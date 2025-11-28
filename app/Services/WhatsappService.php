<?php

namespace App\Services;

use GuzzleHttp\Client;
use App\Models\Setting;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    protected $client;
    protected $apiKey;
    protected $baseUrl;

    public function __construct()
    {
        // Fetch configuration from database settings
        $this->apiKey = Setting::get('whatsapp_api_key');
        $this->baseUrl = Setting::get('whatsapp_base_url');

        if (!$this->apiKey || !$this->baseUrl) {
            Log::error('WA Service: API Key or Base URL is not set.');
            return;
        }

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 10.0, // Tambahkan timeout agar tidak lambat
        ]);
    }

    /**
     * Mengirim pesan WhatsApp.
     *
     * @param string $number Nomor tujuan (format 628xxxx)
     * @param string $message Isi pesan
     * @return bool Berhasil atau tidak
     */
    public function sendMessage(string $number, string $message): bool
    {
        // Pastikan service terinisialisasi
        if (!$this->client) {
            return false;
        }

        try {
            // Bersihkan nomor telepon
            $number = preg_replace('/[^0-9]/', '', $number);

            // Pastikan nomor diawali 62, bukan 0
            if (substr($number, 0, 1) === '0') {
                $number = '62' . substr($number, 1);
            }

            $response = $this->client->request('POST', 'send-message', [
                'form_params' => [
                    'id' => $number,
                    'text' => $message,
                    'type' => 'Text',
                    'waKey' => $this->apiKey
                ]
            ]);

            $body = json_decode($response->getBody()->getContents());

            // Asumsikan sukses jika API mengembalikan status 200
            // (Sesuaikan logika ini jika API Anda punya respons sukses/gagal)
            if ($response->getStatusCode() === 200) {
                Log::info("WA Service: Message sent to {$number}.");
                return true;
            }

            return false;
        } catch (\Throwable $e) {
            Log::error("WA Service Error: " . $e->getMessage(), [
                'number' => $number
            ]);
            return false;
        }
    }
}
