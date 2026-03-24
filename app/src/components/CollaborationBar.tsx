import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { UserAvatar } from '@/components/ui/UserAvatar';

export function CollaborationBar() {
  const { activeUsers, tasks, updateActiveUserTask } = useTaskStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate user movement between tasks
  useEffect(() => {
    const simulateUserMovement = () => {
      activeUsers.forEach(user => {
        // 30% chance to move to a different task
        if (Math.random() < 0.3) {
          const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
          if (randomTask && randomTask.id !== user.currentTaskId) {
            updateActiveUserTask(user.id, randomTask.id);
          }
        }
      });
    };

    // Start simulation
    intervalRef.current = setInterval(simulateUserMovement, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeUsers, tasks, updateActiveUserTask]);

  const activeCount = activeUsers.filter(u => u.currentTaskId !== null).length;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 border-b border-blue-100">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {activeUsers.map((user, index) => (
            <div
              key={user.id}
              className="relative"
              style={{ zIndex: activeUsers.length - index }}
            >
              <UserAvatar
                initials={user.initials}
                color={user.color}
                size="sm"
                title={user.name}
                className="ring-2 ring-blue-50"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-blue-50 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <span className="text-sm text-blue-800">
        <span className="font-medium">{activeCount}</span> people viewing this board
      </span>
      <span className="text-xs text-blue-600 ml-auto flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        Live
      </span>
    </div>
  );
}
