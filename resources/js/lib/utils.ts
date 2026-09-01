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
