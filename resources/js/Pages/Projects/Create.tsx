import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useEffect, useState } from 'react';

export default function Create({ users = [] }: { users?: any[] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        status: 'planning',
        manager_id: '',
        start_date: '',
        deadline: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('projects.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Create New Project
                </h2>
            }
        >
            <Head title="Create Project" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit}>
                            <div>
                                <InputLabel htmlFor="name" value="Project Name" />
                                <TextInput
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    className="mt-1 block w-full"
                                    autoComplete="name"
                                    isFocused={true}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="description" value="Description" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows={4}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="manager_id" value="Project Manager" />
                                    <select
                                        id="manager_id"
                                        name="manager_id"
                                        value={data.manager_id}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('manager_id', e.target.value)}
                                    >
                                        <option value="">Select Project Manager</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.manager_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        name="status"
                                        value={data.status}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="planning">Planning</option>
                                        <option value="active">Active</option>
                                        <option value="on_hold">On Hold</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="start_date" value="Start Date" />
                                    <TextInput
                                        id="start_date"
                                        type="date"
                                        name="start_date"
                                        value={data.start_date}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    <InputError message={errors.start_date} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="deadline" value="Deadline" />
                                    <TextInput
                                        id="deadline"
                                        type="date"
                                        name="deadline"
                                        value={data.deadline}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('deadline', e.target.value)}
                                    />
                                    <InputError message={errors.deadline} className="mt-2" />
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-6">
                                <Link
                                    href={route('projects.index')}
                                    className="text-sm text-gray-600 hover:text-gray-900 mr-4"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton className="ml-4" disabled={processing}>
                                    Create Project
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
