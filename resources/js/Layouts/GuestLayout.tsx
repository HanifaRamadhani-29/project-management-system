import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
            {/* Ambient glow backgrounds */}
            <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none" />

            {/* Header */}
            <div className="mb-8 flex flex-col items-center gap-2.5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] text-lg">
                    P
                </div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    ProManage Enterprise
                </span>
            </div>

            {/* Form Card */}
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
                {children}
            </div>
        </div>
    );
}
