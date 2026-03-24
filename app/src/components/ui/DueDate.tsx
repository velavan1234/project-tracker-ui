import { getDueDateDisplay } from '@/lib/dateUtils';

interface DueDateProps {
  date: Date;
  className?: string;
}

export function DueDate({ date, className = '' }: DueDateProps) {
  const { text, isOverdue, isToday } = getDueDateDisplay(date);
  
  let textColor = 'text-gray-500';
  if (isToday) {
    textColor = 'text-amber-600 font-medium';
  } else if (isOverdue) {
    textColor = 'text-red-600 font-medium';
  }
  
  return (
    <span className={`text-xs ${textColor} ${className}`}>
      {text}
    </span>
  );
}
