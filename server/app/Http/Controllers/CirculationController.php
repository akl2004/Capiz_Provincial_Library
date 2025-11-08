<?php 

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Circulation;
use App\Models\BookCopy;
use App\Models\LibrarySetting;
use App\Models\Patron;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;


class CirculationController extends Controller
{
    // Show all circulation records
    public function index()
    {
        // Fetch all circulation records
        $records = Circulation::with(['bookCopy.book', 'patron'])->get();

        // Define fine rate from settings
        $fineRate = (int) LibrarySetting::getValue('fine_per_day', 5);

        $records = $records->map(function ($rec) use ($fineRate) {
            $dueDate = $rec->due_date instanceof \Carbon\Carbon
                ? $rec->due_date
                : \Carbon\Carbon::parse($rec->due_date);

            $now = now();
            $overdueBy = ($rec->status === 'borrowed' && $now->gt($dueDate))
                ? $dueDate->diffInDays($now)
                : 0;

            $rec->overdue_by = $overdueBy;

            // Only set fine for display if status is borrowed
            if ($rec->status === 'returned') {
                $rec->fine = $rec->fine; // leave stored fine
            } else {
                $rec->fine = $overdueBy * $fineRate; // for display only
            }

            return $rec;
        });

        return response()->json($records);
    }



