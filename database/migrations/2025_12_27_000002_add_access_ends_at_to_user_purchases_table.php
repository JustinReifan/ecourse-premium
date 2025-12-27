<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_purchases', function (Blueprint $table) {
            // null = Lifetime access, date = expires after this timestamp
            $table->timestamp('access_ends_at')->nullable()->after('amount_paid');
        });
    }

    public function down(): void
    {
        Schema::table('user_purchases', function (Blueprint $table) {
            $table->dropColumn('access_ends_at');
        });
    }
};
