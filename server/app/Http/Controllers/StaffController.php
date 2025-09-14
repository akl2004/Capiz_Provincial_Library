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
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'status' => 'required|in:active,onleave,inactive'
        ]);

        $staff = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'role' => 'staff',
            'status' => $request->status,
        ]);

        return response()->json($staff, 201);
    }

    // Edit staff
    public function update(Request $request, $id)
    {
        $staff = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required',
            'email' => 'sometimes|required|email|unique:users,email,' . $staff->id,
            'password' => 'nullable|min:6',
            'status' => 'sometimes|required|in:active,onleave,inactive'
        ]);

        if ($request->filled('password')) {
            $staff->password = $request->password;
        }

        $staff->update($request->only(['name', 'email', 'status']));

        return response()->json($staff);
    }

    // Delete staff
    public function destroy($id)
    {
        $staff = User::findOrFail($id);
        $staff->delete();

        return response()->json(['message' => 'Staff deleted']);
    }
}
