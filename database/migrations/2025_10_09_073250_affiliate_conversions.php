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
        Schema::create('affiliate_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('campaign_id')->nullable()->constrained('affiliate_campaigns')->onDelete('set null');
            $table->string('order_id')->index(); // order reference dari sistem
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // pembeli
            $table->unsignedBigInteger('click_id')->nullable()->index(); // optional ref ke affiliate_clicks.id (last-click)
            $table->decimal('order_amount', 15, 2)->default(0);
            $table->decimal('commission_amount', 15, 2)->default(0); // berapa yang akan dikredit
            $table->enum('status', ['pending', 'approved', 'rejected', 'reversed', 'paid'])->default('pending');
            $table->json('meta')->nullable(); // payload, reason, notes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliate_conversions');
    }
};
