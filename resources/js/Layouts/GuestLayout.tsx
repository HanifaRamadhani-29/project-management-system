import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-slate-850 font-sans selection:bg-indigo-600 selection:text-white relative overflow-hidden">
            {/* Header */}
            <div className="mb-6 flex flex-col items-center gap-2.5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-black text-white shadow-md text-lg">
                    P
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                    ProManage Enterprise
                </span>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl relative z-10 animate-fade-in">
                {children}
            </div>
        </div>
    );
}
