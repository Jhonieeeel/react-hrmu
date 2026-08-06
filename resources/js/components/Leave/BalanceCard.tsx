import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Spinner } from '../ui/spinner';

type Balance = {
    leave_type: string;
    previous: number;
    current: number;
    estimated: number;
    monthly_accrual: number;
    used: number;
};

type BalanceProp = {
    balance: Balance;
    isFetching: boolean;
};

export default function BalanceCard({ balance, isFetching }: BalanceProp) {
    const usagePercentage =
        balance.current + balance.used > 0
            ? (balance.used / (balance.current + balance.used)) * 100
            : 0;

    return (
        <Card className="w-full border-border bg-card shadow-sm">
            {isFetching ? (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/50 backdrop-blur-sm">
                    <Spinner className="h-8 w-8" />
                </div>
            ) : (
                <>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle className="capitalize">
                                {balance.leave_type}
                            </CardTitle>

                            <p className="text-sm text-muted-foreground">
                                Monthly accrual: {balance.monthly_accrual} days
                            </p>
                        </div>

                        <Badge className="bg-accent text-accent-foreground capitalize">
                            Active
                        </Badge>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        {/* Current Balance */}
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Available Balance
                            </p>

                            <div className="flex items-end gap-2">
                                <span className="text-4xl font-bold text-primary">
                                    {balance.current.toFixed(3) ??
                                        balance.current}
                                </span>

                                <span className="mb-1 text-sm text-muted-foreground">
                                    days
                                </span>
                            </div>
                        </div>

                        {/* Usage */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Used
                                </span>

                                <span className="font-medium">
                                    {balance.used} days
                                </span>
                            </div>

                            <Progress value={usagePercentage} />
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg border border-border bg-muted/40 p-3">
                                <p className="text-xs text-muted-foreground">
                                    Previous
                                </p>

                                <p className="text-lg font-semibold">
                                    {balance.previous.toFixed(3) ??
                                        balance.previous}
                                </p>
                            </div>

                            <div className="rounded-lg border border-border bg-muted/40 p-3">
                                <p className="text-xs text-muted-foreground">
                                    Estimated
                                </p>

                                <p className="text-lg font-semibold">
                                    {balance.estimated.toFixed(3) ??
                                        balance.estimated}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
