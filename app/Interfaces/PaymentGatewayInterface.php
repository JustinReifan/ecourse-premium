<?php

namespace App\Interfaces;

use App\Models\Order;
use Illuminate\Http\Request;

// Ini adalah "Kontrak"
interface PaymentGatewayInterface
{
    /**
     * Membuat permintaan pembayaran (seperti getReference / getSnapToken).
     * @return array Data untuk front-end (e.g., token, reference, redirect_url)
     */
    public function createPaymentRequest(Order $order, array $customerData): array;

    /**
     * Menangani webhook/callback.
     * @return array ['status' => 'completed'|'failed'|'pending', 'order_id' => string, 'reference' => string]
     */
    public function handleWebhook(Request $request): array;
}
