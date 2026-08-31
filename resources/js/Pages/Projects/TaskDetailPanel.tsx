import { Task } from '@/types/kanban';
import { useForm, usePage, router } from '@inertiajs/react';
import { X, MessageSquare, Paperclip, Clock, AlertCircle, File, Download, Trash2, Send, Tag, CheckSquare, Link as LinkIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TaskDetailPanelProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    projectSlug: string;
    allLabels?: any[];
    allProjectTasks?: any[];
    users?: any[];
}

export default function TaskDetailPanel({ task, isOpen, onClose, projectSlug, allLabels = [], allProjectTasks = [], users = [] }: TaskDetailPanelProps) {
    const { auth } = usePage().props as any;
    const currentUser = auth.user;
    const hasPermission = (perm: string) => 
        currentUser?.role === 'super_admin' || currentUser?.permissions?.includes(perm);
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Mentions state
    const [isMentioning, setIsMentioning] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');

    // Comment Form
    const {
        data: commentData,
        setData: setCommentData,
        post: postComment,
        reset: resetComment,
        processing: processingComment
    } = useForm({ content: '' });

    // Attachment Form
    const {
        data: attachmentData,
        setData: setAttachmentData,
        post: postAttachment,
        reset: resetAttachment,
        processing: processingAttachment
    } = useForm({ file: null as File | null });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => {
                commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        postComment(route('tasks.comments.store', task.id), {
            preserveScroll: true,
            onSuccess: () => {
                resetComment();
                setIsMentioning(false);
                setTimeout(() => {
                    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        });
    };

    const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCommentData('content', value);

        const cursorPosition = e.target.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
        
        if (match) {
            setIsMentioning(true);
            setMentionQuery(match[1]);
        } else {
            setIsMentioning(false);
        }
    };

    const insertMention = (username: string) => {
        const currentText = commentData.content;
        const cursorPosition = inputRef.current?.selectionStart || 0;
        const textBeforeCursor = currentText.substring(0, cursorPosition);
        const textAfterCursor = currentText.substring(cursorPosition);
        
        const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
        if (match) {
            const prefixIndex = match.index! + match[0].lastIndexOf('@');
            const prefix = textBeforeCursor.substring(0, prefixIndex);
            const newText = prefix + `@${username} ` + textAfterCursor;
            setCommentData('content', newText);
        }
        setIsMentioning(false);
        setTimeout(() => inputRef.current?.focus(), 10);
    };

    const renderComment = (content: string) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded-sm">{part}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachmentData('file', e.target.files[0]);
            // Submit immediately when file is selected
            setTimeout(() => {
                const form = document.getElementById('attachment-form') as HTMLFormElement;
                if(form) form.requestSubmit();
            }, 100);
        }
    };

    const submitAttachment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        postAttachment(route('tasks.attachments.store', task.id), {
            preserveScroll: true,
            onSuccess: () => resetAttachment()
        });
    };

    const handleDeleteAttachment = (attachmentId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus file ini?')) {
            router.delete(route('attachments.destroy', attachmentId), {
                preserveScroll: true,
            });
        }
    };

    // Approval Workflow state & handlers
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [submitNote, setSubmitNote] = useState('');
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [revisionFeedback, setRevisionFeedback] = useState('');

    const canApprove = currentUser?.role === 'super_admin' || 
                        auth.roles?.includes('Super Admin') || 
                        auth.permissions?.includes('tasks.approve');

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        router.post(route('tasks.submit-review', task.id), {
            note: submitNote
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowSubmitModal(false);
                setSubmitNote('');
            }
        });
    };

    const handleApprove = () => {
        if (!task) return;
        if (confirm('Apakah Anda yakin ingin menyetujui tugas ini?')) {
            router.post(route('tasks.approve', task.id), {}, {
                preserveScroll: true
            });
        }
    };

    const handleRevision = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task) return;
        if (!revisionFeedback.trim()) {
            alert('Catatan revisi wajib diisi!');
            return;
        }
        router.post(route('tasks.revision', task.id), {
            feedback: revisionFeedback
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRevisionModal(false);
                setRevisionFeedback('');
            }
        });
    };

    const handleDeleteTask = () => {
        if (!task) return;
        if (confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
            router.delete(route('tasks.destroy', [projectSlug, task.id]), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    const formatPriority = (priority: string) => {
        switch (priority) {
            case 'critical': return <span className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-xs font-bold uppercase">Critical</span>;
            case 'high': return <span className="px-2 py-1 rounded bg-amber-100 text-amber-700 text-xs font-bold uppercase">High</span>;
            case 'medium': return <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-bold uppercase">Medium</span>;
            default: return <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold uppercase">Low</span>;
        }
    };

    const formatStatus = (status: string) => {
        return <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase">{status.replace('_', ' ')}</span>;
    };

    // Safe access to relations, defaulting to empty arrays if not present
    const comments = task?.comments || [];
    const attachments = task?.attachments || [];
    const subtasks = task?.subtasks || [];
    const dependencies = task?.dependencies || [];
    const labels = task?.labels || [];
    const approvals = task?.approvals || [];

    // Local State for forms
    const [subtaskTitle, setSubtaskTitle] = useState('');
    const [depId, setDepId] = useState('');
    const [isEditingLabels, setIsEditingLabels] = useState(false);
    const [selectedLabels, setSelectedLabels] = useState<number[]>([]);

    useEffect(() => {
        if (task) {
            setSelectedLabels(task.labels?.map((l: any) => l.id) || []);
            setIsEditingLabels(false);
            setSubtaskTitle('');
            setDepId('');
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSubtaskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subtaskTitle.trim()) return;
        router.post(route('tasks.subtasks.store', [projectSlug, task.id]), {
            title: subtaskTitle,
            status: 'todo',
            priority: 'low'
        }, { preserveScroll: true, onSuccess: () => setSubtaskTitle('') });
    };

    const toggleSubtask = (subtaskId: number, currentStatus: string) => {
        router.put(route('tasks.update', [projectSlug, subtaskId]), {
            status: currentStatus === 'done' ? 'todo' : 'done'
        }, { preserveScroll: true });
    };

    const handleDepSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!depId) return;
        router.post(route('tasks.dependencies.store', task.id), {
            depends_on_task_id: depId
        }, { preserveScroll: true, onSuccess: () => setDepId('') });
    };

    const removeDependency = (depTaskId: number) => {
        router.delete(route('tasks.dependencies.destroy', [task.id, depTaskId]), { preserveScroll: true });
    };

    const saveLabels = () => {
        router.post(route('tasks.labels.sync', task.id), {
            label_ids: selectedLabels
        }, { preserveScroll: true, onSuccess: () => setIsEditingLabels(false) });
    };

    const toggleLabelSelection = (labelId: number) => {
        setSelectedLabels(prev => 
            prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="w-full max-w-md md:max-w-xl h-full bg-slate-50 shadow-2xl flex flex-col transform transition-transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400">#{task.id}</span>
                        {formatStatus(task.status)}
                        {hasPermission('tasks.delete') && (
                            <button
                                onClick={handleDeleteTask}
                                className="p-1 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Task"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-8">
                        
                        {/* Approval Action Banner */}
                        {task.status === 'in_progress' && (
                            <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-indigo-900">Task In Progress</h4>
                                    <p className="text-xs text-indigo-700">Submit this task for project manager review once finished.</p>
                                </div>
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                                >
                                    🚀 Submit for Review
                                </button>
                            </div>
                        )}

                        {task.status === 'review' && (
                            <div className="p-4 bg-amber-50 border border-amber-150 rounded-xl">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-900">Under Review</h4>
                                        <p className="text-xs text-amber-700">This task is pending approval from a Project Manager or Super Admin.</p>
                                    </div>
                                    {canApprove && (
                                        <div className="flex gap-2 shrink-0">
                                            <button
                                                onClick={handleApprove}
                                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                                            >
                                                ✅ Approve Task
                                            </button>
                                            <button
                                                onClick={() => setShowRevisionModal(true)}
                                                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                                            >
                                                ⚠️ Request Revision
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Title & Description */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-800">{task.title}</h2>
                            <div className="p-4 bg-white rounded-xl border border-slate-200 text-slate-600 text-sm whitespace-pre-wrap">
                                {task.description || <span className="italic text-slate-400">No description provided.</span>}
                            </div>
                        </div>

                        {/* Properties */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Priority</span>
                                {formatPriority(task.priority)}
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Deadline</span>
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                </div>
                            </div>
                        </div>

                        {/* Labels Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-slate-500" />
                                Labels
                            </h3>
                            {isEditingLabels ? (
                                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                                    <div className="flex flex-wrap gap-2">
                                        {allLabels.map((l: any) => (
                                            <button
                                                key={l.id}
                                                onClick={() => toggleLabelSelection(l.id)}
                                                className={`px-3 py-1 text-xs font-bold rounded-full border transition ${selectedLabels.includes(l.id) ? 'border-indigo-500 shadow-sm' : 'border-slate-200 opacity-60 hover:opacity-100'}`}
                                                style={{ backgroundColor: selectedLabels.includes(l.id) ? l.color : '#fff', color: selectedLabels.includes(l.id) ? '#fff' : l.color }}
                                            >
                                                {l.name}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button onClick={() => setIsEditingLabels(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
                                        <button onClick={saveLabels} className="px-3 py-1 text-xs font-bold bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-wrap items-center gap-2">
                                    {labels.length > 0 ? labels.map((l: any) => (
                                        <span key={l.id} className="px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: l.color }}>
                                            {l.name}
                                        </span>
                                    )) : <span className="text-xs text-slate-400 italic">No labels</span>}
                                    <button onClick={() => setIsEditingLabels(true)} className="w-6 h-6 rounded-full border border-dashed border-slate-300 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-600 transition" title="Edit Labels">+</button>
                                </div>
                            )}
                        </div>

                        {/* Subtasks Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 text-slate-500" />
                                Subtasks
                            </h3>
                            <div className="space-y-2">
                                {subtasks.map((st: any) => (
                                    <div key={st.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
                                        <input 
                                            type="checkbox" 
                                            checked={st.status === 'done'}
                                            onChange={() => toggleSubtask(st.id, st.status)}
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                                        />
                                        <span className={`text-sm font-medium ${st.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                            {st.title}
                                        </span>
                                    </div>
                                ))}
                                <form onSubmit={handleSubtaskSubmit} className="flex gap-2 mt-2">
                                    <input 
                                        type="text" 
                                        value={subtaskTitle} 
                                        onChange={e => setSubtaskTitle(e.target.value)} 
                                        placeholder="Add new subtask..." 
                                        className="flex-1 text-sm border-slate-200 rounded-xl px-3 py-2 focus:ring-indigo-500"
                                    />
                                    <button type="submit" disabled={!subtaskTitle.trim()} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition disabled:opacity-50">Add</button>
                                </form>
                            </div>
                        </div>

                        {/* Dependencies Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-slate-500" />
                                Dependencies (Blocked By)
                            </h3>
                            <div className="space-y-2">
                                {dependencies.map((dep: any) => (
                                    <div key={dep.id} className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-rose-500" />
                                            <span className="text-sm font-medium text-slate-700">#{dep.id} {dep.title}</span>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-rose-200 text-rose-600 uppercase">{dep.status.replace('_', ' ')}</span>
                                        </div>
                                        <button onClick={() => removeDependency(dep.id)} className="text-slate-400 hover:text-rose-600 transition p-1">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <form onSubmit={handleDepSubmit} className="flex gap-2 mt-2">
                                    <select 
                                        value={depId} 
                                        onChange={e => setDepId(e.target.value)}
                                        className="flex-1 text-sm border-slate-200 rounded-xl px-3 py-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select task to depend on...</option>
                                        {allProjectTasks.filter(t => t.id !== task.id && !dependencies.find((d: any) => d.id === t.id)).map((t: any) => (
                                            <option key={t.id} value={t.id}>#{t.id} - {t.title}</option>
                                        ))}
                                    </select>
                                    <button type="submit" disabled={!depId} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition disabled:opacity-50">Add</button>
                                </form>
                            </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Paperclip className="w-4 h-4 text-slate-500" />
                                    Attachments
                                </h3>
                                {hasPermission('files.upload') && (
                                    <form id="attachment-form" onSubmit={submitAttachment}>
                                        <label className="cursor-pointer text-xs font-bold text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition">
                                            + Add File
                                            <input type="file" className="hidden" onChange={handleFileUpload} />
                                        </label>
                                    </form>
                                )}
                            </div>
                            
                            {attachments.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                    {attachments.map((file: any) => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                                    <File className="w-4 h-4" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-semibold text-slate-700 truncate">{file.file_name}</p>
                                                    <p className="text-xs text-slate-400">{(file.file_size / 1024).toFixed(2)} KB</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <a href={route('attachments.download', file.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteAttachment(file.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Hapus Attachment"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 italic">No attachments yet.</p>
                            )}
                        </div>

                        {/* Approval History Section */}
                        {approvals.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    Approval History
                                </h3>
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {approvals.map((approval: any, index: number) => (
                                            <li key={approval.id}>
                                                <div className="relative pb-8">
                                                    {index !== approvals.length - 1 && (
                                                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                                                    )}
                                                    <div className="relative flex space-x-3">
                                                        <div>
                                                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-slate-50 ${
                                                                approval.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                                                approval.status === 'Revision Required' ? 'bg-amber-100 text-amber-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {approval.status === 'Approved' ? '✓' : approval.status === 'Revision Required' ? '⚠' : '?' }
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-xs text-slate-600">
                                                                    Status: <span className="font-bold">{approval.status}</span>
                                                                </p>
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    Submitted by <span className="font-semibold text-slate-700">{approval.requested_by?.name || 'Unknown User'}</span>
                                                                    {approval.note && <span>: "{approval.note}"</span>}
                                                                </p>
                                                                {approval.reviewed_by && (
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        Reviewed by <span className="font-semibold text-slate-700">{approval.reviewed_by?.name || 'Unknown PM'}</span>
                                                                        {approval.feedback && <span className="text-amber-700 block mt-0.5 font-medium">Feedback: "{approval.feedback}"</span>}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right text-[10px] whitespace-nowrap text-slate-400">
                                                                <time dateTime={approval.created_at}>{new Date(approval.created_at).toLocaleDateString()}</time>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                        {/* Comments Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <MessageSquare className="w-4 h-4 text-slate-500" />
                                Comments & Activity
                            </h3>
                            
                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                {comments.length > 0 ? (
                                    comments.map((comment: any) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <div className="flex-1 bg-white p-3 border border-slate-200 rounded-2xl rounded-tl-none">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-bold text-slate-700">{comment.user?.name || 'Unknown User'}</span>
                                                    <span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{renderComment(comment.content)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-slate-500 text-center py-4">No comments yet. Start the discussion!</p>
                                )}
                                <div ref={commentsEndRef} />
                            </div>
                        </div>

                    </div>
                </div>

                {/* Comment Input Footer */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleCommentSubmit} className="flex gap-2">
                        <div className="relative flex-1">
                            {isMentioning && (
                                <div className="absolute bottom-full mb-2 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                                    {users.filter((u: any) => u.name.toLowerCase().replace(/\s+/g, '').includes(mentionQuery.toLowerCase())).length > 0 ? (
                                        users.filter((u: any) => u.name.toLowerCase().replace(/\s+/g, '').includes(mentionQuery.toLowerCase())).slice(0, 5).map((u: any) => (
                                            <button
                                                key={u.id}
                                                type="button"
                                                onClick={() => insertMention(u.name.replace(/\s+/g, ''))}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2 border-b border-slate-50 last:border-0"
                                            >
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-slate-700 truncate">{u.name}</span>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-xs text-slate-500 italic">No users found</div>
                                    )}
                                </div>
                            )}
                            <input
                                ref={inputRef}
                                type="text"
                                value={commentData.content}
                                onChange={handleCommentChange}
                                placeholder={hasPermission('comments.create') ? "Write a comment... (Type @ to mention)" : "You do not have permission to post comments"}
                                className="w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-2 disabled:bg-slate-100 disabled:text-slate-400"
                                required
                                disabled={!hasPermission('comments.create')}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={processingComment || !commentData.content.trim() || !hasPermission('comments.create')}
                            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-sm transition"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>

            {/* Submit for Review Modal */}
            {showSubmitModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">🚀 Submit for Review</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Submission Note (Optional)</label>
                                <textarea
                                    className="w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-4 py-2 h-24"
                                    value={submitNote}
                                    onChange={(e) => setSubmitNote(e.target.value)}
                                    placeholder="Add notes about your work..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Request Revision Modal */}
            {showRevisionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 shadow-xl rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">⚠️ Request Revision</h3>
                        <form onSubmit={handleRevision} className="space-y-4">
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
                                    onClick={() => setShowRevisionModal(false)}
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
            </div>
        </div>
    );
}
