<?php

namespace App\Actions\User;

use App\Models\Employee;
use Illuminate\Http\Request;

class UsersListAction
{
    public function __invoke(Request $request)
    {
        return Employee::query()
            ->with(['user:id,name,employee_type', 'division:id,division_name,division_code', 'section:id,section_name,section_code', 'unit:id,unit_name,unit_code'])
            ->when($request->filled('section_id'), function ($query) use ($request) {
                $query->where('section_id', $request->integer('section_id'));
            })
            ->when($request->filled('unit_id'), function ($query) use ($request) {
                $query->where('unit_id', $request->integer('unit_id'));
            })
            ->when($request->filled('position'), function ($query) use ($request) {
                $query->where('position', 'like', '%' . $request->string('position') . '%');
            })
            ->latest()
            ->paginate(10)
            ->withQueryString()
            ->through(function (Employee $employee) {
                return [
                    'id' => $employee->id,
                    'employee_id' => $employee->id,
                    'user_id' => $employee->user_id,
                    'name' => $employee->user?->name,
                    'employee_type' => $employee->user?->employee_type,
                    'position' => $employee->position,
                    'division' => $employee->division?->only(['id', 'division_name', 'division_code']),
                    'section' => $employee->section?->only(['id', 'section_name', 'section_code']),
                    'unit' => $employee->unit?->only(['id', 'unit_name', 'unit_code']),
                ];
            });
    }
}
