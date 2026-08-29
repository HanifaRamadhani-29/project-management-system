import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { AuditLog, PaginatedAuditLogs } from "@/types/audit-log";
import { 
    History, 
    Search, 
    Calendar, 
    Eye, 
    X, 
    User as UserIcon, 
    RefreshCcw, 
    HelpCircle 
} from "lucide-react";

interface OptionUser {
    id: number;
    name: string;
    email: string;
}

interface IndexProps {
    auditLogs: PaginatedAuditLogs;
    filters: {
        action?: string;
        user_id?: string;
        date_start?: string;
        date_end?: string;
        search?: string;
    };
    actionOptions: string[];
    userOptions: OptionUser[];
}

export default function Index({ auditLogs, filters, actionOptions, userOptions }: IndexProps) {
    const [search, setSearch] = useState(filters.search || "");
    const [action, setAction] = useState(filters.action || "");
    const [userId, setUserId] = useState(filters.user_id || "");
    const [dateStart, setDateStart] = useState(filters.date_start || "");
    const [dateEnd, setDateEnd] = useState(filters.date_end || "");

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("audit_logs.index"),
            {
                search,
                action,
                user_id: userId,
                date_start: dateStart,
                date_end: dateEnd,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleResetFilters = () => {
        setSearch("");
        setAction("");
        setUserId("");
        setDateStart("");
        setDateEnd("");

        router.get(
            route("audit_logs.index"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const getActionBadgeClass = (actionName: string) => {
        const name = actionName.toUpperCase();
        if (name.includes("CREATED")) {
            return "bg-emerald-50 text-emerald-650 border border-emerald-100";
        }
        if (name.includes("DELETED")) {
            return "bg-rose-50 text-rose-650 border border-rose-100";
        }
        if (name.includes("STATUS_CHANGED")) {
            return "bg-indigo-50 text-indigo-650 border border-indigo-100";
        }
        if (name.includes("DEADLINE_CHANGED")) {
            return "bg-amber-50 text-amber-650 border border-amber-100";
        }
        if (name.includes("UPDATED")) {
            return "bg-blue-50 text-blue-650 border border-blue-100";
        }
        return "bg-slate-50 text-slate-600 border border-slate-100";
    };

    const formatTimestamp = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            }) + " WIB";
        } catch (e) {
            return dateString;
        }
    };

    const extractEntityName = (log: AuditLog) => {
        const typeParts = log.auditable_type.split("\\");
        const baseType = typeParts[typeParts.length - 1];
        return `${baseType} #${log.auditable_id}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    Audit Logs Console
                </h2>
            }
        >
            <Head title="Audit Logs" />

            <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
                {/* 1. Welcome & Info */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Audit Logs Tracker
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            System-wide activity trail and data mutation history.
                        </p>
                    </div>
                </div>

                {/* 2. Filter Bar Panel */}
                <form onSubmit={handleFilterSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Keyword Search */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search IP, name, action..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-xs font-medium transition"
                                />
                            </div>
                        </div>

                        {/* Action Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action Type</label>
                            <select
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-xs font-medium transition cursor-pointer"
                            >
                                <option value="">All Actions</option>
                                {actionOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        {/* Actor User Dropdown */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actor (User)</label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-xs font-medium transition cursor-pointer"
                            >
                                <option value="">All Users</option>
                                {userOptions.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Start */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date Start</label>
                                <input
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => setDateStart(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-xs font-medium transition"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date End</label>
                                <input
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-xs font-medium transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleResetFilters}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-slate-650 hover:bg-slate-100 font-semibold rounded-xl text-xs transition border border-slate-200"
                        >
                            <RefreshCcw className="w-3.5 h-3.5" />
                            Reset Filters
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-755 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-indigo-600/20"
                        >
                            Apply Filters
                        </button>
                    </div>
                </form>

                {/* 3. Table Log Panels */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium text-slate-600 min-w-[800px]">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-150 bg-slate-50 text-[10px] uppercase font-bold tracking-wider">
                                    <th className="py-4 px-6">Timestamp</th>
                                    <th className="py-4 px-4">Actor</th>
                                    <th className="py-4 px-4">Action</th>
                                    <th className="py-4 px-4">Target Entity</th>
                                    <th className="py-4 px-4">IP Address</th>
                                    <th className="py-4 px-6 text-right">Data Changes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {auditLogs.data.length > 0 ? (
                                    auditLogs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition">
                                            {/* Timestamp */}
                                            <td className="py-4 px-6 font-semibold text-slate-700 whitespace-nowrap">
                                                {formatTimestamp(log.created_at)}
                                            </td>

                                            {/* Actor Info */}
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {log.user ? (
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase shadow-sm">
                                                            {log.user.name.substring(0, 2)}
                                                        </div>
                                                        <div className="flex flex-col text-[11px]">
                                                            <span className="font-bold text-slate-800 leading-tight">{log.user.name}</span>
                                                            <span className="text-slate-400 font-medium">{log.user.email}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-400 italic">
                                                        <UserIcon className="w-3.5 h-3.5" />
                                                        System Action
                                                    </div>
                                                )}
                                            </td>

                                            {/* Action Badge */}
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold capitalize border tracking-wide whitespace-nowrap ${getActionBadgeClass(log.action)}`}>
                                                    {log.action.replace("_", " ").toLowerCase()}
                                                </span>
                                            </td>

                                            {/* Target Entity */}
                                            <td className="py-4 px-4 font-bold text-slate-800">
                                                {extractEntityName(log)}
                                            </td>

                                            {/* IP Address */}
                                            <td className="py-4 px-4 font-semibold text-slate-500 font-mono">
                                                {log.ip_address || "127.0.0.1"}
                                            </td>

                                            {/* Action changes modal button */}
                                            <td className="py-4 px-6 text-right">
                                                {log.old_values || log.new_values ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedLog(log)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-indigo-600 hover:text-indigo-700 font-bold border border-slate-200 rounded-lg text-[10px] transition"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        Inspect Diffs
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-350 italic">No mutations</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                                            No audit logs found matching selected criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {auditLogs.links && auditLogs.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-150 bg-slate-50 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">
                                Showing page {auditLogs.current_page} of {auditLogs.last_page} ({auditLogs.total} logs)
                            </span>
                            <div className="flex items-center gap-1">
                                {auditLogs.links.map((link, idx) => {
                                    if (link.url === null) {
                                        return (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1.5 rounded-lg text-slate-300 text-[10px] font-bold border border-transparent cursor-not-allowed select-none"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${
                                                link.active
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                    : "bg-white text-slate-600 border-slate-250 hover:bg-slate-50"
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Diffs Modal Component */}
            {selectedLog && (
                <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                                    <History className="w-5 h-5 text-indigo-500" />
                                    Data Mutations Inspector
                                </h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                    Compare state changes for action: <span className="text-indigo-600 font-bold">{selectedLog.action}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
                            {/* Inline Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 bg-slate-50 border border-slate-150 rounded-xl font-semibold text-slate-550">
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-slate-400">Actor</span>
                                    {selectedLog.user?.name || "System"}
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-slate-400">Target</span>
                                    {extractEntityName(selectedLog)}
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-slate-400">Timestamp</span>
                                    {formatTimestamp(selectedLog.created_at)}
                                </div>
                                <div>
                                    <span className="block text-[9px] uppercase font-bold text-slate-400">IP Address</span>
                                    {selectedLog.ip_address || "127.0.0.1"}
                                </div>
                            </div>

                            {/* Diff Viewer Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Old Values Side */}
                                <div className="space-y-2.5">
                                    <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                                        Old Value (Before)
                                    </h4>
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono overflow-auto max-h-[300px] text-[11px] leading-relaxed">
                                        {selectedLog.old_values ? (
                                            <pre className="text-rose-700 whitespace-pre-wrap">
                                                {JSON.stringify(selectedLog.old_values, null, 2)}
                                            </pre>
                                        ) : (
                                            <span className="text-slate-400 italic">No record (Initial State)</span>
                                        )}
                                    </div>
                                </div>

                                {/* New Values Side */}
                                <div className="space-y-2.5">
                                    <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        New Value (After)
                                    </h4>
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono overflow-auto max-h-[300px] text-[11px] leading-relaxed">
                                        {selectedLog.new_values ? (
                                            <pre className="text-emerald-700 whitespace-pre-wrap">
                                                {JSON.stringify(selectedLog.new_values, null, 2)}
                                            </pre>
                                        ) : (
                                            <span className="text-slate-400 italic">No record (Entity Deleted)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl text-xs transition"
                            >
                                Close Inspector
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
