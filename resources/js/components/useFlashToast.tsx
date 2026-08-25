import { useEffect } from 'react';
import { toast } from 'sonner';

interface FlashSuccess {
    message: string;
    id: string;
}

interface Flash {
    success?: FlashSuccess | null;
}

export default function useFlashToast(flash: Flash | undefined) {
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success.message, { position: 'top-center' });
        }
    }, [flash?.success?.id]);
}
