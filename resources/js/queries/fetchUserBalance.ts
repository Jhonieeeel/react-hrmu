import leaves from '@/routes/leaves';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function getUserBalanceOption(
    month: string,
    year: string,
    user_id: number,
    page: number,
) {
    return queryOptions({
        queryKey: ['leaves', month, year, user_id, page],
        queryFn: () => getUserBalance(month, year, user_id, page),
        placeholderData: (previous) => previous,
    });
}

async function getUserBalance(
    month: string,
    year: string,
    user_id: number,
    page: number,
) {
    const res = await axios.get(leaves.balance(user_id).url, {
        params: { month, year, page },
    });
    return res.data;
}
