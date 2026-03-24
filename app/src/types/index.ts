// Advanced TypeScript Types with Generics and Utility Types

// Base entity interface with common fields
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Task Types with discriminated unions
export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// Task status progression rules
export const TASK_STATUS_FLOW: Record<TaskStatus, TaskStatus[]> = {
  'todo': ['in-progress'],
  'in-progress': ['in-review', 'todo'],
  'in-review': ['done', 'in-progress'],
  'done': ['in-review']
} as const;

// Advanced Task interface with computed properties
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: User;
  startDate: Date | null;
  dueDate: Date;
  tags: string[];
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[]; // task IDs
  comments: Comment[];
  attachments: Attachment[];
  subtasks: Subtask[];
  
  // Computed properties (derived)
  isOverdue: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  timeRemaining: number | null; // days
}

// Comment interface
export interface Comment extends BaseEntity {
  taskId: string;
  userId: string;
  content: string;
  mentions: string[]; // user IDs
  reactions: CommentReaction[];
}

// Comment reaction
export interface CommentReaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

// Attachment interface
export interface Attachment extends BaseEntity {
  taskId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
}

// Subtask interface
export interface Subtask extends BaseEntity {
  parentTaskId: string;
  title: string;
  completed: boolean;
  assignee?: string;
}

// Enhanced User Types with roles and permissions
export interface User extends BaseEntity {
  name: string;
  email: string;
  initials: string;
  avatar?: string;
  color: string;
  role: UserRole;
  department: Department;
  permissions: Permission[];
  isActive: boolean;
  lastActive: Date;
  stats: UserStats;
}

// User roles with permission levels
export type UserRole = 'admin' | 'manager' | 'lead' | 'developer' | 'designer' | 'tester';

// Departments
export type Department = 'engineering' | 'design' | 'product' | 'marketing' | 'sales' | 'hr';

// Permission system
export type Permission = 
  | 'view_tasks'
  | 'create_tasks'
  | 'edit_tasks'
  | 'delete_tasks'
  | 'assign_tasks'
  | 'manage_users'
  | 'view_reports'
  | 'manage_projects';

// User statistics
export interface UserStats {
  tasksCompleted: number;
  tasksInProgress: number;
  averageCompletionTime: number; // days
  onTimeCompletionRate: number; // percentage
}

// Enhanced Collaboration Types
export interface ActiveUser {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  color: string;
  currentTaskId: string | null;
  status: UserStatus;
  lastActivity: Date;
  isTyping: boolean;
  currentAction?: UserAction;
}

// User status
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

// User actions for real-time collaboration
export type UserAction = 
  | { type: 'viewing'; taskId: string }
  | { type: 'editing'; taskId: string }
  | { type: 'commenting'; taskId: string }
  | { type: 'dragging'; taskId: string; fromColumn: TaskStatus; toColumn: TaskStatus };

// Advanced Filter Types with nested conditions
export interface FilterCondition<T = any> {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
  value: any;
}

export interface FilterGroup<T = any> {
  conditions: FilterCondition<T>[];
  logic: 'and' | 'or';
}

export interface AdvancedFilters<T = Task> {
  groups: FilterGroup<T>[];
  globalLogic: 'and' | 'or';
}

// Legacy filters for backward compatibility
export interface Filters {
  status: TaskStatus[];
  priority: TaskPriority[];
  assignee: string[];
  dueDateFrom: Date | null;
  dueDateTo: Date | null;
  tags: string[];
  search: string;
}

// Enhanced View Types with configurations
export type ViewType = 'kanban' | 'list' | 'timeline' | 'calendar' | 'board' | 'gantt';

export interface ViewConfig {
  type: ViewType;
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  createdBy: string;
  filters: AdvancedFilters;
  sortBy: SortField;
  sortDirection: SortDirection;
  groupBy?: string;
  columns: string[];
  pageSize: number;
}

// Enhanced Sort Types
export type SortField = keyof Task | 'assignee.name' | 'priority.value';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
  multiSort?: { field: SortField; direction: SortDirection }[];
}

