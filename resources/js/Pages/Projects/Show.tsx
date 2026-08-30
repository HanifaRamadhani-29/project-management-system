import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Project } from '@/types/project';
import DangerButton from '@/Components/DangerButton';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, FileText, Pencil, Trash2, Users } from 'lucide-react';

const getStatusClass = (status: string) => {
    const normalized = status?.toLowerCase();

    switch (normalized) {
        case 'active':
            return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        case 'planning':
            return 'bg-sky-100 text-sky-700 border border-sky-200';
        case 'on hold':
        case 'on_hold':
            return 'bg-amber-100 text-amber-700 border border-amber-200';
        case 'completed':
            return 'bg-violet-100 text-violet-700 border border-violet-200';
        case 'cancelled':
            return 'bg-rose-100 text-rose-700 border border-rose-200';
        default:
            return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
};

const formatDate = (value: string | null) => {
    if (!value) return 'Not set';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

export default function Show({ project, users = [], taskCounts = { todo: 0, in_progress: 0, done: 0 } }: PageProps<{ project: Project; users?: { id: number; name: string; email?: string }[]; taskCounts?: { todo: number; in_progress: number; done: number } }>) {
    const { delete: destroy } = useForm();
    const { data, setData, post, processing, reset } = useForm({
        user_id: '',
        role: 'member',
    });
    
    const members = project.members ?? [];
    const managerName = project.manager?.name ?? 'Unassigned';
    const progress = Math.max(0, Math.min(100, Number(project.progress ?? 0)));
    const isOverdue = Boolean(project.is_overdue);

    // Filter users who are not yet added to the project members
    const nonMembers = users.filter(user => !members.some(member => member.id === user.id));

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this project?')) {
            destroy(route('projects.destroy', project.slug));
        }
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.user_id) return;
        post(route('projects.members.add', project.slug), {
            onSuccess: () => reset(),
        });
    };

    const handleRemoveMember = (memberId: number) => {
        if (confirm('Are you sure you want to remove this member?')) {
            router.delete(route('projects.members.remove', [project.slug, memberId]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('projects.index')}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            {project.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route('projects.kanban', project.slug)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                        >
                            📋 Buka Kanban Board
                        </Link>
                        <Link
                            href={route('projects.edit', project.slug)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            <Pencil className="h-4 w-4" />
                            Edit
                        </Link>
                        <DangerButton onClick={handleDelete} className="inline-flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </DangerButton>
                    </div>
                </div>
            }
        >
            <Head title={project.name} />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Project Overview
                                </p>
                                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                                    {project.name}
                                </h1>
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusClass(project.status)}`}
                                >
                                    {project.status}
                                </span>
                                {isOverdue && (
                                    <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                        Overdue
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <BriefcaseBusiness className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                                    Project
                                </span>
                            </div>
                            <p className="mt-3 text-lg font-bold text-slate-900">{project.name}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <CalendarDays className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                                    Start Date
                                </span>
                            </div>
                            <p className="mt-3 text-lg font-bold text-slate-900">
                                {formatDate(project.start_date)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <CalendarDays className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                                    Deadline
                                </span>
                            </div>
                            <p className="mt-3 text-lg font-bold text-slate-900">
                                {formatDate(project.deadline)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Users className="h-4 w-4" />
                                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                                    Members
                                </span>
                            </div>
                            <p className="mt-3 text-lg font-bold text-slate-900">{members.length}</p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600">
                                <FileText className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Project Details</h3>
                        </div>

                        <p className="mt-5 text-base leading-7 text-slate-600">
                            {project.description || 'No description provided for this project yet.'}
                        </p>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    Project Manager
                                </p>
                                <p className="mt-3 text-base font-semibold text-slate-900">
                                    {managerName}
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    Progress
                                </p>
                                <p className="mt-3 text-base font-semibold text-slate-900">
                                    {progress}%
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                                <span>Completion</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </section>

                    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
                                <Users className="h-5 w-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Team Members</h3>
                        </div>

                        <form onSubmit={handleAddMember} className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div>
                                <label htmlFor="user_id" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    User
                                </label>
                                <select
                                    id="user_id"
                                    value={data.user_id}
                                    onChange={(e) => setData('user_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="">Select a user</option>
                                    {nonMembers.map((user) => (
                                        <option key={user.id} value={String(user.id)}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="role" className="mb-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                                >
                                    <option value="project_manager">Project Manager</option>
                                    <option value="member">Member</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'Adding...' : 'Add Member'}
                            </button>
                        </form>

                        <div className="mt-5 space-y-3">
                            {members.length > 0 ? (
                                members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                                {member.name?.charAt(0)?.toUpperCase() ?? '?'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{member.name}</p>
                                                <p className="text-xs text-slate-500">{member.email ?? 'No email available'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                                                (member as any).pivot?.role === 'super_admin' || (member as any).pivot?.role === 'Super Admin'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : (member as any).pivot?.role === 'project_manager' || (member as any).pivot?.role === 'Project Manager' 
                                                        ? 'bg-indigo-100 text-indigo-700' 
                                                        : (member as any).pivot?.role === 'viewer' || (member as any).pivot?.role === 'Viewer' 
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                                {(member as any).pivot?.role || 'Member'}
                                            </span>
                                            {member.id !== project.manager_id && (
                                                <button
                                                    onClick={() => handleRemoveMember(member.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                                    <p className="text-sm text-slate-500">No members assigned yet.</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-violet-100 p-2 text-violet-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Task Overview</h3>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                To Do
                            </p>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{taskCounts.todo}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                In Progress
                            </p>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{taskCounts.in_progress}</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                                Done
                            </p>
                            <p className="mt-3 text-2xl font-bold text-slate-900">{taskCounts.done}</p>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <p className="text-base font-medium text-slate-700">
                            Ready to manage tasks?
                        </p>
                        <p className="mt-2 text-sm text-slate-500 mb-6">
                            Go to the Kanban board to create, reorder, and manage project tasks.
                        </p>
                        <Link
                            href={route('projects.kanban', project.slug)}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                        >
                            Open Kanban Board
                        </Link>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
