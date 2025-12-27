<?php

namespace App\Http\Controllers\Auth;

use Midtrans\Snap;
use App\Models\User;
use Inertia\Inertia;
use Midtrans\Config;
use App\Models\Order;
use Inertia\Response;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Str;
use App\Models\UserPurchase;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use App\Services\WhatsappService;
use App\Services\AffiliateService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Registered;
use App\Services\PaymentGatewayService;
use App\Http\Controllers\DuitkuController;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response
    {
        $coursePrice = (int) Setting::get('course_price', env('VITE_COURSE_PRICE', 500000));
        $coursePriceYearly = (int) Setting::get('course_price_yearly', 0);
        $enableYearlyPlan = filter_var(Setting::get('enable_yearly_plan', false), FILTER_VALIDATE_BOOLEAN);
        $duitkuScriptUrl = Setting::get('duitku_script_url', env('VITE_DUITKU_SCRIPT_URL', ''));
        
        // Detect subscription plan from URL param
        $subscriptionPlan = $request->query('period') === 'yearly' && $enableYearlyPlan ? 'yearly' : 'lifetime';
        
        return Inertia::render('auth/register', [
            'coursePrice' => $coursePrice,
            'coursePriceYearly' => $coursePriceYearly,
            'enableYearlyPlan' => $enableYearlyPlan,
            'subscriptionPlan' => $subscriptionPlan,
            'duitkuScriptUrl' => $duitkuScriptUrl,
        ]);
    }

    public function createPaymentRequest(Request $request, PaymentGatewayService $paymentGateway, AffiliateService $affiliateService)
    {
        // 1. Validasi form
        $validated = $request->validate([
            'gateway' => 'required|string|in:duitku,midtrans',
            'username' => 'required|string|max:255|alpha_dash|unique:users',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255|min_digits:8|unique:users',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'subscription_plan' => 'nullable|string|in:yearly,lifetime',
        ]);

        $gatewayDriver = $request->input('gateway');
        $subscriptionPlan = $request->input('subscription_plan', 'lifetime');
        
        // Validate price based on subscription plan
        $enableYearlyPlan = filter_var(Setting::get('enable_yearly_plan', false), FILTER_VALIDATE_BOOLEAN);
        $expectedPrice = $subscriptionPlan === 'yearly' && $enableYearlyPlan
            ? (int) Setting::get('course_price_yearly', 0)
            : (int) Setting::get('course_price', 0);

        $click = $affiliateService->getLastValidClickForSession($request);
        
        // Get default product
        $defaultProduct = Product::where('is_default', true)->first();

        // 2. Buat Order 'pending'
        $order = Order::create([
            'order_id' => 'REG-' . Str::uuid(),
            'user_id' => null,
            'amount' => $request->final_price,
            'status' => 'pending',
            'type' => 'registration',
            'payment_method' => $gatewayDriver,
            'meta' => [
                'form_data' => $validated,
                'voucher_code' => $request->voucher_code,
                'discount_amount' => $request->discount_amount ?? 0,
                'follow_up_sent' => false,
                'payment_url' => null,
                'affiliate_click_id' => $click ? $click->id : null,
                'product_id' => $defaultProduct?->id,
                'subscription_plan' => $subscriptionPlan,
            ],
        ]);

        try {
            // 3. Pilih Gateway secara dinamis
            $gateway = $paymentGateway->getGateway($gatewayDriver);

            // 4. Buat permintaan pembayaran
            $paymentDetails = $gateway->createPaymentRequest($order, $validated);

            // 5. Simpan URL pembayaran ke Order 
            if (isset($paymentDetails['paymentUrl'])) {
                $meta = $order->meta;
                $meta['payment_url'] = $paymentDetails['paymentUrl'];
                $order->meta = $meta;
                $order->save();
            }

            // 6. Kirim data ke front-end
            return response()->json($paymentDetails);
        } catch (\Exception $e) {
            logger()->error("Failed to create payment request: " . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle free/voucher registration
     */
    public function forceRegister(Request $request)
    {
        try {
            $validated = $request->validate([
                'username' => 'required|string|max:255|alpha_dash|unique:users',
                'name' => 'required|string|max:255',
                'phone' => 'required|string|max:255|min_digits:8|unique:users',
                'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'subscription_plan' => 'nullable|string|in:yearly,lifetime',
            ]);

            $subscriptionPlan = $request->input('subscription_plan', 'lifetime');
            $defaultProduct = Product::where('is_default', true)->first();

            if (!$defaultProduct) {
                Log::error('Gagal: Produk tidak ditemukan');
                return response()->json(['success' => false, 'message' => 'Produk tidak ditemukan.'], 404);
            }

            $user = User::create([
                'username' => $validated['username'],
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            $order = Order::create([
                'order_id' => 'REGFREE-' . Str::uuid(),
                'user_id' => $user->id,
                'amount' => 0,
                'status' => 'completed',
                'type' => 'registration',
                'payment_method' => $request->gateway ?? null,
                'meta' => [
                    'form_data' => $validated,
                    'voucher_code' => $request->voucher_code ?? null,
                    'discount_amount' => $request->discount_amount ?? 0,
                    'follow_up_sent' => false,
                    'payment_url' => null,
                    'product_id' => $defaultProduct->id,
                    'subscription_plan' => $subscriptionPlan,
                ],
            ]);

            // 3. Cek Idempotency
            if ($defaultProduct->isOwnedBy($user->id)) {
                Log::info('User sudah memiliki produk.', [
                    'order_id' => $order->order_id,
                    'user_id' => $user->id
                ]);
                return response()->json(['success' => false, 'message' => 'User sudah memiliki produk.'], 404);
            }

            if ($defaultProduct) {
                $accessEndsAt = $this->calculateAccessExpiry($defaultProduct, $subscriptionPlan);
                logger()->info('Access ends at: ' . $accessEndsAt);
                UserPurchase::create([
                    'user_id' => $user->id,
                    'product_id' => $defaultProduct->id,
                    'order_id' => $order->id,
                    'amount_paid' => $order->amount,
                    'access_ends_at' => $accessEndsAt,
                ]);
            }

            session()->flash('trigger_survey', true);
            event(new Registered($user));
            Auth::login($user);

            return response()->json(['success' => true, 'message' => 'Registrasi berhasil diproses.']);
        } catch (\Exception $e) {
            Log::error('Gagal melakukan registrasi: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses order: ' . $e->getMessage()
            ], 500);
        }
    }

    protected function calculateAccessExpiry(Product $product, string $subscriptionPlan = 'lifetime', ?UserPurchase $existingPurchase = null): ?\Carbon\Carbon
    {
        // Override: If yearly plan, always set 1 year access
        if ($subscriptionPlan === 'yearly') {
            if ($existingPurchase && $existingPurchase->access_ends_at?->isFuture()) {
                return $existingPurchase->access_ends_at->copy()->addYear();
            }
            return now()->addYear();
        }

        // Lifetime access (null or 0)
        if ($product->hasLifetimeAccess()) {
            return null;
        }

        $accessDays = $product->access_period;

        // Handle renewal
        if ($existingPurchase) {
            $currentExpiry = $existingPurchase->access_ends_at;
            if ($currentExpiry && $currentExpiry->isFuture()) {
                return $currentExpiry->copy()->addDays($accessDays);
            }
        }

        return now()->addDays($accessDays);
    }
}
