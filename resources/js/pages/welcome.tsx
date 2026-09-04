import { Head, Link } from '@inertiajs/react';
import { login } from '@/routes';

export default function Welcome() {
    return (
        <>
            <Head title="OCD Leave Management System" />

            <div className="min-h-screen bg-background text-foreground">
                {/* Top Bar */}
                <div className="bg-primary px-6 py-2 text-center text-xs font-medium tracking-[0.15em] text-primary-foreground">
                    REPUBLIC OF THE PHILIPPINES
                </div>

                {/* Header */}
                <header className="border-b border-border bg-card">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
                        <div className="flex items-center gap-4">
                            {/* Logo */}
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xs font-black text-primary-foreground shadow-sm ring-2 ring-secondary/40">
                                OCD
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                                    Office of Civil Defense
                                </p>

                                <h1 className="text-lg font-bold text-foreground">
                                    Leave Management System
                                </h1>
                            </div>
                        </div>

                        <Link
                            href={login()}
                            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                            Sign In
                        </Link>
                    </div>
                </header>

                {/* Hero */}
                <main>
                    <section className="relative overflow-hidden bg-primary">
                        {/* Decorative circles */}
                        <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full border-[35px] border-secondary/10" />

                        <div className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full border-[35px] border-secondary/5" />

                        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
                            {/* Text */}
                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 px-4 py-2 text-xs font-medium text-primary-foreground">
                                    <span className="h-2 w-2 rounded-full bg-secondary" />
                                    EMPLOYEE PORTAL
                                </div>

                                <h2 className="text-4xl leading-tight font-extrabold tracking-tight text-primary-foreground sm:text-5xl">
                                    Manage your leave.
                                    <span className="block text-secondary">
                                        Know your balance.
                                    </span>
                                </h2>

                                <p className="mt-6 max-w-lg text-base leading-7 text-primary-foreground/65">
                                    A simple and secure portal for Office of
                                    Civil Defense personnel to view and monitor
                                    their leave balances and leave records.
                                </p>

                                <Link
                                    href={login()}
                                    className="mt-8 inline-flex items-center rounded-md bg-secondary px-7 py-3.5 text-sm font-bold text-secondary-foreground shadow-lg transition hover:brightness-105"
                                >
                                    Sign In to Continue
                                    <svg
                                        className="ml-2 h-4 w-4"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                            </div>

                            {/* Leave Balance Preview */}
                            <div className="relative">
                                <div className="absolute -inset-4 rounded-3xl border border-secondary/10" />

                                <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                                    {/* Card Header */}
                                    <div className="border-b border-border px-6 py-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground">
                                                    Employee Dashboard
                                                </p>

                                                <h3 className="mt-1 font-bold text-card-foreground">
                                                    Leave Balance
                                                </h3>
                                            </div>

                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                                                LB
                                            </div>
                                        </div>
                                    </div>

                                    {/* Balance Cards */}
                                    <div className="grid grid-cols-2 gap-4 p-6">
                                        <div className="rounded-xl bg-muted p-5">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Vacation Leave
                                            </p>

                                            <div className="mt-3 flex items-end gap-2">
                                                <span className="text-3xl font-bold text-primary">
                                                    15
                                                </span>

                                                <span className="mb-1 text-xs text-muted-foreground">
                                                    days
                                                </span>
                                            </div>

                                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
                                                <div className="h-full w-[75%] rounded-full bg-primary" />
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-muted p-5">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Sick Leave
                                            </p>

                                            <div className="mt-3 flex items-end gap-2">
                                                <span className="text-3xl font-bold text-secondary">
                                                    12
                                                </span>

                                                <span className="mb-1 text-xs text-muted-foreground">
                                                    days
                                                </span>
                                            </div>

                                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border">
                                                <div className="h-full w-[60%] rounded-full bg-secondary" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Record */}
                                    <div className="mx-6 mb-6 rounded-xl border border-border bg-background p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    Leave Records
                                                </p>

                                                <p className="mt-1 text-sm font-semibold">
                                                    View your leave history
                                                </p>
                                            </div>

                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                                                →
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-1 bg-secondary" />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="mx-auto max-w-6xl px-6 py-20">
                        <div className="max-w-2xl">
                            <p className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">
                                Leave Management
                            </p>

                            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                                Everything you need to keep track of your leave.
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                Access your leave information in one convenient
                                place.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            <FeatureCard
                                icon="01"
                                title="View Balances"
                                description="Check your available vacation, sick, and other leave balances at any time."
                            />

                            <FeatureCard
                                icon="02"
                                title="Leave Records"
                                description="Review your previous leave transactions and keep track of your leave history."
                            />

                            <FeatureCard
                                icon="03"
                                title="Stay Updated"
                                description="Keep your leave information organized and easily accessible whenever you need it."
                            />
                        </div>
                    </section>

                    {/* Simple CTA */}
                    <section className="px-6 pb-20">
                        <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-muted">
                            <div className="flex flex-col items-center justify-between gap-6 px-8 py-10 text-center sm:flex-row sm:text-left">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        Ready to check your leave balance?
                                    </h2>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Sign in to access your employee leave
                                        dashboard.
                                    </p>
                                </div>

                                <Link
                                    href={login()}
                                    className="shrink-0 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-border bg-card">
                    <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-7 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                        <div>
                            <p className="text-sm font-semibold">
                                Office of Civil Defense
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Leave Management System
                            </p>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            © {new Date().getFullYear()} Office of Civil Defense
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="group rounded-xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-secondary/40 hover:shadow-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                {icon}
            </div>

            <h3 className="mt-6 text-base font-bold">{title}</h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {description}
            </p>
        </div>
    );
}
