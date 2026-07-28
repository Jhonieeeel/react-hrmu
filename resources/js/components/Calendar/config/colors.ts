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
