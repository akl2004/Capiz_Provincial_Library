<?php

namespace App\Http\Controllers;

use App\Models\Patron;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PatronController extends Controller
{
    public function index()
    {
        return Patron::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patron_id' => 'nullable|string|unique:patrons,patron_id', // allow null
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:patrons,email',
            'address' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
        ]);

        // If patron_id not provided → auto-generate
        if (empty($validated['patron_id'])) {
            $validated['patron_id'] = Patron::generateUniquePatronId();
        }

        $patron = Patron::create($validated);

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
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:patrons,email,' . $id,
            'address' => 'nullable|string|max:255',
            'number' => 'nullable|string|max:20',
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

    // ✅ Fetch by patron_id (like P00123)
    public function getByPatronId($patronId)
    {
        $patron = Patron::where('patron_id', $patronId)->first();

        if (!$patron) {
            return response()->json(['message' => 'Patron not found'], 404);
        }

        return response()->json($patron);
    }

    // Generate a unique Patron ID
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
    

}
