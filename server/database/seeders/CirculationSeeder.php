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

        // Create sample book (include required fields like section/dewey if your migration requires them)
        $book = Book::firstOrCreate(
            ['title' => 'Introduction to AI'],
            [
                'author'        => 'John McCarthy',
                'call_number'   => "GC\n006.3\nM123\n1999", // follow your call-number style
                'dewey_decimal' => '006.3',       // include if migration requires
                'author_number' => 'M123',
                'section'       => 'Gen. Circulation',
                'copyright'     => '1999'
            ]
        );

        // Determine starting accession (numeric)
        $lastCopy = BookCopy::orderBy('id', 'desc')->first();
        $startAccession = $lastCopy ? (int) $lastCopy->accession_number : 0;

        // Number of copies for this book
        $numCopies = 2;

        for ($i = 1; $i <= $numCopies; $i++) {
            // next accession — padded with leading zeros (5 digits)
            $accessionNumber = str_pad($startAccession + $i, 5, '0', STR_PAD_LEFT);

            // unique barcode (adjust as you like)
            $barcode = 'BC' . str_pad((string) (time() + $i), 6, '0', STR_PAD_LEFT);

            // create copy (include accession_number so the DB won't complain)
            BookCopy::firstOrCreate(
                ['barcode' => $barcode],
                [
                    'book_id' => $book->id,
                    'copy_number' => $i,
                    'accession_number' => $accessionNumber,
                    'status' => 'available',
                    // optional copy fields
                    'material_type' => 'Book',
                    'source' => 'donated',
                    'location_of_book' => 'Main Library Shelf A1',
                ]
            );
        }

        // Fetch the copies we created (using book->copies relation if available)
        $copies = BookCopy::where('book_id', $book->id)->orderBy('id')->take(2)->get();
        $copy1 = $copies->get(0);
        $copy2 = $copies->get(1);

        // Circulation examples
        if ($copy1) {
            Circulation::create([
                'book_copy_id' => $copy1->id,
                'patron_id'    => $patron1->id,
                'issue_date'   => Carbon::now()->subDays(3),
                'due_date'     => Carbon::now()->addDays(2),
                'status'       => 'borrowed',
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
                'fine'           => 30,
                'overdue_by'     => 3,
            ]);
        }
    }
}
