import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import { User } from './auth';

export type AppLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};

export type AppVariant = 'header' | 'sidebar';

export type FlashToast = {
    type: 'success' | 'info' | 'warning' | 'error';
    message: string;
};

export type AuthLayoutProps = {
    children?: ReactNode;
    name?: string;
    title?: string;
    description?: string;
};

export type Leave = {
    id: number;
    user_id: number;
    leave_type: string;
    event_type: string;
    event_tag: string;
    balance: number;
    starts_at: string;
    ends_at: string;
    status: boolean;
    remarks?: string;

    user?: User;
};

export type DataResponse<T> = {
    current_page: number;
    data?: T[];
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
};

export type EventProp = {
    id: number;
    title: string;
    end: Temporal.PlainDate;
    start: Temporal.PlainDate;
    user_id: number;
    user: User;
    status: boolean;
    calendarTitle: string;
    calendarId: string;
};

export type CalendarEvent = {
    id: string;
    title: string;
    start: string;
    end: string;
    user: User;
    user_id: number;
    status: boolean;
    calendarTitle: string;
    calendarTheme: {
        lightColors: {
            main: string;
            container: string;
            onContainer: string;
        };
        darkColors: {
            main: string;
            container: string;
            onContainer: string;
        };
    };
};

export type FlashMessageProp = {
    message: string;
    id: string;
};
