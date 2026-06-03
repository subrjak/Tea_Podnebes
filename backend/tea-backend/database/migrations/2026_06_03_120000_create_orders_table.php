<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_telegram')->nullable();
            $table->text('delivery_address')->nullable();
            $table->text('comment')->nullable();
            $table->string('payment_method');
            $table->string('payment_status')->default('pending');
            $table->string('status')->default('pending');
            $table->unsignedInteger('total_weight')->default(0);
            $table->unsignedInteger('total_quantity')->default(0);
            $table->unsignedInteger('total_price')->default(0);
            $table->string('telegram_message_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
