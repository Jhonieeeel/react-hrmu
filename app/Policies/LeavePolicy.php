<?php

namespace App\Policies;

use App\Enums\Permission;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\User;

class LeavePolicy
{
    /**
     * Can the user see the leave ledger of any employee?
     */
    public function viewAny(User $user): bool
    {
        return $user->can(Permission::ViewAllBalances);
    }

    /**
     * Can the user read this specific leave row?
     *
     * A filing always carries an employee, so ownership can be resolved from the
     * row itself. HR-only rows (accruals, monthly filings) have no employee
     * context an employee could match against, so they stay restricted to HR.
     */
    public function view(User $user, Leave $leave): bool
    {
        if ($user->can(Permission::ViewAllBalances)) {
            return true;
        }

        $employee = $user->employee();

        return $employee !== null && $leave->employee_id === $employee->id;
    }

    /**
     * Can the user edit this row?
     *
     * The rule the business asked for: a pending filing belongs to the employee
     * who submitted it, but once it has been approved only HR may touch it.
     */
    public function update(User $user, Leave $leave): bool
    {
        if ($leave->isApproved()) {
            return $user->can(Permission::EditApprovedLeave);
        }

        // Rejected or still-pending filings stay with their owner.
        return $this->owns($user, $leave);
    }

    /**
     * Can the user delete this row?
     *
     * Same rule as editing: an employee may withdraw their own filing while it
     * is still undecided; after approval, deletion is an HR action.
     */
    public function delete(User $user, Leave $leave): bool
    {
        if ($leave->isApproved()) {
            return $user->can(Permission::DeleteAnyLeave);
        }

        return $this->owns($user, $leave);
    }

    /**
     * Can the user record a decision on this filing?
     */
    public function review(User $user, Leave $leave): bool
    {
        if (! $leave->requiresApproval() || $leave->reviewed_at !== null) {
            return false;
        }

        return $user->can(Permission::ReviewLeave);
    }

    public function approve(User $user, Leave $leave): bool
    {
        return $this->review($user, $leave);
    }

    public function reject(User $user, Leave $leave): bool
    {
        return $this->review($user, $leave);
    }

    /**
     * Can the user add an accrual or adjustment to this employee's ledger?
     */
    public function adjust(User $user, Employee $employee): bool
    {
        return $user->can(Permission::ManageAccruals);
    }

    /**
     * @param  Leave  $leave  Filings always belong to an employee, so the owner's
     *                        own record is the only thing that grants access.
     */
    protected function owns(User $user, Leave $leave): bool
    {
        if ($leave->event_type !== 'deduction') {
            return false;
        }

        $employee = $user->employee();

        return $employee !== null
            && $leave->employee_id === $employee->id
            && $user->can(Permission::FileLeave);
    }
}
