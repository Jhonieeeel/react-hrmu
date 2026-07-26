type EventType = {
    id: number;
    leave_type: string;
};

export const event_types: EventType[] = [
    { id: 1, leave_type: 'Vacation Leave' },
    { id: 2, leave_type: 'Sick Leave' },
    { id: 3, leave_type: 'Force Leave' },
    { id: 4, leave_type: 'Wellness Leave' },
    { id: 5, leave_type: 'Paternity leave' },
    { id: 6, leave_type: 'Special Privilege leave' },
    { id: 7, leave_type: 'Solo Parent Leave' },
    { id: 8, leave_type: '10-day VAWC Leave' },
    { id: 9, leave_type: 'Special Emergency (Calamity) Leave' },
    { id: 10, leave_type: 'Maternity Leave' },
    { id: 11, leave_type: 'Study Leave' },
    { id: 12, leave_type: 'Rehabilitation Leave' },
    { id: 13, leave_type: 'Adoption Leave' },
    { id: 14, leave_type: 'CTO' },
    { id: 15, leave_type: 'Offset' },
];

export const calendarTypes = [
    'maternity leave',
    'study leave',
    'rehabilitation leave',
    'adoption leave',
];
