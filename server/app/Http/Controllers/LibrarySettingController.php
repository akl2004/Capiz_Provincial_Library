<?php

namespace App\Http\Controllers;

use App\Models\LibrarySetting;
use Illuminate\Http\Request;

class LibrarySettingController extends Controller
{
    // =======================
    // 📌 Loan Days
    // =======================
    public function getLoanDays()
    {
        $days = LibrarySetting::getValue('default_loan_days', 5); // default 5 days
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
            'loan_days' => (int) $validated['loan_days']
        ]);
    }

    // =======================
    // 📌 Patron Expiration Years
    // =======================
    public function getExpirationYears()
    {
        $years = LibrarySetting::getValue('patron_expiration_years', 3); // default 3 years
        return response()->json(['expiration_years' => (int) $years]);
    }

    public function updateExpirationYears(Request $request)
    {
        $validated = $request->validate([
            'expiration_years' => 'required|integer|min:1|max:10', // up to 10 years
        ]);

        LibrarySetting::setValue('patron_expiration_years', $validated['expiration_years']);

        return response()->json([
            'message' => 'Patron expiration years updated successfully',
            'expiration_years' => (int) $validated['expiration_years']
        ]);
    }


    // =======================
    // 📌 Fine
    // =======================
    public function getFinePerDay()
    {
        $fine = LibrarySetting::getValue('fine_per_day', 5);
        return response()->json(['fine_per_day' => (int) $fine]);
    }

    public function updateFinePerDay(Request $request)
    {
        $validated = $request->validate([
            'fine_per_day' => 'required|integer|min:1|max:100',
        ]);

        LibrarySetting::setValue('fine_per_day', $validated['fine_per_day']);

        return response()->json([
            'message' => 'Fine per day updated successfully',
            'fine_per_day' => $validated['fine_per_day']
        ]);
    }


    // =======================
    // 📌 Renewal Limit
    // =======================
    public function getRenewalLimit()
    {
        $limit = LibrarySetting::getValue('renewal_limit', 2); // default = 2
        return response()->json(['renewal_limit' => (int) $limit]);
    }

    public function updateRenewalLimit(Request $request)
    {
        $validated = $request->validate([
            'renewal_limit' => 'required|integer|min:1|max:10',
        ]);

        LibrarySetting::setValue('renewal_limit', $validated['renewal_limit']);

        return response()->json([
            'message' => 'Renewal limit updated successfully',
            'renewal_limit' => $validated['renewal_limit']
        ]);
    }
}
