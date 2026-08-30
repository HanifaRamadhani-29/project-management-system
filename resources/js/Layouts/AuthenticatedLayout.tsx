import React, { useState, useEffect, PropsWithChildren, ReactNode } from "react";
import { Link, usePage } from "@inertiajs/react";
import { 
    LayoutDashboard, 
    FolderKanban, 
    CheckSquare, 
    CheckCircle2, 
    Bell, 
    Users, 
    ShieldCheck, 
    History, 
    BarChart3, 
    Menu, 
    X, 
    ChevronDown, 
    LogOut, 
    User as UserIcon 
} from "lucide-react";

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth?.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showingUserDropdown, setShowingUserDropdown] = useState(false);

    const { flash } = usePage().props as any;
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash?.success) {
            setNotification({ message: flash.success, type: 'success' });
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        } else if (flash?.error) {
            setNotification({ message: flash.error, type: 'error' });
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const isSuperAdmin = user?.role === 'super_admin' || (user?.roles && user.roles.includes("Super Admin"));
    const isPM = user?.role === 'project_manager' || (user?.roles && user.roles.includes("Project Manager"));

    // Main section menu items
    const mainSection = [
        { name: "Dashboard", href: route().has("dashboard") ? route("dashboard") : "/dashboard", icon: LayoutDashboard, active: route().current("dashboard") },
        { name: "Projects", href: route().has("projects.index") ? route("projects.index") : "/projects", icon: FolderKanban, active: route().current("projects.*") && !route().current("projects.kanban") },
        { name: "My Tasks", href: "/tasks", icon: CheckSquare, active: false },
    ];

    const workflowSection = [
        { name: "Approvals", href: route().has("approvals.index") ? route("approvals.index") : "/approvals", icon: CheckCircle2, active: route().current("approvals.*") },
        { name: "Notifications", href: "/notifications", icon: Bell, active: false },
    ];

    const hasPermission = (perm: string) => 
        user?.role === 'super_admin' || user?.permissions?.includes(perm);

    // Administration section menu items
    const adminSection: { name: string; href: string; icon: any; active: boolean }[] = [];
    if (hasPermission('users.manage')) {
        adminSection.push({ name: "Users", href: route().has("users.index") ? route("users.index") : "/users", icon: Users, active: route().current("users.*") });
    }
    if (user?.role === 'super_admin') {
        adminSection.push({ name: "Roles & Permissions", href: route().has("roles.permissions.index") ? route("roles.permissions.index") : "/roles/permissions", icon: ShieldCheck, active: route().current("roles.permissions.*") });
    }
    if (hasPermission('audit_logs.view')) {
        adminSection.push({ name: "Audit Logs", href: route().has("audit_logs.index") ? route("audit_logs.index") : "/audit-logs", icon: History, active: route().current("audit_logs.*") });
    }

    // Dynamic role badges
    const getRoleDetails = () => {
        if (isSuperAdmin) {
            return { label: "Super Admin", style: "bg-purple-50 text-purple-700 border-purple-100" };
        }
        if (isPM) {
            return { label: "Project Manager", style: "bg-blue-50 text-blue-700 border-blue-100" };
        }
        if (user?.role === 'member' || (user?.roles && user.roles.includes("Member"))) {
            return { label: "Member", style: "bg-emerald-50 text-emerald-700 border-emerald-100" };
        }
        return { label: "Viewer", style: "bg-slate-100 text-slate-700 border-slate-200" };
    };

    const roleDetails = getRoleDetails();

    const renderNavLinks = () => (
        <div className="space-y-6">
            {/* Section: Menu Utama */}
            <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                    Menu Utama
                </div>
                <div className="space-y-1">
                    {mainSection.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                                    item.active
                                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            >
                                <Icon className="w-4.5 h-4.5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Section: Workflow & Kolaborasi */}
            <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                    Workflow & Kolaborasi
                </div>
                <div className="space-y-1">
                    {workflowSection.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                                    item.active
                                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            >
                                <Icon className="w-4.5 h-4.5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Section: Administrasi */}
            {adminSection.length > 0 && (
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                        Administrasi
                    </div>
                    <div className="space-y-1">
                        {adminSection.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition duration-150 ${
                                        item.active
                                            ? "bg-indigo-50 text-indigo-600 font-semibold"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon className="w-4.5 h-4.5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
                {/* Brand / Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white text-sm shadow-sm">
                        P
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                        ProManage Enterprise
                    </span>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    {renderNavLinks()}
                </nav>

                {/* User Profile Card & Quick Logout */}
                <div className="p-4 border-t border-slate-200 space-y-3.5 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</div>
                            <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-bold border capitalize ${roleDetails.style}`}>
                                {roleDetails.label}
                            </span>
                        </div>
                    </div>
                    
                    <Link
                        method="post"
                        href={route('logout')}
                        as="button"
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 bg-white transition duration-150 shadow-sm"
                    >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        Log Out
                    </Link>
                </div>
            </aside>

            {/* Sidebar Mobile Drawer */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/40 backdrop-blur-sm">
                    <div className="flex flex-col w-64 bg-white h-full border-r border-slate-200 p-4 relative animate-slide-in">
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-150 mt-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white text-sm shadow-sm">
                                P
                            </div>
                            <span className="font-extrabold text-sm text-slate-900">
                                ProManage
                            </span>
                        </div>

                        <nav className="flex-1 overflow-y-auto">
                            {renderNavLinks()}
                        </nav>
                    </div>
                </div>
            )}

            {/* Right Side: Header & Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white/80 backdrop-blur border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1 px-4">
                        {header}
                    </div>

                    {/* User Profile Action Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowingUserDropdown(!showingUserDropdown)}
                            className="relative z-50 flex items-center gap-2 pl-3 py-1.5 pr-2.5 hover:bg-slate-50 rounded-xl transition text-slate-700"
                        >
                            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                            </div>
                            <span className="hidden sm:inline text-sm font-semibold">{user?.name || 'User'}</span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {/* Click-outside backdrop */}
                        {showingUserDropdown && (
                            <div 
                                className="fixed inset-0 z-40 bg-transparent cursor-default" 
                                onClick={() => setShowingUserDropdown(false)} 
                            />
                        )}

                        {showingUserDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50 text-xs font-medium text-slate-650">
                                <Link
                                    href={route("profile.edit")}
                                    onClick={() => setShowingUserDropdown(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition w-full text-left"
                                >
                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                    Profile Settings
                                </Link>
                                <Link
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    onClick={() => setShowingUserDropdown(false)}
                                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition"
                                >
                                    <LogOut className="w-4 h-4 text-rose-500" />
                                    Log Out
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Pane */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
                    {notification && (
                        <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 ${
                            notification.type === 'success' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            {notification.message}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
