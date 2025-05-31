import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Moon, Sun, MessageCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../utils/cn';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Generate page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === '/') return 'Dashboard';
    if (path === '/ideas') return 'Ideas Workspace';
    if (path.includes('/projects') && path.includes('/tasks'))
      return 'Project Tasks';
    if (path.includes('/projects') && path.includes('/stories'))
      return 'User Stories';
    if (path.includes('/projects')) return 'Project Details';

    return 'ProductMind AI';
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {getPageTitle()}
        </h1>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 w-48 lg:w-64 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
