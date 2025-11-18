<?php

namespace App\Console\Commands;

use Carbon\Carbon;
use App\Models\Order;
use App\Services\OrderFinalizationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;;

class FollowUpPendingRegistrations extends Command
{
    protected $signature = 'follow-up:pending-registrations';
    protected $description = 'Send WA follow-up to pending registration orders';

    protected $orderService;

    public function __construct(OrderFinalizationService $orderService)
    {
        parent::__construct();
        $this->orderService = $orderService;
    }

    public function handle()
    {
        $this->info('Mencari order pending untuk di-follow-up...');

        // 1. Cari order 'pending' yang dibuat antara 1 dan 2 jam yang lalu
        // (Asumsi Anda tidak mau spam order yg baru dibuat 5 menit lalu)
        $orders = Order::where('status', 'pending')
            ->where('user_id', null) // Hanya untuk registrasi
            // ->where('created_at', '<=', Carbon::now()->subHour(1))
            ->where('created_at', '>', Carbon::now()->subHours(2))
            ->where('meta->follow_up_sent', '!=', true) // Yang belum pernah dikirim
            ->get();

        if ($orders->isEmpty()) {
            $this->info('Tidak ada order pending yang perlu di-follow-up.');
            return 0;
        }

        $this->info("Menemukan {$orders->count()} order...");

        foreach ($orders as $order) {
            try {
                // 2. Panggil fungsi yang sudah kita buat
                $this->orderService->sendPendingNotification($order);

                // 3. Tandai agar tidak dikirim lagi
                $meta = $order->meta;
                $meta['follow_up_sent'] = true;
                $order->meta = $meta;
                $order->save();

                $this->info("Follow-up terkirim ke order: {$order->order_id}");
            } catch (\Exception $e) {
                $this->error("Gagal mengirim ke {$order->order_id}: " . $e->getMessage());
                Log::error('Gagal kirim follow-up pending: ' . $e->getMessage());
            }
        }

        $this->info('Selesai.');
        return 0;
    }
}
