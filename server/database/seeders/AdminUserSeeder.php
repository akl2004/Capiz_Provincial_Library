<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (!User::where('email', 'admin@library.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@library.com',
                'password' => 'admin123',
                'role' => 'admin',
                'status' => 'active',
            ]);
        }
    }
}
