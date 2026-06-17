<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teas', function (Blueprint $table) {
            $table->index('name');
            $table->index('price');
            $table->index(['category_id', 'price']);
        });
    }

    public function down(): void
    {
        Schema::table('teas', function (Blueprint $table) {
            $table->dropIndex(['name']);
            $table->dropIndex(['price']);
            $table->dropIndex(['category_id', 'price']);
        });
    }
};
