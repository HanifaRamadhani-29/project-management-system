import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, User } from '@/types';

const getRoleName = (role: string | { name?: string } | undefined) => {
    if (typeof role === 'string') return role;
    return role?.name ?? 'No Role';
};

export default function Show({ user }: PageProps<{ user: User }>) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        User Details
                    </h2>
                    <Link
                        href={route('users.edit', user.id)}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                    >
                        Edit User
                    </Link>
                </div>
            }
        >
            <Head title={`${user.name}`} />

            <div className="mx-auto max-w-3xl py-10">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Name</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{user.name}</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Email</p>
                            <p className="mt-2 text-lg text-slate-700">{user.email}</p>
                        </div>

                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Role</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {(user.roles ?? []).map((role, index) => (
                                    <span
                                        key={`${user.id}-${index}`}
                                        className="rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700"
                                    >
                                        {getRoleName(role as string | { name?: string })}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
