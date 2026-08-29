import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { 
    Folder, 
    AlertTriangle, 
    CheckSquare, 
    Clock, 
    BarChart3, 
    Layers, 
    Users,
    ChevronRight,
    LayoutDashboard
} from "lucide-react";

interface Stats {
    total_projects?: string | number;
    active_projects?: string | number;
    overdue_projects?: string | number;
    total_tasks?: string | number;
    completed_tasks?: string | number;
    overdue_tasks?: string | number;
    completion_rate?: number;
}

interface MemberWorkload {
    name: string;
    task_count?: number;
    active_tasks_count?: number;
}

interface Project {
    id: number;
    name: string;
    slug: string;
    status: string;
    description?: string;
    deadline?: string;
    manager?: {
        name: string;
    } | null;
    progress?: number;
}

interface AdminDashboardProps {
    stats?: Stats;
    task_distribution?: Record<string, number>;
    tasks_by_status?: Record<string, number>;
    member_workloads?: MemberWorkload[];
    team_workloads?: MemberWorkload[];
    recent_projects?: Project[];
}

export default function AdminDashboard({
    stats,
    task_distribution,
    tasks_by_status,
    member_workloads,
    team_workloads,
    recent_projects
}: AdminDashboardProps) {
    
    // Fallback handlers to prevent blank screen crashes
    const safeStats: Stats = stats || {};
    const safeDistribution = task_distribution || tasks_by_status || {};
    const safeWorkloads = member_workloads || team_workloads || [];
    const safeRecentProjects = recent_projects || [];

    const getStatusClass = (status: string) => {
        const cleanStatus = (status || '').toLowerCase();
        switch (cleanStatus) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            case 'active':
                return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
            case 'on_hold':
                return 'bg-amber-50 text-amber-600 border border-amber-100';
            case 'cancelled':
                return 'bg-rose-50 text-rose-600 border border-rose-100';
            default:
                return 'bg-slate-100 text-slate-600 border border-slate-200';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 tracking-tight flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    Super Admin Console
                </h2>
            }
        >
            <Head title="Super Admin Dashboard" />

            <div className="space-y-8 font-sans text-slate-800">
                {/* 1. Dashboard Welcome & Overview */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            System-Wide Analytics
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            Real-time aggregates and resource allocation metrics.
                        </p>
                    </div>
                    <span className="px-3.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full w-max">
                        Admin Mode
                    </span>
                </div>

                {/* 2. Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Projects */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                                Total Projects
                            </span>
                            <span className="text-3xl font-black text-slate-900 block">
                                {safeStats.total_projects ?? "0"}
                            </span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-indigo-600">
                            <Folder className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Active Projects */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                                Active Projects
                            </span>
                            <span className="text-3xl font-black text-indigo-650 block">
                                {safeStats.active_projects ?? "0"}
                            </span>
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-indigo-600">
                            <Folder className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Overdue Projects */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                                Overdue Projects
                            </span>
                            <span className="text-3xl font-black text-rose-600 block">
                                {safeStats.overdue_projects ?? "0"}
                            </span>
                        </div>
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                    </div>

                    {/* Completion Rate */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                                Task Completion Rate
                            </span>
                            <span className="text-lg font-black text-indigo-650">
                                {safeStats.completion_rate ?? 0}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                            <div 
                                className="bg-gradient-to-r from-indigo-500 to-cyan-500 h-2.5 rounded-full" 
                                style={{ width: `${safeStats.completion_rate ?? 0}%` }} 
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Task Metric Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Total Tasks */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-500">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tasks</span>
                            <span className="text-xl font-extrabold text-slate-800">{safeStats.total_tasks ?? "0"}</span>
                        </div>
                    </div>

                    {/* Completed Tasks */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Tasks</span>
                            <span className="text-xl font-extrabold text-emerald-650">{safeStats.completed_tasks ?? "0"}</span>
                        </div>
                    </div>

                    {/* Overdue Tasks */}
                    <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Tasks</span>
                            <span className="text-xl font-extrabold text-rose-600">{safeStats.overdue_tasks ?? "0"}</span>
                        </div>
                    </div>
                </div>

                {/* 4. Details Section: Workload & Task Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Task Status Distribution */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3.5 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                            Task Status Distribution
                        </h3>
                        <div className="space-y-4">
                            {Object.entries(safeDistribution).map(([status, count]) => {
                                const total = Number(safeStats.total_tasks) || 0;
                                const percentage = total > 0 
                                    ? Math.round((Number(count) / total) * 100) 
                                    : 0;
                                return (
                                    <div key={status} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="capitalize text-slate-600">{status.replace('_', ' ')}</span>
                                            <span className="text-slate-500">{count} tasks ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                                            <div 
                                                className="bg-indigo-500 h-2 rounded-full" 
                                                style={{ width: `${percentage}%` }} 
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(safeDistribution).length === 0 && (
                                <div className="text-xs text-slate-450 italic py-6 text-center">
                                    No task distribution data available.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Member Workloads */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3.5 mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-cyan-600" />
                            Active Member Workload
                        </h3>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                            {safeWorkloads.length > 0 ? (
                                safeWorkloads.map((member, index) => {
                                    const taskCount = member.task_count ?? member.active_tasks_count ?? 0;
                                    return (
                                        <div key={member.name || index} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                            <span className="text-xs font-bold text-slate-700">{member.name}</span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                                taskCount > 5 
                                                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                            }`}>
                                                {taskCount} active tasks
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-12 text-center">
                                    No active members found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. Recent Projects Table */}
                <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3.5 mb-4">
                        Recent Projects
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium text-slate-650">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-150 text-[10px] uppercase font-bold tracking-wider">
                                    <th className="pb-3">Name</th>
                                    <th className="pb-3">Manager</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {safeRecentProjects.length > 0 ? (
                                    safeRecentProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-50/50 transition group">
                                            <td className="py-3.5 font-bold text-slate-850">{project.name}</td>
                                            <td className="py-3.5 text-slate-500">{project.manager?.name || 'Unassigned'}</td>
                                            <td className="py-3.5">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold capitalize ${getStatusClass(project.status)}`}>
                                                    {project.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3.5 text-right">
                                                <Link 
                                                    href={route('projects.show', project.slug)}
                                                    className="inline-flex items-center gap-1 text-indigo-650 hover:text-indigo-500 font-bold transition text-[10px]"
                                                >
                                                    View Details
                                                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-slate-450">
                                            No projects available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
