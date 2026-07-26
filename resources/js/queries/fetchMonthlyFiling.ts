import leaves from '@/routes/leaves';
import { DataResponse, Leave } from '@/types';
import { queryOptions } from '@tanstack/react-query';
import axios from 'axios';

export default function getFilingOption(
    month: string,
    year: string,
    page: number,
) {
    return queryOptions({
        queryKey: ['leaves', month, year, page],
        queryFn: () => getMonthlyFiling(month, year, page),
        placeholderData: (previous) => previous,
    });
}

async function getMonthlyFiling(
    month: string,
    year: string,
    page: number,
): Promise<DataResponse<Leave>> {
    const res = await axios.get(leaves.data().url, {
        params: { month, year, page },
    });
    return res.data;
}
