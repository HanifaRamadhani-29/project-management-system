import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { AdminDashboardProps } from "@/types/dashboard";
import { Head, Link } from "@inertiajs/react";
import {
    Briefcase,
    Play,
    AlertTriangle,
    CheckSquare,
    CheckCircle2,
    Clock,
    TrendingUp,
    Users,
    ChevronRight,
    UserCheck,
} from "lucide-react";

export default function AdminDashboard({
    stats,
    tasks_by_status,
    team_workloads,
    recent_projects,
}: AdminDashboardProps) {
    // Helper to render task status progress bar widths
    const calculateTaskStatusPercentage = (count: number) => {
        const total = Object.values(tasks_by_status).reduce((a, b) => a + b, 0);
        return total > 0 ? (count / total) * 100 : 0;
    };

    // Helper for status badge styling in dark theme
    const getProjectStatusBadgeClass = (status: string) => {
        switch (status) {
            case "active":
                return "bg-emerald-950/65 text-emerald-400 border border-emerald-900/60";
            case "completed":
                return "bg-blue-950/65 text-blue-400 border border-blue-900/60";
            case "on_hold":
                return "bg-amber-950/65 text-amber-400 border border-amber-900/60";
            case "planning":
            default:
                return "bg-slate-800 text-slate-300 border border-slate-700";
        }
    };

    return (
        <div className="bg-slate-950 min-h-screen -m-6 md:-m-8 p-6 md:p-8 text-slate-100">
            <AuthenticatedLayout
                header={
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                                Admin Command Center
                            </h2>
                            <p className="text-sm text-slate-400">
                                Enterprise-wide system aggregates & workloads
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-900 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Super Admin Mode
                            </span>
                        </div>
                    </div>
                }
            >
                <Head title="Super Admin Dashboard" />

                <div className="space-y-8 mt-6">
                    {/* Stat Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Projects */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition duration-200">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-sm font-semibold text-slate-400">
                                        Total Projects
                                    </span>
                                    <div className="text-4xl font-extrabold tracking-tight text-white mt-1">
                                        {stats.total_projects}
                                    </div>
                                    <span className="text-xs text-slate-500 font-semibold block">
                                        Active:{" "}
                                        <span className="text-emerald-400">
                                            {stats.active_projects}
                                        </span>
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center shadow-inner">
                                    <Briefcase className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Overdue Projects */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition duration-200">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-sm font-semibold text-slate-400">
                                        Overdue Projects
                                    </span>
                                    <div className="text-4xl font-extrabold tracking-tight text-rose-400 mt-1">
                                        {stats.overdue_projects}
                                    </div>
                                    <span className="text-xs text-slate-500 font-semibold block">
                                        Requires PM review
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-rose-950/35 text-rose-400 border border-rose-900/40 flex items-center justify-center shadow-inner">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Total Tasks */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition duration-200">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-sm font-semibold text-slate-400">
                                        Total Tasks
                                    </span>
                                    <div className="text-4xl font-extrabold tracking-tight text-white mt-1">
                                        {stats.total_tasks}
                                    </div>
                                    <span className="text-xs text-slate-500 font-semibold block">
                                        Completed:{" "}
                                        <span className="text-indigo-400">
                                            {stats.completed_tasks}
                                        </span>
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center shadow-inner">
                                    <CheckSquare className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        {/* Completion Rate */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition duration-200">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <span className="text-sm font-semibold text-slate-400">
                                        Task Completion Rate
                                    </span>
                                    <div className="text-4xl font-extrabold tracking-tight text-emerald-400 mt-1">
                                        {stats.completion_rate}%
                                    </div>
                                    <span className="text-xs text-slate-500 font-semibold block">
                                        Overdue Tasks:{" "}
                                        <span className="text-rose-400">
                                            {stats.overdue_tasks}
                                        </span>
                                    </span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-950/35 text-emerald-400 border border-emerald-900/40 flex items-center justify-center shadow-inner">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Section: Task status distribution */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                        <h3 className="font-bold text-base text-slate-200 mb-6">
                            Global Task Status Distribution
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                            {(Object.keys(tasks_by_status) as Array<
                                keyof typeof tasks_by_status
                            >).map((status) => {
                                const count = tasks_by_status[status];
                                const percentage =
                                    calculateTaskStatusPercentage(count);

                                const colors = {
                                    backlog: "bg-slate-700 text-slate-300",
                                    todo: "bg-blue-600 text-blue-300",
                                    in_progress: "bg-amber-600 text-amber-300",
                                    review: "bg-purple-600 text-purple-300",
                                    done: "bg-emerald-600 text-emerald-300",
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
                                        className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-400 capitalize">
                                                {statusNames[status]}
                                            </span>
                                            <span className="text-xs font-extrabold text-white">
                                                {count}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
                        {/* Recent Projects Table (3/5 columns width) */}
                        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-base text-slate-200">
                                    Recent Enterprise Projects
                                </h3>
                                <Link
                                    href={route("projects.index")}
                                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                                >
                                    Manage All
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                                            <th className="pb-3 pr-4">Project</th>
                                            <th className="pb-3 px-4">Status</th>
                                            <th className="pb-3 px-4">PM</th>
                                            <th className="pb-3 px-4">Deadline</th>
                                            <th className="pb-3 pl-4 text-right">
                                                Completion
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850/60 text-sm">
                                        {recent_projects.length > 0 ? (
                                            recent_projects.map((project) => (
                                                <tr
                                                    key={project.id}
                                                    className="group hover:bg-slate-950/20 transition duration-150"
                                                >
                                                    <td className="py-3.5 pr-4">
                                                        <Link
                                                            href={route(
                                                                "projects.kanban",
                                                                project.slug
                                                            )}
                                                            className="font-semibold text-slate-200 group-hover:text-indigo-400 transition"
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
                                                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                                                        {project.manager?.name || (
                                                            <span className="text-slate-600">
                                                                Unassigned
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                                                        {project.deadline ? (
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                                {
                                                                    project.deadline
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-600">
                                                                N/A
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 pl-4">
                                                        <div className="flex items-center justify-end gap-3">
                                                            <div className="w-20 bg-slate-850 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                                                <div
                                                                    className="bg-emerald-500 h-full rounded-full"
                                                                    style={{
                                                                        width: `${project.progress}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-300 shrink-0">
                                                                {
                                                                    project.progress
                                                                }%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="py-6 text-center text-slate-500 font-medium"
                                                >
                                                    No projects found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Team Workloads (2/5 columns width) */}
                        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-bold text-base text-slate-200">
                                    Team Workloads
                                </h3>
                                <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                                    Top 5 Active PM/Members
                                </div>
                            </div>

                            <div className="space-y-4">
                                {team_workloads.length > 0 ? (
                                    team_workloads.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-850/80 rounded-xl hover:border-slate-800 transition duration-150"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                                                    {member.name
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm text-slate-200 block">
                                                        {member.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-medium block">
                                                        {member.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-indigo-400 rounded-lg shadow-inner">
                                                <UserCheck className="w-3.5 h-3.5" />
                                                <span className="text-xs font-extrabold">
                                                    {member.active_tasks_count}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-6 text-center text-slate-500 font-medium">
                                        No active workloads recorded.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </div>
    );
}
