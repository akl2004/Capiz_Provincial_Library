<?php

namespace Database\Seeders;

use App\Models\Source;
use Illuminate\Database\Seeder;

class SourceSeeder extends Seeder {
    public function run(): void {
        $sources = [
            ['name' => 'Library'],
            ['name' => 'Donated'],
        ];

        foreach ($sources as $source) {
            Source::create($source);
        }
    }
}
