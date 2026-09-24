<?php

namespace App\Http\Controllers;

use App\Models\Division;
use App\Models\Section;
use App\Models\Unit;
use Illuminate\Http\Request;

class OrganizationController extends Controller
{
    public function storeDivision(Request $request)
    {
        $data = $request->validate([
            'division_name' => ['required', 'string', 'max:255'],
            'division_code' => ['required', 'string', 'max:20', 'unique:divisions,division_code'],
        ]);

        Division::create($data);

        return back()->with('success', 'Division created successfully.');
    }

    public function updateDivision(Request $request, Division $division)
    {
        $data = $request->validate([
            'division_name' => ['required', 'string', 'max:255'],
            'division_code' => [
                'required',
                'string',
                'max:20',
                'unique:divisions,division_code,' . $division->id,
            ],
        ]);

        $division->update($data);

        return back()->with('success', 'Division updated successfully.');
    }

    public function destroyDivision(Division $division)
    {
        $division->delete();

        return back()->with('success', 'Division deleted successfully.');
    }

    public function storeSection(Request $request)
    {
        $data = $this->validateSection($request);

        Section::create($data);

        return back()->with('success', 'Section created successfully.');
    }

    public function updateSection(Request $request, Section $section)
    {
        $section->update($this->validateSection($request, $section));

        return back()->with('success', 'Section updated successfully.');
    }

    public function destroySection(Section $section)
    {
        $section->delete();

        return back()->with('success', 'Section deleted successfully.');
    }

    public function storeUnit(Request $request)
    {
        $data = $this->validateUnit($request);

        Unit::create($data);

        return back()->with('success', 'Unit created successfully.');
    }

    public function updateUnit(Request $request, Unit $unit)
    {
        $unit->update($this->validateUnit($request, $unit));

        return back()->with('success', 'Unit updated successfully.');
    }

    public function destroyUnit(Unit $unit)
    {
        $unit->delete();

        return back()->with('success', 'Unit deleted successfully.');
    }

    private function validateSection(Request $request, ?Section $section = null): array
    {
        return $request->validate([
            'section_name' => ['required', 'string', 'max:255'],
            'section_code' => [
                'required',
                'string',
                'max:20',
                'unique:sections,section_code' . ($section ? ',' . $section->id : ''),
            ],
            'division_id' => ['nullable', 'integer', 'exists:divisions,id'],
        ]);
    }

    private function validateUnit(Request $request, ?Unit $unit = null): array
    {
        return $request->validate([
            'unit_name' => ['required', 'string', 'max:255'],
            'unit_code' => [
                'required',
                'string',
                'max:20',
                'unique:units,unit_code' . ($unit ? ',' . $unit->id : ''),
            ],
            'section_id' => ['required', 'integer', 'exists:sections,id'],
        ]);
    }
}
