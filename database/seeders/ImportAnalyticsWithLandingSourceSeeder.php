<?php

namespace Database\Seeders;

use App\Models\UserAnalytic;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class ImportAnalyticsWithLandingSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Lokasi file JSON (Pastikan file ada di folder public)
        $jsonPath = public_path('analytics.json');

        if (!File::exists($jsonPath)) {
            $this->command->error("File tidak ditemukan: {$jsonPath}");
            return;
        }

        // 2. Baca file
        $jsonContent = File::get($jsonPath);
        $decodedJson = json_decode($jsonContent, true);

        // 3. Cari array 'data' di dalam struktur export phpMyAdmin
        $analyticsData = [];
        if (is_array($decodedJson)) {
            foreach ($decodedJson as $element) {
                // Mencari elemen yang tipenya 'table' dan namanya 'user_analytics'
                if (isset($element['type']) && $element['type'] === 'table' && $element['name'] === 'user_analytics') {
                    $analyticsData = $element['data'] ?? [];
                    break;
                }
            }
        }

        // Fallback jika struktur json langsung array data (jaga-jaga)
        if (empty($analyticsData) && is_array($decodedJson) && isset($decodedJson[0]['event_type'])) {
            $analyticsData = $decodedJson;
        }

        if (empty($analyticsData)) {
            $this->command->error("Data kosong atau struktur JSON tidak dikenali.");
            return;
        }

        $this->command->info("Memproses " . count($analyticsData) . " data analytics...");
        $count = 0;
        $skipped = 0;

        foreach ($analyticsData as $record) {
            // Cek apakah ID ini sudah ada biar tidak error duplicate entry
            // (Opsional: matikan cek ini jika ingin paksa timpa/truncate dulu)
            if (UserAnalytic::where('id', $record['id'])->exists()) {
                $skipped++;
                continue;
            }

            try {
                // --- LOGIKA TRANSFORMASI DATA ---

                // 1. Decode event_data dari string JSON menjadi Array PHP
                // Di JSON Anda: "event_data": "{\"page\":\"\/\", ...}" (String)
                $eventDataArray = [];
                if (isset($record['event_data']) && is_string($record['event_data'])) {
                    $eventDataArray = json_decode($record['event_data'], true) ?? [];
                }

                // 2. Ambil value 'page' untuk dijadikan 'landing_source'
                // Jika 'page' tidak ada atau null, gunakan fallback '/'
                $landingSourceVal = $eventDataArray['page'] ?? '/';

                // 3. Masukkan key baru ke dalam array event_data
                $eventDataArray['landing_source'] = $landingSourceVal;

                // --------------------------------

                // 4. Simpan ke Database
                UserAnalytic::create([
                    // Pakai ID lama agar relasi history terjaga (jika perlu)
                    'id' => $record['id'],

                    'session_id' => $record['session_id'],
                    'event_type' => $record['event_type'],

                    // Laravel akan otomatis meng-cast array ini jadi JSON 
                    // (Asumsi di model UserAnalytic ada casts = ['event_data' => 'array'])
                    'event_data' => $eventDataArray,

                    'referral_source' => $record['referral_source'] ?? null,
                    'utm_source' => $record['utm_source'] ?? null,
                    'utm_medium' => $record['utm_medium'] ?? null,
                    'utm_campaign' => $record['utm_campaign'] ?? null,
                    'utm_content' => $record['utm_content'] ?? null,
                    'utm_term' => $record['utm_term'] ?? null,
                    'ip_hash' => $record['ip_hash'] ?? null,
                    'user_agent' => $record['user_agent'] ?? null,
                    'user_id' => $record['user_id'] ?? null,

                    // Gunakan waktu asli dari backup
                    'created_at' => $record['created_at'],
                ]);

                $count++;
            } catch (\Exception $e) {
                $this->command->warn("Gagal import ID {$record['id']}: " . $e->getMessage());
            }
        }

        $this->command->info("Selesai! Berhasil import & modifikasi: {$count} data. Skipped (duplikat): {$skipped}.");
    }
}
