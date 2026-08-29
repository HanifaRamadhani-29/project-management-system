import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps, Project } from '@/types';

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

const formatDeadline = (value: string | null) => {
    if (!value) return 'No deadline';
    return value;
};

export default function Index({ projects }: PageProps<{ projects: Project[] }>) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Projects
                        </h2>
                    </div>
                    <Link
                        href={route('projects.create')}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                    >
                        + Create Project
                    </Link>
                </div>
            }
        >
            <Head title="Projects" />

            <div className="space-y-6">
                {projects.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-lg font-semibold text-slate-700">No projects yet</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Start by creating your first project.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={route('projects.show', project.slug)}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-200"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-indigo-600">
                                            {project.name}
                                        </h3>
                                    </div>
                                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusClass(project.status)}`}>
                                        {project.status}
                                    </span>
                                </div>

                                <p className="mt-4 line-clamp-3 min-h-[48px] text-sm leading-6 text-slate-600">
                                    {project.description || 'No description provided.'}
                                </p>

                                <div className="mt-5 border-t border-slate-100 pt-4">
                                    <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span className="font-medium">Deadline</span>
                                        <span className="font-semibold text-slate-700">
                                            {formatDeadline(project.deadline)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
