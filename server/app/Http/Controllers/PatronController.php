<?php

namespace App\Http\Controllers;

use App\Models\LibrarySetting;
use App\Models\Patron;
use Carbon\Carbon;
use Illuminate\Http\Request;

class PatronController extends Controller
{
    public function index()
    {
        // Get expiration years from settings
        $expirationYears = (int) LibrarySetting::getValue('patron_expiration_years', 3);

        // Fetch all patrons and add a dynamic expiration_date field
        $patrons = Patron::all()->map(function ($patron) use ($expirationYears) {
            $createdAt = $patron->created_at ?? now(); // fallback to now if null
            $patron->expiration_date = Carbon::parse($createdAt)->addYears($expirationYears);
            return $patron;
        });

        return response()->json($patrons);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patron_id'   => 'nullable|string|unique:patrons,patron_id',
            'first_name'  => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'required|string|max:255',
            'suffix'      => 'nullable|string|max:50',
            'email'       => 'required|email|unique:patrons,email',
            'barangay'    => 'nullable|string|max:255',
            'city'        => 'required|string|max:255',
            'province'    => 'required|string|max:255',
            'number'      => 'nullable|string|max:20',
            'status'      => 'nullable|string|max:50',
            'age'         => 'nullable|integer|min:0',
            'gender'      => 'nullable|string|max:10',
            'notes'       => 'nullable|string',
        ]);

        if (empty($validated['patron_id'])) {
            $validated['patron_id'] = Patron::generateUniquePatronId();
        }

        $patron = Patron::create($validated);

        // Add expiration_date dynamically
        $createdAt = $patron->created_at ?? now();
        $patron->expiration_date = Carbon::parse($createdAt)
            ->addYears((int) LibrarySetting::getValue('patron_expiration_years', 3));


        return response()->json($patron, 201);
    }

    public function show($id)
    {
        return Patron::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $patron = Patron::findOrFail($id);

        $validated = $request->validate([
            'first_name'  => 'sometimes|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name'   => 'sometimes|string|max:255',
            'suffix'      => 'nullable|string|max:50',
            'email'       => 'sometimes|email|unique:patrons,email,' . $id,
            'barangay'    => 'nullable|string|max:255',
            'city'        => 'sometimes|string|max:255',
            'province'    => 'sometimes|string|max:255',
            'number'      => 'nullable|string|max:20',
            'status'      => 'nullable|string|max:50',
            'age'         => 'nullable|integer|min:0',
            'gender'      => 'nullable|string|max:10',
            'notes'       => 'nullable|string',
        ]);

        $patron->update($validated);

        return response()->json($patron);
    }

    public function destroy($id)
    {
        $patron = Patron::findOrFail($id);
        $patron->delete();

        return response()->json(['message' => 'Patron deleted']);
    }

    public function getByPatronId($patronId)
    {
        $patron = Patron::where('patron_id', $patronId)->first();

        if (!$patron) {
            return response()->json(['message' => 'Patron not found'], 404);
        }

        return response()->json($patron);
    }

    public function generatePatronId()
    {
        try {
            $patronId = Patron::generateUniquePatronId();
            return response()->json(['patron_id' => $patronId]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate unique Patron ID',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function stats($id)
    {
        $patron = Patron::with('circulations')->findOrFail($id);

        $stats = [
            'borrowedBooks' => $patron->circulations()->count(),
            'returnedBooks' => $patron->circulations()->where('status', 'returned')->count(),
            'totalFine' => $patron->circulations()->sum('fine'),
            'overdueBooks' => $patron->circulations()
            ->where('status', '!=', 'returned')
            ->where('due_date', '<', now())
            ->count(),
            'history' => $patron->circulations()->get() // full circulation records
        ];

        return response()->json($stats);
    }

    
    public function deactivate($id)
    {
        $patron = Patron::findOrFail($id);

        $patron->status = 'Deactivated';
        $patron->save();

        return response()->json([
            'message' => 'Patron account deactivated successfully',
            'patron' => $patron
        ]);
    }

}
