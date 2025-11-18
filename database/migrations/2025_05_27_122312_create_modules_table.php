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
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique()->nullable();
            $table->string('video_path')->nullable();
            $table->bigInteger('order')->nullable();
            $table->boolean('is_completed')->default(false);
            $table->unsignedInteger('duration')->nullable();
            $table->string('status')->default('draft');
            $table->foreignId('course_id')->nullable()->constrained()->onDelete('cascade')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */

    public function down(): void
    {
        Schema::dropIfExists('modules');
    }
};
