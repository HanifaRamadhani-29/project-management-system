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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            // Relasi ke Project
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            
            // Atribut Utama
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('backlog'); // backlog, todo, in_progress, review, done
            $table->string('priority')->default('medium'); // low, medium, high, critical
            
            // Untuk Fitur Subtask
            $table->foreignId('parent_id')->nullable()->constrained('tasks')->nullOnDelete();
            
            // Relasi ke User (Assignee & Reporter)
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reporter_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Untuk Fitur Kanban (Urutan)
            $table->integer('order')->default(0);
            
            $table->date('deadline')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
