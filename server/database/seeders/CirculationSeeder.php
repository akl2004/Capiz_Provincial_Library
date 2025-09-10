<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Circulation;
use App\Models\BookCopy;
use App\Models\Patron;
use Carbon\Carbon;

class CirculationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get any book copy & patron (adjust IDs if needed)
        $bookCopy = BookCopy::inRandomOrder()->first();
        $patron   = Patron::inRandomOrder()->first();

        if (!$bookCopy || !$patron) {
            $this->command->warn("⚠️ No BookCopy or Patron found. Please seed those first.");
            return;
        }

        Circulation::create([
            'book_copy_id' => $bookCopy->id,
            'patron_id' => $patron->id,
            'issue_date' => now(),
            'due_date' => now()->addDays(5),
            'renewal_date' => null,
            'overdue_by' => 0,
            'fine' => 0,
            'date_returned' => null,
            'status' => 'borrowed', // available, borrowed, returned, lost
        ]);

        $this->command->info("✅ Circulation record seeded successfully!");
    }
}
