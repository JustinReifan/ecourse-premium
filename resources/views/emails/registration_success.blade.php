<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Selamat Bergabung!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6; color: #333;">
    
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 40px 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #111; margin: 0; font-size: 24px;">Yeay! Selamat Datang! 🎉</h2>
        </div>

        <p style="font-size: 16px; color: #4b5563;">Hai <strong>{{ $user->name }}</strong>! 👋</p>
        
        <p style="font-size: 16px; color: #4b5563;">
            Seneng banget akhirnya kamu resmi bergabung di <strong>{{ config('app.name') }}</strong>.
        </p>
        
        <p style="font-size: 16px; color: #4b5563;">
            Aku mau kabarin kalau pembayaran kamu udah beres diterima, dan akun kamu sekarang udah <strong>aktif sepenuhnya</strong>. Sekarang waktunya buat mulai belajar dan <strong>upgrade skill</strong> kamu! 🚀
        </p>
        
        <p style="font-size: 16px; color: #4b5563;">
            Kamu bisa langsung login pakai email dan password yang tadi kamu daftarin ya.
        </p>
        
        <div style="text-align: center; margin: 35px 0;">
            <a href="{{ $loginUrl }}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
                Mulai Belajar Sekarang
            </a>
        </div>
        
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            Kalau tombol di atas nggak bisa diklik, kamu bisa copy-paste link ini ke browser kamu ya:<br>
            <a href="{{ $loginUrl }}" style="color: #4f46e5; word-break: break-all;">{{ $loginUrl }}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 16px; color: #4b5563; margin-bottom: 0;">
            Semangat belajarnya ya! Kalau ada kendala, jangan sungkan buat sapa aku.
        </p>
        
        <p style="font-size: 16px; color: #111; font-weight: bold; margin-top: 10px;">
            Salam hangat,<br>
            Admin {{ config('app.name') }}
        </p>
    </div>

</body>
</html>