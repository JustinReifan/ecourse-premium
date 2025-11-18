<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('affiliate_commission_rate', 5, 2)->nullable()->after('price');
            $table->boolean('is_default')->default(false)->after('status');
            $table->index('is_default');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['affiliate_commission_rate', 'is_default']);
        });
    }
};
