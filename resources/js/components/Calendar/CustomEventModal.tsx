import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UserInfo } from '@/components/user-info';
import { CalendarEvent, User } from '@/types';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import EditEventDialog from './EditEventDialog';
import ViewEventDialog from './ViewEventDialog';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    calendarEvent: CalendarEvent;
}

export default function CustomEventModal({
    open,
    onOpenChange,
    calendarEvent,
}: Props) {
    const [mode, setMode] = useState('view');

    const form = useForm();

    return (
        <Dialog
            modal={false}
            open={open}
            onOpenChange={(next) => {
                onOpenChange(next);
                if (!next) {
                    setMode('view');
                    form.reset();
                }
            }}
        >
            <DialogContent className="max-w-sm gap-0 overflow-hidden p-0">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b px-5 pt-5 pb-4">
                    <div className="flex h-11 items-center gap-2">
                        <UserInfo user={calendarEvent.user} />
                    </div>
                </div>

                {mode === 'view' ? (
                    <ViewEventDialog
                        calendarEvent={calendarEvent}
                        setMode={setMode}
                        open={open}
                        onOpenChange={onOpenChange}
                    />
                ) : (
                    <EditEventDialog
                        calendarEvent={calendarEvent}
                        setMode={setMode}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
