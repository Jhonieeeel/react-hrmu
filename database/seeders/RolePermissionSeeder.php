<?php

namespace Database\Seeders;

use App\Enums\Permission;
use App\Enums\Role;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission as PermissionModel;
use Spatie\Permission\Models\Role as RoleModel;
use Spatie\Permission\PermissionRegistrar;

/**
 * Creates every permission and role.
 *
 * Safe to re-run: permissions are matched on name and roles are synced, so
 * running this after adding a permission updates existing roles in place rather
 * than duplicating anything.
 */
class RolePermissionSeeder extends Seeder
{
    /**
     * Permissions held by the HR officer role.
     *
     * Deliberately excludes AssignRoles — promoting someone to super admin is a
     * super-admin-only action, so an HR account cannot escalate itself or a
     * colleague.
     *
     * @var list<Permission>
     */
    protected array $hrPermissions = [
        Permission::ApproveLeave,
        Permission::ReviewLeave,
        Permission::ViewAllLeaveRequests,
        Permission::DeleteAnyLeave,
        Permission::EditApprovedLeave,
        Permission::ViewAllEmployees,
        Permission::CreateEmployees,
        Permission::UpdateAnyEmployee,
        Permission::DeleteEmployees,
        Permission::ViewAllBalances,
        Permission::ManageAccruals,
        Permission::RecordAdjustments,
        Permission::ExportBalances,
        Permission::ManageHolidays,
        Permission::ManageOrganization,
        Permission::ManagePassSlips,
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->createPermissions();
        $this->createRoles();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    protected function createPermissions(): void
    {
        foreach (Permission::cases() as $permission) {
            PermissionModel::findOrCreate($permission->value, 'web');
        }
    }

    protected function createRoles(): void
    {
        // Super admin holds every permission, so adding one in future code
        // automatically extends the role.
        RoleModel::findOrCreate(Role::SuperAdmin->value, 'web')
            ->syncPermissions(PermissionModel::all());

        RoleModel::findOrCreate(Role::HrOfficer->value, 'web')
            ->syncPermissions(
                PermissionModel::all()
                    ->reject(fn (PermissionModel $permission) => $permission->name === Permission::AssignRoles->value)
            );
    }
}
