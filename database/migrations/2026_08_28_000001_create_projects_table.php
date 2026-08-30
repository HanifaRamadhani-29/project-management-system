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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
<<<<<<< HEAD
=======
<<<<<<< HEAD
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('Planning');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
<<<<<<< HEAD
            $table->foreignId('manager_id')->constrained('users')->cascadeOnDelete();
=======
=======
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('Planning');
            $table->text('description')->nullable();
            $table->date('start_date')->nullable();
            $table->date('deadline')->nullable();
            $table->foreignId('manager_id')->constrained('users')->cascadeOnDelete();
>>>>>>> feature/project
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