    // Borrow a specific book copy
    public function borrow(Request $request)
{
    $validated = $request->validate([
        'book_copy_id' => 'required|exists:book_copies,id',
        'patron_id'    => 'required|exists:patrons,patron_id', // validate by custom Patron ID
    ]);

    $user = $request->user();

    $bookCopy = BookCopy::findOrFail($validated['book_copy_id']);
    $patron   = Patron::where('patron_id', $validated['patron_id'])->firstOrFail();

    // Check patron status
    if ($patron->status !== 'Active') {
        return response()->json([
            'message' => 'Cannot issue book: Patron is deactivated or blocked.'
        ], 403);
    }

    // Check book availability
    if ($bookCopy->status !== 'available') {
        return response()->json([
            'message' => 'Cannot issue book: Book is already borrowed.'
        ], 400);
    }

    // Set issue date and loan days
    $issueDate = now();
    $loanDays = (int) LibrarySetting::getValue('default_loan_days', 5);

    // Use DB transaction for safety
    $circulation = null;
    DB::transaction(function () use ($bookCopy, $patron, $issueDate, $loanDays, &$circulation) {
        $dueDate = Carbon::parse($issueDate)->addDays($loanDays);

        $circulation = Circulation::create([
            'book_copy_id' => $bookCopy->id,
            'patron_id' => $patron->id,
            'issue_date' => $issueDate,
            'due_date' => $dueDate,
            'status' => 'borrowed',
        ]);

        // Mark book as borrowed
        $bookCopy->update(['status' => 'borrowed']);
    });

    // ✅ Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role ?? 'staff',
            'module' => 'Circulation Module',
            'action' => 'Processed Issue',
            'description' => "Borrowed copy of '{$bookCopy->book->title}'"
        ]);

    return response()->json([
        'message' => 'Book copy borrowed successfully',
        'circulation' => $circulation
    ], 201);
    }


    // Return a borrowed book copy
    public function return(Request $request)
    {
        $request->validate([
            'book_copy_id' => 'required|exists:book_copies,id',
        ]);

        $user = $request->user();

        $circulation = Circulation::where('book_copy_id', $request->book_copy_id)
            ->where('status', 'borrowed')
            ->latest('issue_date')
            ->firstOrFail();

        $returnDate = now();

        $overdueBy = $returnDate->gt($circulation->due_date)
            ? $circulation->due_date->diffInDays($returnDate)
            : 0;

        $fineRate = (int) LibrarySetting::getValue('fine_per_day', 5);
        $fine = $overdueBy * $fineRate;

        $circulation->update([
            'date_returned' => $returnDate,
            'overdue_by'    => $overdueBy,
            'fine'          => $fine,
            'status'        => 'returned',
        ]);

        $circulation->bookCopy->update(['status' => 'available']);

        // ✅ Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role ?? 'staff',
            'module' => 'Circulation Module',
            'action' => 'Processed Return',
            'description' => "Returned copy of '{$circulation->bookCopy->book->title}'"
        ]);

        return response()->json([
            'message'     => 'Book copy returned successfully',
            'circulation' => $circulation,
        ]);
    }


    // Renew a borrowed book copy (extend due date)
    public function renew(Request $request)
    {
        // Validate input
        $request->validate([
            'book_copy_id' => 'required|exists:book_copies,id',
        ]);

        $user = $request->user();

        // Find the latest borrowed circulation for this book copy
        $circulation = Circulation::where('book_copy_id', $request->book_copy_id)
            ->where('status', 'borrowed')
            ->latest('issue_date')
            ->firstOrFail();

        // Ensure the book is currently borrowed
        if ($circulation->status !== 'borrowed') {
            return response()->json(['message' => 'This record is not currently borrowed'], 400);
        }

        // Prevent renewal if there is an unpaid fine
        if ($circulation->fine > 0) {
            return response()->json([
                'message' => 'Cannot renew book: Please settle the outstanding fine first.',
                'fine' => $circulation->fine
            ], 400);
        }

        // Get loan days & renewal limit from settings
        $loanDays = (int) LibrarySetting::getValue('default_loan_days', 5);
        $renewalLimit = (int) LibrarySetting::getValue('renewal_limit', 2);

        // Check renewal count
        if ($circulation->renewal_count >= $renewalLimit) {
            return response()->json(['message' => 'Maximum renewal limit reached'], 400);
        }

        // Extend due date
        $dueDate = $circulation->due_date instanceof Carbon
            ? $circulation->due_date
            : Carbon::parse($circulation->due_date);

        $newDueDate = $dueDate->copy()->addDays($loanDays);

        // Update circulation
        $circulation->update([
            'renewal_date' => now(),
            'renewal_count' => $circulation->renewal_count + 1,
            'due_date' => $newDueDate,
            'status' => 'borrowed',
        ]);

        // ✅ Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'role' => $user->role ?? 'staff',
            'module' => 'Circulation Module',
            'action' => 'Processed Renewal',
            'description' => "Renewed copy of '{$circulation->bookCopy->book->title}'"
        ]);

        return response()->json([
            'message' => 'Book copy renewed successfully',
            'circulation' => $circulation
        ]);
    }




    // Reports: number of borrowed, returned, overdue
    public function reports()
    {
        $borrowed = Circulation::where('status', 'borrowed')->count();
        $returned = Circulation::where('status', 'returned')->count();
        $overdue = Circulation::where('status', 'borrowed')
            ->where('due_date', '<', now())
            ->count();

        return response()->json([
            'borrowed' => $borrowed,
            'returned' => $returned,
            'overdue' => $overdue,
        ]);
    }

    // Get all transactions for a specific patron
    public function patronTransactions($patronId)
    {
        $transactions = Circulation::with(['bookCopy.book'])
            ->where('patron_id', $patronId)
            ->get()
            ->map(function ($t) {
                return [
                    'id'          => $t->id,
                    'book_title'  => $t->bookCopy->book->title ?? 'Unknown',
                    'call_number' => $t->bookCopy->book->call_number ?? 'N/A',
                    'copy_number' => $t->bookCopy->copy_number ?? 'N/A',
                    'status'      => $t->status,
                    'date_issued' => $t->issue_date,
                    'due_date'    => $t->due_date,
                    'return_date' => $t->date_returned,
                    'fine'        => (float) ($t->fine ?? 0),
                ];
            });

        return response()->json($transactions);
    }

    
    public function getBorrowedBookByBarcode($barcode)
    {
        $bookCopy = BookCopy::with('book')->where('barcode', $barcode)->firstOrFail();

        // Find the latest borrowed circulation record for this copy
        $circulation = Circulation::with('patron')
            ->where('book_copy_id', $bookCopy->id)
            ->where('status', 'borrowed')
            ->latest('issue_date')
            ->first();

        if (!$circulation) {
            return response()->json([
                'message' => 'This book is not currently borrowed.'
            ], 404);
        }

        // Ensure due_date is a Carbon instance
        $dueDate = $circulation->due_date instanceof \Carbon\Carbon
            ? $circulation->due_date
            : \Carbon\Carbon::parse($circulation->due_date);

        $now = now();
        $overdueBy = $now->gt($dueDate) ? $dueDate->diffInDays($now) : 0;

        $fineRate = (int) LibrarySetting::getValue('fine_per_day', 5);
        $fine = $overdueBy * $fineRate;

        // Attach patron info and overdue/fine
        $bookCopyArray = $bookCopy->toArray();
        $bookCopyArray['borrowed_by'] = [
            'patron_id'   => $circulation->patron->patron_id,
            'first_name'  => $circulation->patron->first_name,
            'middle_name' => $circulation->patron->middle_name,
            'last_name'   => $circulation->patron->last_name,
            'suffix'      => $circulation->patron->suffix,
        ];
        $bookCopyArray['overdue_by'] = $overdueBy;
        $bookCopyArray['fine'] = $fine;
        $bookCopyArray['issue_date'] = $circulation->issue_date;
        $bookCopyArray['due_date'] = $circulation->due_date;
        $bookCopyArray['renewal_date'] = $circulation->renewal_date;


        return response()->json($bookCopyArray);
    }

    // Get circulation history of a specific book copy
    public function copyHistory($copyId)
    {
        $fineRate = (int) LibrarySetting::getValue('fine_per_day', 5);

        $history = Circulation::with('patron')
            ->where('book_copy_id', $copyId)
            ->orderBy('issue_date', 'desc')
            ->get()
            ->map(function ($rec) use ($fineRate) {
                $dueDate = $rec->due_date instanceof \Carbon\Carbon
                    ? $rec->due_date
                    : \Carbon\Carbon::parse($rec->due_date);

                $returnDate = $rec->date_returned
                    ? ($rec->date_returned instanceof \Carbon\Carbon
                        ? $rec->date_returned
                        : \Carbon\Carbon::parse($rec->date_returned))
                    : null;

                $now = now();
                $overdueBy = ($rec->status === 'borrowed' && $now->gt($dueDate))
                    ? $dueDate->diffInDays($now)
                    : 0;

                $fine = $rec->status === 'returned'
                    ? ($rec->fine ?? 0)
                    : $overdueBy * $fineRate;

                return [
                    'id'           => $rec->id,
                    'borrower'     => $rec->patron->first_name . ' ' . $rec->patron->last_name,
                    'issue_date'   => $rec->issue_date,
                    'due_date'     => $rec->due_date,
                    'return_date'  => $returnDate,
                    'fine'         => $fine,
                    'status'       => $rec->status,
                ];
            });

        return response()->json($history);
    }

    // Get today's tally: borrowed, returned, overdue
    // public function todayTally()
    // {
    //     $today = Carbon::today();

    //     $borrowedToday = Circulation::where('status', 'borrowed')
    //         ->whereDate('issue_date', $today)
    //         ->count();

    //     $returnedToday = Circulation::where('status', 'returned')
    //         ->whereDate('date_returned', $today)
    //         ->count();

    //     $overdueToday = Circulation::where('status', 'borrowed')
    //         ->whereDate('due_date', '<', $today)
    //         ->count();

    //     return response()->json([
    //         'borrowedToday' => $borrowedToday,
    //         'returnedToday' => $returnedToday,
    //         'overdueToday' => $overdueToday,
    //     ]);
    // }

    // Get top 5 most borrowed books this week
    public function topBooksThisWeek()
    {
        $startOfWeek = Carbon::now()->startOfWeek();

        $topBooks = Circulation::whereDate('issue_date', '>=', $startOfWeek)
            ->join('book_copies', 'circulations.book_copy_id', '=', 'book_copies.id')
            ->join('books', 'book_copies.book_id', '=', 'books.id')
            ->select('books.title', DB::raw('COUNT(*) as borrowed_count'))
            ->groupBy('books.title')
            ->orderByDesc('borrowed_count')
            ->limit(5)
            ->get();

        return response()->json($topBooks);
    }

    // Get today's tally with percentage change from yesterday
    public function todayTallyWithPercentage()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $calcPercent = fn($todayCount, $yesterdayCount) => $yesterdayCount
            ? round((($todayCount - $yesterdayCount) / $yesterdayCount) * 100)
            : 100;

        $borrowedToday = Circulation::whereDate('issue_date', $today)->count();
        $borrowedYesterday = Circulation::whereDate('issue_date', $yesterday)->count();

        $returnedToday = Circulation::whereDate('date_returned', $today)->count();
        $returnedYesterday = Circulation::whereDate('date_returned', $yesterday)->count();

        $overdueToday = Circulation::where('status', 'borrowed')
            ->whereDate('due_date', '<', $today)
            ->count();
        $overdueYesterday = Circulation::where('status', 'borrowed')
            ->whereDate('due_date', '<', $yesterday)
            ->count();

        return response()->json([
            'borrowed' => [
                'count' => $borrowedToday,
                'percent' => $calcPercent($borrowedToday, $borrowedYesterday),
            ],
            'returned' => [
                'count' => $returnedToday,
                'percent' => $calcPercent($returnedToday, $returnedYesterday),
            ],
            'overdue' => [
                'count' => $overdueToday,
                'percent' => $calcPercent($overdueToday, $overdueYesterday),
            ],
        ]);
    }


}
