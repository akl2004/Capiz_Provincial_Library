<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\LoginLog;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = Auth::user();

        // Only allow active or onleave staff/admin
        if ($user->status === 'inactive') {
            return response()->json(['message' => 'Your account is inactive'], 403);
        }

        // Create token
        $token = $user->createToken('authToken')->plainTextToken;

        // Log login
        LoginLog::create([
            'user_id' => $user->id,
            'logged_in_at' => now(),
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'role' => $user->role,
            'name' => $user->name,
            'status' => $user->status,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
    
    public function user(Request $request)
{
    $user = $request->user(); // gets the currently authenticated user

    return response()->json([
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email,
        'role' => $user->role,
        'status' => $user->status,
        'avatar' => './src/assets/lib-logo.png', // placeholder
    ]);
}
}
