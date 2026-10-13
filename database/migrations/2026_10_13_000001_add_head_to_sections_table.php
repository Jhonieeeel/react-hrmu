<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Names the person who heads a section.
 *
 * A pass slip's "Recommending Approval" line belongs to the filer's immediate
 * supervisor, which the business defines as the head of the section their unit
 * sits under — so the relationship has to live on the section rather than be
 * re-typed per employee.
 *
 * Nullable because a section can exist before anyone is appointed to lead it,
 * and because seeding the org chart happens before the employees that would
 * fill these roles.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->foreignId('head_id')
                ->nullable()
                ->after('division_id')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        // The foreign key has to be dropped before its column.
        Schema::table('sections', function (Blueprint $table) {
            $table->dropForeign(['head_id']);
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->dropColumn('head_id');
        });
    }
};
