<?php

namespace Database\Seeders;

use App\Models\MaterialType;
use Illuminate\Database\Seeder;

class MaterialTypeSeeder extends Seeder {
    public function run(): void {
        $types = [
            ['name' => 'Book'],
            ['name' => 'Magazine'],
            ['name' => 'Journal'],
        ];

        foreach ($types as $type) {
            MaterialType::create($type);
        }
    }
}

