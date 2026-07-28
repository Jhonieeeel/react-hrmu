import calendar from '@/routes/calendar';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export default function getCalendarEventsOption() {
    return queryOptions({
        queryKey: ['calendarEvents'],
        queryFn: () => getCalendarEvents(),
    });
}

async function getCalendarEvents() {
    const res = await axios.get(calendar.data().url);

    return res.data;
}
