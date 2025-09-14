<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Patron;

class PatronSeeder extends Seeder
{
    public function run(): void
    {
        $patrons = [
            [
                'patron_id' => 'P001',
                'name' => 'Juan Dela Cruz',
                'email' => 'juan@example.com',
                'municipality' => 'Mambusao',
                'province' => 'Capiz',
                'barangay' => 'Poblacion Proper',
                'number' => '09171234567',
            ],
            [
                'patron_id' => 'P002',
                'name' => 'Maria Santos',
                'email' => 'maria@example.com',
                'municipality' => 'Roxas City',
                'province' => 'Capiz',
                'barangay' => 'Lawa-an',
                'number' => '09987654321',
            ],
        ];

        foreach ($patrons as $patron) {
            Patron::create($patron);
        }
    }
}
