import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { User as UserIcon, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-slate-850 tracking-tight">
                    Create Account
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Please fill in the details to register.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Name Input */}
                <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Full Name
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <UserIcon className="w-4 h-4" />
                        </div>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm font-medium transition duration-150"
                            placeholder="John Doe"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <InputError message={errors.name} className="mt-1.5 text-xs text-rose-600 font-semibold" />
                </div>

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
                        />
                    </div>
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-600 font-semibold" />
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Password
                    </label>
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
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-600 font-semibold" />
                </div>

                {/* Confirm Password Input */}
                <div>
                    <label htmlFor="password_confirmation" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm font-medium transition duration-150"
                            placeholder="••••••••"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                        />
                    </div>
                    <InputError message={errors.password_confirmation} className="mt-1.5 text-xs text-rose-600 font-semibold" />
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col gap-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition duration-200 shadow-md shadow-indigo-600/20"
                    >
                        Register
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-xs text-slate-500 font-semibold">
                        Already have an account?{" "}
                        <Link
                            href={route('login')}
                            className="text-indigo-655 hover:text-indigo-700 font-medium transition"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
