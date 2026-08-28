import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { PropsWithChildren, ReactNode, useState } from "react";
import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    Calendar,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    User as UserIcon,
} from "lucide-react";

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingMobileSidebar, setShowingMobileSidebar] = useState(false);

    // Helper to determine if link is active
    const isRouteActive = (routeName: string) => {
        return route().current(routeName);
    };

    const isProjectsActive = () => {
        return route().current("projects.*") || route().current("tasks.*");
    };

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white border-r border-slate-100 p-5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-emerald-500/20">
                    P
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-800">
                    ProManage
                </span>
            </div>

            {/* Workspace Navigation */}
            <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-3 px-3">
                    Workspace
                </span>
                <nav className="space-y-1">
                    <Link
                        href={route("dashboard")}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                            isRouteActive("dashboard")
                                ? "bg-emerald-50 text-emerald-600 font-semibold"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                    >
                        <LayoutDashboard className="w-4.5 h-4.5" />
                        Dashboard
                    </Link>

                    <Link
                        href={route("projects.index")}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition duration-150 ${
                            isProjectsActive()
                                ? "bg-emerald-50 text-emerald-600 font-semibold"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                        }`}
                    >
                        <FolderKanban className="w-4.5 h-4.5" />
                        Projects
                    </Link>

                    <button
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
                    >
                        <CheckSquare className="w-4.5 h-4.5" />
                        Tasks
                    </button>

                    <button
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
                    >
                        <Calendar className="w-4.5 h-4.5" />
                        Calendar
                    </button>

                    <button
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
                    >
                        <Users className="w-4.5 h-4.5" />
                        Team
                    </button>

                    <button
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
                    >
                        <BarChart3 className="w-4.5 h-4.5" />
                        Reports
                    </button>
                </nav>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-100 space-y-1">
                <button
                    disabled
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
                >
                    <Settings className="w-4.5 h-4.5" />
                    Settings
                </button>

                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition duration-150 text-left"
                >
                    <LogOut className="w-4.5 h-4.5 text-slate-400 group-hover:text-rose-600" />
                    Logout
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 flex">
            {/* Desktop Left Sidebar */}
            <aside className="w-64 fixed inset-y-0 left-0 z-20 hidden md:block">
                {sidebarContent}
            </aside>

            {/* Main Area */}
            <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
                {/* Top Navbar */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowingMobileSidebar(true)}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg md:hidden transition"
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Route specific header content */}
                        <div className="font-semibold text-slate-850">
                            {header || "Workspace"}
                        </div>
                    </div>

                    {/* User Profile dropdown */}
                    <div className="flex items-center gap-3">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 group p-1.5 rounded-lg hover:bg-slate-50 transition">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white uppercase ring-2 ring-white">
                                        {user.name.substring(0, 1).toUpperCase()}
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                        {user.name}
                                    </span>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route("profile.edit")}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 p-6 md:p-8">{children}</main>
            </div>

            {/* Mobile Sidebar Overlay Drawer */}
            {showingMobileSidebar && (
                <div className="fixed inset-0 z-40 md:hidden flex">
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowingMobileSidebar(false)}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                    />

                    {/* Drawer Content */}
                    <div className="relative w-64 max-w-xs flex-1 flex flex-col h-full bg-white animate-slide-in">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowingMobileSidebar(false)}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        {sidebarContent}
                    </div>
                </div>
            )}
        </div>
    );
}
