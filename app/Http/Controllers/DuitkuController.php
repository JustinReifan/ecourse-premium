<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\Request;

class DuitkuController extends Controller
{

    private $duitkuConfig;

    public function __construct()
    {
        $this->duitkuConfig = new \Duitku\Config(
            env('DUITKU_SERVER_KEY'),
            env('DUITKU_MERCHANT_CODE'),
            (bool) env('DUITKU_SANDBOX_MODE', false),
            true,
            false
        );
    }


    public function create($merchantRef, $price, $email, $return_url)
    {
        // duitku

        // make sure price is int
        $price = (int) $price;

        $params = array(
            'paymentAmount'     => $price,
            'merchantOrderId'   => $merchantRef,
            'productDetails'    => "Pondok Grafis",
            'email'             => $email,
            'callbackUrl'       => url('api/callback/duitku'),
            'returnUrl'         => $return_url,
        );

        logger()->info("Duitku Request: ", $params);

        try {
            // createInvoice Request
            $responseDuitkuPop = \Duitku\Pop::createInvoice($params, $this->duitkuConfig);
            logger()->info("Duitku Response: " . $responseDuitkuPop);
            header('Content-Type: application/json');
            return $responseDuitkuPop;
        } catch (Exception $e) {
            return response()->json(
                [
                    'status' => false,
                    'message' => $e->getMessage()
                ]
            );
        }
    }
}
