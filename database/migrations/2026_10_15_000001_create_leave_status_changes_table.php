<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_status_changes', function (Blueprint $table) {
            // The filing, not a single ledger row: a decision is made on a whole
            // submission, so the trail has to answer "who decided this request
            // and then changed their mind about it" rather than per-row noise.
            $table->uuid('filing_group_id')->index();

            // Null when the group predates grouping (a legacy row with no group).
            $table->foreignId('leave_id')->nullable()->constrained('leaves')->cascadeOnDelete();

            // The derived approval states from Leave::approvalState(), stored as
            // strings rather than a boolean because "rejected" and "pending" are
            // both written as `status = false` and only reviewed_at tells them
            // apart. See the approval workflow block on the Leave model.
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20);

            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('remarks')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Created-only: an audit row that can be edited is not an audit row.
            // updated_at is deliberately absent so there is nothing to write to.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_status_changes');
    }
};
