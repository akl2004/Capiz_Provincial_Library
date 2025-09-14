<?php 

namespace App\Http\Controllers;

use App\Models\Circulation;
use App\Models\BookCopy;
use App\Models\LibrarySetting;
use App\Models\Patron;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

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
            'patron_id'    => 'required|exists:patrons,patron_id', // ✅ validate by custom Patron ID
        ]);

        $bookCopy = BookCopy::findOrFail($validated['book_copy_id']);
        $patron   = Patron::where('patron_id', $validated['patron_id'])->firstOrFail();

        if ($bookCopy->status === 'borrowed') {
            return response()->json(['message' => 'This copy is already borrowed'], 400);
        }

        $issueDate = now();

        // ✅ Fetch global default (fallback = 5 days if not set)
        $loanDays = (int) LibrarySetting::getValue('default_loan_days', 5);

        $dueDate = Carbon::parse($issueDate)->addDays($loanDays);

        $circulation = Circulation::create([
            'book_copy_id' => $bookCopy->id,
            'patron_id'    => $patron->id,
            'issue_date'   => $issueDate,
            'due_date'     => $dueDate,
            'status'       => 'borrowed',
        ]);

        $bookCopy->update(['status' => 'borrowed']);

        return response()->json([
            'message'     => 'Book copy borrowed successfully',
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
        $fine = $overdueBy * 10; // e.g. ₱10 per overdue day

        $circulation->update([
            'date_returned' => $returnDate,
            'overdue_by' => $overdueBy,
            'fine' => $fine,
            'status' => 'returned',
        ]);

        // make ONLY this copy available again
        $circulation->bookCopy->update(['status' => 'available']);

        return response()->json([
            'message' => 'Book copy returned successfully',
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

        $newDueDate = $circulation->due_date->copy()->addDays(5);

        $circulation->update([
            'renewal_date' => now(),
            'due_date' => $newDueDate,
            'status' => 'renewed',
        ]);

        return response()->json([
            'message' => 'Book copy renewed successfully',
            'circulation' => $circulation
        ]);
    }

    // Reports: number of borrowed, returned, overdue, renewed
    public function reports()
    {
        $borrowed = Circulation::where('status', 'borrowed')->count();
        $returned = Circulation::where('status', 'returned')->count();
        $renewed = Circulation::where('status', 'renewed')->count();
        $overdue = Circulation::where('status', 'borrowed')
            ->where('due_date', '<', now())
            ->count();

        return response()->json([
            'borrowed' => $borrowed,
            'returned' => $returned,
            'renewed' => $renewed,
            'overdue' => $overdue,
        ]);
    }
}
