<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('teas')->update([
            'stock' => DB::raw('stock * 100'),
        ]);
    }

    public function down(): void
    {
        DB::table('teas')->update([
            'stock' => DB::raw('CAST(stock / 100 AS INTEGER)'),
        ]);
    }
};
