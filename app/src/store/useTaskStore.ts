import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Task, 
  TaskStatus, 
  Filters, 
  ViewType, 
  SortConfig, 
  ActiveUser,
  TaskPriority 
} from '@/types';
import { SEED_TASKS, ACTIVE_USERS } from '@/lib/dataGenerator';

interface TaskState {
  // Data
  tasks: Task[];
  activeUsers: ActiveUser[];
  
  // View State
  currentView: ViewType;
  
  // Filter State
  filters: Filters;
  
  // Sort State (for list view)
  sortConfig: SortConfig;
  
  // Drag State
  draggedTaskId: string | null;
  dragOverColumn: TaskStatus | null;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  
  // Filter Actions
  setStatusFilter: (status: TaskStatus[]) => void;
  setPriorityFilter: (priority: TaskPriority[]) => void;
  setAssigneeFilter: (assignee: string[]) => void;
  setDueDateFromFilter: (date: Date | null) => void;
  setDueDateToFilter: (date: Date | null) => void;
  clearFilters: () => void;
  setFilters: (filters: Filters) => void;
  
  // Sort Actions
  setSortConfig: (config: SortConfig) => void;
  toggleSort: (field: SortConfig['field']) => void;
  
  // Task Actions
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  
  // Drag Actions
  setDraggedTaskId: (taskId: string | null) => void;
  setDragOverColumn: (column: TaskStatus | null) => void;
  
  // Collaboration Actions
  updateActiveUserTask: (userId: string, taskId: string | null) => void;
  
  // Selectors
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getSortedTasks: () => Task[];
}

const initialFilters: Filters = {
  status: [],
  priority: [],
  assignee: [],
  dueDateFrom: null,
  dueDateTo: null,
  tags: [],
  search: '',
};

const initialSortConfig: SortConfig = {
  field: 'dueDate',
  direction: 'asc',
};

// Initialize active users with random task assignments
const initializeActiveUsers = (): ActiveUser[] => {
  return ACTIVE_USERS.map(user => ({
    ...user,
    currentTaskId: SEED_TASKS[Math.floor(Math.random() * SEED_TASKS.length)].id,
    status: 'online' as const,
    lastActivity: new Date(),
    isTyping: false,
  }));
};

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: SEED_TASKS,
      activeUsers: initializeActiveUsers(),
      currentView: 'kanban',
      filters: initialFilters,
      sortConfig: initialSortConfig,
      draggedTaskId: null,
      dragOverColumn: null,

      // View Actions
      setCurrentView: (view) => set({ currentView: view }),

      // Filter Actions
      setStatusFilter: (status) => set((state) => ({
        filters: { ...state.filters, status }
      })),
      
      setPriorityFilter: (priority) => set((state) => ({
        filters: { ...state.filters, priority }
      })),
      
      setAssigneeFilter: (assignee) => set((state) => ({
        filters: { ...state.filters, assignee }
      })),
      
      setDueDateFromFilter: (date) => set((state) => ({
        filters: { ...state.filters, dueDateFrom: date }
      })),
      
      setDueDateToFilter: (date) => set((state) => ({
        filters: { ...state.filters, dueDateTo: date }
      })),
      
      clearFilters: () => set({ filters: initialFilters }),
      
      setFilters: (filters) => set({ filters }),

      // Sort Actions
      setSortConfig: (config) => set({ sortConfig: config }),
      
      toggleSort: (field) => set((state) => ({
        sortConfig: {
          field,
          direction: state.sortConfig.field === field && state.sortConfig.direction === 'asc' 
            ? 'desc' 
            : 'asc',
        }
      })),

      // Task Actions
      updateTaskStatus: (taskId, newStatus) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === taskId 
            ? { ...task, status: newStatus, startDate: task.startDate || new Date() }
            : task
        )
      })),

      // Drag Actions
      setDraggedTaskId: (taskId) => set({ draggedTaskId: taskId }),
      setDragOverColumn: (column) => set({ dragOverColumn: column }),

      // Collaboration Actions
      updateActiveUserTask: (userId, taskId) => set((state) => ({
        activeUsers: state.activeUsers.map(user =>
          user.id === userId ? { ...user, currentTaskId: taskId } : user
        )
      })),

      // Selectors
      getFilteredTasks: () => {
        const { tasks, filters } = get();
        return tasks.filter(task => {
          // Status filter
          if (filters.status.length > 0 && !filters.status.includes(task.status)) {
            return false;
          }
          
          // Priority filter
          if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
            return false;
          }
          
          // Assignee filter
          if (filters.assignee.length > 0 && !filters.assignee.includes(task.assignee.id)) {
            return false;
          }
          
          // Due date from filter
          if (filters.dueDateFrom && task.dueDate < filters.dueDateFrom) {
            return false;
          }
          
          // Due date to filter
          if (filters.dueDateTo && task.dueDate > filters.dueDateTo) {
            return false;
          }
          
          return true;
        });
      },

      getTasksByStatus: (status) => {
        const filteredTasks = get().getFilteredTasks();
        return filteredTasks.filter(task => task.status === status);
      },

      getSortedTasks: () => {
        const filteredTasks = get().getFilteredTasks();
        const { sortConfig } = get();
        
        return [...filteredTasks].sort((a, b) => {
          let comparison = 0;
          
          switch (sortConfig.field) {
            case 'title':
              comparison = a.title.localeCompare(b.title);
              break;
            case 'priority': {
              const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
              comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
              break;
            }
            case 'dueDate':
              comparison = a.dueDate.getTime() - b.dueDate.getTime();
              break;
          }
          
          return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
      },
    }),
    {
      name: 'task-store',
      partialize: (state) => ({ 
        currentView: state.currentView,
        filters: state.filters,
        sortConfig: state.sortConfig,
      }),
    }
  )
);
