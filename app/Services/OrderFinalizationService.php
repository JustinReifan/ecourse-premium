<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\Setting;
use App\Models\UserPurchase;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Jobs\SendWhatsappNotificationJob;

class OrderFinalizationService
{
    protected AffiliateService $affiliateService;
    protected WhatsappService $waService;
    protected $adminNumber;

    public function __construct(AffiliateService $affiliateService, WhatsappService $waService)
    {
        $this->affiliateService = $affiliateService;
        $this->waService = $waService;
        $this->adminNumber  = Setting::get('owner_whatsapp', env('ADMIN_WA_NUMBER'));
    }

    /**
     * Logika utama untuk menyelesaikan registrasi SETELAH pembayaran lunas.
     */
    public function finalizeRegistration(Order $order): User
    {
        // 1. Ambil data form dari meta
        $formData = $order->meta['form_data'];

        // 2. Buat User baru
        $user = User::create([
            'name' => $formData['name'],
            'username' => $formData['username'],
            'email' => $formData['email'],
            'phone' => $formData['phone'],
            'password' => Hash::make($formData['password']),
        ]);

        // 3. Update order dengan user_id
        $order->update(['user_id' => $user->id]);

        event(new Registered($user));

        // 4. Berikan produk default
        $defaultProduct = Product::where('is_default', true)->first();
        if ($defaultProduct) {
            UserPurchase::create([
                'user_id' => $user->id,
                'product_id' => $defaultProduct->id,
                'order_id' => $order->id,
                'amount_paid' => $order->amount,
            ]);
        }

        // 5. Berikan Komisi Affiliate
        $conversion = $this->affiliateService->awardConversion(
            $order,
            $user,
            $order->amount,
            ['registration' => true, 'voucher_applied' => !empty($order->meta['voucher_code'])],
            $defaultProduct?->id
        );

        // 6. Kirim Notifikasi Sukses
        try {
            $this->sendSuccessNotifications($user, $conversion);
        } catch (\Exception $e) {
            // Jika WA gagal, jangan gagalkan registrasi. Cukup catat.
            Log::error('Gagal mengirim WA notifikasi sukses: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'order_id' => $order->order_id
            ]);
        }
        return $user;
    }

    public function sendSuccessNotifications(User $user, $conversion): void
    {
        // 1. Ke Member Baru
        $memberName = $user->name;
        $memberPhone = $user->phone;
        $loginUrl = route('login'); // Ambil URL login secara dinamis

        $messageToMember = "Haii {$memberName}, selamat dataang! 👋\n\n"
            . "Pembayaran kamu udah beress dan akun kamu udah jadii.\n\n"
            . "Kamu bisa langsung login pake email dan password yang kamu daftarin tadi untuk mulai belajar.\n\n"
            . "Login di sini ya: \n{$loginUrl}\n\n"
            . "Semangat terus belajarnya!";

        // $this->waService->sendMessage($memberPhone, $messageToMember);
        SendWhatsappNotificationJob::dispatch($memberPhone, $messageToMember);

        // 2. Ke Affiliator & Admin (hanya jika ada komisi)
        if ($conversion) {
            $affiliator = $conversion->affiliate; // Dapatkan data affiliate
            $affiliatorUser = $affiliator->user; // Dapatkan data user dari affiliate

            // Format Rupiah
            $commissionAmount = 'Rp ' . number_format($conversion->commission_amount, 0, ',', '.');

            // Link Admin dari Anda (ganti 127.0.0.1 dengan URL asli jika sudah production)
            $adminUrl = url('/admin/affiliates/conversions/list');


            // 2a. Kirim Pesan ke Affiliator (jika ada & punya nomor HP)
            if ($affiliatorUser && $affiliatorUser->phone) {
                $affiliatorName = $affiliatorUser->name;
                $affiliatorPhone = $affiliatorUser->phone;

                $messageToAffiliator = "Asiiik, {$affiliatorName} 😎! Kamu dapet komisi baru nih 🥳\n\n"
                    . "Ada member baru ({$user->name}) yang daftar pake link kamu. Komisi sebesar *{$commissionAmount}* udah masuk ke saldo pending kamu yaa.\n\n"
                    . "Mantap banget! Cek dashboard affiliate kamu gih. Semangat terus tebar link-nya! 😉";

                // $this->waService->sendMessage($affiliatorPhone, $messageToAffiliator);
                SendWhatsappNotificationJob::dispatch($affiliatorPhone, $messageToAffiliator);
            }

            // 2b. Kirim Pesan Notifikasi ke Owner/Admin Website
            if ($this->adminNumber) {
                $affiliatorName = $affiliator->name; // Ambil nama dari data affiliate

                $messageToAdmin = "Halo Bos! Ada komisi baru masuk nih 🤑\n\n"
                    . "Buat affiliator: *{$affiliatorName}*\n"
                    . "Dari member baru: *{$user->name}*\n"
                    . "Sebesar: *{$commissionAmount}*\n\n"
                    . "Jangan lupa di-approve di admin panel ya:\n"
                    . $adminUrl;

                // $this->waService->sendMessage($adminPhone, $messageToAdmin);
                SendWhatsappNotificationJob::dispatch($this->adminNumber, $messageToAdmin);
            }
        }
    }

    /**
     * Kirim notifikasi jika pembayaran gagal
     */
    public function sendFailedNotification(Order $order): void
    {
        $formData = $order->meta['form_data'] ?? null;
        $messageToMember = "Yah, {$formData['name']} 😢\n\n"
            . "Pembayaran kamu untuk pendaftaran kamu gagal nih.\n\n"
            . "Coba lagi yuk! Kalau ada masalah, kontak admin yaa.";
        // $this->waService->sendMessage($formData['phone'], $messageToMember);
        SendWhatsappNotificationJob::dispatch($formData['phone'], $messageToMember);
    }

    public function sendPendingNotification(Order $order): void
    {
        // 1. Ambil data penting dari 'meta' order
        $formData = $order->meta['form_data'] ?? null;
        $paymentUrl = $order->meta['payment_url'] ?? null; // <-- Ambil URL pembayaran

        // 2. Validasi data
        if (!$formData || !isset($formData['phone'])) {
            Log::warning('Gagal kirim WA pending: Data form/nomor HP tidak ditemukan di meta order.', [
                'order_id' => $order->order_id
            ]);
            return;
        }

        // 3. Validasi URL (PENTING)
        // Jika tidak ada URL, jangan kirim pesan agar tidak membingungkan member
        if (!$paymentUrl) {
            Log::error('Gagal kirim WA pending: meta->payment_url tidak ditemukan.', [
                'order_id' => $order->order_id
            ]);
            return;
        }

        // 4. Siapkan variabel pesan
        $name = $formData['name'] ?? 'kamu';
        $phone = $formData['phone'];

        // --- INI TEMPLATE PESANNYA ---

        $messageToMember = "Haii {$name}! 👋\n\n"
            . "Ini aku, Admin dari " . env('APP_NAME') . ".\n"
            . "Aku lihat pembayaran kamu buat daftar statusnya masih *pending* nih. Sayang banget, padahal udah selangkah lagi.\n\n"
            . "Yuk, selesaikan pembayarannya sekarang biar akunmu bisa langsung aktif. Kamu bisa lanjutin di link ini ya:\n"
            . "➡️ *{$paymentUrl}*\n\n"
            . "Ditunggu ya, biar kamu bisa cepet join dan mulai belajar! 😉";

        // 5. Kirim pesan
        $this->waService->sendMessage($phone, $messageToMember);
    }

    public function finalizeProductPurchase(Order $order): ?UserPurchase
    {
        // 1. Dapatkan User (User PASTI ada di order produk)
        $user = $order->user;
        if (!$user) {
            Log::error('Gagal finalisasi produk: User tidak ditemukan di order.', ['order_id' => $order->order_id]);
            return null;
        }

        // 2. Dapatkan Product
        $productId = $order->meta['product_id'] ?? null;
        $product = Product::find($productId);
        if (!$product) {
            Log::error('Gagal finalisasi produk: Produk tidak ditemukan di meta.', ['order_id' => $order->order_id]);
            return null;
        }

        // 3. Cek Idempotency (jika sudah dibeli, jangan proses lagi)
        if ($product->isOwnedBy($user->id)) {
            Log::info('Finalisasi produk dilewati: User sudah memiliki produk.', [
                'order_id' => $order->order_id,
                'user_id' => $user->id
            ]);
            return null; // Berhenti di sini
        }

        // 4. Buat UserPurchase (catat kepemilikan)
        $purchase = UserPurchase::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'order_id' => $order->id,
            'amount_paid' => $order->amount,
        ]);

        // 5. Berikan Komisi Affiliate (Upsell)
        // Ini akan otomatis menggunakan 'affiliate_click_id' dari meta order
        $conversion = $this->affiliateService->awardConversion(
            $order,
            $user,
            $order->amount,
            ['registration' => false, 'product_upsell' => true],
            $product->id
        );

        // 6. Kirim Notifikasi WA (Sukses)
        try {
            $this->sendProductSuccessNotifications($user, $product, $conversion);
        } catch (\Exception $e) {
            Log::error('Gagal kirim WA notifikasi produk: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'order_id' => $order->order_id
            ]);
        }

        return $purchase;
    }

    /**
     * Mengirim notifikasi WA untuk pembelian produk (upsell)
     */
    public function sendProductSuccessNotifications(User $user, Product $product, $conversion): void
    {
        // 1. Ke Member
        $messageToMember = "Yeay, {$user->name}! Pembayaran kamu berhasil 🤩\n\n"
            . "Produk *'{$product->title}'* udah aktif di akun kamu dan bisa langsung kamu akses di Member Area yaa.\n\n"
            . "Makasih udah belanja lagi. Selamat belajar!";
        // $this->waService->sendMessage($user->phone, $messageToMember);
        SendWhatsappNotificationJob::dispatch($user->phone, $messageToMember);

        // 2. Ke Affiliator & Admin (jika ada komisi)
        if ($conversion) {
            $affiliator = $conversion->affiliate;
            $affiliatorUser = $affiliator->user;
            $commissionAmount = 'Rp ' . number_format($conversion->commission_amount, 0, ',', '.');
            $adminUrl = url('/admin/affiliates/conversions/list');

            // 2a. Ke Affiliator
            if ($affiliatorUser && $affiliatorUser->phone) {
                $messageToAffiliator = "Mantap, {$affiliatorUser->name}! Ada komisi upsell nih 💸\n\n"
                    . "Member kamu ({$user->name}) baru aja beli produk *'{$product->title}'*. Komisi *{$commissionAmount}* udah masuk ke saldo pending kamu.\n\n"
                    . "Makin cuan! 🔥";
                // $this->waService->sendMessage($affiliatorUser->phone, $messageToAffiliator);
                SendWhatsappNotificationJob::dispatch($affiliatorUser->phone, $messageToAffiliator);
            }

            // 2b. Ke Admin
            if ($this->adminNumber) {
                $messageToAdmin = "Info Bos! Ada penjualan upsell 📈\n\n"
                    . "Affiliator: *{$affiliator->name}*\n"
                    . "Member: *{$user->name}*\n"
                    . "Produk: *{$product->title}*\n"
                    . "Komisi: *{$commissionAmount}*\n\n"
                    . "Link approval: {$adminUrl}";
                // $this->waService->sendMessage($adminPhone, $messageToAdmin);
                SendWhatsappNotificationJob::dispatch($this->adminNumber, $messageToAdmin);
            }
        }
    }
}
