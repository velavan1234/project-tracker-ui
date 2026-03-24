// Advanced TypeScript Utility Functions and Helpers

import type { 
  Task, 
  User, 
  DeepPartial, 
  RequiredFields, 
  OptionalFields,
  TaskWithComputed,
  BaseEntity
} from '@/types';

// Type Guards
export const isTask = (item: any): item is Task => {
  return item && 
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.status === 'string' &&
    typeof item.priority === 'string' &&
    typeof item.assignee === 'object' &&
    item.assignee !== null &&
    item.dueDate instanceof Date;
};

export const isUser = (item: any): item is User => {
  return item &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.email === 'string' &&
    typeof item.initials === 'string' &&
    typeof item.color === 'string';
};

// Advanced Type Utilities
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
};

// Partial update utility with type safety
export const updateEntity = <T extends BaseEntity>(
  entity: T,
  updates: DeepPartial<T>
): T => {
  return {
    ...entity,
    ...updates,
    updatedAt: new Date(),
    id: entity.id // Ensure ID cannot be changed
  };
};

// Required fields utility
export const ensureRequiredFields = <T, K extends keyof T>(
  entity: T,
  requiredFields: K[]
): RequiredFields<T, K> => {
  const missingFields = requiredFields.filter(field => !entity[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return entity as RequiredFields<T, K>;
};

// Optional fields utility
export const withOptionalFields = <T, K extends keyof T>(
  entity: T,
  optionalFields: K[]
): OptionalFields<T, K> => {
  const result = { ...entity };
  optionalFields.forEach(field => {
    delete (result as any)[field];
  });
  return result as OptionalFields<T, K>;
};

// Task computation utilities
export const computeTaskProperties = (task: Omit<TaskWithComputed, 'isOverdue' | 'isCompleted' | 'progressPercentage' | 'timeRemaining'>): TaskWithComputed => {
  const now = new Date();
  const isOverdue = task.dueDate < now && task.status !== 'done';
  const isCompleted = task.status === 'done';
  
  // Calculate progress based on subtasks
  const progressPercentage = task.subtasks.length > 0 
    ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100
    : (task.status === 'done' ? 100 : task.status === 'in-review' ? 75 : task.status === 'in-progress' ? 50 : 0);
  
  // Calculate time remaining
  const timeRemaining = isCompleted ? null : Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    ...task,
    isOverdue,
    isCompleted,
    progressPercentage,
    timeRemaining
  };
};

// Array utilities with type safety
export const groupBy = <T, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal === undefined || aVal === null) return direction === 'asc' ? -1 : 1;
    if (bVal === undefined || bVal === null) return direction === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' 
        ? aVal - bVal
        : bVal - aVal;
    }
    
    if (aVal instanceof Date && bVal instanceof Date) {
      return direction === 'asc' 
        ? aVal.getTime() - bVal.getTime()
        : bVal.getTime() - aVal.getTime();
    }
    
    return 0;
  });
};

export const uniqueBy = <T, K extends keyof T>(
  array: T[],
  key: K
): T[] => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

// Search utilities with type safety
export const searchTasks = (
  tasks: Task[],
  query: string,
  fields: (keyof Task)[] = ['title', 'description']
): Task[] => {
  if (!query.trim()) return tasks;
  
  const lowercaseQuery = query.toLowerCase();
  
  return tasks.filter(task => 
    fields.some(field => {
      const value = task[field];
      return value && 
        typeof value === 'string' && 
        value.toLowerCase().includes(lowercaseQuery);
    })
  );
};

// Filter utilities with type safety
export const filterByDateRange = <T extends { dueDate?: Date }>(
  items: T[],
  fromDate?: Date | null,
  toDate?: Date | null
): T[] => {
  return items.filter(item => {
    if (!item.dueDate) return true;
    
    if (fromDate && item.dueDate < fromDate) return false;
    if (toDate && item.dueDate > toDate) return false;
    
    return true;
  });
};

export const filterByStatus = <T extends { status: string }>(
  items: T[],
  statuses: string[]
): T[] => {
  if (statuses.length === 0) return items;
  return items.filter(item => statuses.includes(item.status));
};

