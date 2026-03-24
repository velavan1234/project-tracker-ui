import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Task, 
  TaskStatus, 
  Filters, 
  ViewType, 
  SortConfig, 
  ActiveUser,
  TaskEvent,
  PerformanceMetrics
} from '@/types';

// Simplified enhanced store interface
interface EnhancedTaskState {
  // Data
  tasks: Task[];
  activeUsers: ActiveUser[];
  taskHistory: TaskEvent[];
  performanceMetrics: PerformanceMetrics;
  
  // View State
  currentView: ViewType;
  
  // Filter State
  filters: Filters;
  
  // Sort State
  sortConfig: SortConfig;
  
  // Drag State
  draggedTaskId: string | null;
  dragOverColumn: TaskStatus | null;
  
  // UI State
  sidebarOpen: boolean;
  selectedTask: Task | null;
  isTaskModalOpen: boolean;
  isFilterModalOpen: boolean;
  searchQuery: string;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  
  // Filter Actions
  setFilters: (filters: Filters) => void;
  clearFilters: () => void;
  
  // Sort Actions
  setSortConfig: (config: SortConfig) => void;
  toggleSort: (field: SortConfig['field']) => void;
  
  // Task Actions
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  
  // Drag Actions
  setDraggedTaskId: (taskId: string | null) => void;
  setDragOverColumn: (column: TaskStatus | null) => void;
  
  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setSelectedTask: (task: Task | null) => void;
  setTaskModalOpen: (open: boolean) => void;
  setFilterModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  
  // Selectors
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTaskById: (id: string) => Task | undefined;
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

const initialPerformanceMetrics: PerformanceMetrics = {
  renderTime: 0,
  loadTime: 0,
  memoryUsage: 0,
  networkRequests: 0,
  errorCount: 0,
};

// Initialize active users with required properties
const initializeActiveUsers = (): ActiveUser[] => {
  return [
    {
      id: 'user1',
      name: 'Alex Chen',
      initials: 'AC',
      color: '#8B5CF6',
      currentTaskId: null,
      status: 'online',
      lastActivity: new Date(),
      isTyping: false,
    },
    {
      id: 'user2',
      name: 'Sarah Johnson',
      initials: 'SJ',
      color: '#EC4899',
      currentTaskId: null,
      status: 'online',
      lastActivity: new Date(),
      isTyping: false,
    },
  ];
};

export const useEnhancedTaskStore = create<EnhancedTaskState>()(
  persist(
    (set, get) => ({
      // Initial State
      tasks: [],
      activeUsers: initializeActiveUsers(),
      taskHistory: [],
      performanceMetrics: initialPerformanceMetrics,
      currentView: 'kanban',
      filters: initialFilters,
      sortConfig: initialSortConfig,
      draggedTaskId: null,
      dragOverColumn: null,
      sidebarOpen: true,
      selectedTask: null,
      isTaskModalOpen: false,
      isFilterModalOpen: false,
      searchQuery: '',

      // View Actions
      setCurrentView: (view) => set({ currentView: view }),

      // Filter Actions
      setFilters: (filters) => set({ filters }),
      clearFilters: () => set({ filters: initialFilters }),

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
        tasks: state.tasks.map((task: Task) =>
          task.id === taskId 
            ? { ...task, status: newStatus, startDate: task.startDate || new Date() }
            : task
        )
      })),

      // Drag Actions
      setDraggedTaskId: (taskId) => set({ draggedTaskId: taskId }),
      setDragOverColumn: (column) => set({ dragOverColumn: column }),

      // UI Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSelectedTask: (task) => set({ selectedTask: task }),
      setTaskModalOpen: (open) => set({ isTaskModalOpen: open }),
      setFilterModalOpen: (open) => set({ isFilterModalOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query, filters: { ...get().filters, search: query } }),

      // Selectors
      getFilteredTasks: () => {
        const { tasks, filters } = get();
        return tasks.filter((task: Task) => {
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

          // Tags filter
          if (filters.tags.length > 0 && !filters.tags.some(tag => task.tags.includes(tag))) {
            return false;
          }
          
          // Search filter
          if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
          }
          
          return true;
        });
      },

      getTasksByStatus: (status) => {
        const filteredTasks = get().getFilteredTasks();
        return filteredTasks.filter((task: Task) => task.status === status);
      },

      getTaskById: (id) => {
        return get().tasks.find((task: Task) => task.id === id);
      },
    }),
    {
      name: 'enhanced-task-store',
      partialize: (state) => ({ 
        currentView: state.currentView,
        filters: state.filters,
        sortConfig: state.sortConfig,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
