<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_phone')->nullable()->after('email');
            $table->string('profile_telegram')->nullable()->after('profile_phone');
            $table->text('profile_address')->nullable()->after('profile_telegram');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('discount_percent')->default(0)->after('total_quantity');
            $table->unsignedInteger('subtotal_price')->default(0)->after('discount_percent');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['discount_percent', 'subtotal_price']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['profile_phone', 'profile_telegram', 'profile_address']);
        });
    }
};
