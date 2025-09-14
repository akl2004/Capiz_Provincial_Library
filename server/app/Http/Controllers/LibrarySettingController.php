<?php

namespace App\Http\Controllers;

use App\Models\LibrarySetting;
use Illuminate\Http\Request;

class LibrarySettingController extends Controller
{
    public function getLoanDays()
    {
        $days = LibrarySetting::getValue('default_loan_days', 5);
        return response()->json(['loan_days' => (int) $days]);
    }

    public function updateLoanDays(Request $request)
    {
        $validated = $request->validate([
            'loan_days' => 'required|integer|min:1|max:60', // up to 60 days
        ]);

        LibrarySetting::setValue('default_loan_days', $validated['loan_days']);

        return response()->json([
            'message' => 'Default loan days updated successfully',
            'loan_days' => $validated['loan_days']
        ]);
    }
}
