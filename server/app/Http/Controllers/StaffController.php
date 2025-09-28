<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    // List all staff
    public function index()
    {
        $staff = User::where('role', 'staff')->get();
        return response()->json($staff);
    }

    // Add new staff
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'suffix' => 'nullable|string|max:50',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:staff,admin',
            'status' => 'required|in:active,onleave,inactive',
        ]);

        $fullName = $request->first_name
            . ($request->middle_name ? ' ' . $request->middle_name : '')
            . ' ' . $request->last_name
            . ($request->suffix ? ', ' . $request->suffix : '');

        $staff = User::create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'phone_number' => $request->phone_number,
            'name' => $fullName, // optional full name field
            'email' => $request->email,
            'password' => $request->password,
            'role' => $request->role,
            'status' => $request->status,
        ]);

        return response()->json($staff, 201);
    }

    // Edit staff
    public function update(Request $request, $id)
    {
        $staff = User::findOrFail($id);

        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'suffix' => 'nullable|string|max:50',
            'phone_number' => 'nullable|string|max:20',
            'email' => 'sometimes|required|email|unique:users,email,' . $staff->id,
            'password' => 'nullable|min:6',
            'role' => 'sometimes|required|in:staff,admin',
            'status' => 'sometimes|required|in:active,onleave,inactive',
        ]);

        if ($request->filled('password')) {
            $staff->password = $request->password;
        }

        // Update full name
        if ($request->filled('first_name') || $request->filled('last_name')) {
            $staff->name =
                ($request->first_name ?? $staff->first_name)
                . ($request->middle_name ?? $staff->middle_name ? ' ' . $request->middle_name : '')
                . ' ' . ($request->last_name ?? $staff->last_name)
                . ($request->suffix ?? $staff->suffix ? ', ' . $request->suffix : '');
        }

        $staff->update($request->only([
            'first_name',
            'middle_name',
            'last_name',
            'suffix',
            'phone_number',
            'email',
            'role',
            'status',
        ]));

        return response()->json($staff);
    }

    // Delete staff
    public function destroy($id)
    {
        $staff = User::findOrFail($id);
        $staff->delete();

        return response()->json(['message' => 'Staff deleted']);
    }

    // Show single staff
    public function show($id)
    {
        $staff = User::where('role', 'staff')->findOrFail($id);
        return response()->json($staff);
    }
}
