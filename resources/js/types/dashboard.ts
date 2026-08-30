import { User } from "./index";

export interface AdminStats {
    total_projects: string;
    active_projects: string;
    overdue_projects: string;
    total_tasks: string;
    completed_tasks: string;
    overdue_tasks: string;
    completion_rate: number;
}

export interface TasksByStatus {
    backlog: number;
    todo: number;
    in_progress: number;
    review: number;
    done: number;
}

export interface TeamWorkload {
    id: number;
    name: string;
    email: string;
    active_tasks_count: number;
}

export interface RecentProject {
    id: number;
    name: string;
    slug: string;
    status: string;
    deadline: string | null;
    manager: {
        id: number;
        name: string;
    } | null;
    progress: number;
}

export interface AdminDashboardProps {
    stats: AdminStats;
    tasks_by_status: TasksByStatus;
    team_workloads: TeamWorkload[];
    recent_projects: RecentProject[];
}
