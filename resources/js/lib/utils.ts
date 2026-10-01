import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function toDateOnly(value?: string | null) {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[0] : value;
}

export function readFiltersFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const now = new Date();

    return {
        month: params.get('month') ?? String(now.getMonth() + 1),
        year: params.get('year') ?? String(now.getFullYear()),
    };
}

export function filteredDateName(month: string, year: string) {
    return format(new Date(Number(year), Number(month) - 1, 1), 'MMMM yyyy');
}

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

/**
 * Converts a 1-12 month number into its full name (e.g. 12 -> 'December').
 * Falls back to the raw value when it is out of range.
 */
export function monthName(month: number | string) {
    return MONTH_NAMES[Number(month) - 1] ?? String(month);
}

/**
 * Builds a yyyy-MM-dd date that belongs to the given (month, year) filter.
 * When the filter matches the current month/year, today is used so the
 * filing form opens on the actual day instead of the 1st.
 */
export function defaultDateFromFilters(month?: string | null, year?: string | null) {
    const now = new Date();
    const targetMonth = Number(month) || now.getMonth() + 1;
    const targetYear = Number(year) || now.getFullYear();

    const isCurrentMonth =
        targetMonth === now.getMonth() + 1 && targetYear === now.getFullYear();

    return format(
        new Date(targetYear, targetMonth - 1, isCurrentMonth ? now.getDate() : 1),
        'yyyy-MM-dd',
    );
}
