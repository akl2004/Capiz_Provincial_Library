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
        Schema::create('patrons', function (Blueprint $table) {
            $table->id();
            $table->string('patron_id')->unique(); // custom ID for library
            $table->string('name');
            $table->string('email')->unique();
            $table->string('barangay')->nullable();
            $table->string('municipality');
            $table->string('province');
            $table->string('number')->nullable(); // contact number
            $table->string('status')->default('active');
            $table->integer('age')->nullable();
            $table->text('notes')->nullable();
            $table->date('expiry_date')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patrons');
    }
};
