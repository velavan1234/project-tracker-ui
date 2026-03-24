import type { ViewType } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';

interface ViewOption {
  id: ViewType;
  label: string;
  icon: React.ReactNode;
}

const views: ViewOption[] = [
  {
    id: 'kanban',
    label: 'Kanban',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    id: 'list',
    label: 'List',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export function ViewSwitcher() {
  const { currentView, setCurrentView } = useTaskStore();

  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => setCurrentView(view.id)}
          className={`
            flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all
            ${currentView === view.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }
          `}
        >
          {view.icon}
          {view.label}
        </button>
      ))}
    </div>
  );
}
