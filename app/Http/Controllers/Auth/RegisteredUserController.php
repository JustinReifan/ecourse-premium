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
use App\Mail\Registration\UserRegistrationMail;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        $coursePrice = \App\Models\Setting::get('course_price', env('VITE_COURSE_PRICE', 500000));
        $duitkuScriptUrl = \App\Models\Setting::get('duitku_script_url', env('VITE_DUITKU_SCRIPT_URL', ''));
        return Inertia::render('auth/register', [
            'coursePrice' => $coursePrice,
            'duitkuScriptUrl' => $duitkuScriptUrl,
        ]);
    }

    public function createPaymentRequest(Request $request, PaymentGatewayService $paymentGateway, AffiliateService $affiliateService)
    {
        // 1. Validasi form
        $validated = $request->validate([
            'gateway' => 'required|string|in:duitku,midtrans', // <-- Front-end harus kirim ini
            'username' => 'required|string|max:255|alpha_dash|unique:users',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255|min_digits:8|unique:users',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $gatewayDriver = $request->input('gateway');

        $click = $affiliateService->getLastValidClickForSession($request);

        // 2. Buat Order 'pending' (Logika ini tetap sama)
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
     * Handle an incoming registration request.
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
            ]);

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
                ],
            ]);

            // 3. Cek Idempotency (jika sudah dibeli, jangan proses lagi)
            if ($defaultProduct->isOwnedBy($user->id)) {
                Log::info('User sudah memiliki produk.', [
                    'order_id' => $order->order_id,
                    'user_id' => $user->id
                ]);
                return response()->json(['success' => false, 'message' => 'User sudah memiliki produk.'], 404);
            }

            if ($defaultProduct) {
                UserPurchase::create([
                    'user_id' => $user->id,
                    'product_id' => $defaultProduct->id,
                    'order_id' => $order->id,
                    'amount_paid' => $order->amount,
                ]);
            }

            try {
                if ($user->email) {
                    Mail::to($user->email)->send(new UserRegistrationMail($user));
                    Log::info("Email sukses dikirim ke: " . $user->email);
                }
            } catch (\Exception $e) {
                Log::error("Gagal mengirim email ke member: " . $e->getMessage());
            }

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
