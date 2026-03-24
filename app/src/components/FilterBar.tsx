import { useEffect } from 'react';
import type { TaskStatus, TaskPriority } from '@/types';
import { COLUMNS, PRIORITIES } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';

export function FilterBar() {
  const { 
    filters, 
    setStatusFilter, 
    setPriorityFilter, 
    setAssigneeFilter,
    setDueDateFromFilter,
    setDueDateToFilter,
    clearFilters,
    tasks 
  } = useTaskStore();

  // Sync filters with URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Parse URL params and set filters
    const statusParam = urlParams.get('status');
    const priorityParam = urlParams.get('priority');
    const assigneeParam = urlParams.get('assignee');
    const dueDateFromParam = urlParams.get('dueDateFrom');
    const dueDateToParam = urlParams.get('dueDateTo');

    if (statusParam) setStatusFilter(statusParam.split(',') as TaskStatus[]);
    if (priorityParam) setPriorityFilter(priorityParam.split(',') as TaskPriority[]);
    if (assigneeParam) setAssigneeFilter(assigneeParam.split(','));
    if (dueDateFromParam) setDueDateFromFilter(new Date(dueDateFromParam));
    if (dueDateToParam) setDueDateToFilter(new Date(dueDateToParam));
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const urlParams = new URLSearchParams();
    
    if (filters.status.length > 0) urlParams.set('status', filters.status.join(','));
    if (filters.priority.length > 0) urlParams.set('priority', filters.priority.join(','));
    if (filters.assignee.length > 0) urlParams.set('assignee', filters.assignee.join(','));
    if (filters.dueDateFrom) urlParams.set('dueDateFrom', filters.dueDateFrom.toISOString().split('T')[0]);
    if (filters.dueDateTo) urlParams.set('dueDateTo', filters.dueDateTo.toISOString().split('T')[0]);

    const newUrl = urlParams.toString() 
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;
    
    window.history.replaceState({}, '', newUrl);
  }, [filters]);

  // Handle popstate (back button)
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      const statusParam = urlParams.get('status');
      const priorityParam = urlParams.get('priority');
      const assigneeParam = urlParams.get('assignee');
      const dueDateFromParam = urlParams.get('dueDateFrom');
      const dueDateToParam = urlParams.get('dueDateTo');

      // Reset filters first
      clearFilters();

      // Then apply URL params
      if (statusParam) setStatusFilter(statusParam.split(',') as TaskStatus[]);
      if (priorityParam) setPriorityFilter(priorityParam.split(',') as TaskPriority[]);
      if (assigneeParam) setAssigneeFilter(assigneeParam.split(','));
      if (dueDateFromParam) setDueDateFromFilter(new Date(dueDateFromParam));
      if (dueDateToParam) setDueDateToFilter(new Date(dueDateToParam));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const hasActiveFilters = 
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    filters.dueDateFrom !== null ||
    filters.dueDateTo !== null;

  // Get unique assignees from tasks
  const uniqueAssignees = Array.from(new Map(tasks.map(t => [t.assignee.id, t.assignee])).values());

  const toggleStatus = (status: TaskStatus) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setStatusFilter(newStatus);
  };

  const togglePriority = (priority: TaskPriority) => {
    const newPriority = filters.priority.includes(priority)
      ? filters.priority.filter(p => p !== priority)
      : [...filters.priority, priority];
    setPriorityFilter(newPriority);
  };

  const toggleAssignee = (assigneeId: string) => {
    const newAssignee = filters.assignee.includes(assigneeId)
      ? filters.assignee.filter(a => a !== assigneeId)
      : [...filters.assignee, assigneeId];
    setAssigneeFilter(newAssignee);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex gap-1">
            {COLUMNS.map(column => (
              <button
                key={column.id}
                onClick={() => toggleStatus(column.id)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                  ${filters.status.includes(column.id)
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {column.title}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Priority:</span>
          <div className="flex gap-1">
            {PRIORITIES.map(priority => (
              <button
                key={priority.id}
                onClick={() => togglePriority(priority.id)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                  ${filters.priority.includes(priority.id)
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
                style={filters.priority.includes(priority.id) ? { backgroundColor: priority.color } : {}}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Assignee:</span>
          <select
            multiple
            value={filters.assignee}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, opt => opt.value);
              setAssigneeFilter(selected);
            }}
            className="hidden"
          />
          <div className="flex gap-1">
            {uniqueAssignees.slice(0, 4).map(assignee => (
              <button
                key={assignee.id}
                onClick={() => toggleAssignee(assignee.id)}
                className={`
                  w-8 h-8 rounded-full text-xs font-semibold text-white transition-all
                  ${filters.assignee.includes(assignee.id)
                    ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                    : 'opacity-60 hover:opacity-100'
                  }
                `}
                style={{ backgroundColor: assignee.color }}
                title={assignee.name}
              >
                {assignee.initials}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Due:</span>
          <input
            type="date"
            value={filters.dueDateFrom ? filters.dueDateFrom.toISOString().split('T')[0] : ''}
            onChange={(e) => setDueDateFromFilter(e.target.value ? new Date(e.target.value) : null)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="From"
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            value={filters.dueDateTo ? filters.dueDateTo.toISOString().split('T')[0] : ''}
            onChange={(e) => setDueDateToFilter(e.target.value ? new Date(e.target.value) : null)}
            className="px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="To"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-auto px-4 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
