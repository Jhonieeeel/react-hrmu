import { useForm } from '@inertiajs/react';
import { Button } from '../ui/button';
import { Field, FieldGroup, FieldLabel, FieldSet } from '../ui/field';
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

    return (
        <form onSubmit={handleSubmit}>
            <FieldSet className="w-full max-w-xl border shadow md:p-14">
                <FieldGroup>
                    <Field>
                        <FieldLabel>Name</FieldLabel>
                        <Input
                            id="name"
                            type="text"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="Full name"
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Email Address</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                            placeholder="email@example.com"
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            value={form.data.password}
                            onChange={(e) =>
                                form.setData('password', e.target.value)
                            }
                            placeholder="Password"
                        />
                    </Field>

                    <Field>
                        <FieldLabel>Confirm Password</FieldLabel>
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
                        />
                    </Field>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline">
                            Clear
                        </Button>

                        <Button type="submit">Create User</Button>
                    </div>
                </FieldGroup>
            </FieldSet>
        </form>
    );
}
