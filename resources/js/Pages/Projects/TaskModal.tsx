import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import { Project } from '@/types/kanban';

interface TaskModalProps {
    show: boolean;
    onClose: () => void;
    project: Project;
    users: any[];
    defaultStatus?: string;
}

export default function TaskModal({ show, onClose, project, users, defaultStatus = 'backlog' }: TaskModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        description: '',
        status: defaultStatus,
        priority: 'low',
        assignee_id: '',
        deadline: '',
    });

    useEffect(() => {
        if (show) {
            setData('status', defaultStatus);
        } else {
            reset();
        }
    }, [show, defaultStatus]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        
        post(route('tasks.store', project.slug), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">Create New Task</h2>
                
                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <InputLabel htmlFor="title" value="Title" />
                        <TextInput
                            id="title"
                            type="text"
                            name="title"
                            value={data.title}
                            className="mt-1 block w-full text-sm"
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        <InputError message={errors.title} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="description" value="Description" />
                        <textarea
                            id="description"
                            name="description"
                            value={data.description}
                            className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                            rows={3}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                name="status"
                                value={data.status}
                                className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="backlog">Backlog</option>
                                <option value="todo">To Do</option>
                                <option value="in_progress">In Progress</option>
                                <option value="review">Under Review</option>
                                <option value="done">Done</option>
                            </select>
                            <InputError message={errors.status} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="priority" value="Priority" />
                            <select
                                id="priority"
                                name="priority"
                                value={data.priority}
                                className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                onChange={(e) => setData('priority', e.target.value)}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                            <InputError message={errors.priority} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="assignee_id" value="Assignee" />
                            <select
                                id="assignee_id"
                                name="assignee_id"
                                value={data.assignee_id}
                                className="mt-1 block w-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                onChange={(e) => setData('assignee_id', e.target.value)}
                            >
                                <option value="">Unassigned</option>
                                {users && users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.assignee_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="deadline" value="Deadline" />
                            <TextInput
                                id="deadline"
                                type="date"
                                name="deadline"
                                value={data.deadline}
                                className="mt-1 block w-full text-sm"
                                onChange={(e) => setData('deadline', e.target.value)}
                            />
                            <InputError message={errors.deadline} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-6 gap-3">
                        <SecondaryButton onClick={onClose} type="button" disabled={processing}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            Create Task
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
