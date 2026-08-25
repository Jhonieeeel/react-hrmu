import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { LucideIcon } from 'lucide-react';
import { FlashMessageProp } from '@/types';

type AlertProp = {
    icon: LucideIcon;
    flash: {
        success: FlashMessageProp | null;
    };
};

export default function SuccessAlertMessage({ icon: Icon, flash }: AlertProp) {
    return (
        <Alert className="border-green-400 bg-green-100 text-green-900 shadow-sm">
            <Icon className="text-green-700" />
            <AlertTitle className="font-semibold text-green-900">
                Success
            </AlertTitle>
            <AlertDescription className="text-green-800">
                {flash.success?.message}
            </AlertDescription>
        </Alert>
    );
}
