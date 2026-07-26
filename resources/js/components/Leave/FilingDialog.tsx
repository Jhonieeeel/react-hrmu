import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Leave } from '@/types';
import { Check, X } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Textarea } from '../ui/textarea';

type FilingProp = {
    children: React.ReactNode;
    leave: Leave;
};

export function FilingDialog({ children, leave }: FilingProp) {
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when
                            you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="status">Filing Status</Label>
                            <ToggleGroup
                                type="single"
                                value={
                                    leave?.status ? 'completed' : 'incomplete'
                                }
                                // onValueChange={(value) =>
                                //     value && form.setData('event_tag', value)
                                // }
                                className="grid grid-cols-2 gap-3"
                            >
                                <ToggleGroupItem
                                    value={'completed'}
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 text-emerald-600 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-emerald-400 dark:data-[state=on]:text-white"
                                >
                                    <Check className="size-4" />
                                    <span className="font-medium">
                                        Completed
                                    </span>
                                </ToggleGroupItem>

                                <ToggleGroupItem
                                    value="incomplete"
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive/60 hover:bg-destructive/10 data-[state=on]:scale-[1.02] data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:shadow-lg"
                                >
                                    <X className="size-4" />
                                    <span className="font-medium">
                                        Incomplete
                                    </span>
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </Field>
                        <Field>
                            <Label htmlFor="remarks">Remarks</Label>
                            <Textarea placeholder="Type your message here." />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Save changes</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
