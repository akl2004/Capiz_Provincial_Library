<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('book_copies', function (Blueprint $table) {
            $table->id();

            // Link to book
            $table->foreignId('book_id')->constrained()->onDelete('cascade');

            // Copy-specific info
            $table->string('accession_number')->unique();
            $table->string('barcode')->unique()->nullable();
            $table->integer('copy_number');

            // Accession / acquisition details
            $table->enum('material_type', ['Book', 'Journal', 'Thesis', 'E-Resource']);
            $table->text('cataloging_note')->nullable();
            $table->text('internal_note')->nullable();
            $table->enum('source', ['library', 'donated'])->default('library');
            $table->string('source_person')->nullable();
            $table->string('location_of_book')->nullable();

            // Circulation info
            $table->enum('status', ['available', 'borrowed', 'lost', 'archived'])->default('available');
            $table->dateTime('date_added')->useCurrent();


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('book_copies');
    }
};
