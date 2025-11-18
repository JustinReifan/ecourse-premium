<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Services\AffiliateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected AffiliateService $affiliateService;

    public function __construct(AffiliateService $affiliateService)
    {
        $this->affiliateService = $affiliateService;
    }

    /**
     * Handle payment callback (Duitku/Midtrans)
     */
    public function callback(Request $request)
    {
        Log::info('Payment callback received', $request->all());

        // Validate callback signature (implement based on your payment gateway)
        
        DB::beginTransaction();
        try {
            // Extract order ID and payment status from request
            // This depends on your payment gateway format
            $orderId = $request->input('merchantOrderId') ?? $request->input('order_id');
            $paymentStatus = $request->input('resultCode') ?? $request->input('transaction_status');
            
            // Create or update order
            $order = Order::firstOrCreate(
                ['order_id' => $orderId],
                [
                    'user_id' => null, // Will be set when we have user context
                    'amount' => $request->input('amount') ?? 0,
                    'status' => 'pending',
                    'payment_method' => $request->input('paymentMethod') ?? 'unknown',
                    'meta' => $request->all(),
                ]
            );

            // Check if payment is successful
            $isSuccess = in_array($paymentStatus, ['00', 'success', 'capture', 'settlement']);
            
            if ($isSuccess && $order->status !== 'completed') {
                // Update order status
                $order->update(['status' => 'completed']);

                // Get buyer user from order or request
                $buyerUser = null;
                if ($order->user_id) {
                    $buyerUser = User::find($order->user_id);
                } elseif ($request->input('email')) {
                    $buyerUser = User::where('email', $request->input('email'))->first();
                }

                // Award affiliate conversion if buyer exists
                if ($buyerUser) {
                    $this->affiliateService->awardConversion(
                        $order,
                        $buyerUser,
                        (float) $order->amount,
                        [
                            'payment_method' => $order->payment_method,
                            'callback_at' => now()->toDateTimeString(),
                        ]
                    );
                    
                    Log::info('Affiliate conversion processed', [
                        'order_id' => $orderId,
                        'user_id' => $buyerUser->id,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Payment callback processed',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment callback failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to process payment callback',
            ], 500);
        }
    }

    /**
     * Manual conversion trigger (for testing or manual orders)
     */
    public function triggerConversion(Request $request)
    {
        $request->validate([
            'order_id' => 'required|string',
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:0',
        ]);

        $order = Order::where('order_id', $request->order_id)->first();
        
        if (!$order) {
            $order = Order::create([
                'order_id' => $request->order_id,
                'user_id' => $request->user_id,
                'amount' => $request->amount,
                'status' => 'completed',
                'payment_method' => 'manual',
            ]);
        }

        $user = User::find($request->user_id);
        
        try {
            $conversion = $this->affiliateService->awardConversion(
                $order,
                $user,
                (float) $request->amount,
                ['source' => 'manual_trigger']
            );

            if ($conversion) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Conversion awarded successfully',
                    'conversion' => $conversion,
                ]);
            }

            return response()->json([
                'status' => 'info',
                'message' => 'No conversion awarded (no valid click, self-referral, or already exists)',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
