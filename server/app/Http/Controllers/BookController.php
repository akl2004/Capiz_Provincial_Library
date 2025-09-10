<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\BookCopy;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function store(Request $request)
{
    // Validate incoming request
    $validated = $request->validate([
        'title' => 'required|string',
        'author' => 'nullable|string',
        'other_author_editor' => 'nullable|string',
        'edition' => 'nullable|string',
        'series_name' => 'nullable|string',
        'volume' => 'nullable|string',
        'publisher' => 'nullable|string',
        'place_of_publication' => 'nullable|string',
        'copyright' => 'nullable|string',
        'number_of_pages' => 'nullable|integer',
        'book_language' => 'nullable|string',
        'person_as_subject' => 'nullable|string',
        'location_of_book' => 'nullable|string',
        'material_type' => 'nullable|string',
        'cataloging_note' => 'nullable|string',
        'internal_note' => 'nullable|string',
        'includes_index' => 'boolean',
        'includes_appendix' => 'boolean',
        'includes_glossary' => 'boolean',
        'includes_bibliographical_references' => 'boolean',
        'isbn' => 'nullable|string',
        'topical_subject' => 'nullable|string',
        'geographical_subject' => 'nullable|string',
        'class_section' => 'required|string',
        'dewey_decimal' => 'required|string',
        'author_number' => 'nullable|string',
        'source' => 'required|in:library,donated',
        'source_person' => 'nullable|string',
        'copies' => 'required|integer|min:1',
        'cover_image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    /// Map section → abbreviation
    $sectionMap = [
        'Filipiniana' => 'FIL',
        'Gen. Circulation' => 'GC',
        'Gen. Reference' => 'REF',
    ];
    $sectionAbbr = $sectionMap[$validated['section']];

    // Build call number
    $callNumber = $sectionAbbr . "\n" .
                  $validated['dewey_decimal'] . "\n" .
                  ($validated['author_number'] ?? '') . "\n" .
                  ($validated['copyright'] ?? '');

    $book = Book::create([
        ...$validated,
        'call_number' => $callNumber,
    ]);

    // Get last global accession number
    $lastCopy = BookCopy::orderBy('id', 'desc')->first();
    $startAccession = $lastCopy ? (int)$lastCopy->accession_number : 0;

    // Get existing copies for this book
    $existingCopies = $book->copies()->count();

    // Create new copies
    for ($i = 1; $i <= $validated['copies']; $i++) {
        $copyNumber = $existingCopies + $i;                     // Copy 1,2,3 for this book
        $accessionNumber = str_pad($startAccession + $i, 5, '0', STR_PAD_LEFT); // global accession
        $barcode = uniqid("BC");

        $book->copies()->create([
            'copy_number' => $copyNumber,
            'accession_number' => $accessionNumber,
            'barcode' => $barcode,
        ]);
    }

    return response()->json([
        'message' => 'Book added successfully',
        'book' => $book->load('copies'),
    ], 201);
}


    // List all books
    public function index()
    {
        $books = Book::with('copies')->get();
        return response()->json($books);
    }

    // Show book details
    public function show($id)
    {
        $book = Book::with('copies')->find($id);

        if (!$book) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return response()->json($book);
    }



    public function getByBarcode($barcode)
    {
        $bookCopy = \App\Models\BookCopy::with('book')
            ->where('barcode', $barcode)
            ->first();

        if (!$bookCopy) {
            return response()->json(['message' => 'Book not found'], 404);
        }

        return response()->json($bookCopy);
    }



}