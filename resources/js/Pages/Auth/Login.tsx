import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-slate-850 tracking-tight">
                    Sign In
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Please enter your credentials to login.
                </p>
            </div>

            {status && (
                <div className="mb-5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm font-medium transition duration-150"
                            placeholder="name@company.com"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-600 font-semibold" />
                </div>

                {/* Password Input */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Password
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-indigo-655 hover:text-indigo-700 font-medium transition"
                            >
                                Forgot?
                            </Link>
                        )}
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm font-medium transition duration-150"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-600 font-semibold" />
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ms-2.5 text-xs text-slate-600 font-medium">
                            Remember me on this device
                        </span>
                    </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition duration-200 shadow-md shadow-indigo-600/20"
                    >
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-xs text-slate-500 font-semibold">
                        Don't have an account?{" "}
                        <Link
                            href={route('register')}
                            className="text-indigo-655 hover:text-indigo-700 font-medium transition"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
