<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\WhatsappService;

class WhatsappNotifController extends Controller
{
    /**
     * Mengirim pesan WA kustom ke pengguna yang sedang login.
     */
    public function sendMessage(Request $request, WhatsappService $waService)
    {
        // 1. Validasi input dari front-end
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'phone' => 'required|string|max:15',
        ]);


        // 2. Panggil WhatsappService Anda
        try {
            $success = $waService->sendMessage($validated['phone'], $validated['message']);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pesan WhatsApp berhasil dikirim!',
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengirim pesan. Silakan coba lagi.',
                ], 500); // 500 = Internal Server Error
            }
        } catch (\Exception $e) {
            Log::error('Error calling sendMyMessage: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }
}
