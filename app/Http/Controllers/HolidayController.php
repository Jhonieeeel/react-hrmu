<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class HolidayController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'holiday_name' => ['required', 'string', 'max:255'],
            'month' => ['required', 'integer', 'between:1,12'],
            'day' => ['required', 'integer', 'between:1,31'],
        ]);

        Holiday::create($validated);

        return back()->with('success', [
            'message' => 'Holiday Added Successfully',
            'id' => Str::uuid(),
        ]);
    }

    public function destroy(Holiday $holiday)
    {
        $this->authorize('delete', $holiday);

        $holiday->delete();

        return back()->with('success', [
            'message' => 'Holiday Deleted Successfully',
            'id' => Str::uuid(),
        ]);
    }
}
