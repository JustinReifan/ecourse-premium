<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Voucher;
use Illuminate\Support\Str;
use App\Models\UserPurchase;
use Illuminate\Http\Request;
use App\Services\AffiliateService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Services\PaymentGatewayService;
use App\Services\OrderFinalizationService;

class ProductPurchaseController extends Controller
{
    /**
     * Handle product purchase
     */

    protected $orderFinalizationService;

    public function __construct(OrderFinalizationService $orderFinalizationService)
    {
        $this->orderFinalizationService = $orderFinalizationService;
    }

    public function forcePurchase(Request $request, AffiliateService $affiliateService)
    {
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'final_price' => 'required|numeric',
            'gateway' => 'required|string|in:duitku,midtrans',
            'voucher_code' => 'nullable|string',
            'discount_amount' => 'nullable|numeric',
        ]);

        $gatewayDriver = $request->input('gateway', 'duitku');
        $product = Product::findOrFail($validated['product_id']);
        $user = $request->user();

        // Check if already purchased
        if ($product->isOwnedBy($user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'You already own this product.',
            ], 400);
        }

        $click = $affiliateService->getLastValidClickForSession($request);

        $productDetails = [
            'id' => $product->id,
            'title' => $product->title,
            'type' => $product->type,
        ];

        // Create order
        $order = Order::create([
            'order_id' => 'ORDFREE-' . strtoupper(Str::random(10)),
            'user_id' => $user->id,
            'amount' => 0,
            'status' => 'completed',
            'type' => 'product',
            'payment_method' => $gatewayDriver,
            'meta' => [
                'product' => $productDetails,
                'affiliate_click_id' => $click ? $click->id : null,
                'voucher_code' => $request->voucher_code ?? null,
                'discount_amount' => $request->discount_amount ?? 0,
            ],
        ]);

        $this->orderFinalizationService->finalizeProductPurchase($order);

        return response()->json(['success' => true, 'message' => 'Produk berhasil ditambahkan.']);
    }

    public function confirmInstantPayment(Request $request, OrderFinalizationService $orderService)
    {
        // 1. Validasi reference dari Duitku
        $validated = $request->validate([
            'reference' => 'required|string',
            'order_id' => 'required|string', // Duitku mengirim 'merchantOrderId' sebagai 'order_id' di pop-up
        ]);

        $orderId = $validated['order_id'];
        $reference = $validated['reference'];

        try {
            return DB::transaction(function () use ($orderId, $reference, $orderService, $request) {

                // 3. Cari Order. Gunakan 'lockForUpdate()' untuk mencegah double-processing
                $order = Order::where('order_id', $orderId)
                    ->lockForUpdate() // <-- SANGAT PENTING
                    ->first();

                // 4. Cek Status Order
                if (!$order) {
                    return response()->json(['success' => false, 'message' => 'Order tidak ditemukan.'], 404);
                }

                // Jika sudah lunas (oleh webhook), bilang sukses
                if ($order->status === 'completed') {
                    return response()->json(['success' => true, 'message' => 'Order sudah diproses.']);
                }

                // Jika masih pending, kita proses SEKARANG
                if ($order->status === 'pending') {
                    // Tandai lunas
                    $order->update([
                        'status' => 'completed',
                        'meta->reference' => $reference
                    ]);

                    // 5. Panggil Logika Bisnis Sesuai Tipe
                    if ($order->type === 'registration') {
                        $user = $orderService->finalizeRegistration($order);
                        if ($user) {
                            Auth::login($user);
                            $request->session()->regenerate();
                        }
                    } elseif ($order->type === 'product') {
                        $orderService->finalizeProductPurchase($order);
                    }

                    return response()->json(['success' => true, 'message' => 'Pembayaran berhasil diproses.']);
                }

                // Handle status lain (misal 'failed')
                return response()->json(['success' => false, 'message' => 'Status order tidak valid.'], 400);
            });
        } catch (\Exception $e) {
            Log::error('Gagal konfirmasi instant payment: ' . $e->getMessage(), ['order_id' => $orderId]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download purchased product file
     */
    public function download(Product $product)
    {
        $user = auth()->user();

        // Check if user owns the product
        if (!$product->isOwnedBy($user->id)) {
            abort(403, 'You do not own this product.');
        }

        // Check if product has a file
        if (!$product->file_path) {
            abort(404, 'Product file not found.');
        }

        return response()->download(storage_path('app/public/' . $product->file_path));
    }


    public function createPaymentRequest(
        Request $request,
        PaymentGatewayService $paymentGateway,
        AffiliateService $affiliateService
    ) {
        // 1. Validasi
        $validated = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'final_price' => 'required|numeric',
            'gateway' => 'required|string|in:duitku,midtrans',
            'voucher_code' => 'nullable|string',
            'discount_amount' => 'nullable|numeric',
        ]);

        $gatewayDriver = $request->input('gateway', 'duitku');
        $product = Product::findOrFail($validated['product_id']);
        $user = $request->user();


        // 2. Cek jika sudah punya
        if ($product->isOwnedBy($user->id)) {
            return response()->json(['message' => 'Anda sudah memiliki produk ini.'], 400);
        }

        $productDetails = [
            'id' => $product->id,
            'title' => $product->title,
            'type' => $product->type,
        ];

        // 3. Buat Order 'pending'
        $order = Order::create([
            'order_id' => 'ORD-' . Str::uuid(),
            'user_id' => $user->id, // User sudah login
            'amount' => $request->final_price,
            'status' => 'pending',
            'payment_method' => $gatewayDriver,
            'type' => 'product',
            'meta' => [
                'product' => $productDetails,
                'product_title' => $product->title,
                'voucher_code' => $request->voucher_code,
                'discount_amount' => $request->discount_amount ?? 0,
                'affiliate_click_id' => null,
                'follow_up_sent' => false,
            ],
        ]);

        // 4. Buat Permintaan Pembayaran
        try {
            $gateway = $paymentGateway->getGateway($gatewayDriver);
            $paymentDetails = $gateway->createPaymentRequest($order, [
                'email' => $user->email,
                'name' => $user->name,
                'phone' => $user->phone,
            ]);

            // 5. Simpan URL Pembayaran (untuk follow-up)
            $meta = $order->meta;
            if (isset($paymentDetails['paymentUrl'])) {
                $meta['payment_url'] = $paymentDetails['paymentUrl'];
            }
            if (isset($paymentDetails['reference'])) {
                $meta['reference'] = $paymentDetails['reference'];
            }
            $order->meta = $meta;
            $order->save();

            // 6. Kirim data ke front-end
            return response()->json($paymentDetails);
        } catch (\Exception $e) {
            logger()->error("Gagal membuat permintaan pembayaran produk: " . $e->getMessage());
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
