import { useState, PropsWithChildren, ReactNode } from "react";
import { Link, usePage } from "@inertiajs/react";
import { 
    LayoutDashboard, 
    Folder, 
    Kanban, 
    CheckSquare, 
    Users, 
    ScrollText, 
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
    const user = usePage().props.auth.user;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const isSuperAdmin = user.role === 'super_admin' || (user.roles && user.roles.includes("Super Admin"));

    const menuItems = [
        { name: "Dashboard", href: route("dashboard"), icon: LayoutDashboard, active: route().current("dashboard") },
        { name: "Projects", href: route("projects.index"), icon: Folder, active: route().current("projects.*") && !route().current("projects.kanban") },
        { name: "Kanban Board", href: route("projects.index"), icon: Kanban, active: route().current("projects.kanban") },
        { name: "My Tasks", href: "#", icon: CheckSquare, active: false },
        { name: "Team Members", href: "#", icon: Users, active: false },
    ];

    if (isSuperAdmin) {
        menuItems.push({ name: "Audit Logs", href: "#", icon: ScrollText, active: false });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
                {/* Brand / Logo */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-200">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white text-sm shadow-sm">
                        P
                    </div>
                    <span className="font-extrabold text-sm text-slate-800 tracking-tight">
                        ProManage Enterprise
                    </span>
                </div>

                {/* Sidebar Navigation Links */}
                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                                    item.active
                                        ? "bg-indigo-50 text-indigo-650 font-bold"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`}
                            >
                                <Icon className="w-4.5 h-4.5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
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

                        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100 mt-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-black text-white text-sm shadow-sm">
                                P
                            </div>
                            <span className="font-extrabold text-sm text-slate-800">
                                ProManage
                            </span>
                        </div>

                        <nav className="flex-1 space-y-1.5 overflow-y-auto">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                                            item.active
                                                ? "bg-indigo-50 text-indigo-650 font-bold"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }`}
                                    >
                                        <Icon className="w-4.5 h-4.5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
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
                            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                            className="flex items-center gap-2 pl-3 py-1.5 pr-2.5 hover:bg-slate-50 rounded-xl transition text-slate-700"
                        >
                            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                                {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="hidden sm:inline text-sm font-semibold">{user.name}</span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {isUserDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-2xl shadow-xl py-2 z-50 text-xs font-medium text-slate-650">
                                <Link
                                    href={route("profile.edit")}
                                    onClick={() => setIsUserDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 hover:text-slate-900 transition w-full text-left"
                                >
                                    <UserIcon className="w-4 h-4 text-slate-400" />
                                    Profile Settings
                                </Link>
                                <Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                    onClick={() => setIsUserDropdownOpen(false)}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 hover:text-rose-600 text-left transition"
                                >
                                    <LogOut className="w-4 h-4 text-rose-450" />
                                    Log Out
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content Pane */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