// Advanced Drag and Drop Types
export interface DragItem<T = Task> {
  itemType: 'task' | 'column' | 'user';
  itemId: string;
  sourceColumn?: TaskStatus;
  targetColumn?: TaskStatus;
  originalIndex: number;
  data: T;
}

export interface DropZone {
  columnId: TaskStatus;
  index: number;
  accepts: string[];
}

// Virtual Scroll Types with performance optimizations
export interface VirtualScrollConfig {
  itemHeight: number;
  bufferSize: number;
  containerHeight: number;
  overscan: number;
  getItemKey?: (index: number, data: any[]) => string | number;
}

// Advanced Column Configuration
export interface ColumnConfig {
  id: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  width: number;
  minWidth: number;
  maxWidth: number;
  isSortable: boolean;
  isFilterable: boolean;
  isResizable: boolean;
  isHidden: boolean;
}

export const COLUMNS: ColumnConfig[] = [
  { 
    id: 'todo', 
    title: 'To Do', 
    color: '#6B7280', 
    bgColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    width: 350,
    minWidth: 250,
    maxWidth: 500,
    isSortable: true,
    isFilterable: true,
    isResizable: true,
    isHidden: false
  },
  { 
    id: 'in-progress', 
    title: 'In Progress', 
    color: '#3B82F6', 
    bgColor: '#EFF6FF',
    borderColor: '#DBEAFE',
    width: 350,
    minWidth: 250,
    maxWidth: 500,
    isSortable: true,
    isFilterable: true,
    isResizable: true,
    isHidden: false
  },
  { 
    id: 'in-review', 
    title: 'In Review', 
    color: '#F59E0B', 
    bgColor: '#FFFBEB',
    borderColor: '#FED7AA',
    width: 350,
    minWidth: 250,
    maxWidth: 500,
    isSortable: true,
    isFilterable: true,
    isResizable: true,
    isHidden: false
  },
  { 
    id: 'done', 
    title: 'Done', 
    color: '#10B981', 
    bgColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    width: 350,
    minWidth: 250,
    maxWidth: 500,
    isSortable: true,
    isFilterable: true,
    isResizable: true,
    isHidden: false
  },
];

// Enhanced Priority Configuration
export interface PriorityConfig {
  id: TaskPriority;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  value: number;
  icon: string;
  description: string;
}

export const PRIORITIES: PriorityConfig[] = [
  { 
    id: 'low', 
    label: 'Low', 
    color: '#6B7280', 
    bgColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    value: 1, 
    icon: '↓',
    description: 'Low priority - can be deferred'
  },
  { 
    id: 'medium', 
    label: 'Medium', 
    color: '#3B82F6', 
    bgColor: '#DBEAFE',
    borderColor: '#93C5FD',
    value: 2, 
    icon: '→',
    description: 'Medium priority - normal workflow'
  },
  { 
    id: 'high', 
    label: 'High', 
    color: '#F59E0B', 
    bgColor: '#FEF3C7',
    borderColor: '#FCD34D',
    value: 3, 
    icon: '↑',
    description: 'High priority - urgent attention needed'
  },
  { 
    id: 'critical', 
    label: 'Critical', 
    color: '#EF4444', 
    bgColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    value: 4, 
    icon: '⚡',
    description: 'Critical - immediate action required'
  },
];

