<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Brings `pass_slips` in line with the physical OCD pass slip.
 *
 * The original table only had room for a single pair of travel times and an
 * opaque `assigned_to`, which could not express the difference between when a
 * personnel said they *expected* to travel and when they actually did — nor the
 * two separate signatories the form carries (the immediate supervisor who
 * recommends, and the next higher official who approves).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pass_slips', function (Blueprint $table) {
            // Renamed rather than dropped so any slip already filed keeps its
            // expected times, and so the column name states plainly that these
            // are the planned, not actual, times.
            $table->renameColumn('departure', 'expected_departure');
            $table->renameColumn('arrival', 'expected_arrival');

            // A slip is filed before anyone is named to sign it — the approver is
            // assigned from the review queue — so this can no longer be required.
            $table->foreignId('assigned_to')->nullable()->change();

            // The date the slip was filed out ("Date Accomplished" on the form).
            // Kept distinct from created_at because HR back-fills slips after
            // the fact, so the two can legitimately disagree.
            $table->date('date_accomplished')->nullable()->after('user_id');

            // The date the personnel is asking to be away on. Distinct from
            // date_accomplished: a slip filed in advance has two different days.
            $table->date('date_requested')->nullable()->after('date_accomplished');

            // Filled in once the personnel returns, so the office can compare
            // planned against actual. Nullable because it is unknown at filing
            // time. HR records it; the filer never enters it.
            //
            // There is deliberately no actual_departure column — the form only
            // asks for the moment of return.
            $table->dateTime('actual_arrival')->nullable()->after('expected_arrival');

            // The form asks for the personnel's name in print, so it is captured
            // as a snapshot rather than always read back from users.name — a
            // later rename must not rewrite the history of what was signed.
            $table->string('printed_name')->nullable()->after('position');

            // The immediate supervisor who "recommends" the slip — resolved from
            // the filer's section head, and overridable by HR.
            $table->foreignId('recommended_by')
                ->nullable()
                ->after('purpose')
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('reviewed_by')
                ->nullable()
                ->after('status')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('review_remarks')->nullable()->after('reviewed_at');

            // The queue filters by decision state on every page load.
            $table->index(['status', 'reviewed_at']);
        });
    }

    public function down(): void
    {
        Schema::table('pass_slips', function (Blueprint $table) {
            // Foreign keys first: MySQL will refuse to drop a column an index
            // still references.
            $table->dropForeign(['recommended_by']);
            $table->dropForeign(['reviewed_by']);
        });

        Schema::table('pass_slips', function (Blueprint $table) {
            $table->dropIndex(['status', 'reviewed_at']);
        });

        Schema::table('pass_slips', function (Blueprint $table) {
            $table->dropColumn([
                'date_accomplished',
                'date_requested',
                'actual_arrival',
                'printed_name',
                'recommended_by',
                'reviewed_by',
                'reviewed_at',
                'review_remarks',
            ]);
        });

        Schema::table('pass_slips', function (Blueprint $table) {
            $table->renameColumn('expected_departure', 'departure');
            $table->renameColumn('expected_arrival', 'arrival');
        });
    }
};
