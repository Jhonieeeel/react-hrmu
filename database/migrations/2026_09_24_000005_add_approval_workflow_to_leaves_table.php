<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leaves', function (Blueprint $table) {
            // Groups the multiple ledger rows produced by a single submission
            // (CreateLeaveAction writes one row per contiguous weekday range).
            $table->uuid('filing_group_id')->nullable()->after('event_tag')->index();

            $table->foreignId('reviewed_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('review_remarks')->nullable()->after('reviewed_at');

            // The balance engine filters on these three columns on every replay.
            $table->index(['employee_id', 'leave_type', 'event_type'], 'leaves_employee_type_event_index');
        });

        // Every deduction written before this migration predates the approval
        // workflow, so it is grandfathered in as approved. Without this, existing
        // balances would collapse to zero because `status` defaults to false.
        DB::table('leaves')
            ->where('event_type', 'deduction')
            ->update(['status' => true]);
    }

    public function down(): void
    {
        // Each statement is issued separately and in dependency order. The
        // reviewed_by foreign key has to go before its column, and the composite
        // index cannot be dropped while it is still the only index covering
        // employee_id — which the employee foreign key requires.
        Schema::table('leaves', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
        });

        // MySQL backs a foreign key with whichever index starts with its column,
        // and it will happily use the composite index added above. Restoring a
        // plain employee_id index first is what makes that composite droppable —
        // without this the rollback fails with error 1553.
        //
        // This index is intentionally left in place: it is what the employee
        // foreign key falls back to once the composite one is gone, and leaving
        // it is also why re-running this migration does not collide with it.
        Schema::table('leaves', function (Blueprint $table) {
            $table->index('employee_id', 'leaves_employee_id_index');
        });

        Schema::table('leaves', function (Blueprint $table) {
            $table->dropIndex('leaves_employee_type_event_index');
        });

        Schema::table('leaves', function (Blueprint $table) {
            $table->dropIndex(['filing_group_id']);
        });

        Schema::table('leaves', function (Blueprint $table) {
            $table->dropColumn(['filing_group_id', 'reviewed_by', 'reviewed_at', 'review_remarks']);
        });
    }
};
