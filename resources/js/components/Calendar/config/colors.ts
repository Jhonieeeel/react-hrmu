const red = {
    lightColors: {
        main: '#ef4444',
        container: '#fee2e2',
        onContainer: '#991b1b',
    },
    darkColors: {
        main: '#f87171',
        container: '#7f1d1d',
        onContainer: '#fecaca',
    },
};

const green = {
    lightColors: {
        main: '#16A34A',
        container: '#DCFCE7',
        onContainer: '#14532D',
    },
    darkColors: {
        main: '#22C55E',
        container: '#14532D',
        onContainer: '#BBF7D0',
    },
};

const orange = {
    lightColors: {
        main: '#EA580C',
        container: '#FFEDD5',
        onContainer: '#9A3412',
    },
    darkColors: {
        main: '#F97316',
        container: '#9A3412',
        onContainer: '#FED7AA',
    },
};

const blue = {
    lightColors: {
        main: '#2563EB',
        container: '#DBEAFE',
        onContainer: '#1E3A8A',
    },
    darkColors: {
        main: '#60A5FA',
        container: '#1E3A8A',
        onContainer: '#BFDBFE',
    },
};

export const calendarConfig = {
    'vacation leave': {
        colorName: 'vacation_leave',
        ...red,
    },
    'sick leave': {
        colorName: 'sick_leave',
        ...red,
    },
    'force leave': {
        colorName: 'force_leave',
        ...red,
    },
    'wellness leave': {
        colorName: 'wellness_leave',
        ...red,
    },
    'special leave': {
        colorName: 'special_leave',
        ...red,
    },
    cto: {
        colorName: 'cto',
        ...green,
    },
    offset: {
        colorName: 'offset',
        ...blue,
    },
    absent: {
        colorName: 'absent',
        ...orange,
    },
    holiday: {
        colorName: 'holiday',
        ...orange,
    },
};

type CalendarTheme = (typeof calendarConfig)[keyof typeof calendarConfig];

/**
 * The colour pair for a calendar id, or undefined for one this theme set does
 * not define.
 *
 * A lookup rather than a bare index because the id comes off an event the grid
 * is holding, and an unrecognised leave type should render without a colour
 * rather than crash the page — an unknown type is a data problem, not a reason
 * the calendar stops drawing.
 */
export function calendarThemeFor(
    id?: string | null,
): CalendarTheme | undefined {
    if (!id) {
        return undefined;
    }

    return (calendarConfig as Record<string, CalendarTheme>)[id];
}
