
import { User, UserRole, Project, Task, TaskStatus, TaskPriority, Activity, Comment } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', role: UserRole.OWNER, avatarUrl: 'https://picsum.photos/seed/john/100/100' },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: UserRole.DEVELOPER, avatarUrl: 'https://picsum.photos/seed/jane/100/100' },
  { id: 'u3', name: 'Super Admin', email: 'admin@example.com', role: UserRole.SUPERADMIN, avatarUrl: 'https://picsum.photos/seed/admin/100/100' },
];

export const mockProjects: Project[] = [
  { 
    id: 'p1', 
    name: 'Apollo Rebuild', 
    description: 'Modernizing the legacy Apollo platform with a React frontend and NestJS backend.', 
    ownerId: 'u1', 
    createdAt: '2023-10-01',
    stats: { totalTasks: 12, completedTasks: 4, overdueTasks: 1 }
  },
  { 
    id: 'p2', 
    name: 'Customer CRM', 
    description: 'Building internal tool for managing lead conversions.', 
    ownerId: 'u1', 
    createdAt: '2023-11-15',
    stats: { totalTasks: 8, completedTasks: 6, overdueTasks: 0 }
  },
];

export const mockTasks: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Initialize project structure',
    description: 'Setup monorepo and shared types.',
    status: TaskStatus.DONE,
    priority: TaskPriority.HIGH,
    dueDate: '2023-12-01',
    assigneeId: 'u2',
    assignee: mockUsers[1]
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Implement Auth logic',
    description: 'Add JWT strategy and refresh token support.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.URGENT,
    dueDate: '2023-12-10',
    assigneeId: 'u2',
    assignee: mockUsers[1]
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Design Dashboard UI',
    description: 'Create wireframes for the main dashboard view.',
    status: TaskStatus.REVIEW,
    priority: TaskPriority.MEDIUM,
    dueDate: '2023-12-15',
    assigneeId: 'u1',
    assignee: mockUsers[0]
  },
  {
    id: 't4',
    projectId: 'p1',
    title: 'Configure DB Migrations',
    description: 'Setup TypeORM migrations for Postgres.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    dueDate: '2024-01-05',
    assigneeId: 'u3',
    assignee: mockUsers[2]
  }
];

export const mockActivities: Activity[] = [
  { id: 'a1', projectId: 'p1', userId: 'u1', action: 'created task', targetType: 'Task', targetId: 't4', createdAt: '2023-12-01T10:00:00Z' },
  { id: 'a2', projectId: 'p1', userId: 'u2', action: 'moved task to In Progress', targetType: 'Task', targetId: 't2', createdAt: '2023-12-02T14:30:00Z' },
];

export const mockComments: Comment[] = [
  { id: 'c1', taskId: 't2', userId: 'u1', user: mockUsers[0], body: 'Make sure to handle the 401 interceptor properly.', createdAt: '2023-12-02T15:00:00Z' }
];
