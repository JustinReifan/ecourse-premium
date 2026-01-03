<?php

namespace App\Services;

use GuzzleHttp\Client;
use App\Models\Setting;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class WhatsappService
{
    protected $client;
    protected $apiKey;
    protected $accountKey;
    protected $baseUrl;

    public function __construct()
    {
        // Ambil konfigurasi dari database
        $this->apiKey = Setting::get('whatsapp_api_key');

        $this->accountKey = Setting::get('whatsapp_account_key') ?? '869f8353-3fce-4601-82fe-0330b1421c61';

        $this->baseUrl = Setting::get('whatsapp_base_url');

        if (!$this->baseUrl) {
            Log::error('WA Service: Base URL is not set.');
            return;
        }

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 15.0,
            'http_errors' => false
        ]);
    }

    /**
     * Mengambil satu waKey secara acak dari device yang statusnya 'connected'.
     */
    private function getRandomActiveWaKey()
    {
        try {
            $response = $this->client->request('POST', 'devices', [
                'form_params' => [
                    'account_key' => $this->accountKey
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);

            // Cek apakah request sukses dan data tersedia
            if (isset($body['statusCode']) && $body['statusCode'] == 200 && !empty($body['data'])) {

                // Filter hanya device yang statusnya 'connected'
                $activeDevices = array_filter($body['data'], function ($device) {
                    return isset($device['status']) && $device['status'] === 'connected';
                });

                if (empty($activeDevices)) {
                    Log::warning('WA Service: Tidak ada device yang statusnya connected.');
                    return null;
                }

                // Acak device yang aktif
                $randomDevice = Arr::random($activeDevices);

                Log::info("WA Service: Menggunakan device pengirim: " . ($randomDevice['name'] ?? 'Unknown') . " (" . ($randomDevice['number'] ?? '-') . ")");

                return $randomDevice['waKey'] ?? null;
            }

            Log::warning('WA Service: Gagal mengambil device active. Response: ' . json_encode($body));
            return null;
        } catch (\Exception $e) {
            Log::error('WA Service (Get Devices) Error: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Mengirim pesan WhatsApp dengan Device Shuffle.
     *
     * @param string $number Nomor tujuan
     * @param string $message Isi pesan
     * @return bool Berhasil atau tidak
     */
    public function sendMessage(string $number, string $message): bool
    {
        if (!$this->client) {
            return false;
        }

        // 1. Coba ambil Random Key dari device aktif
        $selectedWaKey = $this->getRandomActiveWaKey();

        // 2. Jika gagal ambil random key (misal API devices error), pakai Default Key dari database
        if (!$selectedWaKey) {
            if ($this->apiKey) {
                Log::warning("WA Service: Fallback menggunakan Default API Key database.");
                $selectedWaKey = $this->apiKey;
            } else {
                Log::error("WA Service: Tidak ada waKey yang tersedia (Random gagal, Default kosong).");
                return false;
            }
        }

        try {
            // Bersihkan nomor telepon
            $number = preg_replace('/[^0-9]/', '', $number);
            if (substr($number, 0, 1) === '0') {
                $number = '62' . substr($number, 1);
            }

            // Kirim pesan menggunakan waKey terpilih
            $response = $this->client->request('POST', 'send-message', [
                'form_params' => [
                    'id'    => $number,
                    'text'  => $message,
                    'type'  => 'Text',
                    'waKey' => $selectedWaKey
                ]
            ]);

            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody()->getContents());

            if ($statusCode === 200) {
                Log::info("WA Service: Message sent to {$number} using key: " . substr($selectedWaKey, 0, 5) . "...");
                return true;
            }

            Log::error("WA Service: Failed to send. Status: $statusCode. Body: " . json_encode($body));
            return false;
        } catch (\Throwable $e) {
            Log::error("WA Service Error: " . $e->getMessage(), [
                'number' => $number
            ]);
            return false;
        }
    }
}