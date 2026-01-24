<?php

namespace App\Services;

use GuzzleHttp\Client;
use App\Models\Setting;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WhatsappService
{
    protected $client;
    protected $mainApiKey;
    protected $baseUrl;

    public function __construct()
    {
        // Ambil API Key Utama (Account Key) dari database
        // Pastikan Anda mengupdate nilai 'whatsapp_api_key' di database dengan API Key Starsender Anda
        $this->mainApiKey = Setting::get('whatsapp_api_key');

        // Base URL Starsender
        $this->baseUrl = Setting::get('whatsapp_base_url');

        if (!$this->mainApiKey) {
            Log::error('WA Service: Starsender API Key is not set in Settings.');
        }

        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 30.0,
            'http_errors' => false,
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ]
        ]);
    }

    /**
     * Mengambil satu waKey secara acak dari device yang statusnya 'connected'.
     */
    /**
     * Mengambil device key secara bergantian (Round Robin).
     * Device A -> Device B -> Device A -> dst...
     */
    private function getRandomActiveDeviceKey()
    {
        if (!$this->mainApiKey) {
            return null;
        }

        try {
            $response = $this->client->request('GET', 'devices', [
                'headers' => [
                    'Authorization' => $this->mainApiKey
                ]
            ]);

            $body = json_decode($response->getBody()->getContents(), true);

            if (isset($body['success']) && $body['success'] == true && !empty($body['data']['devices'])) {

                $activeDevices = array_filter($body['data']['devices'], function ($device) {
                    return isset($device['status']) && $device['status'] === 'connected';
                });

                $activeDevices = array_values($activeDevices);

                if (empty($activeDevices)) {
                    Log::warning('WA Service: Tidak ada device connected.');
                    return null;
                }

                $totalDevices = count($activeDevices);

                $lastIndex = \Illuminate\Support\Facades\Cache::get('wa_last_device_index', -1);

                $nextIndex = $lastIndex + 1;

                if ($nextIndex >= $totalDevices) {
                    $nextIndex = 0;
                }

                Cache::put('wa_last_device_index', $nextIndex, 3600);

                $selectedDevice = $activeDevices[$nextIndex];


                $deviceKey = $selectedDevice['device_key'] ?? $selectedDevice['apikey'] ?? null;

                if ($deviceKey) {
                    Log::info("WA Service [Round Robin]: Menggunakan device ke-" . ($nextIndex + 1) . " dari $totalDevices: " . ($selectedDevice['name'] ?? '-'));
                    return $deviceKey;
                }
            }

            return null;
        } catch (\Exception $e) {
            Log::error('WA Service Error: ' . $e->getMessage());
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
        // 1. Coba ambil Random Device Key dari device aktif
        $selectedDeviceKey = $this->getRandomActiveDeviceKey();

        // 2. Fallback: Jika gagal ambil device aktif (misal API list error), 
        // gunakan Main API Key (siapa tau Main Key juga bisa dipakai kirim/default device)
        if (!$selectedDeviceKey) {
            Log::error("WA Service: Tidak ada API Key yang tersedia.");
            return false;
        }

        try {
            // Bersihkan nomor telepon (Format Starsender support 628...)
            $number = preg_replace('/[^0-9]/', '', $number);

            // Pastikan format 62
            if (substr($number, 0, 1) === '0') {
                $number = '62' . substr($number, 1);
            }

            // Kirim pesan ke Endpoint Send Message
            // Header Authorization menggunakan Key Device yang terpilih
            $response = $this->client->request('POST', 'send', [
                'headers' => [
                    'Authorization' => $selectedDeviceKey
                ],
                'json' => [
                    'messageType' => 'text',
                    'to'          => $number,
                    'body'        => $message
                ]
            ]);

            $statusCode = $response->getStatusCode();
            $body = json_decode($response->getBody()->getContents(), true);

            // Cek sukses berdasarkan response Starsender
            // Starsender return HTTP 200 dan body['success'] == true
            if ($statusCode === 200 && isset($body['success']) && $body['success'] == true) {
                Log::info("WA Service: Message sent to {$number}. Msg ID: " . ($body['data']['message_id'] ?? '-'));
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
