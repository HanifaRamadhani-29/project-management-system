import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Task, Project } from "@/types/kanban";
import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
} from "@hello-pangea/dnd";
import axios from "axios";
import TaskModal from "./TaskModal";
import TaskDetailPanel from "./TaskDetailPanel";
import {
    AlertCircle,
    Calendar,
    Clock,
    Plus,
    User as UserIcon,
    ArrowLeft,
    AlertTriangle,
    MessageSquare,
    Send,
    X,
} from "lucide-react";

type ColumnId = "backlog" | "todo" | "in_progress" | "review" | "done";

const columnOrder: ColumnId[] = [
    "backlog",
    "todo",
    "in_progress",
    "review",
    "done",
];

const columnTitles: Record<ColumnId, string> = {
    backlog: "Backlog",
    todo: "To Do",
    in_progress: "In Progress",
    review: "Under Review",
    done: "Done",
};

interface KanbanProps {
    project: Project;
    tasks: Task[];
    users?: any[];
    allLabels?: any[];
    allProjectTasks?: any[];
}

interface ColumnsState {
    backlog: Task[];
    todo: Task[];
    in_progress: Task[];
    review: Task[];
    done: Task[];
}

export default function Kanban({ project, tasks, users = [], allLabels = [], allProjectTasks = [] }: KanbanProps) {
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
    const modalUsers = users.length > 0 ? users : (project.members ?? []);
    const safeUsers = modalUsers.length > 0 ? modalUsers : (Array.isArray((usePage() as any).props.users) ? (usePage() as any).props.users : []);

    // Group and sort initial tasks by status and their order
    const getInitialColumns = (taskList: Task[]): ColumnsState => {
        return {
            backlog: taskList
                .filter((t) => t.status === "backlog")
                .sort((a, b) => a.order - b.order),
            todo: taskList
                .filter((t) => t.status === "todo")
                .sort((a, b) => a.order - b.order),
            in_progress: taskList
                .filter((t) => t.status === "in_progress")
                .sort((a, b) => a.order - b.order),
            review: taskList
                .filter((t) => t.status === "review")
                .sort((a, b) => a.order - b.order),
            done: taskList
                .filter((t) => t.status === "done")
                .sort((a, b) => a.order - b.order),
        };
    };

    const [columns, setColumns] = useState<ColumnsState>(() =>
        getInitialColumns(tasks)
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        setColumns(getInitialColumns(tasks));

        if (selectedTask) {
            let found: Task | undefined;
            // Search in parent tasks first
            found = tasks.find((t) => t.id === selectedTask.id);
            // Search in subtasks of parent tasks if not found
            if (!found) {
                for (const parent of tasks) {
                    if (parent.subtasks) {
                        found = parent.subtasks.find((t) => t.id === selectedTask.id);
                        if (found) break;
                    }
                }
            }

            if (found) {
                setSelectedTask(found);
            } else {
                setSelectedTask(null);
            }
        }
    }, [tasks]);

    // Chat room state
    const currentUser = usePage().props.auth.user;
    const { auth } = usePage().props as any;
    const hasPermission = (perm: string) => 
        currentUser?.role === 'super_admin' || auth?.user?.permissions?.includes(perm);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const chatInputRef = useRef<HTMLInputElement>(null);

    const [isMentioning, setIsMentioning] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');

    const handleChatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        const cursorPosition = e.target.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPosition);
        const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
        
        if (match) {
            setIsMentioning(true);
            setMentionQuery(match[1]);
        } else {
            setIsMentioning(false);
        }
    };

    const insertChatMention = (username: string) => {
        const currentText = newMessage;
        const cursorPosition = chatInputRef.current?.selectionStart || 0;
        const textBeforeCursor = currentText.substring(0, cursorPosition);
        const textAfterCursor = currentText.substring(cursorPosition);
        
        const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
        if (match) {
            const prefixIndex = match.index! + match[0].lastIndexOf('@');
            const prefix = textBeforeCursor.substring(0, prefixIndex);
            const newText = prefix + `@${username} ` + textAfterCursor;
            setNewMessage(newText);
        }
        setIsMentioning(false);
        setTimeout(() => chatInputRef.current?.focus(), 10);
    };

    const renderChatMessage = (content: string, isMe: boolean) => {
        const parts = content.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className={`font-bold px-1 rounded-sm ${isMe ? 'bg-emerald-600/50 text-white' : 'text-indigo-600 bg-indigo-50'}`}>{part}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    // Fetch and poll messages
    useEffect(() => {
        if (!isChatOpen) return;

        const fetchMessages = async () => {
            try {
                const response = await axios.get(route("projects.chat.messages", project.slug));
                if (response.data.success) {
                    setChatMessages(response.data.messages);
                }
            } catch (err) {
                console.error("Failed to load messages:", err);
            }
        };

        fetchMessages();

        const interval = setInterval(fetchMessages, 3000);

        return () => clearInterval(interval);
    }, [isChatOpen, project.slug]);

    // Auto-scroll chat log
    useEffect(() => {
        if (isChatOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, isChatOpen]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSendingMessage) return;

        setIsSendingMessage(true);
        try {
            const response = await axios.post(route("projects.chat.store", project.slug), {
                message: newMessage,
            });
            if (response.data.success) {
                setChatMessages((prev) => [...prev, response.data.message]);
                setNewMessage("");
                setIsMentioning(false);
            }
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setIsSendingMessage(false);
        }
    };

    // Optimistic Update & Rollback handler
    const onDragEnd = async (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside a valid drop target
        if (!destination) return;

        // Dropped in the exact same spot
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        const sourceColId = source.droppableId as ColumnId;
        const destColId = destination.droppableId as ColumnId;

        // Deep copy existing state for rollback
        const previousColumnsState = {
            backlog: [...columns.backlog],
            todo: [...columns.todo],
            in_progress: [...columns.in_progress],
            review: [...columns.review],
            done: [...columns.done],
        };

        // Create new column state
        const updatedColumns = {
            backlog: [...columns.backlog],
            todo: [...columns.todo],
            in_progress: [...columns.in_progress],
            review: [...columns.review],
            done: [...columns.done],
        };

        // Find and retrieve task being moved
        const taskIndex = updatedColumns[sourceColId].findIndex(
            (t) => t.id === parseInt(draggableId)
        );
        if (taskIndex === -1) return;

        const [movedTask] = updatedColumns[sourceColId].splice(taskIndex, 1);

        // Update task's local status
        const updatedTask: Task = {
            ...movedTask,
            status: destColId,
        };

        // Insert into the destination column at correct index
        updatedColumns[destColId].splice(destination.index, 0, updatedTask);

        // Update UI immediately (Optimistic Update)
        setColumns(updatedColumns);
        setErrorMessage(null);

        // Send backend PATCH request
        try {
            // Get all task IDs in destination column to save their new ordering
            const orderedIds = updatedColumns[destColId].map((t) => t.id);

            const response = await axios.patch(
                route("tasks.reorder", project.slug),
                {
                    status: destColId,
                    ordered_ids: orderedIds,
                }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Failed to update task order");
            }
        } catch (error: any) {
            // Rollback to previous state
            setColumns(previousColumnsState);
            const errorMsg =
                error.response?.data?.message ||
                error.message ||
                "Failed to update task positioning. Reverted changes.";
            setErrorMessage(errorMsg);
        }
    };

    // Priority badge styles helper for light theme
    const getPriorityBadgeClass = (priority: Task["priority"]) => {
        switch (priority) {
            case "critical":
                return "bg-rose-50 text-rose-600 border-rose-200";
            case "high":
                return "bg-amber-50 text-amber-600 border-amber-200";
            case "medium":
                return "bg-indigo-50 text-indigo-600 border-indigo-200";
            case "low":
            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    // Helper for formatting priorities
    const formatPriority = (priority: string) => {
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("projects.index")}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
                                {project.name}
                            </h2>
                            <p className="text-sm text-slate-500">
                                Kanban Board & Task Ordering
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {hasPermission('tasks.create') && (
                            <button
                                onClick={() => setIsCreateTaskOpen(true)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-indigo-500 transition"
                            >
                                <Plus className="w-4 h-4" />
                                Add Task
                            </button>
                        )}
                        <button
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl text-sm font-semibold transition ${
                                isChatOpen
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-650"
                                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800"
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            {isChatOpen ? "Hide Chat" : "Project Chat"}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Kanban - ${project.name}`} />

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Board Area */}
                <div className="flex-1 w-full space-y-6">
                    {/* Project Metadata Card */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-slate-600">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2">
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                                    Description
                                </span>
                                <p className="text-sm text-slate-700 font-medium">
                                    {project.description || "No project description provided."}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                                    Project Status
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 capitalize">
                                        {project.status.replace("_", " ")}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1">
                                    Project Timeline
                                </span>
                                <p className="text-sm text-slate-700 font-semibold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {project.start_date ? new Date(project.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"} to {project.deadline ? new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 shadow-sm">
                            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                            <div>
                                <span className="font-bold block text-sm">
                                    Reordering Failed
                                </span>
                                <span className="text-xs text-rose-600 font-medium">
                                    {errorMessage}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Kanban Board Container */}
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start overflow-x-auto pb-4">
                            {columnOrder.map((colId) => {
                                const columnTasks = columns[colId];

                                return (
                                    <div
                                        key={colId}
                                        className="bg-slate-50/70 border border-slate-100 rounded-2xl p-4 flex flex-col min-w-[250px] max-h-[700px] overflow-y-auto"
                                    >
                                        {/* Column Header */}
                                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-150">
                                            <span className="font-bold text-sm text-slate-800">
                                                {columnTitles[colId]}
                                            </span>
                                            <span className="px-2 py-0.5 text-xs font-extrabold text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                {columnTasks.length}
                                            </span>
                                        </div>

                                        {/* Droppable Area */}
                                        <Droppable droppableId={colId}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className="flex-1 space-y-3 min-h-[150px]"
                                                >
                                                    {columnTasks.map(
                                                        (task, index) => (
                                                            <Draggable
                                                                key={task.id}
                                                                draggableId={task.id.toString()}
                                                                index={index}
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        onClick={() => setSelectedTask(task)}
                                                                        className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition duration-150 flex flex-col gap-3 group cursor-pointer"
                                                                    >
                                                                        {/* Card Label/Priority */}
                                                                        <div className="flex flex-col gap-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <span
                                                                                    className={`inline-flex px-2 py-0.5 border rounded text-[10px] font-bold capitalize ${getPriorityBadgeClass(
                                                                                        task.priority
                                                                                    )}`}
                                                                                >
                                                                                    {formatPriority(
                                                                                        task.priority
                                                                                    )}
                                                                                </span>
                                                                                <span className="text-[10px] text-slate-350 font-bold group-hover:text-slate-500 transition">
                                                                                    #{task.id}
                                                                                </span>
                                                                            </div>
                                                                            {task.labels && task.labels.length > 0 && (
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {task.labels.map(label => (
                                                                                        <span 
                                                                                            key={label.id}
                                                                                            className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm"
                                                                                            style={{ backgroundColor: label.color }}
                                                                                        >
                                                                                            {label.name}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Card Title & Desc */}
                                                                        <div className="space-y-1">
                                                                            <h4 className="font-bold text-sm text-slate-700 leading-snug break-words">
                                                                                {task.title}
                                                                            </h4>
                                                                            {task.description && (
                                                                                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed break-words">
                                                                                    {task.description}
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        {/* Card Footer: Deadline & Assignee */}
                                                                        <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1 text-[10px] font-bold text-slate-400">
                                                                            {task.deadline ? (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                                                    {new Date(
                                                                                        task.deadline
                                                                                    ).toLocaleDateString(
                                                                                        "id-ID",
                                                                                        {
                                                                                            month: "short",
                                                                                            day: "numeric",
                                                                                        }
                                                                                    )}
                                                                                </span>
                                                                            ) : (
                                                                                <span />
                                                                            )}

                                                                            {/* Assignee Avatar */}
                                                                            <div className="flex items-center gap-1">
                                                                                {task.assignee ? (
                                                                                    <div
                                                                                        className="flex items-center gap-1.5 hover:text-slate-600 transition"
                                                                                        title={`Assignee: ${task.assignee.name}`}
                                                                                    >
                                                                                        <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white uppercase ring-2 ring-white shadow-sm">
                                                                                            {task.assignee.name
                                                                                                .substring(
                                                                                                    0,
                                                                                                    2
                                                                                                )
                                                                                                .toUpperCase()}
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div
                                                                                        className="p-0.5 border border-dashed border-slate-300 rounded-full text-slate-400"
                                                                                        title="Unassigned"
                                                                                    >
                                                                                        <UserIcon className="w-3 h-3" />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </DragDropContext>
                </div>

                {/* Chat Panel */}
                {isChatOpen && (
                    <div className="w-full lg:w-80 h-[650px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between shrink-0 lg:sticky lg:top-8 animate-scale-in">
                        <div className="flex flex-col h-full justify-between overflow-hidden">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <h3 className="font-bold text-sm text-slate-800">Project Chat Room</h3>
                                </div>
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-650 rounded-lg transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Message Log */}
                            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
                                {chatMessages.length > 0 ? (
                                    chatMessages.map((msg) => {
                                        const isMe = msg.user_id === currentUser.id;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${
                                                    isMe ? "items-end" : "items-start"
                                                }`}
                                            >
                                                <span className="text-[10px] text-slate-400 font-bold mb-0.5">
                                                    {msg.user?.name || "Unknown"}
                                                </span>
                                                <div
                                                    className={`px-3 py-2 rounded-2xl max-w-[90%] break-words font-medium whitespace-pre-wrap ${
                                                        isMe
                                                            ? "bg-emerald-500 text-white rounded-tr-none shadow-sm"
                                                            : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-150"
                                                    }`}
                                                >
                                                    {renderChatMessage(msg.message, isMe)}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-center py-12">
                                        No messages yet.<br />Start the conversation!
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Send Input */}
                            <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 pt-3 relative">
                                {isMentioning && (
                                    <div className="absolute bottom-full mb-2 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-[60]">
                                        {safeUsers.filter((u: any) => u.name.toLowerCase().replace(/\s+/g, '').includes(mentionQuery.toLowerCase())).length > 0 ? (
                                            safeUsers.filter((u: any) => u.name.toLowerCase().replace(/\s+/g, '').includes(mentionQuery.toLowerCase())).slice(0, 5).map((u: any) => (
                                                <button
                                                    key={u.id}
                                                    type="button"
                                                    onClick={() => insertChatMention(u.name.replace(/\s+/g, ''))}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center gap-2 border-b border-slate-50 last:border-0"
                                                >
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-slate-700 truncate">{u.name}</span>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-xs text-slate-500 italic">No users found</div>
                                        )}
                                    </div>
                                )}
                                <input
                                    ref={chatInputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={handleChatChange}
                                    placeholder="Type a message... (@ to mention)"
                                    className="flex-1 text-xs border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl px-3 py-2"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={isSendingMessage || !newMessage.trim()}
                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition shadow-sm"
                                    title="Send Message"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>

            <TaskModal
                show={isCreateTaskOpen}
                onClose={() => setIsCreateTaskOpen(false)}
                project={project}
                users={safeUsers}
                defaultStatus="backlog"
            />

            <TaskDetailPanel
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                projectSlug={project.slug}
                allLabels={allLabels}
                allProjectTasks={allProjectTasks}
                users={safeUsers}
            />
        </AuthenticatedLayout>
    );
}
