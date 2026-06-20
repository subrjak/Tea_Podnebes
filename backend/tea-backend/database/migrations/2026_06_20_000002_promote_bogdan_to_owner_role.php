<?php

use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->where('name', 'Богдан')
            ->where(function ($query) {
                $query->where('admin_status', User::ROLE_ADMIN)
                    ->orWhereNull('admin_status');
            })
            ->update([
                'is_admin' => true,
                'admin_status' => User::ROLE_OWNER,
            ]);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('name', 'Богдан')
            ->where('admin_status', User::ROLE_OWNER)
            ->update([
                'is_admin' => true,
                'admin_status' => User::ROLE_ADMIN,
            ]);
    }
};
