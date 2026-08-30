export interface User {
    id: number;
    name: string;
    email: string;
    role: 'super_admin' | 'project_manager' | 'member' | 'viewer';
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Link {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedUsers {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: Link[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}
