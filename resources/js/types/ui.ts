import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';
import type { User } from './auth';

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
    employee_id: number;
    leave_type: string;
    event_type: string;
    event_tag: string;
    balance: number;
    starts_at: string;
    ends_at: string;
    status: boolean;
    remarks?: string;
    filing_group_id?: string | null;
    /** Mirrors Leave::approvalState(). Absent on older API payloads. */
    approval_state?: 'pending' | 'approved' | 'rejected';
    reviewed_at?: string | null;
    review_remarks?: string | null;

    employee?: {
        id: number;
        user: {
            id: number;
            name: string;
            employee_type?: string;
        };
    };
    user?: User;
};

export type EmployeeSummary = {
    id: number;
    name: string;
    employee_type?: string;
};

export type EmployeeRecord = {
    id: number;
    employee_id: number;
    user_id: number;
    name: string;
    employee_type?: string;
    position: string | null;
    division: {
        id: number;
        division_name: string;
        division_code: string;
    } | null;
    section: {
        id: number;
        section_name: string;
        section_code: string;
    } | null;
    unit: {
        id: number;
        unit_name: string;
        unit_code: string;
    } | null;
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
    employee_id: number;
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
    employee_id: number;
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

export type Holiday = {
    id?: number;
    holiday_name: string;
    day: number;
    month: number;
};
