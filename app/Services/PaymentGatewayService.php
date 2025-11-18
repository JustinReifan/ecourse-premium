<?php

namespace App\Services;

use App\Interfaces\PaymentGatewayInterface;
use App\Services\PaymentGateway\DuitkuGateway;
use App\Services\PaymentGateway\MidtransGateway;

class PaymentGatewayService
{
    /**
     * Memilih driver gateway berdasarkan nama.
     */
    public function getGateway(string $driverName): PaymentGatewayInterface
    {
        if ($driverName === 'duitku') {
            return new DuitkuGateway();
        }

        if ($driverName === 'midtrans') {
            // return new MidtransGateway(); // (Jika sudah Anda buat)
        }

        throw new \Exception("Payment gateway '{$driverName}' not supported.");
    }
}