// Advanced User pool with enhanced properties
export const USER_POOL: Omit<User, keyof BaseEntity | 'id'>[] = [
  { 
    name: 'Alex Chen', 
    email: 'alex@velozity.com', 
    initials: 'AC', 
    color: '#8B5CF6',
    role: 'developer',
    department: 'engineering',
    permissions: ['view_tasks', 'create_tasks', 'edit_tasks'],
    isActive: true,
    lastActive: new Date(),
    stats: {
      tasksCompleted: 42,
      tasksInProgress: 3,
      averageCompletionTime: 2.5,
      onTimeCompletionRate: 0.85
    }
  },
  { 
    name: 'Sarah Johnson', 
    email: 'sarah@velozity.com', 
    initials: 'SJ', 
    color: '#EC4899',
    role: 'manager',
    department: 'engineering',
    permissions: ['view_tasks', 'create_tasks', 'edit_tasks', 'assign_tasks', 'manage_users'],
    isActive: true,
    lastActive: new Date(),
    stats: {
      tasksCompleted: 67,
      tasksInProgress: 5,
      averageCompletionTime: 1.8,
      onTimeCompletionRate: 0.92
    }
  },
  { 
    name: 'Mike Rodriguez', 
    email: 'mike@velozity.com', 
    initials: 'MR', 
    color: '#3B82F6',
    role: 'lead',
    department: 'engineering',
    permissions: ['view_tasks', 'create_tasks', 'edit_tasks', 'assign_tasks'],
    isActive: true,
    lastActive: new Date(),
    stats: {
      tasksCompleted: 89,
      tasksInProgress: 4,
      averageCompletionTime: 2.1,
      onTimeCompletionRate: 0.88
    }
  },
  { 
    name: 'Emily Davis', 
    email: 'emily@velozity.com', 
    initials: 'ED', 
    color: '#10B981',
    role: 'designer',
    department: 'design',
    permissions: ['view_tasks', 'create_tasks', 'edit_tasks'],
    isActive: true,
    lastActive: new Date(),
    stats: {
      tasksCompleted: 35,
      tasksInProgress: 2,
      averageCompletionTime: 3.2,
      onTimeCompletionRate: 0.79
    }
  },
  { 
    name: 'James Wilson', 
    email: 'james@velozity.com', 
    initials: 'JW', 
    color: '#F59E0B',
    role: 'tester',
    department: 'engineering',
    permissions: ['view_tasks', 'create_tasks', 'edit_tasks'],
    isActive: false,
    lastActive: new Date(Date.now() - 86400000),
    stats: {
      tasksCompleted: 28,
      tasksInProgress: 1,
      averageCompletionTime: 1.5,
      onTimeCompletionRate: 0.95
    }
  },
  { 
    name: 'Lisa Park', 
    email: 'lisa@velozity.com', 
    initials: 'LP', 
    color: '#EF4444',
    role: 'admin',
    department: 'hr',
    permissions: ['view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks', 'manage_users', 'view_reports'],
    isActive: true,
    lastActive: new Date(),
    stats: {
      tasksCompleted: 156,
      tasksInProgress: 8,
      averageCompletionTime: 1.2,
      onTimeCompletionRate: 0.98
    }
  },
];

// Enhanced collaboration colors with themes
export const COLLAB_COLORS = {
  primary: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
  secondary: ['#A78BFA', '#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#F87171'],
  pastel: ['#DDD6FE', '#FCE7F3', '#DBEAFE', '#D1FAE5', '#FEF3C7', '#FEE2E2'],
  dark: ['#6D28D9', '#BE185D', '#2563EB', '#059669', '#D97706', '#DC2626']
} as const;

// Advanced TypeScript Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type TaskWithComputed = Omit<Task, 'isOverdue' | 'isCompleted' | 'progressPercentage' | 'timeRemaining'> & {
  isOverdue: boolean;
  isCompleted: boolean;
  progressPercentage: number;
  timeRemaining: number | null;
};

// Generic store state type
export interface StoreState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  selected: T | null;
  filters: Record<string, any>;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// Event types for real-time updates
export interface TaskEvent {
  type: 'created' | 'updated' | 'deleted' | 'assigned' | 'status_changed' | 'comment_added';
  taskId: string;
  userId: string;
  timestamp: Date;
  data: Partial<Task>;
}

export interface UserEvent {
  type: 'online' | 'offline' | 'typing' | 'viewing' | 'editing';
  userId: string;
  timestamp: Date;
  data?: any;
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number;
  loadTime: number;
  memoryUsage: number;
  networkRequests: number;
  errorCount: number;
}

// Theme and styling types
export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}
