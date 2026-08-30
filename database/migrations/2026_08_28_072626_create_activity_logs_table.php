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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action'); // e.g., 'TASK_STATUS_CHANGED'
            $table->string('entity_type'); // e.g., 'Task'
            $table->unsignedBigInteger('entity_id');
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->timestamp('timestamp')->useCurrent();
            $table->timestamps();
            
            $table->index(['entity_type', 'entity_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
