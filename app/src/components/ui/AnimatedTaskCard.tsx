import React from 'react';
import { motion } from 'framer-motion';
import type { Task } from '@/types';
import { useEnhancedTaskStore } from '@/store/enhancedTaskStore';
import { cn } from '@/lib/utils';

interface AnimatedTaskCardProps {
  task: Task;
  className?: string;
  index?: number;
}

const AnimatedTaskCard: React.FC<AnimatedTaskCardProps> = ({ 
  task, 
  className,
  index = 0 
}) => {
  const { setSelectedTask, setTaskModalOpen } = useEnhancedTaskStore();

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'border-gray-300 bg-gray-50';
      case 'in-progress': return 'border-blue-300 bg-blue-50';
      case 'in-review': return 'border-yellow-300 bg-yellow-50';
      case 'done': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Handle click
  const handleClick = () => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={cn(
        "bg-white rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md",
        getStatusColor(task.status),
        task.isOverdue && "border-red-300 bg-red-50",
        className
      )}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {task.title}
        </h3>
        <span className={cn(
          "px-2 py-1 text-xs font-medium rounded-full",
          getPriorityColor(task.priority)
        )}>
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Assignee */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
          style={{ backgroundColor: task.assignee.color }}
        >
          {task.assignee.initials}
        </div>
        <span className="text-xs text-gray-600">{task.assignee.name}</span>
      </div>

      {/* Due Date */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Due: {formatDate(task.dueDate)}</span>
        {task.isOverdue && (
          <span className="text-red-600 font-medium">Overdue</span>
        )}
      </div>

      {/* Progress Bar */}
      {task.progressPercentage > 0 && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${task.progressPercentage}%` }}
              transition={{ duration: 0.5 }}
              className="bg-blue-600 h-2 rounded-full"
            />
          </div>
          <span className="text-xs text-gray-500 mt-1">
            {task.progressPercentage}% complete
          </span>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AnimatedTaskCard;
