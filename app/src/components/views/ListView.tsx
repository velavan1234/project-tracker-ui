import { useRef, useEffect, useState, useCallback } from 'react';
import type { Task, TaskStatus, SortField, SortConfig } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { DueDate } from '@/components/ui/DueDate';
import { Dropdown } from '@/components/ui/Dropdown';

const ITEM_HEIGHT = 64; // Height of each row in pixels
const BUFFER_SIZE = 5; // Number of rows to render above and below viewport

interface ListRowProps {
  task: Task;
  style: React.CSSProperties;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

function ListRow({ task, style, onStatusChange }: ListRowProps) {
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'in-review', label: 'In Review' },
    { value: 'done', label: 'Done' },
  ];

  return (
    <div
      style={style}
      className="flex items-center px-6 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
    >
      {/* Title */}
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
      </div>

      {/* Status */}
      <div className="w-36 px-2">
        <Dropdown
          options={statusOptions}
          value={task.status}
          onChange={(value) => onStatusChange(task.id, value as TaskStatus)}
          className="w-full"
        />
      </div>

      {/* Priority */}
      <div className="w-28 px-2">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Assignee */}
      <div className="w-40 px-2 flex items-center gap-2">
        <UserAvatar
          initials={task.assignee.initials}
          color={task.assignee.color}
          size="sm"
          title={task.assignee.name}
        />
        <span className="text-sm text-gray-600 truncate">{task.assignee.name}</span>
      </div>

      {/* Due Date */}
      <div className="w-32 px-2 text-right">
        <DueDate date={task.dueDate} />
      </div>
    </div>
  );
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentSort: SortConfig;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortHeader({ label, field, currentSort, onSort, className = '' }: SortHeaderProps) {
  const isActive = currentSort.field === field;
  
  return (
    <button
      onClick={() => onSort(field)}
      className={`
        flex items-center gap-1 font-medium text-sm text-gray-700 hover:text-gray-900
        focus:outline-none ${className}
      `}
    >
      {label}
      <span className="inline-flex flex-col">
        <svg
          className={`w-3 h-3 -mb-1 ${isActive && currentSort.direction === 'asc' ? 'text-gray-900' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        <svg
          className={`w-3 h-3 ${isActive && currentSort.direction === 'desc' ? 'text-gray-900' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </span>
    </button>
  );
}

export function ListView() {
  const { getSortedTasks, updateTaskStatus, sortConfig, toggleSort, clearFilters } = useTaskStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const tasks = getSortedTasks();

  // Update container height on mount and resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT) + 2 * BUFFER_SIZE;
  const endIndex = Math.min(tasks.length, startIndex + visibleCount);
  const visibleTasks = tasks.slice(startIndex, endIndex);

  // Total height for scroll area
  const totalHeight = tasks.length * ITEM_HEIGHT;
  const offsetY = startIndex * ITEM_HEIGHT;

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
        <p className="text-sm text-gray-500 mb-4">Try adjusting your filters to see more results.</p>
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Table Header */}
      <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex-1 pr-4">
          <SortHeader
            label="Title"
            field="title"
            currentSort={sortConfig}
            onSort={toggleSort}
          />
        </div>
        <div className="w-36 px-2">
          <span className="font-medium text-sm text-gray-700">Status</span>
        </div>
        <div className="w-28 px-2">
          <SortHeader
            label="Priority"
            field="priority"
            currentSort={sortConfig}
            onSort={toggleSort}
          />
        </div>
        <div className="w-40 px-2">
          <span className="font-medium text-sm text-gray-700">Assignee</span>
        </div>
        <div className="w-32 px-2 text-right">
          <SortHeader
            label="Due Date"
            field="dueDate"
            currentSort={sortConfig}
            onSort={toggleSort}
            className="justify-end"
          />
        </div>
      </div>

      {/* Virtual Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto"
        style={{ height: 'calc(100vh - 280px)' }}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleTasks.map((task) => (
              <ListRow
                key={task.id}
                task={task}
                style={{ height: ITEM_HEIGHT }}
                onStatusChange={updateTaskStatus}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        Showing {tasks.length} tasks
      </div>
    </div>
  );
}
