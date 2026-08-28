import { User } from './index';

export interface Task {
    id: number;
    project_id: number;
    parent_id: number | null;
    title: string;
    description: string | null;
    status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    reporter_id: number;
    assignee_id: number | null;
    deadline: string | null;
    order: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    assignee?: User | null;
    reporter?: User;
}

export interface Column {
    id: Task['status'];
    title: string;
    tasks: Task[];
}

export interface Project {
    id: number;
    name: string;
    slug: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    description: string | null;
    start_date: string | null;
    deadline: string | null;
    created_at: string;
    updated_at: string;
    manager_id: number | null;
    manager?: User | null;
    members?: User[];
    progress: number;
    is_overdue: boolean;
}

export interface ReorderPayload {
    status: Task['status'];
    ordered_ids: number[];
}
