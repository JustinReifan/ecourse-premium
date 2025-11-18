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
        Schema::create('affiliate_milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->nullable()->constrained('affiliate_campaigns')->onDelete('set null');
            $table->integer('target_conversions'); // e.g. 10 conversions/week
            $table->decimal('bonus_amount', 15, 2)->nullable(); // fixed bonus
            $table->decimal('bonus_percent', 5, 2)->nullable(); // % bonus on top of total commission
            $table->string('period')->default('weekly'); // daily/weekly/monthly
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affiliate_milestones');
    }
};
