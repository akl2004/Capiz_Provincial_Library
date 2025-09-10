<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    // Store new guest & mark Time In
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'gender' => 'required|in:male,female,other',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
            'purpose_of_visit' => 'required|string|max:255',
        ]);

        $attendance = Attendance::create([
            ...$validated,
            'time_in' => Carbon::now(),
        ]);

        return response()->json($attendance, 201);
    }

    // Update guest Time Out
    public function timeOut($id)
    {
        $attendance = Attendance::findOrFail($id);

        if ($attendance->time_out) {
            return response()->json(['message' => 'Already timed out'], 400);
        }

        $attendance->update([
            'time_out' => Carbon::now(),
        ]);

        return response()->json($attendance);
    }

    // List all attendance records
    public function index()
    {
        return Attendance::orderBy('created_at', 'desc')->get();
    }
}
