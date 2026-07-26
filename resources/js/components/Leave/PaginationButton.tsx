import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface PaginationButtonProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export default function PaginationButton({
    currentPage,
    lastPage,
    onPageChange,
    isLoading = false,
}: PaginationButtonProps) {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === lastPage;

    return (
        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
            <span className="text-sm text-muted-foreground">
                Page {currentPage} of {lastPage}
            </span>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    disabled={isFirstPage || isLoading}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="border-border transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                </Button>

                <Button
                    variant="outline"
                    disabled={isLastPage || isLoading}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="border-border transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
