<?php

// use App\Http\Controllers\Api\AuthController;
// use App\Http\Controllers\Api\GenderController;
// use App\Http\Controllers\Api\UserController;
use Illuminate\Http\Request;
use App\Http\Controllers\BookController;
use App\Http\Controllers\DropdownController;
use Illuminate\Support\Facades\Route;

// Fetch all books
Route::get('/books', [BookController::class, 'index']);

// Add a new book
Route::post('/books', [BookController::class, 'store']);

Route::get('/books/{id}', [BookController::class, 'show']);

Route::get('/dropdown-options', [DropdownController::class, 'index']);




// Route::controller(AuthController::class)->group(function () {
//     Route::post('/login', 'login');
// });

// Route::middleware('auth:sanctum')->group(function () {
//     Route::controller(AuthController::class)->group(function () {
//         Route::get('/user', 'user');
//         Route::post('/logout', 'logout');
//     });

    

//     Route::controller(UserController::class)->group(function () {
//         Route::get('/loadUsers', 'loadUsers');
//         Route::post('/storeUser', 'storeUser');
//         Route::put('/updateUser/{user}', 'updateUser');
//         Route::put('/destroyUser/{user}', 'destroyUser');
//     });
// });

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');
