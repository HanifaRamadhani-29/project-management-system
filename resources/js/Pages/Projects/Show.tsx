import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

interface Member {
    id: number;
    name: string;
    email: string;
}

interface Project {
    id: number;
    name: string;
    description: string;
    status: string;
    manager?: {
        name: string;
    };
    members: Member[];
}

export default function Show({ project }: { project: Project }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Project Detail: {project.name}
                </h2>
            }
        >
            <Head title={`Project - ${project.name}`} />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-bold">{project.name}</h3>
                        <p>{project.description}</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
