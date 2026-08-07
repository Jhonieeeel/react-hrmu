import leaves from '@/routes/leaves';
import users from '@/routes/users';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function getUsers(page: number) {
    return queryOptions({
        queryKey: ['users', page],
        queryFn: () => getUsersList(page),
    });
}

async function getUsersList(page: number) {
    const res = await axios.get(users.data().url, {
        params: { page },
    });
    return res.data;
}
