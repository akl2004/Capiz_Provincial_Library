<?php

// use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CirculationController;
use App\Http\Controllers\DropdownController;
use App\Http\Controllers\LibrarySettingController;
use App\Http\Controllers\PatronController;
use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;


// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Fetch the logged-in user
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'user']);

// Staff/Accounts routes (protected with sanctum)
Route::middleware('auth:sanctum')->prefix('staff')->group(function () {
    Route::get('/', [StaffController::class, 'index']);       // List all staff
    Route::post('/', [StaffController::class, 'store']);      // Add new staff
    Route::put('/{id}', [StaffController::class, 'update']); // Update staff
    Route::delete('/{id}', [StaffController::class, 'destroy']); // Delete staff
    Route::get('/{id}', [StaffController::class, 'show']); // Get single staff
});


// Dropdown options
Route::get('/dropdown-options', [DropdownController::class, 'index']);

// Book routes
Route::get('/books', [BookController::class, 'index']);    //fetch all books
Route::post('/books', [BookController::class, 'store']);   // add new book
Route::get('/books/{id}', [BookController::class, 'show']);  // fetch single book

// ✅ Extra Patron routes
Route::get('/patrons/generate-id', [PatronController::class, 'generatePatronId']);
Route::get('/patrons/by-id/{patronId}', [PatronController::class, 'getByPatronId']);
Route::get('/patrons/{id}/stats', [PatronController::class, 'stats']);
Route::patch('/patrons/{id}/deactivate', [PatronController::class, 'deactivate']);

// ✅ Standard Patron routes
Route::get('/patrons', [PatronController::class, 'index']);
Route::post('/patrons', [PatronController::class, 'store']);
Route::get('/patrons/{id}', [PatronController::class, 'show']);
Route::put('/patrons/{id}', [PatronController::class, 'update']);
Route::delete('/patrons/{id}', [PatronController::class, 'destroy']);  


// Circulation routes
Route::get('/circulations', [CirculationController::class, 'index']);        // list all circulations
// Route::post('/circulations', [CirculationController::class, 'store']);    // issue a book (borrow)
Route::post('/circulations/borrow', [CirculationController::class, 'borrow']); // borrow a book
Route::get('/circulations/{id}', [CirculationController::class, 'show']);    // view single circulation record
Route::put('/circulations/{id}/renew', [CirculationController::class, 'renew']); // renew circulation
Route::put('/circulations/{id}/return', [CirculationController::class, 'returnBook']); // return a book
Route::put('/circulations/{id}/mark-lost', [CirculationController::class, 'markLost']); // mark book as lost
Route::get('/patrons/{id}/transactions', [CirculationController::class, 'patronTransactions']); // fetch patrons transaction

Route::get('/books/copy/{barcode}', [BookController::class, 'getByBarcode']);


// Attendance routes
Route::get('/attendances', [AttendanceController::class, 'index']);
Route::post('/attendances', [AttendanceController::class, 'store']);   // time in
Route::post('/attendances/{id}/timeout', [AttendanceController::class, 'timeOut']); // time out
Route::get('/attendances/today', [AttendanceController::class, 'today']); // daily attendance

Route::get('/patrons/{id}/activity-logs', [AttendanceController::class, 'patronLogs']);


// Settings routes
// Loan Days
Route::get('/settings/loan-days', [LibrarySettingController::class, 'getLoanDays']);
Route::post('/settings/loan-days', [LibrarySettingController::class, 'updateLoanDays']);
// Expiration Years
Route::get('/settings/expiration-years', [LibrarySettingController::class, 'getExpirationYears']);
Route::post('/settings/expiration-years', [LibrarySettingController::class, 'updateExpirationYears']);
// Fine Per Day
Route::get('/settings/fine-per-day', [LibrarySettingController::class, 'getFinePerDay']);
Route::post('/settings/fine-per-day', [LibrarySettingController::class, 'updateFinePerDay']);
// Renewal Limit
Route::get('/settings/renewal-limit', [LibrarySettingController::class, 'getRenewalLimit']);
Route::post('/settings/renewal-limit', [LibrarySettingController::class, 'updateRenewalLimit']);




// Route::get('/patrons/by-id/{patron_id}', [PatronController::class, 'getByPatronId']);
// Route::apiResource('patrons', PatronController::class);




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
