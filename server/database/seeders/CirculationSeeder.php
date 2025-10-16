<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Circulation;
use App\Models\BookCopy;
use App\Models\Patron;
use App\Models\Book;
use App\Models\LibrarySetting;
use Carbon\Carbon;

class CirculationSeeder extends Seeder
{
    public function run(): void
    {
        // Fine per day from settings (fallback to 5)
        $finePerDay = (int) LibrarySetting::getValue('fine_per_day', 5);

        // Create sample patrons
        $patron1 = Patron::firstOrCreate(
            ['patron_id' => 'P001'],
            [
                'first_name'  => 'Juan',
                'middle_name' => 'S.',
                'last_name'   => 'Dela Cruz',
                'email'       => 'juan@example.com',
                'city'        => 'Mambusao',
                'province'    => 'Capiz',
                'barangay'    => 'Poblacion Proper',
                'number'      => '09171234567',
            ]
        );

        $patron2 = Patron::firstOrCreate(
            ['patron_id' => 'P002'],
            [
                'first_name'  => 'Maria',
                'middle_name' => 'L.',
                'last_name'   => 'Santos',
                'email'       => 'maria@example.com',
                'city'        => 'Roxas City',
                'province'    => 'Capiz',
                'barangay'    => 'Lawa-an',
                'number'      => '09987654321',
            ]
        );

        $patron3 = Patron::firstOrCreate(
            ['patron_id' => 'P003'],
            [
                'first_name'  => 'Charlie',
                'last_name'   => 'Brown',
                'email'       => 'charlie@example.com',
                'city'        => 'Panay',
                'province'    => 'Capiz',
                'barangay'    => 'Ilaya',
                'number'      => '09333333333',
            ]
        );

        // Create sample book
        $book = Book::firstOrCreate(
            ['title' => 'Introduction to AI'],
            [
                'author'        => 'John McCarthy',
                'call_number'   => "GC\n006.3\nM123\n1999",
                'dewey_decimal' => '006.3',
                'author_number' => 'M123',
                'section'       => 'Gen. Circulation',
                'copyright'     => '1999'
            ]
        );

        // Starting accession
        $lastCopy = BookCopy::orderBy('id', 'desc')->first();
        $startAccession = $lastCopy ? (int) $lastCopy->accession_number : 0;

        $numCopies = 3;

        for ($i = 1; $i <= $numCopies; $i++) {
            $accessionNumber = str_pad($startAccession + $i, 5, '0', STR_PAD_LEFT);
            $barcode = 'BC' . str_pad((string) (time() + $i), 6, '0', STR_PAD_LEFT);

            BookCopy::firstOrCreate(
                ['barcode' => $barcode],
                [
                    'book_id'          => $book->id,
                    'copy_number'      => $i,
                    'accession_number' => $accessionNumber,
                    'status'           => 'available',
                    'material_type'    => 'Book',
                    'source'           => 'Donation',
                    'location_of_book' => 'Main Library Shelf A1',
                ]
            );
        }

        // Grab copies
        $copies = BookCopy::where('book_id', $book->id)->orderBy('id')->take(3)->get();

        // Create deterministic circulation records
        $records = [
            // Copy 1: borrowed, not overdue
            [
                'patron' => $patron1,
                'copy' => $copies[0] ?? null,
                'status' => 'borrowed',
                'issue_days_ago' => 5,
                'loan_days' => 7
            ],
            // Copy 2: returned, on time
            [
                'patron' => $patron2,
                'copy' => $copies[1] ?? null,
                'status' => 'returned',
                'issue_days_ago' => 10,
                'loan_days' => 5
            ],
            // Copy 3: borrowed, overdue
            [
                'patron' => $patron3,
                'copy' => $copies[2] ?? null,
                'status' => 'borrowed',
                'issue_days_ago' => 14,
                'loan_days' => 7
            ],
        ];

        foreach ($records as $entry) {
            $patron = $entry['patron'];
            $copy = $entry['copy'];
            if (!$copy) continue;

            $issueDate = Carbon::now()->subDays($entry['issue_days_ago']);
            $dueDate = $issueDate->copy()->addDays($entry['loan_days']);

            if ($entry['status'] === 'returned') {
                // Use actual return date for overdue calculation
                $dateReturned = $dueDate->copy()->addDays(0); // returned on time
                $overdueBy = max(0, $dateReturned->diffInDays($dueDate));
            } else {
                $dateReturned = null;
                $overdueBy = max(0, Carbon::now()->diffInDays($dueDate, false) * -1);
            }

            $fine = $overdueBy * $finePerDay;

            Circulation::create([
                'book_copy_id'  => $copy->id,
                'patron_id'     => $patron->id,
                'issue_date'    => $issueDate,
                'due_date'      => $dueDate,
                'date_returned' => $dateReturned,
                'status'        => $entry['status'],
                'renewal_count' => 0,
                'overdue_by'    => $overdueBy,
                'fine'          => $fine,
            ]);
        }
    }
}
