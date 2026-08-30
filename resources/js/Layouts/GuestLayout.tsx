import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-8 max-w-md w-full">
                {/* Branding Header */}
                <div className="mb-6 flex flex-col items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-md text-lg">
                        P
                    </div>
                    <span className="text-slate-900 font-bold text-xl tracking-tight">
                        ProManage Enterprise
                    </span>
                </div>
                {children}
            </div>
        </div>
    );
}
