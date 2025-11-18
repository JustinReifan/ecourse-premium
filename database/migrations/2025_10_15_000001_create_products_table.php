<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->longText('description')->nullable();
            $table->decimal('price', 15, 2);
            $table->string('thumbnail')->nullable();
            $table->enum('type', ['ecourse', 'ebook', 'template', 'affiliate_link'])->default('ecourse');
            $table->string('file_path')->nullable(); // For ebook/template files
            $table->string('external_url')->nullable(); // For affiliate links
            $table->integer('order')->default(0);
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
