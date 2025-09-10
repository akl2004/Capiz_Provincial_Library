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
        Schema::create('books', function (Blueprint $table) {
            $table->id();

            // Bibliographic info
            $table->string('title');
            $table->string('author')->nullable(); // multiple authors
            $table->string('editor')->nullable();
            $table->string('other_author_editor')->nullable(); // other author + editor
            $table->string('edition')->nullable();
            $table->string('series_name')->nullable();
            $table->string('volume')->nullable();
            $table->string('publisher')->nullable();
            $table->string('place_of_publication')->nullable();
            $table->string('copyright')->nullable();
            $table->integer('number_of_pages')->nullable();

            // Extra bibliographic details
            $table->string('book_language')->nullable(); 
            $table->string('person_as_subject')->nullable();
            $table->string('topical_subject')->nullable();
            $table->string('geographical_subject')->nullable();

            // Checklist
            $table->boolean('includes_index')->default(false);
            $table->boolean('includes_appendix')->default(false);
            $table->boolean('includes_glossary')->default(false);
            $table->boolean('includes_bibliographical_references')->default(false);

            // Identifiers
            $table->string('isbn')->nullable();

            // Call number breakdown
            $table->string('dewey_decimal');
            $table->string('author_number')->nullable();
            $table->string('call_number');     // combined

            // New fields
            $table->enum('section', ['Gen. Reference', 'Filipiniana', 'Gen. Circulation']);

            // Book cover image
            $table->string('cover_image')->nullable(); // stores image path or URL

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
