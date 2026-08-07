<?php

namespace App\Actions\Leave;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
class ExportPdfAction
{
    public function exportPdf(array $usersBalance)
    {
        $spreadSheetFile = public_path("EXPORTING_FILE.xlsx");

        $spreadSheet = IOFactory::load($spreadSheetFile);

        $activeSheet = $spreadSheet->getActiveSheet();

        $cellStart = 6;

        foreach ($usersBalance as $replay) {

            $name     = $replay['name'];
            $balances = $replay['balances'];
            $events   = $replay['events'];
            $leaves   = $replay['leaves'];
            $date = Carbon::parse($replay['date']);

            // name
            $activeSheet->setCellValue("B$cellStart", $name);

            $firstHalfRow  = $cellStart;
            $secondHalfRow = $cellStart;


            $firstHalfEvents = [];
            $secondHalfEvents = [];

            $firstHalfHours = 0;
            $firstHalfMinutes = 0;

            $secondHalfHours = 0;
            $secondHalfMinutes = 0;

            foreach ($events as $event) {
                if ($event['day'] <= 15) {
                    $firstHalfEvents[] = $event['label'];
                    $firstHalfHours += $event['hours'];
                    $firstHalfMinutes += $event['minutes'];
                } else {
                    $secondHalfEvents[] = $event['label'];
                    $secondHalfHours += $event['hours'];
                    $secondHalfMinutes += $event['minutes'];
                }
            }
            // hours and minutes
            $activeSheet->setCellValue("E$firstHalfRow",   $firstHalfHours);
            $activeSheet->setCellValue("F$firstHalfRow",   $firstHalfMinutes);

            $activeSheet->setCellValue("H$secondHalfRow",   $secondHalfHours);
            $activeSheet->setCellValue("I$secondHalfRow",   $secondHalfMinutes);

            // event per kinsesa
            $activeSheet->setCellValue("D$cellStart", implode("\n", $firstHalfEvents));
            $activeSheet->setCellValue("G$cellStart", implode("\n", $secondHalfEvents));


            $allLeaves = [];
            foreach ($leaves as $leave) {
                $allLeaves[] = $leave["label"];
            }
            $activeSheet->setCellValue("J$cellStart", implode("\n", $allLeaves));




            $activeSheet->setCellValue("K$cellStart", $replay['tardinessCount'] <= 0 ? '' : $replay['tardinessCount']);
            $activeSheet->setCellValue("L$cellStart", $replay['undertimeCount'] <= 0 ? '' : $replay['undertimeCount']);

            $totalBalance = 0;

            foreach ($balances as $balance) {
                if ($balance['leave_type'] === 'vacation leave') {
                    $activeSheet->setCellValue("N$cellStart", $balance['estimated']);
                } else if ($balance['leave_type'] === 'sick leave') {
                    $activeSheet->setCellValue("O$cellStart", $balance['estimated']);
                } else {
                    continue;
                }

                $totalBalance += $balance['estimated'];
            }
            $activeSheet->setCellValue("P$cellStart", $totalBalance);

            // remarks
            $activeSheet->setCellValue("Q$cellStart", $replay['filing']);

            $cellStart = max($firstHalfRow, $secondHalfRow) + 1;
        }


        $outputFileName = "reports/{$date?->format('F_Y')}.xlsx";

        $filename = $date?->format('F_Y') . '.xlsx';
        $outputPath = storage_path('app/public/' . $outputFileName);

        $url = asset('storage/' . $outputFileName);

        if (!file_exists(dirname($outputPath))) {
            mkdir(dirname($outputPath), 0755, true);
        }

        $writer = new Xlsx($spreadSheet);
        $writer->save($outputPath);

        // reports/filename.xlsx, mao ni ang pangitaon para edownload
        return $url;
    }
}
