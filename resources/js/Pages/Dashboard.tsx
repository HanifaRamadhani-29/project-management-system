import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card Project */}
                        <Link
                            href={route("projects.index")}
                            className="p-6 bg-white overflow-hidden shadow-sm sm:rounded-lg hover:bg-gray-50 transition"
                        >
                            <div className="text-gray-900 font-bold text-lg">
                                📁 Projects
                            </div>
                            <div className="text-gray-600 text-sm">
                                Kelola semua project tim kamu.
                            </div>
                        </Link>

                        {/* Card Tasks */}
                        <div className="p-6 bg-white overflow-hidden shadow-sm sm:rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="text-gray-900 font-bold text-lg">
                                ✅ My Tasks
                            </div>
                            <div className="text-gray-600 text-sm">
                                Lihat tugas yang diberikan padamu.
                            </div>
                        </div>

                        {/* Card Team */}
                        <div className="p-6 bg-white overflow-hidden shadow-sm sm:rounded-lg cursor-pointer hover:bg-gray-50">
                            <div className="text-gray-900 font-bold text-lg">
                                👥 Team Members
                            </div>
                            <div className="text-gray-600 text-sm">
                                Pantau workload anggota tim.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
