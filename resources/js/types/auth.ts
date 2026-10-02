export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
    /**
     * Permission names the user effectively holds, including the baseline
     * self-service set granted to every authenticated user. Kept in sync with
     * App\Enums\Permission via User::effectivePermissions().
     */
    permissions: string[];
    roles: string[];
};

/** Mirrors App\Enums\Permission. */
export const Permissions = {
    ViewOwnBalance: 'view own balance',
    FileLeave: 'file leave',
    FileMonthlyReport: 'file monthly report',
    ViewOwnLeaveHistory: 'view own leave history',
    ApproveLeave: 'approve leave',
    ReviewLeave: 'review leave',
    ViewAllLeaveRequests: 'view all leave requests',
    DeleteAnyLeave: 'delete any leave',
    EditApprovedLeave: 'edit approved leave',
    ViewAllEmployees: 'view all employees',
    CreateEmployees: 'create employees',
    UpdateAnyEmployee: 'update any employee',
    DeleteEmployees: 'delete employees',
    AssignRoles: 'assign roles',
    ViewAllBalances: 'view all balances',
    ManageAccruals: 'manage accruals',
    RecordAdjustments: 'record adjustments',
    ExportBalances: 'export balances',
    ManageHolidays: 'manage holidays',
    ManageOrganization: 'manage organization',
    ManagePassSlips: 'manage pass slips',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

/** Mirrors App\Enums\Role. */
export const Roles = {
    SuperAdmin: 'super-admin',
    HrOfficer: 'hr-officer',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */
