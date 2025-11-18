<?php

namespace App\Http\Controllers\Auth;

use Midtrans\Snap;
use App\Models\User;
use Inertia\Inertia;
use Midtrans\Config;
use App\Models\Order;
use Inertia\Response;
use Illuminate\Support\Str;
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
    public function store(Request $request): RedirectResponse
    {
        Log::warning('RegisteredUserController@store dipanggil, seharusnya tidak terjadi.');
        return to_route('login')->with('error', 'Metode pendaftaran tidak valid.');
    }
}
