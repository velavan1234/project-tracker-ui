import { useEffect } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { ViewSwitcher } from '@/components/ViewSwitcher';
import { FilterBar } from '@/components/FilterBar';
import { CollaborationBar } from '@/components/CollaborationBar';
import { KanbanView } from '@/components/views/KanbanView';
import { ListView } from '@/components/views/ListView';
import { TimelineView } from '@/components/views/TimelineView';
import AdminProfile from '@/components/AdminProfile';
import './App.css';

function App() {
  const { currentView } = useTaskStore();

  // Update document title
  useEffect(() => {
    document.title = 'Velozity Project Tracker';
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'kanban':
        return <KanbanView />;
      case 'list':
        return <ListView />;
      case 'timeline':
        return <TimelineView />;
      default:
        return <KanbanView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Velozity</h1>
                <p className="text-xs text-gray-500">Project Tracker</p>
              </div>
            </div>

            {/* View Switcher */}
            <ViewSwitcher />

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <AdminProfile />
            </div>
          </div>
        </div>

        {/* Collaboration Bar */}
        <CollaborationBar />

        {/* Filter Bar */}
        <FilterBar />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Velozity Global Solutions - Technical Hiring Assessment</p>
          <p>Built with React + TypeScript + Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
