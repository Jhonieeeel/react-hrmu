import leaves from '@/routes/leaves';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export default function getUserBalanceOption(
    month: string,
    year: string,
    user_id: number,
) {
    return queryOptions({
        queryKey: ['leaves', month, year, user_id],
        queryFn: () => getUserBalance(month, year, user_id),
        staleTime: 1000 ^ 60,
        refetchOnWindowFocus: false,
    });
}

async function getUserBalance(month: string, year: string, user_id: number) {
    const res = await axios.get(leaves.balance(user_id).url, {
        params: { month, year },
    });
    return res.data;
}
