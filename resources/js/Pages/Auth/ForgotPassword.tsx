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

            <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Reset Password
                </h2>
                <p className="text-sm text-slate-400 mt-2 font-medium leading-relaxed">
                    Enter the email address associated with your account, and we'll email you a secure link to reset your password.
                </p>
            </div>

            {status && (
                <div className="mb-6 text-sm font-semibold text-emerald-450 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 text-sm font-medium transition duration-150"
                            placeholder="name@company.com"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500 font-semibold" />
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition duration-200 shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                    >
                        Send Reset Link
                        <Send className="w-4.5 h-4.5" />
                    </button>

                    <div className="text-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-1.5 text-xs text-slate-450 hover:text-slate-300 font-bold transition"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to sign in
                        </Link>
                    </div>
                </div>
            </form>
        </GuestLayout>
    );
}
