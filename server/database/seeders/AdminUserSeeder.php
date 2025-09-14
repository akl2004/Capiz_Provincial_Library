<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Check if admin already exists
        if (!User::where('email', 'admin@library.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'admin@library.com',
                'password' => 'admin123', // Will be hashed automatically
                'role' => 'Admin',
                'status' => 'active',
            ]);
        }
    }
}
