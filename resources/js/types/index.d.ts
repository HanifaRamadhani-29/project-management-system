export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
<<<<<<< HEAD
=======
    role?: string;
    roles: string[];
    role?: string;
    permissions: string[];
>>>>>>> 327c57e36514433ef4dc95352f22ff7f27b4638b
    role?: 'super_admin' | 'project_manager' | 'member' | 'viewer';
    roles?: string[];
    permissions?: string[];
}

export interface Project {
    id: number;
    name: string;
    slug: string;
    status: string;
    description: string | null;
    start_date: string | null;
    deadline: string | null;
    manager_id: number;
    progress?: number;
    is_overdue?: boolean;
    manager?: User;
    members?: User[];
    tasks_count?: number;
}

export interface Project {
    id: number;
    name: string;
    slug: string;
    status: string;
    description: string | null;
    start_date: string | null;
    deadline: string | null;
    manager_id: number;
    progress?: number;
    is_overdue?: boolean;
    manager?: User;
    members?: User[];
    tasks_count?: number;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
