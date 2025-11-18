<?php

namespace App\Jobs;

use App\Services\WhatsappService; // <-- Import service Anda
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsappNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $phone;
    protected $message;

    /**
     * Buat instance Job baru.
     */
    public function __construct(string $phone, string $message)
    {
        $this->phone = $phone;
        $this->message = $message;
    }

    /**
     * Jalankan Job.
     */
    public function handle(WhatsappService $waService): void
    {
        try {
            // Panggil service Anda yang lambat di sini
            $waService->sendMessage($this->phone, $this->message);
        } catch (\Exception $e) {
            // Jika gagal, catat di log
            Log::error('Gagal menjalankan SendWhatsappNotificationJob: ' . $e->getMessage(), [
                'phone' => $this->phone
            ]);
            // (Anda bisa atur 'retry' di sini jika mau)
        }
    }
}
