import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-slate-850 tracking-tight">
                    Reset Password
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
                    Forgot your password? Enter your email address and we will email you a password reset link.
                </p>
            </div>

            {status && (
                <div className="mb-5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3.5 py-2 rounded-xl text-center animate-fade-in">
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
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-600 font-semibold" />
                </div>

                {/* Actions Panel */}
                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition duration-200 shadow-md shadow-indigo-600/20"
                    >
                        Send Reset Link
                        <Send className="w-3.5 h-3.5" />
                    </button>

                    <p className="text-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Sign In
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
