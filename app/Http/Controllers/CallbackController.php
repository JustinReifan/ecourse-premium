<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\PaymentGatewayService;
use App\Services\OrderFinalizationService;

class CallbackController extends Controller
{
    protected $paymentGateway;
    protected $orderService;

    public function __construct(PaymentGatewayService $paymentGateway, OrderFinalizationService $orderService)
    {
        $this->paymentGateway = $paymentGateway;
        $this->orderService = $orderService;
    }

    /**
     * Handle webhook dari SEMUA payment gateway.
     */
    public function handle(Request $request, string $driver) // $driver akan dari URL
    {
        try {
            // 1. Pilih Gateway berdasarkan URL (e.g., /webhook/duitku)
            $gateway = $this->paymentGateway->getGateway($driver);

            $result = $gateway->handleWebhook($request);

            // 3. Cari Order
            $order = Order::where('order_id', $result['order_id'])
                ->where('status', 'pending')->first();

            if (!$order) {
                return response()->json(['message' => 'Order not found or already processed'], 200);
            }

            $reference = $result['reference'] ?? null;

            // 4. Jalankan Logika Bisnis (SUDAH TERPISAH)
            if ($result['status'] === 'completed') {
                DB::beginTransaction();

                // Tandai lunas dulu
                $order->update(['status' => 'completed', 'meta->reference' => $reference]);

                // Panggil service yang sesuai berdasarkan 'type'
                if ($order->type === 'registration') {
                    $this->orderService->finalizeRegistration($order);
                } elseif ($order->type === 'product') {
                    $this->orderService->finalizeProductPurchase($order);
                }

                DB::commit();
            } elseif ($result['status'] === 'failed') {
                $order->update(['status' => 'failed', 'meta->reference' => $result['reference']]);
                $this->orderService->sendFailedNotification($order);
            } elseif ($result['status'] === 'pending') {
                $order->update(['status' => 'pending', 'meta->reference' => $result['reference']]);
                Log::info('Webhook: Payment is pending', ['order_id' => $order->order_id]);

                // Kirim notifikasi follow-up
                // $this->orderService->sendPendingNotification($order);
            } else {
                // Handle status lain jika ada (misal: 'expired', 'cancelled')
                Log::info('Webhook: Status not handled', [
                    'order_id' => $order->order_id,
                    'status' => $result['status']
                ]);
            }

            return response()->json(['message' => 'Webhook processed'], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::critical("Webhook Handle Failed (Driver: $driver)", [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);
            return response()->json(['message' => 'Failed to process webhook'], 500);
        }
    }
}
