import { useState, useRef, useEffect, useCallback } from 'react';
import type { Task, TaskStatus } from '@/types';
import type { ActiveUser } from '@/types';
import { COLUMNS } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { UserAvatar, StackedUserAvatars } from '@/components/ui/UserAvatar';
import { DueDate } from '@/components/ui/DueDate';

interface DragState {
  taskId: string;
  sourceColumn: TaskStatus;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  isSnappingBack: boolean;
}

interface KanbanCardProps {
  task: Task;
  activeUsers: ActiveUser[];
  dragState: DragState | null;
  onPointerDown: (e: React.PointerEvent, task: Task, ref: React.RefObject<HTMLDivElement | null>) => void;
}

function KanbanCard({ task, activeUsers, dragState, onPointerDown }: KanbanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Get active users on this task
  const usersOnTask = activeUsers.filter(u => u.currentTaskId === task.id);

  const isDragging = dragState?.taskId === task.id;
  const isSnappingBack = isDragging && dragState.isSnappingBack;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only handle primary button (left click) or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    onPointerDown(e, task, cardRef);
  };

  const cardContent = (
    <>
      {/* Active Users Indicator */}
      {usersOnTask.length > 0 && (
        <div className="absolute -top-2 -right-2">
          <StackedUserAvatars
            avatars={usersOnTask.map(u => ({ initials: u.initials, color: u.color, title: u.name }))}
            max={2}
            size="sm"
          />
        </div>
      )}

      {/* Priority Badge */}
      <div className="mb-2">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2" style={{ userSelect: 'none' }}>
        {task.title}
      </h4>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pointer-events-none">
        <UserAvatar
          initials={task.assignee.initials}
          color={task.assignee.color}
          size="sm"
          title={task.assignee.name}
        />
        <DueDate date={task.dueDate} />
      </div>
    </>
  );

  return (
    <>
      {/* Static Card inside the column */}
      <div
        ref={cardRef}
        onPointerDown={handlePointerDown}
        className={`
          bg-white rounded-lg border border-gray-200 p-4 mb-3 cursor-grab
          select-none relative touch-none
          hover:shadow-md hover:border-gray-300
          ${isDragging ? 'opacity-0 absolute pointer-events-none' : ''}
        `}
      >
        {cardContent}
      </div>

      {/* Dragging or Snapping Overlay Card */}
      {isDragging && (
        <div
          className={`
            fixed z-50 bg-white rounded-lg border border-gray-200 p-4 opacity-90
            ${isSnappingBack ? 'transition-all duration-300 ease-out shadow-lg pointer-events-none' : 'shadow-xl cursor-grabbing pointer-events-none'}
          `}
          style={{
            left: isSnappingBack ? dragState.startX : dragState.currentX - dragState.offsetX,
            top: isSnappingBack ? dragState.startY : dragState.currentY - dragState.offsetY,
            width: dragState.width,
            height: dragState.height,
            margin: 0,
          }}
        >
          {cardContent}
        </div>
      )}

      {/* Placeholder in list */}
      {isDragging && (
        <div 
          className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mb-3"
          style={{ height: dragState.height }}
        />
      )}
    </>
  );
}

interface KanbanColumnProps {
  column: typeof COLUMNS[0];
  tasks: Task[];
  activeUsers: ActiveUser[];
  dragState: DragState | null;
  dragOverColumn: TaskStatus | null;
  onPointerDown: (e: React.PointerEvent, task: Task, ref: React.RefObject<HTMLDivElement | null>) => void;
}

function KanbanColumn({ 
  column, 
  tasks, 
  activeUsers, 
  dragState,
  dragOverColumn,
  onPointerDown
}: KanbanColumnProps) {
  const isDropTarget = dragOverColumn === column.id;

  return (
    <div
      data-kanban-column={column.id}
      className={`
        flex flex-col h-full min-h-[400px] rounded-lg transition-colors
        ${isDropTarget ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : 'bg-gray-50'}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Column Content */}
      <div className="flex-1 p-3 overflow-y-auto max-h-[calc(100vh-280px)]">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center pointer-events-none">
            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-gray-500">No tasks</p>
            <p className="text-xs text-gray-400 mt-1">Drag tasks here</p>
          </div>
        ) : (
          tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              activeUsers={activeUsers}
              dragState={dragState}
              onPointerDown={onPointerDown}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanView() {
  const { 
    activeUsers, 
    updateTaskStatus,
    getTasksByStatus 
  } = useTaskStore();

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent, task: Task, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    
    // Prevent default touch behaviors like scrolling
    (e.target as Element).setPointerCapture(e.pointerId);

    const rect = ref.current.getBoundingClientRect();
    
    setDragState({
      taskId: task.id,
      sourceColumn: task.status,
      startX: rect.left,
      startY: rect.top,
      currentX: e.clientX,
      currentY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      isSnappingBack: false
    });
    
    setDragOverColumn(task.status);
  }, []);

  useEffect(() => {
    if (!dragState || dragState.isSnappingBack) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();

      // Find drop target under cursor
      // Exclude the dragged element from point detection
      const elementsFromPoint = document.elementsFromPoint(e.clientX, e.clientY);
      const columnEl = elementsFromPoint.find(el => el.hasAttribute('data-kanban-column'));
      
      let newHoverCol: TaskStatus | null = null;
      if (columnEl) {
        newHoverCol = columnEl.getAttribute('data-kanban-column') as TaskStatus;
      }

      setDragOverColumn(newHoverCol);

      setDragState(prev => prev ? {
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY
      } : null);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!dragState) return;

      const elementsFromPoint = document.elementsFromPoint(e.clientX, e.clientY);
      const columnEl = elementsFromPoint.find(el => el.hasAttribute('data-kanban-column'));
      
      let targetColumn: TaskStatus | null = null;
      if (columnEl) {
        targetColumn = columnEl.getAttribute('data-kanban-column') as TaskStatus;
      }

      if (targetColumn && targetColumn !== dragState.sourceColumn) {
        // Drop success
        updateTaskStatus(dragState.taskId, targetColumn);
        setDragState(null);
        setDragOverColumn(null);
      } else {
        // Snap back
        setDragState(prev => prev ? {
          ...prev,
          currentX: prev.startX + prev.offsetX, // reset transform target to start
          currentY: prev.startY + prev.offsetY,
          isSnappingBack: true
        } : null);
        setDragOverColumn(null);

        // Wait for transition to finish
        setTimeout(() => {
          setDragState(null);
        }, 300); // match transition-duration duration-300
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, updateTaskStatus]);

  return (
    <div className="h-full overflow-x-auto touch-none">
      <div className="flex gap-4 min-w-[1024px] h-full p-4">
        {COLUMNS.map(column => (
          <div key={column.id} className="flex-1 min-w-[240px]">
            <KanbanColumn
              column={column}
              tasks={getTasksByStatus(column.id)}
              activeUsers={activeUsers}
              dragState={dragState}
              dragOverColumn={dragOverColumn}
              onPointerDown={handlePointerDown}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
