import { Spinner } from '@/components/ui/spinner';
import leaves from '@/routes/leaves';
import { useForm } from '@inertiajs/react';
import { FileSpreadsheet } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '../ui/button';

type ButtonProps = {
    date: {
        month: string | number;
        year: string | number;
    };
    flash: {
        downloadUrl: string;
    };
};

export default function DownloadButton({ date, flash }: ButtonProps) {
    console.log(flash.downloadUrl);
    const form = useForm({
        month: date.month,
        year: date.year,
    });

    function handleDownload() {
        form.setData({
            month: date.month ?? '',
            year: date.year ?? '',
        });

        form.get(leaves.export().url);
    }

    useEffect(() => {
        if (flash?.downloadUrl) {
            window.location.assign(flash?.downloadUrl);
        }
    }, [flash?.downloadUrl]);

    return (
        <Button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground hover:bg-accent/80"
            type="button"
        >
            {form.processing ? (
                <Spinner className="h-4 w-4" />
            ) : (
                <FileSpreadsheet className="h-4 w-4" />
            )}
            {form.processing ? 'Downloading' : 'Download'}
        </Button>
    );
}
