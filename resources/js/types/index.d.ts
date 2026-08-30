export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: string;
    roles: string[];
    role?: string;
    permissions: string[];
    role?: 'super_admin' | 'project_manager' | 'member' | 'viewer';
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
