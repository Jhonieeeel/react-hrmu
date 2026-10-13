<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Makes the Expected Time of Arrival optional.
 *
 * Personnel file a pass slip to leave early as often as they file one for a trip
 * with a planned return — so requiring a return time made the form reject a
 * legitimate request. The column was NOT NULL from the original create
 * migration, which assumed every slip was a round trip.
 *
 * Expected Departure stays required: a slip without one describes no absence at
 * all.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pass_slips', function (Blueprint $table) {
            $table->dateTime('expected_arrival')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Any slip filed as an early-out has no return time to fall back on, so
        // this cannot be reinstated until those rows are given one.
        Schema::table('pass_slips', function (Blueprint $table) {
            $table->dateTime('expected_arrival')->nullable(false)->change();
        });
    }
};
