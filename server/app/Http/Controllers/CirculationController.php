<?php 

namespace App\Http\Controllers;

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
        $records = Circulation::with(['bookCopy.book', 'patron'])->get();
        return response()->json($records);
    }

    // Borrow a specific book copy
    public function borrow(Request $request)
{
    $validated = $request->validate([
        'book_copy_id' => 'required|exists:book_copies,id',
        'patron_id'    => 'required|exists:patrons,patron_id', // validate by custom Patron ID
    ]);

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

    return response()->json([
        'message' => 'Book copy borrowed successfully',
        'circulation' => $circulation
    ], 201);
    }


    // Return a borrowed book copy
    public function return(Request $request, $id)
    {
        $circulation = Circulation::findOrFail($id);

        if ($circulation->status !== 'borrowed') {
            return response()->json(['message' => 'This record is not currently borrowed'], 400);
        }

        $returnDate = now();

        $overdueBy = $returnDate->gt($circulation->due_date)
            ? $circulation->due_date->diffInDays($returnDate)
            : 0;

        // ✅ Get fine rate from settings (default ₱5/day if not set)
        $fineRate = (int) LibrarySetting::getValue('fine_per_day', 5);

        $fine = $overdueBy * $fineRate;

        $circulation->update([
            'date_returned' => $returnDate,
            'overdue_by'    => $overdueBy,
            'fine'          => $fine,
            'status'        => 'returned',
        ]);

        // make ONLY this copy available again
        $circulation->bookCopy->update(['status' => 'available']);

        return response()->json([
            'message'     => 'Book copy returned successfully',
            'circulation' => $circulation
        ]);
    }

    // Renew a borrowed book copy (extend due date)
    public function renew($id)
    {
        $circulation = Circulation::findOrFail($id);

        if ($circulation->status !== 'borrowed') {
            return response()->json(['message' => 'This record is not currently borrowed'], 400);
        }

        // ✅ Get loan days, fine rate & renewal limit from settings
        $loanDays = (int) LibrarySetting::getValue('default_loan_days', 5);
        $fineRate = (int) LibrarySetting::getValue('fine_per_day', 5);
        $renewalLimit = (int) LibrarySetting::getValue('renewal_limit', 2);

        // Check renewal count
        if ($circulation->renewal_count >= $renewalLimit) {
            return response()->json(['message' => 'Maximum renewal limit reached'], 400);
        }

        $now = now();
        $fine = 0;

        if ($now->gt($circulation->due_date)) {
            // Overdue → fine is applied, new due date starts from today
            $overdueBy = $circulation->due_date->diffInDays($now);
            $fine = $overdueBy * $fineRate;
            $newDueDate = $now->copy()->addDays($loanDays);
        } else {
            // On time → extend from current due date
            $overdueBy = 0;
            $newDueDate = $circulation->due_date->copy()->addDays($loanDays);
        }

        $circulation->update([
            'renewal_date' => $now,
            'renewal_count' => $circulation->renewal_count + 1,
            'due_date' => $newDueDate,
            'overdue_by' => $overdueBy,
            'fine' => $circulation->fine + $fine,
            'status' => 'borrowed',
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


}
