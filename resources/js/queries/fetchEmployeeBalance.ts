import leaves from '@/routes/leaves';
import { queryOptions, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function getEmployeeBalanceOption(
    month: string,
    year: string,
    employee_id: number,
    page: number,
) {
    return queryOptions({
        queryKey: ['leaves', month, year, employee_id, page],
        queryFn: () => getEmployeeBalance(month, year, employee_id, page),
        placeholderData: (previous) => previous,
        staleTime: 1000 * 60 * 1,
    });
}

async function getEmployeeBalance(
    month: string,
    year: string,
    employee_id: number,
    page: number,
) {
    const res = await axios.get(leaves.balance(employee_id).url, {
        params: { month, year, page },
    });
    return res.data;
}
