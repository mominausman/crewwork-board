export type UserRole = "admin" | "manager" | "member";

export type TaskStatus = "pending" | "in-progress" | "completed";

export type TaskPriority = "high" | "medium" | "low";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  deadline: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: "task-created" | "task-updated" | "task-completed" | "deadline-approaching";
  read: boolean;
  createdAt: string;
}
