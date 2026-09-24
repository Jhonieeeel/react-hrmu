<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->foreignId('division_id')
                ->nullable()
                ->after('id')
                ->constrained('divisions')
                ->nullOnDelete();
        });

        Schema::table('employees', function (Blueprint $table) {
            $table->foreignId('division_id')
                ->nullable()
                ->after('user_id')
                ->constrained('divisions')
                ->nullOnDelete();
            $table->foreignId('section_id')->nullable()->change();
            $table->foreignId('unit_id')->nullable()->change();
            $table->index(['division_id', 'section_id', 'unit_id']);
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropIndex(['division_id', 'section_id', 'unit_id']);
            $table->dropConstrainedForeignId('division_id');
            $table->foreignId('section_id')->nullable(false)->change();
            $table->foreignId('unit_id')->nullable(false)->change();
        });

        Schema::table('sections', function (Blueprint $table) {
            $table->dropConstrainedForeignId('division_id');
        });
    }
};
