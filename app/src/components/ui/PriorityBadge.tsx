import type { TaskPriority } from '@/types';
import { PRIORITIES } from '@/types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const priorityConfig = PRIORITIES.find(p => p.id === priority) || PRIORITIES[0];
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={{
        backgroundColor: priorityConfig.bgColor,
        color: priorityConfig.color,
      }}
    >
      {priorityConfig.label}
    </span>
  );
}
