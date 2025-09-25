<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Circulation;
use App\Models\BookCopy;
use App\Models\Patron;
use App\Models\Book;
use Carbon\Carbon;

class CirculationSeeder extends Seeder
{
    public function run(): void
    {
        // Create sample patrons
        $patron1 = Patron::firstOrCreate(
            ['patron_id' => 'P001'],
            ['name' => 'Alice Johnson', 'email' => 'alice@example.com']
        );

        $patron2 = Patron::firstOrCreate(
            ['patron_id' => 'P002'],
            ['name' => 'Bob Smith', 'email' => 'bob@example.com']
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

        $numCopies = 2;

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
                    'source'           => 'donated',
                    'location_of_book' => 'Main Library Shelf A1',
                ]
            );
        }

        // Grab two copies
        $copies = BookCopy::where('book_id', $book->id)->orderBy('id')->take(2)->get();
        $copy1 = $copies->get(0);
        $copy2 = $copies->get(1);

        // Circulation samples
        if ($copy1) {
            Circulation::create([
                'book_copy_id'  => $copy1->id,
                'patron_id'     => $patron1->id,
                'issue_date'    => Carbon::now()->subDays(3),
                'due_date'      => Carbon::now()->addDays(2),
                'status'        => 'borrowed',
                'renewal_count' => 0,
                'overdue_by'    => 0,
                'fine'          => 0,
            ]);
        }

        if ($copy2) {
            Circulation::create([
                'book_copy_id'   => $copy2->id,
                'patron_id'      => $patron2->id,
                'issue_date'     => Carbon::now()->subDays(10),
                'due_date'       => Carbon::now()->subDays(5),
                'date_returned'  => Carbon::now()->subDays(2),
                'status'         => 'returned',
                'renewal_count'  => 1,
                'renewal_date'   => Carbon::now()->subDays(7),
                'overdue_by'     => 3,
                'fine'           => 30,
            ]);
        }
    }
}
