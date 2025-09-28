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
            'patron_id' => 'nullable|exists:patrons,id', // optional if linked to patrons table
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:50',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'barangay' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'number' => 'nullable|string|max:50',
            'affiliation' => 'nullable|string|max:255',
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

    // Attendance for today
    public function today()
    {
        return Attendance::whereDate('time_in', today())->get();
    }

    // List all attendance records
    public function index()
    {
        return Attendance::orderBy('created_at', 'desc')->get();
    }

    // Get all activity logs for a specific patron
    public function patronLogs($id)
    {
        $logs = Attendance::where('patron_id', $id)
            ->orderBy('time_in', 'desc')
            ->get();

        if ($logs->isEmpty()) {
            return response()->json(['message' => 'No activity logs found for this patron'], 404);
        }

        return response()->json($logs);
    }

}
