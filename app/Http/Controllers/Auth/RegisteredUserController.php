<?php

namespace App\Http\Controllers\Auth;

use Midtrans\Snap;
use App\Models\User;
use Inertia\Inertia;
use Midtrans\Config;
use App\Models\Order;
use Inertia\Response;
use App\Models\Product;
use Illuminate\Support\Str;
use App\Models\UserAnalytic;
use App\Models\UserPurchase;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use App\Services\WhatsappService;
use App\Services\AffiliateService;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Auth\Events\Registered;
use App\Services\PaymentGatewayService;
use App\Http\Controllers\DuitkuController;
use App\Services\OrderFinalizationService;
use App\Mail\Registration\UserRegistrationMail;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */

    protected $orderFinalizationService;

    public function __construct(OrderFinalizationService $orderFinalizationService)
    {
        $this->orderFinalizationService = $orderFinalizationService;
    }

    public function create(): Response
    {
        // Check if coming from lead magnet flow (via query parameter)
        $registrationType = request()->query('type', 'standard');
        $isLeadMagnet = $registrationType === 'lead-magnet';

        if ($isLeadMagnet) {
            // Get lead magnet product
            $product = Product::getLeadMagnetProduct();
            $coursePrice = $product ? $product->price : 0;
        } else {
            // Standard flow - use default product price from settings
            $coursePrice = \App\Models\Setting::get('course_price', env('VITE_COURSE_PRICE', 500000));
        }

        $duitkuScriptUrl = \App\Models\Setting::get('duitku_script_url', env('VITE_DUITKU_SCRIPT_URL', ''));
        $minLeadMagnetPrice = \App\Models\Setting::get('min_lead_magnet_price', 1);

        return Inertia::render('auth/register', [
            'coursePrice' => $coursePrice,
            'duitkuScriptUrl' => $duitkuScriptUrl,
            'registrationType' => $isLeadMagnet ? 'lead_magnet' : 'standard',
            'minLeadMagnetPrice' => (int) $minLeadMagnetPrice,
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
            'registration_type' => 'nullable|string|in:standard,lead_magnet',
            'payment_amount' => 'nullable|numeric',
        ]);

        $gatewayDriver = $request->input('gateway');
        $registrationType = $request->input('registration_type', 'standard');
        $isLeadMagnet = $registrationType === 'lead_magnet';

        // 2. Determine product and price based on registration type

        if ($isLeadMagnet) {
            $product = Product::getLeadMagnetProduct();
            $minPrice = \App\Models\Setting::get('min_lead_magnet_price', 1);
            $paymentAmount = $request->input('payment_amount', $minPrice);

            // Validate minimum price for lead magnet
            if ($paymentAmount < $minPrice) {
                return response()->json([
                    'message' => "Minimal pembayaran adalah Rp " . number_format($minPrice, 0, ',', '.')
                ], 422);
            }

            $orderAmount = $paymentAmount;
        } else {
            $product = Product::getDefaultProduct();
            $orderAmount = $request->final_price;
        }

        $click = $affiliateService->getLastValidClickForSession($request);

        // 3. Buat Order 'pending'
        $order = Order::create([
            'order_id' => 'REG-' . Str::uuid(),
            'user_id' => null,
            'amount' => $orderAmount,
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
                'registration_type' => $registrationType,
                'product_id' => $product ? $product->id : null,
                'session_id' => request()->session()->getId(),
            ],
        ]);

        try {
            // 4. Pilih Gateway secara dinamis
            $gateway = $paymentGateway->getGateway($gatewayDriver);

            // 5. Buat permintaan pembayaran
            $paymentDetails = $gateway->createPaymentRequest($order, $validated);

            // 6. Simpan URL pembayaran ke Order 
            if (isset($paymentDetails['paymentUrl'])) {
                $meta = $order->meta;
                $meta['payment_url'] = $paymentDetails['paymentUrl'];
                $order->meta = $meta;
                $order->save();
            }

            try {
                UserAnalytic::create([
                    'session_id' => $request->session()->getId(),
                    'event_type' => 'conversion',
                    'event_data' => [
                        'type' => 'registration',
                        'registration_type' => $registrationType,
                        'order_id' => $order->order_id,
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'step' => 'payment_request_created'
                    ],
                    'ip_hash' => hash('sha256', $request->ip() . config('app.key')),
                    'user_agent' => $request->userAgent(),
                    'user_id' => null,
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                // Silent fail agar tidak mengganggu proses pembayaran utama
                Log::error('Analytics Conversion Tracking Failed: ' . $e->getMessage());
            }

            // 7. Kirim data ke front-end
            return response()->json($paymentDetails);
        } catch (\Exception $e) {
            logger()->error("Failed to create payment request: " . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    /**
     * Handle an incoming registration request (free/voucher).
     *
     * @throws \Illuminate\Validation\ValidationException
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
                'registration_type' => 'nullable|string|in:standard,lead_magnet',
            ]);

            $registrationType = $request->input('registration_type', 'standard');
            $isLeadMagnet = $registrationType === 'lead_magnet';

            // Determine product based on registration type
            $product = $isLeadMagnet
                ? Product::getLeadMagnetProduct()
                : Product::getDefaultProduct();

            $order = Order::create([
                'order_id' => 'REGFREE-' . Str::uuid(),
                'user_id' => null,
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
                    'registration_type' => $registrationType,
                    'product_id' => $product ? $product->id : null,
                    'session_id' => request()->session()->getId(),
                ],
            ]);

            $user = $this->orderFinalizationService->finalizeRegistration($order);

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
}