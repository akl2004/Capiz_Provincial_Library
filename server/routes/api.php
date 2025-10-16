<?php

// use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CirculationController;
use App\Http\Controllers\DropdownController;
use App\Http\Controllers\LibrarySettingController;
use App\Http\Controllers\PatronController;
use App\Http\Controllers\ReportsController;
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
Route::get('/books/latest', [BookController::class, 'latest']);
Route::get('/books/search', [BookController::class, 'search']); //fetches searched books
Route::get('/books/{id}', [BookController::class, 'show']);  // fetch single book
Route::get('/books/copy/{barcode}', [BookController::class, 'getByBarcode']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/books', [BookController::class, 'store']);   // Add new book
    Route::post('/books/{id}/add-copy', [BookController::class, 'addCopy']); // Add book copy
});

// ✅ Extra Patron routes
// Route::get('/patrons/generate-id', [PatronController::class, 'generatePatronId']);
// Route::get('/patrons/by-id/{patronId}', [PatronController::class, 'getByPatronId']);
// Route::get('/patrons/{id}/stats', [PatronController::class, 'stats']);
// Route::patch('/patrons/{id}/deactivate', [PatronController::class, 'deactivate']);

// ✅ Standard Patron routes
// Route::get('/patrons', [PatronController::class, 'index']);
// Route::middleware('auth:sanctum')->post('/patrons', [PatronController::class, 'store']);
// Route::post('/patrons', [PatronController::class, 'store']);
// Route::get('/patrons/{id}', [PatronController::class, 'show']);
// Route::put('/patrons/{id}', [PatronController::class, 'update']);
// Route::delete('/patrons/{id}', [PatronController::class, 'destroy']);  


Route::middleware('auth:sanctum')->group(function () {
    
    Route::get('/patrons/generate-id', [PatronController::class, 'generatePatronId']);
    Route::get('/patrons/{id}/stats', [PatronController::class, 'stats']);
    Route::patch('/patrons/{id}/deactivate', [PatronController::class, 'deactivate']);
    
    Route::get('/patrons', [PatronController::class, 'index']);
    Route::post('/patrons', [PatronController::class, 'store']);
    Route::get('/patrons/{id}', [PatronController::class, 'show']);
    Route::put('/patrons/{id}', [PatronController::class, 'update']);
    Route::delete('/patrons/{id}', [PatronController::class, 'destroy']);
});

Route::get('/patrons/by-id/{patronId}', [PatronController::class, 'getByPatronId']);



// Circulation routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/circulations/borrow', [CirculationController::class, 'borrow']);
    Route::post('/circulations/return', [CirculationController::class, 'return']);
    Route::post('/circulations/renew', [CirculationController::class, 'renew']);
});

Route::get('/circulations/today-tally', [CirculationController::class, 'todayTallyWithPercentage']);
Route::get('/circulations', [CirculationController::class, 'index']);        // list all circulations
Route::get('/circulations/{id}', [CirculationController::class, 'show']);    // view single circulation record
Route::put('/circulations/{id}/mark-lost', [CirculationController::class, 'markLost']); // mark book as lost
Route::get('/patrons/{id}/transactions', [CirculationController::class, 'patronTransactions']); // fetch patrons transaction
Route::get('/copies/{copyId}/history', [CirculationController::class, 'copyHistory']); //fetches all transaction of a book
// Route::get('/circulation/today-tally', [CirculationController::class, 'todayTally']); 
Route::get('/circulation/top-books-week', [CirculationController::class, 'topBooksThisWeek']);

Route::get('/circulations/borrowed-book/{barcode}', [CirculationController::class, 'getBorrowedBookByBarcode']);



// Attendance routes
Route::get('/attendances', [AttendanceController::class, 'index']);
Route::post('/attendances', [AttendanceController::class, 'store']);   // time in
Route::post('/attendances/{id}/timeout', [AttendanceController::class, 'timeOut']); // time out
Route::get('/attendances/today', [AttendanceController::class, 'today']); // daily attendance
Route::get('/attendances/patrons-this-week', [AttendanceController::class, 'patronsThisWeek']);  // for patron dashboard
Route::get('/attendances/today-tally', [AttendanceController::class, 'todayTallyWithPercentage']);  

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
// Timezone
Route::get('/settings/timezone', [LibrarySettingController::class, 'getTimezone']);
Route::post('/settings/timezone', [LibrarySettingController::class, 'updateTimezone']);


//Activity Logs
Route::get('/activity-logs', [ActivityLogController::class, 'index']);
Route::get('/staff/{id}/activity-logs', [ActivityLogController::class, 'getStaffLogs']); // ✅ for individual staff
Route::post('/activity-logs', [ActivityLogController::class, 'store']);


// Reports
Route::get('/reports/collection', [ReportsController::class, 'collection']);
Route::get('/reports/collection-masterlist', [ReportsController::class, 'collectionMasterlist']);
Route::get('/reports/circulation', [ReportsController::class, 'circulation']);

