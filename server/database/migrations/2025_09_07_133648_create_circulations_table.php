<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('circulations', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('book_copy_id')->constrained('book_copies')->onDelete('cascade');
            $table->foreignId('patron_id')->constrained('patrons')->onDelete('cascade'); 

            // Circulation details
            $table->date('issue_date');
            $table->date('due_date'); // default = issue_date + 5 days (handled in controller)
            $table->date('renewal_date')->nullable(); // last renewal date
            $table->unsignedInteger('renewal_count')->default(0); // ✅ track how many times renewed
            $table->integer('overdue_by')->default(0); // in days
            $table->decimal('fine', 8, 2)->default(0.00);
            $table->date('date_returned')->nullable();

            $table->enum('status', ['available', 'borrowed', 'returned', 'lost', 'overdue'])->default('available');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('circulations');
    }
};
