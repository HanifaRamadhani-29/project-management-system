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
        $tableNames = config('permission.table_names');

        if (!isset($tableNames['permissions'])) {
            $tableNames['permissions'] = 'permissions';
        }

        Schema::table($tableNames['permissions'], function (Blueprint $table) use ($tableNames) {
            if (!Schema::hasColumn($tableNames['permissions'], 'module')) {
                $table->string('module')->after('guard_name')->default('System');
            }
            if (!Schema::hasColumn($tableNames['permissions'], 'description')) {
                $table->string('description')->after('module')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableNames = config('permission.table_names');

        if (!isset($tableNames['permissions'])) {
            $tableNames['permissions'] = 'permissions';
        }

        Schema::table($tableNames['permissions'], function (Blueprint $table) use ($tableNames) {
            $table->dropColumn(['module', 'description']);
        });
    }
};