export const filterByPriority = <T extends { priority: string }>(
  items: T[],
  priorities: string[]
): T[] => {
  if (priorities.length === 0) return items;
  return items.filter(item => priorities.includes(item.priority));
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateTask = (task: Partial<Task>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!task.title || task.title.trim().length === 0) {
    errors.push('Task title is required');
  }
  
  if (task.title && task.title.length > 200) {
    errors.push('Task title must be less than 200 characters');
  }
  
  if (!task.assignee) {
    errors.push('Task assignee is required');
  }
  
  if (!task.dueDate) {
    errors.push('Due date is required');
  } else if (!(task.dueDate instanceof Date)) {
    errors.push('Due date must be a valid date');
  }
  
  if (!task.status) {
    errors.push('Task status is required');
  }
  
  if (!task.priority) {
    errors.push('Task priority is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUser = (user: Partial<User>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!user.name || user.name.trim().length === 0) {
    errors.push('User name is required');
  }
  
  if (!user.email || user.email.trim().length === 0) {
    errors.push('User email is required');
  } else if (!validateEmail(user.email)) {
    errors.push('User email is invalid');
  }
  
  if (!user.role) {
    errors.push('User role is required');
  }
  
  if (!user.department) {
    errors.push('User department is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const getContrastColor = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Date utilities
export const formatDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions,
    medium: { month: 'short', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions,
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' } as Intl.DateTimeFormatOptions
  }[format];
  
  return date.toLocaleDateString('en-US', options);
};

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

// String utilities
export const truncate = (str: string, maxLength: number, suffix: string = '...'): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - suffix.length) + suffix;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Error handling utilities
export class AppError extends Error {
  public code: string;
  public statusCode: number;
  
  constructor(
    message: string,
    code: string,
    statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR');
  }
  
  if (typeof error === 'string') {
    return new AppError(error, 'STRING_ERROR');
  }
  
  return new AppError('An unknown error occurred', 'UNKNOWN_ERROR');
};

// Async utilities
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
};

export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new AppError(timeoutMessage, 'TIMEOUT')), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
};

// Type assertion utilities
export const assertIsDefined = <T>(value: T): asserts value is NonNullable<T> => {
  if (value === undefined || value === null) {
    throw new AppError('Expected value to be defined', 'ASSERTION_ERROR');
  }
};

export const assertIsString = (value: unknown): asserts value is string => {
  if (typeof value !== 'string') {
    throw new AppError('Expected value to be a string', 'ASSERTION_ERROR');
  }
};

export const assertIsNumber = (value: unknown): asserts value is number => {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new AppError('Expected value to be a number', 'ASSERTION_ERROR');
  }
};

// Collection utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = <T>(arrays: T[][]): T[] => {
  return arrays.reduce((flat, arr) => flat.concat(arr), []);
};

export const intersection = <T>(arrays: T[][]): T[] => {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0];
  
  return arrays.reduce((result, array) => 
    result.filter(item => array.includes(item))
  );
};

export const difference = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter(item => !array2.includes(item));
};

// Random utilities
export const randomId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const randomColor = (): string => {
  const colors = [
    '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', 
    '#F59E0B', '#EF4444', '#6B7280', '#84CC16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Export all utilities as a single object for convenience
export const tsHelpers = {
  // Type guards
  isTask,
  isUser,
  
  // Type utilities
  deepClone,
  updateEntity,
  ensureRequiredFields,
  withOptionalFields,
  computeTaskProperties,
  
  // Array utilities
  groupBy,
  sortBy,
  uniqueBy,
  searchTasks,
  filterByDateRange,
  filterByStatus,
  filterByPriority,
  
  // Validation
  validateEmail,
  validateTask,
  validateUser,
  
  // Performance
  debounce,
  throttle,
  memoize,
  
  // Color utilities
  hexToRgb,
  getContrastColor,
  
  // Date utilities
  formatDate,
  getRelativeTime,
  
  // String utilities
  truncate,
  slugify,
  
  // Error handling
  AppError,
  handleError,
  
  // Async utilities
  withRetry,
  withTimeout,
  
  // Type assertions
  assertIsDefined,
  assertIsString,
  assertIsNumber,
  
  // Collection utilities
  chunk,
  flatten,
  intersection,
  difference,
  
  // Random utilities
  randomId,
  randomColor,
  randomBetween
};
