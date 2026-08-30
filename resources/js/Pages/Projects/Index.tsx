import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage, router } from "@inertiajs/react";
import { useState } from "react";
import { Project } from "@/types/kanban";
import { User } from "@/types/index";
import {
    Folder,
    Clock,
    ArrowRight,
    Plus,
    Edit2,
    Trash2,
    Users as UsersIcon,
    AlertTriangle,
    X,
    UserPlus,
    Check,
} from "lucide-react";

interface IndexProps {
    projects: Project[];
    managers: { id: number; name: string }[];
    allUsers: User[];
}

export default function Index({ projects, managers, allUsers }: IndexProps) {
    const currentUser = usePage().props.auth.user;
    const isSuperAdmin = currentUser.roles.includes("Super Admin");
    const isProjectManager = currentUser.roles.includes("Project Manager");

    // Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [selectedMemberId, setSelectedMemberId] = useState<string>("");

    // Inertia Form for Project CRUD
    const projectForm = useForm({
        name: "",
        description: "",
        status: "planning" as Project["status"],
        start_date: "",
        deadline: "",
        manager_id: "" as string | number,
    });

    const openCreateModal = () => {
        setEditingProject(null);
        projectForm.reset();
        projectForm.clearErrors();
        setIsProjectModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        projectForm.setData({
            name: project.name,
            description: project.description || "",
            status: project.status,
            start_date: project.start_date || "",
            deadline: project.deadline || "",
            manager_id: project.manager_id || "",
        });
        projectForm.clearErrors();
        setIsProjectModalOpen(true);
    };

    const saveProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProject) {
            projectForm.put(route("projects.update", editingProject.slug), {
                onSuccess: () => {
                    setIsProjectModalOpen(false);
                    projectForm.reset();
                },
            });
        } else {
            projectForm.post(route("projects.store"), {
                onSuccess: () => {
                    setIsProjectModalOpen(false);
                    projectForm.reset();
                },
            });
        }
    };

    const deleteProject = (project: Project) => {
        if (confirm(`Are you sure you want to delete project: "${project.name}"?`)) {
            router.delete(route("projects.destroy", project.slug));
        }
    };

    // Member Management
    const openMembersModal = (project: Project) => {
        setActiveProject(project);
        setSelectedMemberId("");
        setIsMembersModalOpen(true);
    };

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeProject || !selectedMemberId) return;

        router.post(
            route("projects.members.add", activeProject.slug),
            { user_id: parseInt(selectedMemberId) },
            {
                onSuccess: (page) => {
                    // Update active project details based on incoming page props
                    const updatedProjects = page.props.projects as Project[];
                    const freshProject = updatedProjects.find(
                        (p) => p.id === activeProject.id
                    );
                    if (freshProject) setActiveProject(freshProject);
                    setSelectedMemberId("");
                },
            }
        );
    };

    const handleRemoveMember = (memberId: number) => {
        if (!activeProject) return;

        if (confirm("Remove this member from the project?")) {
            router.delete(
                route("projects.members.remove", [activeProject.slug, memberId]),
                {
                    onSuccess: (page) => {
                        const updatedProjects = page.props.projects as Project[];
                        const freshProject = updatedProjects.find(
                            (p) => p.id === activeProject.id
                        );
                        if (freshProject) setActiveProject(freshProject);
                    },
                }
            );
        }
    };

    // Helper for role verification
    const canManageProject = (project: Project) => {
        return isSuperAdmin || (isProjectManager && project.manager_id === currentUser.id);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                            Projects List
                        </h2>
                        <p className="text-sm text-slate-500">
                            View and manage all enterprise projects
                        </p>
                    </div>

                    {(isSuperAdmin || isProjectManager) && (
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-500/10 transition"
                        >
                            <Plus className="w-4 h-4" />
                            New Project
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Projects" />

            <div className="space-y-6">
                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length > 0 ? (
                        projects.map((project) => (
                            <div
                                key={project.id}
                                className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition duration-200 ${
                                    project.is_overdue
                                        ? "border-rose-200 ring-2 ring-rose-500/5"
                                        : "border-slate-100"
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                                            project.is_overdue 
                                                ? "bg-rose-50 text-rose-500 shadow-rose-500/5" 
                                                : "bg-emerald-50 text-emerald-500 shadow-emerald-500/5"
                                        }`}>
                                            <Folder className="w-5.5 h-5.5" />
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {project.is_overdue && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Overdue
                                                </span>
                                            )}
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                                                project.status === "active"
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : project.status === "completed"
                                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                                    : project.status === "on_hold"
                                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                            }`}>
                                                {project.status.replace("_", " ")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="font-bold text-base text-slate-800 leading-snug truncate">
                                                {project.name}
                                            </h3>
                                        </div>
                                        <span className="text-xs text-slate-400 font-bold block">
                                            Manager:{" "}
                                            <span className="text-slate-600">
                                                {project.manager?.name || "Unassigned"}
                                            </span>
                                        </span>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                            <span>Progress</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    project.is_overdue 
                                                        ? "bg-rose-500" 
                                                        : "bg-emerald-500"
                                                }`}
                                                style={{
                                                    width: `${project.progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Project Members */}
                                <div className="mt-5 flex items-center justify-between">
                                    <div className="flex items-center -space-x-2 overflow-hidden">
                                        {project.members && project.members.length > 0 ? (
                                            project.members.slice(0, 4).map((member) => (
                                                <div
                                                    key={member.id}
                                                    className="inline-block h-6 w-6 rounded-full bg-slate-200 ring-2 ring-white text-[9px] font-bold text-slate-600 flex items-center justify-center uppercase shrink-0"
                                                    title={member.name}
                                                >
                                                    {member.name.substring(0, 2)}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-semibold">No members</span>
                                        )}
                                        {project.members && project.members.length > 4 && (
                                            <div className="inline-block h-6 w-6 rounded-full bg-slate-100 ring-2 ring-white text-[8px] font-extrabold text-slate-500 flex items-center justify-center shrink-0">
                                                +{project.members.length - 4}
                                            </div>
                                        )}
                                    </div>

                                    {canManageProject(project) && (
                                        <button
                                            onClick={() => openMembersModal(project)}
                                            className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 transition"
                                        >
                                            <UsersIcon className="w-3.5 h-3.5" />
                                            Members
                                        </button>
                                    )}
                                </div>

                                {/* Card Footer Actions */}
                                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-6 text-xs text-slate-500 font-bold">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>{project.deadline || "No deadline"}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {canManageProject(project) && (
                                            <>
                                                <button
                                                    onClick={() => openEditModal(project)}
                                                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                                                    title="Edit Project"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteProject(project)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                                                    title="Delete Project"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <Link
                                            href={route("projects.kanban", project.slug)}
                                            className="text-indigo-500 hover:text-indigo-650 flex items-center gap-1 transition ml-1"
                                        >
                                            Kanban
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                            <p className="text-slate-400 font-semibold text-base">
                                No projects assigned or visible yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Project Modal */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsProjectModalOpen(false)} />
                    
                    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 overflow-hidden animate-scale-in">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                            <h3 className="font-bold text-lg text-slate-800">
                                {editingProject ? "Edit Project" : "New Project"}
                            </h3>
                            <button onClick={() => setIsProjectModalOpen(false)} className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={saveProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Name</label>
                                <input
                                    type="text"
                                    required
                                    value={projectForm.data.name}
                                    onChange={(e) => projectForm.setData("name", e.target.value)}
                                    className="w-full text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                                    placeholder="Enter project name"
                                />
                                {projectForm.errors.name && (
                                    <span className="text-xs text-rose-500 mt-1 block">{projectForm.errors.name}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                                <textarea
                                    value={projectForm.data.description}
                                    onChange={(e) => projectForm.setData("description", e.target.value)}
                                    className="w-full text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl min-h-[80px]"
                                    placeholder="Brief project summary"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select
                                        value={projectForm.data.status}
                                        onChange={(e) => projectForm.setData("status", e.target.value as Project["status"])}
                                        className="w-full text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Manager</label>
                                    <select
                                        disabled={!isSuperAdmin}
                                        value={projectForm.data.manager_id}
                                        onChange={(e) => projectForm.setData("manager_id", e.target.value)}
                                        className="w-full text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl disabled:bg-slate-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">Select Manager</option>
                                        {managers.map((m) => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={projectForm.data.start_date}
                                        onChange={(e) => projectForm.setData("start_date", e.target.value)}
                                        className="w-full text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={projectForm.data.deadline}
                                        onChange={(e) => projectForm.setData("deadline", e.target.value)}
                                        className="w-full text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                                    />
                                    {projectForm.errors.deadline && (
                                        <span className="text-xs text-rose-500 mt-1 block">{projectForm.errors.deadline}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsProjectModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={projectForm.processing}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition disabled:opacity-50"
                                >
                                    {projectForm.processing ? "Saving..." : "Save Project"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */}
            {isMembersModalOpen && activeProject && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMembersModalOpen(false)} />
                    
                    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 overflow-hidden animate-scale-in">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">
                                    Project Members
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {activeProject.name}
                                </p>
                            </div>
                            <button onClick={() => setIsMembersModalOpen(false)} className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Add Member Form */}
                        <form onSubmit={handleAddMember} className="flex items-end gap-3 mb-6">
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Add New Member</label>
                                <select
                                    required
                                    value={selectedMemberId}
                                    onChange={(e) => setSelectedMemberId(e.target.value)}
                                    className="w-full text-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
                                >
                                    <option value="">Select user...</option>
                                    {allUsers
                                        .filter((u) => u.id !== currentUser.id) // exclude current user from adding themselves
                                        .filter((u) => !activeProject.members?.some((m) => m.id === u.id)) // exclude existing members
                                        .map((u) => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition shadow-sm"
                                title="Add Member"
                            >
                                <UserPlus className="w-5 h-5" />
                            </button>
                        </form>

                        {/* Current Members List */}
                        <div>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Current Members ({activeProject.members?.length || 0})</span>
                            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                                {activeProject.members && activeProject.members.length > 0 ? (
                                    activeProject.members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                                                    {member.name.substring(0, 2)}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-bold text-slate-700 block truncate max-w-[180px]">
                                                        {member.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-semibold block">
                                                        {member.email}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(member.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                                title="Remove member"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-4 font-semibold">
                                        No members added yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end border-t border-slate-100 pt-4 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsMembersModalOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
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
