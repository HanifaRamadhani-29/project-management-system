import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Check, AlertTriangle, Clock, History, FileText, CheckCircle2, AlertCircle, X, Folder, Calendar, User, Eye, MessageSquare, Download } from 'lucide-react';

interface Props {
    approvals?: any[];
}

export default function Index({ approvals = [] }: Props) {
    const { auth } = usePage().props as any;
    const currentUser = auth.user;

    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    
    // Modal states
    const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
    const [revisionFeedback, setRevisionFeedback] = useState('');
    const [previewTask, setPreviewTask] = useState<any | null>(null);

    const canApprove = currentUser?.role === 'super_admin' || 
                        auth.roles?.includes('Super Admin') || 
                        auth.permissions?.includes('tasks.approve');

    // Split approvals into Pending and History
    const pendingApprovals = approvals.filter((a) => a.status === 'Pending');
    const historyApprovals = approvals.filter((a) => a.status !== 'Pending');

    const getPriorityBadgeClass = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'critical':
                return 'bg-rose-100 text-rose-700 border border-rose-200';
            case 'high':
                return 'bg-amber-100 text-amber-700 border border-amber-200';
            case 'medium':
                return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
            default:
                return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        }
    };

    const formatDeadline = (value: string | null) => {
        if (!value) return 'No deadline';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "just now";
    };

    const handleApprove = (taskId: number) => {
        if (confirm('Apakah Anda yakin ingin menyetujui tugas ini?')) {
            router.post(route('tasks.approve', taskId), {}, {
                preserveScroll: true
            });
        }
    };

    const handleRevisionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedApproval) return;
        if (!revisionFeedback.trim()) {
            alert('Catatan revisi wajib diisi!');
            return;
        }

        router.post(route('tasks.revision', selectedApproval.task_id), {
            feedback: revisionFeedback
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedApproval(null);
                setRevisionFeedback('');
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Approval Center
                        </h2>
                        <p className="text-xs text-slate-500">Review and approve task submissions.</p>
                    </div>
                </div>
            }
        >
            <Head title="Approvals Center" />

            <div className="space-y-6">
                {/* Tabs */}
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === 'pending'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            Pending Approvals
                            {pendingApprovals.length > 0 && (
                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                    {pendingApprovals.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                activeTab === 'history'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <History className="w-4 h-4" />
                            Approval History
                        </button>
                    </nav>
                </div>

                {/* Tab Contents */}
                {activeTab === 'pending' ? (
                    <div className="space-y-4">
                        {pendingApprovals.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-700">All caught up!</p>
                                <p className="text-sm text-slate-500 mt-1">No pending task approvals waiting for your review.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {pendingApprovals.map((approval) => {
                                    const uncompletedDeps = approval.task?.dependencies?.filter((dep: any) => dep.status !== 'done') || [];
                                    const isBlockedByDependency = uncompletedDeps.length > 0;

                                    return (
                                        <div key={approval.id} className="bg-white border border-slate-255/70 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4">
                                        
                                        {/* Header */}
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                            <div className="flex flex-wrap items-center gap-2.5">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100/50">
                                                    <Folder className="w-3.5 h-3.5" />
                                                    {approval.task?.project?.name || 'Project'}
                                                </span>
                                                <span className="text-xs text-slate-400 font-semibold">#Task {approval.task_id}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {approval.task?.priority && (
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeClass(approval.task.priority)}`}>
                                                        {approval.task.priority}
                                                    </span>
                                                )}
                                                <span className="px-2.5 py-1 bg-yellow-55 border border-yellow-200 text-yellow-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                    In Review
                                                </span>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="space-y-3">
                                            <h3 className="text-base font-bold text-slate-800 leading-snug">{approval.task?.title}</h3>
                                            {approval.task?.description && (
                                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                                    {approval.task.description}
                                                </p>
                                            )}
                                            
                                            {approval.note && (
                                                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-650 flex items-start gap-2.5 leading-relaxed">
                                                    <MessageSquare className="w-4 h-4 text-slate-450 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold text-slate-700 block mb-0.5">Catatan Member:</span>
                                                        <span className="italic">"{approval.note}"</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-1.5 text-xs text-slate-450 font-medium">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>Deadline: <span className="font-semibold text-slate-600">{formatDeadline(approval.task?.deadline)}</span></span>
                                            </div>

                                            {/* Dependency Warning Block */}
                                            {isBlockedByDependency && (
                                                <div className="p-3.5 bg-rose-50 border border-rose-150 rounded-xl text-xs text-rose-700 flex items-start gap-2.5">
                                                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold text-rose-800 block mb-0.5">⚠️ Diblokir oleh Dependency:</span>
                                                        <span>Tugas ini membutuhkan penyelesaian tugas-tugas berikut terlebih dahulu:</span>
                                                        <ul className="list-disc list-inside mt-1 font-semibold">
                                                            {uncompletedDeps.map((dep: any) => (
                                                                <li key={dep.id}>{dep.title} (Status: {dep.status.replace('_', ' ')})</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Lampiran & Hasil Kerja */}
                                            <div className="space-y-2 pt-1">
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">📎 Lampiran & Hasil Kerja (Task Deliverables)</span>
                                                {approval.task?.attachments && approval.task.attachments.length > 0 ? (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {approval.task.attachments.map((file: any) => (
                                                            <div key={file.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-slate-350 transition">
                                                                <div className="flex items-center gap-2 overflow-hidden mr-2">
                                                                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                                                    <div className="truncate">
                                                                        <p className="text-xs font-semibold text-slate-700 truncate" title={file.file_name}>
                                                                            {file.file_name}
                                                                        </p>
                                                                        <p className="text-[10px] text-slate-400">
                                                                            {(file.file_size / 1024).toFixed(1)} KB
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <a
                                                                    href={route('attachments.download', file.id)}
                                                                    className="p-1.5 text-indigo-650 hover:bg-indigo-50 rounded-lg transition shrink-0"
                                                                    title="Unduh File"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic">Tidak ada file lampiran.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-2">
                                            {/* Submitter Info */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                                                    {approval.requested_by?.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700 leading-none">{approval.requested_by?.name || 'Unknown User'}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">Diajukan {formatTimeAgo(approval.created_at)}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPreviewTask(approval.task)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition"
                                                    title="Preview Task"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    Preview Task
                                                </button>
                                                {canApprove && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedApproval(approval);
                                                                setRevisionFeedback('');
                                                            }}
                                                            className="inline-flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                                                        >
                                                            <AlertTriangle className="w-3.5 h-3.5" />
                                                            Request Revision
                                                        </button>
                                                        {isBlockedByDependency ? (
                                                            <button
                                                                disabled
                                                                className="inline-flex items-center gap-1 px-3.5 py-2 bg-slate-200 border border-slate-300 text-slate-450 font-bold text-xs rounded-xl cursor-not-allowed shadow-sm transition"
                                                                title="Selesaikan task dependency terlebih dahulu"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                                Approve Task
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleApprove(approval.task_id)}
                                                                className="inline-flex items-center gap-1 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                                Approve Task
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {historyApprovals.length === 0 ? (
                            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-700">No history yet</p>
                                <p className="text-sm text-slate-500 mt-1">Completed task approvals will show up here.</p>
                            </div>
                        ) : (
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 text-left">
                                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <tr>
                                                <th className="px-6 py-3.5">Task Info</th>
                                                <th className="px-6 py-3.5">Submitter</th>
                                                <th className="px-6 py-3.5">Reviewer</th>
                                                <th className="px-6 py-3.5">Status</th>
                                                <th className="px-6 py-3.5">Notes & Feedback</th>
                                                <th className="px-6 py-3.5">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                                            {historyApprovals.map((approval) => (
                                                <tr key={approval.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-800">{approval.task?.title}</div>
                                                        <div className="text-[10px] text-slate-400 mt-0.5">{approval.task?.project?.name || 'Project'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">{approval.requested_by?.name || 'Unknown'}</td>
                                                    <td className="px-6 py-4 font-medium">{approval.reviewed_by?.name || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                            approval.status === 'Approved'
                                                                ? 'bg-emerald-55 text-emerald-800'
                                                                : 'bg-amber-50 text-amber-800'
                                                        }`}>
                                                            {approval.status === 'Approved' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertCircle className="w-3 h-3 text-amber-600" />}
                                                            {approval.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs truncate">
                                                        {approval.note && <div className="text-[11px] text-slate-500">Note: "{approval.note}"</div>}
                                                        {approval.feedback && <div className="text-[11px] text-amber-700 font-medium mt-0.5">Feedback: "{approval.feedback}"</div>}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-400">{new Date(approval.updated_at).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Revision Request Modal */}
            {selectedApproval && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">⚠️ Request Revision</h3>
                        <form onSubmit={handleRevisionSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Revision Feedback (Required)</label>
                                <textarea
                                    className="w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-2 h-24"
                                    value={revisionFeedback}
                                    onChange={(e) => setRevisionFeedback(e.target.value)}
                                    placeholder="Explain what needs to be changed..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedApproval(null)}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition"
                                >
                                    Request Revision
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Task Modal */}
            {previewTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 max-w-lg w-full mx-4 flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                            <div>
                                <span className="text-xs font-bold text-slate-400">#Task {previewTask.id}</span>
                                <h3 className="text-lg font-bold text-slate-800 leading-snug">{previewTask.title}</h3>
                            </div>
                            <button 
                                onClick={() => setPreviewTask(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm text-slate-600">
                            <div>
                                <span className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Description</span>
                                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl whitespace-pre-wrap leading-relaxed text-sm">
                                    {previewTask.description || <span className="italic text-slate-400">No description provided.</span>}
                                </div>
                            </div>
                            {previewTask.attachments && previewTask.attachments.length > 0 && (
                                <div>
                                    <span className="block text-xs font-bold text-slate-400 uppercase mb-2">Attachments ({previewTask.attachments.length})</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {previewTask.attachments.map((file: any) => (
                                            <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl">
                                                <span className="text-xs font-semibold text-slate-700 truncate mr-2">{file.file_name}</span>
                                                <a 
                                                    href={route('attachments.download', file.id)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
                            <button
                                onClick={() => setPreviewTask(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
