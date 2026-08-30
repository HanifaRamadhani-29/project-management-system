import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
<<<<<<< HEAD
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import Pagination from '@/Components/Pagination';

interface Props {
    projects?: {
        data?: any[];
        links?: any[];
        meta?: any;
    } | any[];
    filters?: {
        search?: string;
        status?: string;
    };
    users?: any[];
}
=======
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Project } from '@/types/project';
import { Search, Filter } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import Pagination from '@/Components/Pagination';

type PaginatedProjects = {
    data: Project[];
    links: any[];
    current_page: number;
    last_page: number;
    total: number;
};
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b

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
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

<<<<<<< HEAD
export default function Index({ projects, filters, users = [] }: Props) {
    const { auth } = usePage().props as any;
    const can = (permission: string) => auth.user?.role === 'super_admin' || auth.user?.permissions?.includes(permission);
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');

    // Normalize projects to always extract an array and links
    const projectList = Array.isArray(projects) ? projects : projects?.data || [];
    const paginationLinks = !Array.isArray(projects) ? projects?.links || [] : [];

=======
export default function Index({ projects, filters }: PageProps<{ projects: PaginatedProjects, filters: { search?: string, status?: string } }>) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');

>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                handleFilterChange(search, status);
            }
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleFilterChange = (newSearch: string, newStatus: string) => {
        router.get(
            route('projects.index'),
            { search: newSearch, status: newStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        handleFilterChange(search, newStatus);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Projects
                        </h2>
                    </div>
<<<<<<< HEAD
                    {can('projects.create') && (
                        <Link
                            href={route('projects.create')}
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                        >
                            + Create Project
                        </Link>
                    )}
=======
                    <Link
                        href={route('projects.create')}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                    >
                        + Create Project
                    </Link>
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
                </div>
            }
        >
            <Head title="Projects" />

            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-white border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 shadow-sm"
                        placeholder="Search projects by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Filter className="w-4 h-4 text-slate-400" />
                    </div>
                    <select
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 p-2.5 shadow-sm appearance-none pr-8"
                        value={status}
                        onChange={handleStatusChange}
                    >
                        <option value="">All Statuses</option>
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="space-y-6">
<<<<<<< HEAD
                {projectList.length === 0 ? (
=======
                {projects.data.length === 0 ? (
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-lg font-semibold text-slate-700">No projects yet</p>
                        <p className="mt-2 text-sm text-slate-500">
                            Start by creating your first project.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
<<<<<<< HEAD
                            {projectList.map((project) => (
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
                        
                        {paginationLinks.length > 0 && <Pagination links={paginationLinks} />}
=======
                            {projects.data.map((project) => (
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
                        
                        <Pagination links={projects.links} />
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
