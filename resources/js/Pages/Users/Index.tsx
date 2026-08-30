import { useState, FormEventHandler, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { 
    Users as UsersIcon, 
    UserPlus, 
    Search, 
    Edit, 
    KeyRound, 
    Trash2, 
    X, 
    UserCheck,
    ShieldAlert
} from "lucide-react";
import { PaginatedUsers, User } from "@/types/user";

interface IndexProps {
    users: PaginatedUsers;
    filters: {
        search?: string;
        role?: string;
    };
}

export default function Index({ users, filters }: IndexProps) {
    const authUser = usePage().props.auth?.user;

    // Filters state
    const [search, setSearch] = useState(filters.search || "");
    const [role, setRole] = useState(filters.role || "");

    // Debounced filter submission
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route("users.index"),
                { search, role },
                { preserveState: true, replace: true }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search, role]);

    // Modals visibility state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isResetOpen, setIsResetOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected user for actions
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Forms using Inertia useForm
    const createForm = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
        role: "member" as User["role"],
    });

    const editForm = useForm({
        name: "",
        username: "",
        email: "",
        role: "member" as User["role"],
    });

    const resetForm = useForm({
        password: "",
    });

    // Submissions
    const handleCreate: FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(route("users.store"), {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        editForm.put(route("users.update", selectedUser.id), {
            onSuccess: () => {
                setIsEditOpen(false);
                editForm.reset();
            },
        });
    };

    const handleResetPassword: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        resetForm.post(route("users.reset-password", selectedUser.id), {
            onSuccess: () => {
                setIsResetOpen(false);
                resetForm.reset();
            },
        });
    };

    const handleDelete = () => {
        if (!selectedUser) return;
        router.delete(route("users.destroy", selectedUser.id), {
            onSuccess: () => {
                setIsDeleteOpen(false);
            },
        });
    };

    // Helper: Role badge styling
    const getRoleBadge = (userRole: User["role"]) => {
        switch (userRole) {
            case "super_admin":
                return "bg-purple-50 text-purple-700 border border-purple-100";
            case "project_manager":
                return "bg-indigo-50 text-indigo-700 border border-indigo-100";
            case "member":
                return "bg-emerald-50 text-emerald-700 border border-emerald-100";
            case "viewer":
                return "bg-slate-100 text-slate-700 border border-slate-200";
            default:
                return "bg-slate-50 text-slate-600 border border-slate-100";
        }
    };

    const getRoleLabel = (userRole: User["role"]) => {
        switch (userRole) {
            case "super_admin":
                return "Super Admin";
            case "project_manager":
                return "Project Manager";
            case "member":
                return "Member";
            case "viewer":
                return "Viewer";
            default:
                return userRole;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 tracking-tight flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-indigo-650" />
                    User & Role Management
                </h2>
            }
        >
            <Head title="User Management" />

            <div className="space-y-6 max-w-7xl mx-auto font-sans">
                {/* 1. Page Header description */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            System Access Control
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            Create new user accounts, modify system permissions, and audit roles.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition duration-150 shadow-md shadow-indigo-600/20 w-max"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add New User
                    </button>
                </div>

                {/* 2. Search & Filter Bar */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or username..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm font-medium transition duration-150"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full py-2 pl-3 pr-8 bg-slate-50 border border-slate-200 focus:bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl text-sm font-semibold transition"
                        >
                            <option value="">All Roles</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="project_manager">Project Manager</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                        </select>
                    </div>
                </div>

                {/* 3. Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-medium text-slate-600">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-150 text-[10px] uppercase font-bold tracking-wider bg-slate-50/50">
                                    <th className="py-3 px-6">User Account</th>
                                    <th className="py-3 px-6">System Role</th>
                                    <th className="py-3 px-6">Date Joined</th>
                                    <th className="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {(users.data || []).length > 0 ? (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition">
                                            {/* Account Info */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 uppercase">
                                                        {user.name.substring(0, 2)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-sm">
                                                            {user.name}
                                                            {authUser?.id === user.id && (
                                                                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md">
                                                                    You
                                                                </span>
                                                            )}
                                                        </span>
                                                        <span className="text-slate-400 font-medium text-[11px]">
                                                            @{user.username} • {user.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Badge */}
                                            <td className="py-4 px-6">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getRoleBadge(user.role)}`}>
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>

                                            {/* Joined date */}
                                            <td className="py-4 px-6 text-slate-500 font-medium">
                                                {new Date(user.created_at).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            editForm.setData({
                                                                name: user.name,
                                                                username: user.username,
                                                                email: user.email || "",
                                                                role: user.role,
                                                            });
                                                            setIsEditOpen(true);
                                                        }}
                                                        title="Edit User Role/Details"
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>

                                                    {/* Reset Password */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            resetForm.setData("password", "");
                                                            setIsResetOpen(true);
                                                        }}
                                                        title="Reset User Password"
                                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setIsDeleteOpen(true);
                                                        }}
                                                        disabled={authUser?.id === user.id}
                                                        title={authUser?.id === user.id ? "Cannot delete yourself" : "Delete User Account"}
                                                        className="p-2 hover:bg-rose-50 disabled:opacity-30 rounded-lg text-slate-500 hover:text-rose-600 transition"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                                            No user accounts match search criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {users.links && users.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-slate-150 flex items-center justify-center gap-1.5 bg-slate-50/50">
                            {users.links.map((link, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (link.url) router.visit(link.url);
                                    }}
                                    disabled={!link.url}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                        link.active
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : link.url
                                            ? "text-slate-655 hover:bg-slate-150 hover:text-slate-800"
                                            : "text-slate-350 cursor-not-allowed"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL 1: ADD NEW USER */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-indigo-600" />
                                Add New Account
                            </h3>
                            <button onClick={() => { setIsCreateOpen(false); createForm.clearErrors(); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData("name", e.target.value)}
                                    placeholder=""
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {createForm.errors.name && <p className="mt-1 text-xs text-rose-600 font-bold">{createForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Username</label>
                                <input
                                    type="text"
                                    value={createForm.data.username}
                                    onChange={(e) => createForm.setData("username", e.target.value)}
                                    placeholder=""
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {createForm.errors.username && <p className="mt-1 text-xs text-rose-600 font-bold">{createForm.errors.username}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData("email", e.target.value)}
                                    placeholder=""
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {createForm.errors.email && <p className="mt-1 text-xs text-rose-600 font-bold">{createForm.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
                                <input
                                    type="password"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData("password", e.target.value)}
                                    placeholder=""
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                />
                                {createForm.errors.password && <p className="mt-1 text-xs text-rose-600 font-bold">{createForm.errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">System Access Role</label>
                                <select
                                    value={createForm.data.role}
                                    onChange={(e) => createForm.setData("role", e.target.value as User["role"])}
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                >
                                    <option value="super_admin">Super Admin</option>
                                    <option value="project_manager">Project Manager</option>
                                    <option value="member">Member</option>
                                    <option value="viewer">Viewer</option>
                                </select>
                                {createForm.errors.role && <p className="mt-1 text-xs text-rose-600 font-bold">{createForm.errors.role}</p>}
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsCreateOpen(false); createForm.clearErrors(); }}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT USER DETAILS & ROLE */}
            {isEditOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Edit className="w-5 h-5 text-indigo-650" />
                                Edit Account Details
                            </h3>
                            <button onClick={() => { setIsEditOpen(false); editForm.clearErrors(); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleEdit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData("name", e.target.value)}
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                {editForm.errors.name && <p className="mt-1 text-xs text-rose-600 font-bold">{editForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Username</label>
                                <input
                                    type="text"
                                    value={editForm.data.username}
                                    onChange={(e) => editForm.setData("username", e.target.value)}
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                {editForm.errors.username && <p className="mt-1 text-xs text-rose-600 font-bold">{editForm.errors.username}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData("email", e.target.value)}
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                                {editForm.errors.email && <p className="mt-1 text-xs text-rose-600 font-bold">{editForm.errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">System Access Role</label>
                                {authUser?.id === selectedUser.id ? (
                                    <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-xl text-xs text-amber-800 font-medium leading-relaxed flex items-start gap-2.5">
                                        <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                                        <span>
                                            <strong>Self-Demotion Block</strong>: You cannot change your own role to prevent system lockout.
                                        </span>
                                    </div>
                                ) : (
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData("role", e.target.value as User["role"])}
                                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-medium"
                                    >
                                        <option value="super_admin">Super Admin</option>
                                        <option value="project_manager">Project Manager</option>
                                        <option value="member">Member</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                )}
                                {editForm.errors.role && <p className="mt-1 text-xs text-rose-600 font-bold">{editForm.errors.role}</p>}
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsEditOpen(false); editForm.clearErrors(); }}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
                                >
                                    Update Details
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: RESET PASSWORD */}
            {isResetOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-indigo-600" />
                                Reset Account Password
                            </h3>
                            <button onClick={() => { setIsResetOpen(false); resetForm.clearErrors(); }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-xs text-slate-600 font-medium">
                                Account: <strong className="text-slate-800">{selectedUser.name}</strong> (@{selectedUser.username} - {selectedUser.email})
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">New Password</label>
                                <input
                                    type="password"
                                    value={resetForm.data.password}
                                    onChange={(e) => resetForm.setData("password", e.target.value)}
                                    placeholder=""
                                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                                    required
                                    autoFocus
                                />
                                {resetForm.errors.password && <p className="mt-1 text-xs text-rose-600 font-bold">{resetForm.errors.password}</p>}
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setIsResetOpen(false); resetForm.clearErrors(); }}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetForm.processing}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: DELETE CONFIRMATION */}
            {isDeleteOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
                    <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
                        <div className="px-6 py-4 border-b border-slate-150 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-600" />
                                Delete Account Permanently?
                            </h3>
                            <button onClick={() => setIsDeleteOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                Are you sure you want to delete the user account for <strong className="text-slate-950 font-bold">{selectedUser.name}</strong> (@{selectedUser.username} - {selectedUser.email})?
                                This action is permanent and cannot be undone. All database entities linked specifically to this profile will lose their references.
                            </p>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsDeleteOpen(false)}
                                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-sm transition"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
