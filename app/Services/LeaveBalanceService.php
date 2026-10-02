<?php

namespace App\Services;

use App\Enums\Permission;
use App\Models\Employee;
use App\Models\Leave;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Resolves which employee a balance request is allowed to read.
 *
 * Employees may only read their own balance; HR may read anyone's. Centralising
 * this keeps every balance-flavoured endpoint (the page, the JSON feed, the
 * spreadsheet export) from having to repeat the same ownership check.
 */
class LeaveBalanceService
{
    public function __construct(
        protected Request $request,
    ) {}

    /**
     * The signed-in user.
     *
     * Resolved from the auth guard on each call rather than constructor-injected:
     * a `User $user` parameter would be satisfied with a brand-new empty model,
     * silently making every ownership check compare against a user that is not
     * logged in.
     */
    protected function user(): User
    {
        $user = $this->request->user();

        abort_unless($user instanceof User, 403);

        return $user;
    }

    /**
     * Resolve the employee from the request and confirm access to it.
     *
     * @throws AuthorizationException
     */
    public function resolveFromRequest(): Employee
    {
        $employee = $this->employeeFromRequest();

        $this->authorize($employee);

        return $employee;
    }

    /**
     * The employee record of the signed-in user, if they have one.
     */
    public function ownEmployee(): ?Employee
    {
        return $this->user()->employee();
    }

    /**
     * Confirm the signed-in user may read this employee's balance.
     *
     * @throws AuthorizationException
     */
    public function authorize(Employee $employee): void
    {
        $user = $this->user();
        $isSelf = $this->ownEmployee()?->id === $employee->id;

        if ($isSelf && $user->can(Permission::ViewOwnBalance)) {
            return;
        }

        if ($user->can(Permission::ViewAllBalances)) {
            return;
        }

        abort(403, 'You are not allowed to view this employee\'s balance.');
    }

    /**
     * @throws NotFoundHttpException
     */
    protected function employeeFromRequest(): Employee
    {
        $employee = $this->request->route('employee');

        if ($employee instanceof Employee) {
            return $employee;
        }

        $id = $this->employeeIdFromRoute()
            ?? (is_numeric($this->request->input('employee_id'))
                ? (int) $this->request->input('employee_id')
                : null);

        if ($id === null) {
            // Default to the caller's own record when no employee is specified,
            // which is what "my balance" screens rely on.
            $own = $this->ownEmployee();

            if ($own) {
                return $own;
            }

            throw new NotFoundHttpException('No employee record is linked to this account.');
        }

        return Employee::query()->findOrFail($id);
    }

    /**
     * The route parameter may arrive as an id (unbound) or as a model already.
     */
    protected function employeeIdFromRoute(): ?int
    {
        $parameter = $this->request->route('employee');

        if ($parameter instanceof Employee) {
            return $parameter->id;
        }

        if (is_numeric($parameter)) {
            return (int) $parameter;
        }

        return null;
    }

    /**
     * Pending days per leave type for an employee, so the UI can show what is
     * awaiting approval without being counted against the balance.
     *
     * @return array<string, float>
     */
    public function pendingByLeaveType(Employee $employee): array
    {
        return Leave::query()
            ->where('employee_id', $employee->id)
            ->pendingReview()
            ->get()
            ->groupBy('leave_type')
            ->map(fn ($group) => round((float) abs($group->sum('balance')), 3))
            ->all();
    }
}
