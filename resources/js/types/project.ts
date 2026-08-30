export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface Member {
    id: number;
    name: string;
    email: string;
    role: string;
    pivot?: {
        project_id: number;
        user_id: number;
    };
}

export interface Project {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    start_date: string | null;
    deadline: string | null;
    manager_id: number | null;
    manager?: User | null;
    members?: Member[];
    tasks_count?: number;
    completed_tasks_count?: number;
    progress?: number;
    is_overdue?: boolean;
    created_at: string;
    updated_at: string;
}
