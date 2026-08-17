import { useForm } from '@inertiajs/react';
import { Button } from '../ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from '../ui/field';
import { Input } from '../ui/input';
import users from '@/routes/users';

export default function CreateUserForm() {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function handleSubmit(e: React.SubmitEvent) {
        e.preventDefault();

        form.submit(users.store());
    }

    function handleClear() {
        form.reset();
        form.clearErrors();
    }

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet className="w-full border-0 p-0">
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
