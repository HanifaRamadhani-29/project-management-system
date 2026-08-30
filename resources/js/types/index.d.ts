export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role?: string;
    roles: string[];
    permissions: string[];
    role?: 'super_admin' | 'project_manager' | 'member' | 'viewer';
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
