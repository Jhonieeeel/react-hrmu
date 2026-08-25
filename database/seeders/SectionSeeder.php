<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Unit;
use Database\Factories\SectionFactory;
use Database\Factories\UnitFactory;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        foreach (SectionFactory::sections() as $sectionData) {
            $section = Section::create($sectionData);

            $unitsBySectionCode = UnitFactory::units();

            if (isset($unitsBySectionCode[$sectionData['section_code']])) {
                foreach ($unitsBySectionCode[$sectionData['section_code']] as $unit) {
                    Unit::create([
                        'section_id' => $section->id,
                        'unit_name' => $unit['unit_name'],
                        'unit_code' => $unit['unit_code'],
                    ]);
                }
            }
        }
    }
}
