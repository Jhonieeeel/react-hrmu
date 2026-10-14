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
 * Generational suffixes, which are neither given names nor part of the surname.
 *
 * They are matched anywhere in the name rather than only at the end, because the
 * records store them where they are written — "Carlito Jr. Clarete". Treating
 * one as a given name would both reduce it to a bare "J." and put the surname in
 * the wrong place.
 */
const NAME_SUFFIXES = ['jr.', 'jr', 'sr.', 'sr', 'ii', 'iii', 'iv', 'v'];

/**
 * Lowercase words that belong to the surname rather than the given names.
 *
 * Without this, "Ana Maria de la Cruz" loses "de la" into the initials and
 * becomes "Cruz, A. M. D. L." — which reads as three separate people.
 */
const SURNAME_PARTICLES = [
    'de',
    'del',
    'dela',
    'delos',
    'la',
    'las',
    'lo',
    'los',
    'da',
    'das',
    'dos',
    'van',
    'von',
    'bin',
    'binti',
];

/**
 * A person's name as `Surname, G. I.` — "Alingasa, R. F."
 *
 * For the month grid, where a full name is the difference between a cell that
 * reads as one entry and one that reads as a paragraph. Surname first because
 * that is the part that identifies somebody across a list, and it is the part
 * that survives the grid's right-hand truncation; initials after it because the
 * given name is what tells two people with the same surname apart.
 *
 * Every given name contributes an initial rather than only the first, so
 * "April Rose Anne Sanchez-Elmedulan" stays distinguishable from another
 * Sanchez-Elmedulan. A hyphenated surname is left whole — it is one surname.
 *
 * A name with nothing to move is returned untouched rather than being mangled
 * into a stray initial, so a surname-only record still displays as itself.
 */
export function compactName(name?: string | null) {
    const trimmed = (name ?? '').trim();

    if (!trimmed) {
        return '';
    }

    const tokens = trimmed.split(/\s+/);

    if (tokens.length === 1) {
        return trimmed;
    }

    const suffix: string[] = [];
    const words: string[] = [];

    for (const token of tokens) {
        if (NAME_SUFFIXES.includes(token.toLowerCase())) {
            suffix.push(token);
        } else {
            words.push(token);
        }
    }

    // Surname is the last word, plus any particles written before it. `start`
    // is clamped at 1 so a name made entirely of particles still keeps a word
    // to render rather than collapsing to nothing.
    let start = Math.max(1, words.length - 1);

    while (
        start > 1 &&
        SURNAME_PARTICLES.includes((words[start - 1] ?? '').toLowerCase())
    ) {
        start--;
    }

    const surname = words.slice(start).join(' ');
    const initials = words
        .slice(0, start)
        .map((token) => `${token.charAt(0).toUpperCase()}.`)
        .join(' ');

    if (!initials) {
        return [surname, ...suffix].join(' ');
    }

    return `${surname}, ${initials}${suffix.length ? ` ${suffix.join(' ')}` : ''}`;
}

/**
 * Builds a yyyy-MM-dd date that belongs to the given (month, year) filter.
 * When the filter matches the current month/year, today is used so the
 * filing form opens on the actual day instead of the 1st.
 */
export function defaultDateFromFilters(
    month?: string | null,
    year?: string | null,
) {
    const now = new Date();
    const targetMonth = Number(month) || now.getMonth() + 1;
    const targetYear = Number(year) || now.getFullYear();

    const isCurrentMonth =
        targetMonth === now.getMonth() + 1 && targetYear === now.getFullYear();

    return format(
        new Date(
            targetYear,
            targetMonth - 1,
            isCurrentMonth ? now.getDate() : 1,
        ),
        'yyyy-MM-dd',
    );
}
