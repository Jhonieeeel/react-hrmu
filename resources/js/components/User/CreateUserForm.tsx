import { useForm } from '@inertiajs/react';
import { endOfMonth, format } from 'date-fns';
import { ArrowRightLeft, UserPlus } from 'lucide-react';
import users from '@/routes/users';
import DatePicker from '../Leave/DatePicker';
import { Button } from '../ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '../ui/field';
import { Input } from '../ui/input';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

type CreateUserFormProps = {
    sections: Array<{ id: number; section_name: string; section_code: string }>;
    divisions: Array<{
        id: number;
        division_name: string;
        division_code: string;
    }>;
    units: Array<{
        id: number;
        section_id: number;
        unit_name: string;
        unit_code: string;
    }>;
};

export default function CreateUserForm({
    divisions,
    sections,
    units,
}: CreateUserFormProps) {
    const form = useForm({
        name: '',
        email: '',
        employee_type: '',
        starts_at: '',
        ends_at: '',
        password: '',
        password_confirmation: '',
        position: '',
        division_id: '',
        section_id: '',
        unit_id: '',
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            starts_at: format(endOfMonth(form.data.starts_at), 'yyyy-MM-dd'),
            ends_at: format(endOfMonth(form.data.ends_at), 'yyyy-MM-dd'),
        }));

        form.submit(users.store(), {
            onSuccess: () => {
                form.reset();
            },
        });
    }

    function handleClear() {
        form.reset();
        form.clearErrors();
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet className="w-full max-w-3xl border-0 shadow-md md:p-8">
                <h1 className="text-2xl font-semibold">User Creation</h1>

                <FieldGroup className="gap-5">
                    {/* Name */}
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>

                        <Input
                            id="name"
                            type="text"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="Full name"
                            className="placeholder:text-muted-foreground/50"
                        />

                        <FieldError>{form.errors.name}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="division_id">Division</FieldLabel>
                        <select
                            id="division_id"
                            value={form.data.division_id}
                            onChange={(e) => {
                                form.setData('division_id', e.target.value);
                                form.setData('section_id', '');
                                form.setData('unit_id', '');
                            }}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                        >
                            <option value="">Select a division</option>
                            {divisions.map((division) => (
                                <option key={division.id} value={division.id}>
                                    {division.division_code} —{' '}
                                    {division.division_name}
                                </option>
                            ))}
                        </select>
                        <FieldError>{form.errors.division_id}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="position">Position</FieldLabel>
                        <Input
                            id="position"
                            value={form.data.position}
                            onChange={(e) =>
                                form.setData('position', e.target.value)
                            }
                            placeholder="e.g. Programmer"
                        />
                        <FieldError>{form.errors.position}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="section_id">Section</FieldLabel>
                        <select
                            id="section_id"
                            value={form.data.section_id}
                            onChange={(e) => {
                                form.setData('section_id', e.target.value);
                                form.setData('unit_id', '');
                            }}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                        >
                            <option value="">Select a section</option>
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.section_code} —{' '}
                                    {section.section_name}
                                </option>
                            ))}
                        </select>
                        <FieldError>{form.errors.section_id}</FieldError>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="unit_id">Unit</FieldLabel>
                        <select
                            id="unit_id"
                            value={form.data.unit_id}
                            onChange={(e) =>
                                form.setData('unit_id', e.target.value)
                            }
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                        >
                            <option value="">Select a unit</option>
                            {units
                                .filter(
                                    (unit) =>
                                        !form.data.section_id ||
                                        unit.section_id ===
                                            Number(form.data.section_id),
                                )
                                .map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.unit_code} — {unit.unit_name}
                                    </option>
                                ))}
                        </select>
                        <FieldError>{form.errors.unit_id}</FieldError>
                    </Field>

                    {/* Email */}
                    <Field>
                        <FieldLabel htmlFor="email">Email Address</FieldLabel>

                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            placeholder="email@example.com"
                            className="placeholder:text-muted-foreground/50"
                        />

                        <FieldError>{form.errors.email}</FieldError>
                    </Field>

                    {/* Trabsferee or Not */}
                    <Field>
                        <FieldLabel htmlFor="transferee">
                            Is transferee
                        </FieldLabel>

                        <ToggleGroup
                            type="single"
                            value={form.data.employee_type}
                            onValueChange={(value) => {
                                if (!value) {
                                    return;
                                }

                                form.setData('employee_type', value);
                            }}
                            className="grid w-full grid-cols-2 gap-3"
                        >
                            <ToggleGroupItem
                                value="new employee"
                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 text-emerald-600 transition-all duration-300 hover:border-emerald-500/60 hover:bg-emerald-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-emerald-500 data-[state=on]:bg-emerald-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-emerald-400 dark:data-[state=on]:text-white"
                            >
                                <UserPlus className="size-4" />
                                <span className="font-medium">
                                    New Employee
                                </span>
                            </ToggleGroupItem>

                            {/* <ToggleGroupItem
                                value="old"
                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/30 text-blue-600 transition-all duration-300 hover:border-blue-500/60 hover:bg-blue-500/10 data-[state=on]:scale-[1.02] data-[state=on]:border-blue-500 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=on]:shadow-lg dark:text-blue-400 dark:data-[state=on]:text-white"
                            >
                                <User2 className="size-4" />
                                <span className="font-medium">
                                    Old Employee
                                </span>
                            </ToggleGroupItem> */}

                            <ToggleGroupItem
                                value="transferee"
                                className="flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-destructive transition-all duration-300 hover:border-destructive/60 hover:bg-destructive/10 data-[state=on]:scale-[1.02] data-[state=on]:border-destructive data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground data-[state=on]:shadow-lg"
                            >
                                <ArrowRightLeft className="size-4" />
                                <span className="font-medium">Transferee</span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </Field>

                    <Field>
                        <FieldLabel>Date Created</FieldLabel>
                        <DatePicker
                            value={form.data.starts_at}
                            onChange={(date) => {
                                form.setData('starts_at', date);

                                form.setData('ends_at', date);
                            }}
                            placeholder="Select date"
                        />
                    </Field>

                    {/* Password */}
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>

                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            placeholder="Enter password"
                            className="placeholder:text-muted-foreground/50"
                        />

                        <FieldError>{form.errors.password}</FieldError>
                    </Field>

                    {/* Confirm Password */}
                    <Field>
                        <FieldLabel htmlFor="password_confirmation">
                            Confirm Password
                        </FieldLabel>

                        <Input
                            id="password_confirmation"
                            type="password"
                            placeholder="Confirm password"
                            value={form.data.password_confirmation}
                            onChange={(e) =>
                                form.setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            className="placeholder:text-muted-foreground/50"
                        />

                        <FieldError>
                            {form.errors.password_confirmation}
                        </FieldError>
                    </Field>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClear}
                            className="w-full sm:w-auto"
                        >
                            Clear
                        </Button>

                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="w-full sm:w-auto"
                        >
                            {form.processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </div>
                </FieldGroup>
            </FieldSet>
        </form>
    );
}
