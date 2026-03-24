import { useRef, useMemo, useState, useEffect } from 'react';
import type { Task } from '@/types';
import { PRIORITIES } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { startOfMonth, endOfMonth, isToday, addDays } from '@/lib/dateUtils';

const DAY_WIDTH = 40; // Width of each day column in pixels
const TASK_HEIGHT = 48; // Height of each task bar
const HEADER_HEIGHT = 60; // Height of the date header

interface TimelineTaskBarProps {
  task: Task;
  startDate: Date;
  dayWidth: number;
  onClick?: () => void;
}

function TimelineTaskBar({ task, startDate, dayWidth, onClick }: TimelineTaskBarProps) {
  const priorityConfig = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[0];
  
  // Calculate position and width
  const taskStart = task.startDate || task.dueDate;
  const taskEnd = task.dueDate;
  
  const daysFromStart = Math.floor((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const duration = Math.max(1, Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  const left = daysFromStart * dayWidth;
  const width = duration * dayWidth;

  return (
    <div
      className="absolute h-8 rounded-md cursor-pointer transition-all hover:brightness-110 hover:shadow-md"
      style={{
        left: left + 4,
        width: Math.max(width - 8, dayWidth - 8),
        backgroundColor: priorityConfig.color,
        top: 8,
      }}
      onClick={onClick}
      title={`${task.title} (${priorityConfig.label})`}
    >
      <div className="px-2 py-1 truncate text-xs font-medium text-white">
        {task.title}
      </div>
    </div>
  );
}

interface TodayMarkerProps {
  startDate: Date;
  dayWidth: number;
}

function TodayMarker({ startDate, dayWidth }: TodayMarkerProps) {
  const today = new Date();
  const daysFromStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const left = daysFromStart * dayWidth + dayWidth / 2;

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none z-10"
      style={{ left }}
    >
      <div className="w-0.5 h-full bg-red-500" />
      <div className="absolute -top-1 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-xs font-medium rounded">
        Today
      </div>
    </div>
  );
}

export function TimelineView() {
  const { getFilteredTasks } = useTaskStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setContainerWidth] = useState(0);

  const tasks = getFilteredTasks();

  // Update container width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Calculate timeline range (current month +/- 1 week)
  const today = new Date();
  const timelineStart = useMemo(() => {
    const start = startOfMonth(today);
    return addDays(start, -7); // Start 1 week before month start
  }, [today]);

  const timelineEnd = useMemo(() => {
    const end = endOfMonth(today);
    return addDays(end, 7); // End 1 week after month end
  }, [today]);

  const totalDays = Math.floor((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalWidth = totalDays * DAY_WIDTH;

  // Generate day headers
  const dayHeaders = useMemo(() => {
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const date = addDays(timelineStart, i);
      days.push({
        date,
        isToday: isToday(date),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        dayOfMonth: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return days;
  }, [timelineStart, totalDays]);

  // Group tasks by row (simple approach - one task per row)
  const taskRows = useMemo(() => {
    return tasks.map(task => ({ task }));
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks for timeline</h3>
        <p className="text-sm text-gray-500">Adjust your filters to see tasks on the timeline.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Timeline Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700">
          {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex items-center gap-4 text-xs">
          {PRIORITIES.map(p => (
            <div key={p.id} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: p.color }} />
              <span className="text-gray-600">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto"
        style={{ height: 'calc(100vh - 280px)' }}
      >
        <div style={{ width: totalWidth, position: 'relative' }}>
          {/* Date Header */}
          <div 
            className="sticky top-0 z-20 flex bg-white border-b border-gray-200"
            style={{ height: HEADER_HEIGHT }}
          >
            {dayHeaders.map((day, index) => (
              <div
                key={index}
                className={`
                  flex flex-col items-center justify-center border-r border-gray-100
                  ${day.isToday ? 'bg-red-50' : day.isWeekend ? 'bg-gray-50' : ''}
                `}
                style={{ width: DAY_WIDTH }}
              >
                <span className={`text-xs ${day.isToday ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {day.dayName}
                </span>
                <span className={`text-sm ${day.isToday ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                  {day.dayOfMonth}
                </span>
              </div>
            ))}
          </div>

          {/* Task Bars */}
          <div style={{ position: 'relative', height: taskRows.length * TASK_HEIGHT }}>
            {/* Today Marker */}
            <TodayMarker
              startDate={timelineStart}
              dayWidth={DAY_WIDTH}
            />

            {/* Grid Lines */}
            {dayHeaders.map((_, index) => (
              <div
                key={`grid-${index}`}
                className="absolute top-0 bottom-0 border-r border-gray-100"
                style={{ left: index * DAY_WIDTH }}
              />
            ))}

            {/* Task Rows */}
            {taskRows.map(({ task }) => (
              <div
                key={task.id}
                className="relative border-b border-gray-100 hover:bg-gray-50"
                style={{ height: TASK_HEIGHT }}
              >
                <TimelineTaskBar
                  task={task}
                  startDate={timelineStart}
                  dayWidth={DAY_WIDTH}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        Showing {tasks.length} tasks on timeline
      </div>
    </div>
  );
}
