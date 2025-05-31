import React from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { Bell, Search, Moon, Sun, MessageCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProject } from '../../contexts/ProjectContext';
import { cn } from '../../utils/cn';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { taskId } = useParams();
  const { getTaskById } = useProject();

  // Generate page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/') return 'Dashboard';
    if (path === '/analytics') return 'Analytics';
    if (path === '/projects' && !path.includes('/projects/')) return 'Projects';
    if (path === '/tasks' && !path.includes('/tasks/id/')) return 'Tasks';
    
    // Task detail page
    if (path.includes('/tasks/id/') && taskId) {
      const task = getTaskById(taskId);
      return task?.title || 'Task Details';
    }
    
    if (path.includes('/projects') && path.includes('/tasks'))
      return 'Project Tasks';
    if (path.includes('/projects') && path.includes('/stories'))
      return 'User Stories';
    if (path.includes('/projects')) return 'Project Details';

    return 'ProductMind AI';
  };

  // Check if we're on task detail page for breadcrumb
  const isTaskDetailPage = location.pathname.includes('/tasks/id/') && taskId;
  const task = isTaskDetailPage ? getTaskById(taskId) : null;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        {/* Title with breadcrumb for task detail */}
        <div className="flex items-center gap-2">
          {isTaskDetailPage && task ? (
            <nav className="flex items-center gap-2 text-sm">
              <Link 
                to="/tasks"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Tasks
              </Link>
              <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 truncate max-w-96">
                {task.title}
              </h1>
            </nav>
          ) : (
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {getPageTitle()}
            </h1>
          )}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 w-48 lg:w-64 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>

          {/* Action buttons */}
          <button
            className={cn(
              'p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            )}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          <button
            className={cn(
              'p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            )}
            aria-label="AI Assistant"
          >
            <MessageCircle size={20} />
          </button>

          <button
            onClick={toggleTheme}
            className={cn(
              'p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
              'hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'
            )}
            aria-label={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User avatar */}
          <button className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 flex items-center justify-center font-medium">
            AM
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
