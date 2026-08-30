import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    Briefcase,
    Play,
    AlertTriangle,
    CheckSquare,
    TrendingUp,
    Users as UsersIcon,
    ChevronRight,
    Clock,
    UserCheck,
} from "lucide-react";

interface AdminStats {
    total_projects: string;
    active_projects: string;
    overdue_projects: string;
    total_tasks: string;
    completed_tasks: string;
    overdue_tasks: string;
    completion_rate: number;
}

interface TasksByStatus {
    backlog: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
}

interface TeamWorkload {
    id: number;
    name: string;
    email: string;
    active_tasks_count: number;
}

interface RecentProject {
    id: number;
    name: string;
    slug: string;
    status: string;
    deadline: string | null;
    manager: {
        id: number;
        name: string;
    } | null;
    progress: number;
}

interface DashboardProps {
    stats: AdminStats;
    tasks_by_status: TasksByStatus;
    team_workloads: TeamWorkload[];
    recent_projects: RecentProject[];
}

export default function Dashboard({
    stats,
    tasks_by_status,
    team_workloads,
    recent_projects,
}: DashboardProps) {
    const user = usePage().props.auth.user;

    const calculateTaskStatusPercentage = (count: number) => {
        const total = Object.values(tasks_by_status).reduce((a, b) => a + b, 0);
        return total > 0 ? (count / total) * 100 : 0;
    };

    const getProjectStatusBadgeClass = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-50 text-emerald-600 border border-emerald-100";
            case "completed":
                return "bg-blue-50 text-blue-600 border border-blue-100";
            case "on_hold":
                return "bg-amber-50 text-amber-600 border border-amber-100";
            case "planning":
            default:
                return "bg-slate-100 text-slate-600 border border-slate-200";
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Welcome back, {user.name} 👋
                        </h2>
                        <p className="text-sm text-slate-500">
                            Workspace overview and active project matrices.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="space-y-8 mt-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Projects */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Total Projects
                            </span>
                            <div className="text-3xl font-extrabold text-slate-800">
                                {stats.total_projects}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold block">
                                Active:{" "}
                                <span className="text-emerald-500 font-bold">
                                    {stats.active_projects}
                                </span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <Briefcase className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Overdue Projects */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Overdue Projects
                            </span>
                            <div className="text-3xl font-extrabold text-rose-500">
                                {stats.overdue_projects}
                            </div>
                            <span className="text-[11px] text-slate-400 font-semibold block">
                                Requires attention
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Total Tasks */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Total Tasks
                            </span>
                            <div className="text-3xl font-extrabold text-slate-800">
                                {stats.total_tasks}
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold block">
                                Completed:{" "}
                                <span className="text-emerald-500 font-bold">
                                    {stats.completed_tasks}
                                </span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Task Completion Rate */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Completion Rate
                            </span>
                            <div className="text-3xl font-extrabold text-emerald-500">
                                {stats.completion_rate}%
                            </div>
                            <span className="text-[11px] text-slate-500 font-semibold block">
                                Overdue Tasks:{" "}
                                <span className="text-rose-500 font-bold">
                                    {stats.overdue_tasks}
                                </span>
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Progress Section: Task status distribution */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-base text-slate-800 mb-5">
                        Task Status Distribution
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {(Object.keys(tasks_by_status) as Array<
                            keyof typeof tasks_by_status
                        >).map((status) => {
                            const count = tasks_by_status[status];
                            const percentage =
                                calculateTaskStatusPercentage(count);

                            const colors = {
                                backlog: "bg-slate-400 text-slate-500",
                                todo: "bg-blue-500 text-blue-600",
                                in_progress: "bg-amber-500 text-amber-600",
                                review: "bg-purple-500 text-purple-600",
                                done: "bg-emerald-500 text-emerald-600",
                            };

                            const statusNames = {
                                backlog: "Backlog",
                                todo: "To Do",
                                in_progress: "In Progress",
                                review: "Under Review",
                                done: "Done",
                            };

                            return (
                                <div
                                    key={status}
                                    className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400 capitalize">
                                            {statusNames[status]}
                                        </span>
                                        <span className="text-xs font-extrabold text-slate-800">
                                            {count}
                                        </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                colors[status].split(" ")[0]
                                            }`}
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Lower Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Recent Projects Table (3/5 columns) */}
                    <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-base text-slate-800">
                                Recent Projects
                            </h3>
                            <Link
                                href={route("projects.index")}
                                className="text-xs font-bold text-indigo-500 hover:text-indigo-650 flex items-center gap-1 transition"
                            >
                                View All
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase">
                                        <th className="pb-3 pr-4">Project</th>
                                        <th className="pb-3 px-4">Status</th>
                                        <th className="pb-3 px-4">PM</th>
                                        <th className="pb-3 px-4">Deadline</th>
                                        <th className="pb-3 pl-4 text-right">
                                            Completion
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 text-sm font-semibold">
                                    {recent_projects.length > 0 ? (
                                        recent_projects.map((project) => (
                                            <tr
                                                key={project.id}
                                                className="group hover:bg-slate-50/40 transition duration-150"
                                            >
                                                <td className="py-3.5 pr-4">
                                                    <Link
                                                        href={route(
                                                            "projects.kanban",
                                                            project.slug
                                                        )}
                                                        className="font-bold text-slate-800 group-hover:text-indigo-500 transition"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold capitalize ${getProjectStatusBadgeClass(
                                                            project.status
                                                        )}`}
                                                    >
                                                        {project.status.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 font-medium">
                                                    {project.manager?.name || (
                                                        <span className="text-slate-400">
                                                            Unassigned
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-500 font-medium">
                                                    {project.deadline ? (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            {project.deadline}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            N/A
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 pl-4">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                            <div
                                                                className="bg-emerald-500 h-full rounded-full"
                                                                style={{
                                                                    width: `${project.progress}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 shrink-0">
                                                            {project.progress}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="py-6 text-center text-slate-400 font-semibold"
                                            >
                                                No projects found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Team Workloads (2/5 columns) */}
                    <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-base text-slate-800">
                                Team Workloads
                            </h3>
                            <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                                Top 5 Active Members
                            </div>
                        </div>

                        <div className="space-y-4">
                            {team_workloads.length > 0 ? (
                                team_workloads.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition duration-150"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                                                {member.name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="font-bold text-sm text-slate-800 block">
                                                    {member.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold block">
                                                    {member.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 text-indigo-500 rounded-xl shadow-sm">
                                            <UserCheck className="w-3.5 h-3.5" />
                                            <span className="text-xs font-extrabold">
                                                {member.active_tasks_count}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center text-slate-400 font-semibold">
                                    No active workloads.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
