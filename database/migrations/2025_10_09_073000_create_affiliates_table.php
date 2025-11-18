<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // user pemilik affiliate
            $table->string('aff_key')->unique(); // contoh: aff_ABC123 (dipakai di URL ?aff=)
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->foreignId('upline_affiliate_id')->nullable()->constrained('affiliates')->onDelete('set null'); // upline (referral parent)
            $table->enum('status', ['pending', 'active', 'banned'])->default('pending');
            $table->json('meta')->nullable(); // custom data (bank, payout method, notes)
            $table->decimal('balance', 15, 2)->default(0); // available balance
            $table->decimal('pending_balance', 15, 2)->default(0); // pending (not withdrawable)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliates');
    }
};
