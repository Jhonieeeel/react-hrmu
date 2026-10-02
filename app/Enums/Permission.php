<?php

namespace App\Enums;

/**
 * Every permission in the application.
 *
 * Permissions in `self::baseline()` are not assigned to anyone. They are granted
 * implicitly to every authenticated user through the Gate::before hook in
 * AppServiceProvider, which is what lets a regular employee operate without
 * holding a role. Everything else must be granted by a role.
 */
enum Permission: string
{
    /* --- Implicit for every authenticated user (no role required) --- */

    case ViewOwnBalance = 'view own balance';
    case FileLeave = 'file leave';
    case FileMonthlyReport = 'file monthly report';
    case ViewOwnLeaveHistory = 'view own leave history';

    /* --- Leave review --- */

    case ApproveLeave = 'approve leave';
    case ReviewLeave = 'review leave';
    case ViewAllLeaveRequests = 'view all leave requests';
    case DeleteAnyLeave = 'delete any leave';
    case EditApprovedLeave = 'edit approved leave';

    /* --- Employee administration --- */

    case ViewAllEmployees = 'view all employees';
    case CreateEmployees = 'create employees';
    case UpdateAnyEmployee = 'update any employee';
    case DeleteEmployees = 'delete employees';
    case AssignRoles = 'assign roles';

    /* --- Balances / accruals --- */

    case ViewAllBalances = 'view all balances';
    case ManageAccruals = 'manage accruals';
    case RecordAdjustments = 'record adjustments';
    case ExportBalances = 'export balances';

    /* --- Other modules --- */

    case ManageHolidays = 'manage holidays';
    case ManageOrganization = 'manage organization';
    case ManagePassSlips = 'manage pass slips';

    /**
     * The section a permission belongs to, used to group them in the UI.
     */
    public function group(): string
    {
        return match ($this) {
            self::ViewOwnBalance,
            self::ViewOwnLeaveHistory,
            self::FileLeave,
            self::FileMonthlyReport => 'Self-service',

            self::ApproveLeave,
            self::ReviewLeave,
            self::ViewAllLeaveRequests,
            self::DeleteAnyLeave,
            self::EditApprovedLeave => 'Leave review',

            self::ViewAllEmployees,
            self::CreateEmployees,
            self::UpdateAnyEmployee,
            self::DeleteEmployees,
            self::AssignRoles => 'Employee administration',

            self::ViewAllBalances,
            self::ManageAccruals,
            self::RecordAdjustments,
            self::ExportBalances => 'Balances and accruals',

            self::ManageHolidays,
            self::ManageOrganization,
            self::ManagePassSlips => 'Other modules',
        };
    }

    /**
     * Permissions every authenticated user effectively has.
     *
     * These are deliberately self-scoped verbs. The matching policies are what
     * enforce *whose* records may be touched, so granting them globally does not
     * widen access beyond the caller's own employee record.
     *
     * @return list<self>
     */
    public static function baseline(): array
    {
        return [
            self::ViewOwnBalance,
            self::FileLeave,
            self::FileMonthlyReport,
            self::ViewOwnLeaveHistory,
        ];
    }

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
