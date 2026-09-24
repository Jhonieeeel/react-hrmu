import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';
import users from '@/routes/users';

type EmployeeFilters = {
    section_id?: string;
    unit_id?: string;
    position?: string;
};

export default function getUsers(page: number, filters: EmployeeFilters = {}) {
    return queryOptions({
        queryKey: ['employees', page, filters],
        queryFn: () => getEmployeesList(page, filters),
    });
}

async function getEmployeesList(page: number, filters: EmployeeFilters) {
    const res = await axios.get(users.data().url, {
        params: { page, ...filters },
    });

    return res.data;
}
