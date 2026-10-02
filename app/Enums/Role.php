<?php

namespace App\Enums;

enum Role: string
{
    case SuperAdmin = 'super-admin';
    case HrOfficer = 'hr-officer';

    /**
     * @return list<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
