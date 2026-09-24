<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $employeeIdsByUser = DB::table('employees')
            ->orderBy('id')
            ->pluck('id', 'user_id');

        DB::table('leaves')
            ->orderBy('id')
            ->select(['id', 'user_id'])
            ->get()
            ->each(function ($leave) use ($employeeIdsByUser) {
                if (! $employeeIdsByUser->has($leave->user_id)) {
                    return;
                }

                DB::table('leaves')
                    ->where('id', $leave->id)
                    ->update([
                        'user_id' => $employeeIdsByUser->get($leave->user_id),
                    ]);
            });

        Schema::table('leaves', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->renameColumn('user_id', 'employee_id');
            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        $userIdsByEmployee = DB::table('employees')
            ->orderBy('id')
            ->pluck('user_id', 'id');

        DB::table('leaves')
            ->orderBy('id')
            ->select(['id', 'employee_id'])
            ->get()
            ->each(function ($leave) use ($userIdsByEmployee) {
                if (! $userIdsByEmployee->has($leave->employee_id)) {
                    return;
                }

                DB::table('leaves')
                    ->where('id', $leave->id)
                    ->update([
                        'employee_id' => $userIdsByEmployee->get($leave->employee_id),
                    ]);
            });

        Schema::table('leaves', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->renameColumn('employee_id', 'user_id');
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
