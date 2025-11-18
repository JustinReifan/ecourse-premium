<?php

namespace App\Services\PaymentGateway;

use App\Http\Controllers\DuitkuController; // Asumsi DuitkuController masih dipakai
use App\Interfaces\PaymentGatewayInterface;
use App\Models\Order;
use Illuminate\Http\Request;

class DuitkuGateway implements PaymentGatewayInterface
{
    protected $merchantKey;
    protected $duitkuController;

    public function __construct()
    {
        $this->merchantKey = \App\Models\Setting::get('duitku_api_key', env('DUITKU_SERVER_KEY'));
        $this->duitkuController = new DuitkuController();
    }

    public function createPaymentRequest(Order $order, array $customerData): array
    {
        $response = $this->duitkuController->create(
            $order->order_id,
            $order->amount,
            $customerData['email'],
            null
        );

        $data = json_decode($response);

        if (!$data || !$data->reference) {
            logger()->error('Error membuat referensi duitku: ' . $response);
            throw new \Exception('Duitku: Gagal membuat referensi pembayaran.');
        }

        // Data ini akan dikirim ke front-end (register.tsx)
        return [
            'type' => 'duitku_reference', // Agar front-end tahu cara handle
            'reference' => $data->reference,
            'paymentUrl' => $data->paymentUrl,
        ];
    }

    public function handleWebhook(Request $request): array
    {
        $merchantCode = $request->input('merchantCode');
        $amount = $request->input('amount');
        $merchantOrderId = $request->input('merchantOrderId');
        $signature = $request->input('signature');

        // Validasi Signature
        $localSignature = md5($merchantCode . $amount . $merchantOrderId . $this->merchantKey);
        if ($signature !== $localSignature) {
            logger()->error('Local Signature: ' . $localSignature . ', Duitku Signature: ' . $signature);
            throw new \Exception('Duitku: Invalid signature.');
        }

        $resultCode = $request->input('resultCode');
        $status = 'pending';
        if ($resultCode == '00') $status = 'completed';
        if ($resultCode == '01') $status = 'failed';

        // Mengembalikan data terstandar
        return [
            'status' => $status,
            'order_id' => $merchantOrderId,
            'reference' => $request->input('reference'),
        ];
    }
}
