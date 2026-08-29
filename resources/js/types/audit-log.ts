export interface AuditLogUser {
    id: number;
    name: string;
    email: string;
}

export interface AuditLog {
    id: number;
    user_id: number | null;
    action: string;
    auditable_type: string;
    auditable_id: number;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    created_at: string;
    user: AuditLogUser | null;
}

export interface PaginatedAuditLogs {
    data: AuditLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}
