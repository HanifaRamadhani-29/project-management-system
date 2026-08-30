import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { CheckSquare, Save, ShieldAlert, Info } from "lucide-react";

interface PermissionItem {
    id: number;
    name: string;
    description: string;
}

interface RoleItem {
    id: number;
    name: string;
    permission_names: string[];
}

interface PermissionsProps {
    roles: RoleItem[];
    permissions_grouped: Record<string, PermissionItem[]>;
}

export default function Permissions({ roles, permissions_grouped }: PermissionsProps) {
    // Exclude Super Admin from editable matrix map, but list it for display purposes
    const editableRoles = roles.filter(role => role.name !== "Super Admin");
    const superAdminRole = roles.find(role => role.name === "Super Admin");

    // Initialize state mapping role name -> array of permission names
    const [matrix, setMatrix] = useState<Record<string, string[]>>(() => {
        const initialMatrix: Record<string, string[]> = {};
        editableRoles.forEach(role => {
            initialMatrix[role.name] = [...(role.permission_names || [])];
        });
        return initialMatrix;
    });

    const form = useForm({
        matrix: matrix,
    });

    const handleCheckboxChange = (roleName: string, permissionName: string, isChecked: boolean) => {
        const currentPermissions = matrix[roleName] || [];
        let updatedPermissions: string[];

        if (isChecked) {
            updatedPermissions = [...currentPermissions, permissionName];
        } else {
            updatedPermissions = currentPermissions.filter(name => name !== permissionName);
        }

        const newMatrix = {
            ...matrix,
            [roleName]: updatedPermissions,
        };

        setMatrix(newMatrix);
        form.setData("matrix", newMatrix);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route("roles.permissions.update"), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-slate-800 tracking-tight flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-indigo-600" />
                    Access Control Matrix
                </h2>
            }
        >
            <Head title="Roles & Permissions" />

            <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
                {/* 1. Header Info */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                            Roles & Permissions Matrix
                        </h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            Manage access control permissions and map security credentials to roles.
                        </p>
                    </div>
                </div>

                {/* 2. Alert Box: Super Admin Immunity */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl text-xs text-indigo-850 font-medium flex items-start gap-3">
                    <ShieldAlert className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                        <span className="font-bold block text-sm text-indigo-900 mb-0.5">Super Admin Privileges Lock</span>
                        The <strong>Super Admin</strong> role is hardcoded to retain all system permissions at all times to prevent accidental lockout. Matrix configurations below apply specifically to other system roles.
                    </div>
                </div>

                {/* 3. Matrix Checkbox Grid Form */}
                <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold text-slate-650 min-w-[700px]">
                            <thead>
                                <tr className="text-slate-400 border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold tracking-wider">
                                    <th className="py-4 px-6 w-1/3 min-w-[250px]">Permission Credential</th>
                                    {/* Super Admin header (disabled/display-only) */}
                                    <th className="py-4 px-4 text-center w-28 bg-slate-100/50 border-r border-slate-150">
                                        Super Admin
                                    </th>
                                    {/* Editable roles header */}
                                    {editableRoles.map(role => (
                                        <th key={role.name} className="py-4 px-4 text-center w-28">
                                            {role.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {Object.entries(permissions_grouped || {}).map(([moduleName, permissions]) => (
                                    <React.Fragment key={moduleName}>
                                        {/* Module section header */}
                                        <tr className="bg-slate-50/40">
                                            <td 
                                                colSpan={roles.length + 1} 
                                                className="py-3 px-6 text-indigo-650 font-bold uppercase tracking-wider text-[10px] border-y border-slate-150"
                                            >
                                                {moduleName} Module
                                            </td>
                                        </tr>
                                        {permissions.map((perm) => (
                                            <tr key={perm.id} className="hover:bg-slate-50/50 transition">
                                                {/* Permission Title & Info */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 text-sm">{perm.name}</span>
                                                        <span className="text-slate-400 font-medium text-[11px] mt-0.5 leading-relaxed">
                                                            {perm.description}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Super Admin default checked (un-editable) */}
                                                <td className="py-4 px-4 text-center bg-slate-50/50 border-r border-slate-150">
                                                    <input
                                                        type="checkbox"
                                                        checked={true}
                                                        disabled={true}
                                                        className="rounded border-slate-350 bg-slate-100 text-indigo-500 cursor-not-allowed w-4.5 h-4.5 opacity-60 focus:ring-0"
                                                    />
                                                </td>

                                                {/* Editable checkboxes for other roles */}
                                                {editableRoles.map((role) => {
                                                    const isChecked = (matrix[role.name] || []).includes(perm.name);
                                                    return (
                                                        <td key={role.name} className="py-4 px-4 text-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) => handleCheckboxChange(role.name, perm.name, e.target.checked)}
                                                                className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 w-4.5 h-4.5 transition cursor-pointer"
                                                            />
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Submit Bar */}
                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                        <div className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                            <Info className="w-4 h-4 text-slate-350" />
                            Click checkboxes above and click Save Changes to apply system updates.
                        </div>
                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {form.processing ? "Saving Matrix..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
