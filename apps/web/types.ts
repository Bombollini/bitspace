
export enum UserRole {
  OWNER = 'OWNER',
  DEVELOPER = 'DEVELOPER',
  SUPERADMIN = 'SUPERADMIN'
}

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  stats?: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  assignee?: User;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user?: User;
  body: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}
