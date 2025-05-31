import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  Folder,
  ListTodo,
  Settings,
  HelpCircle,
  Users,
  BarChart,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useProject } from '../../contexts/ProjectContext';
import { NavItem } from '../../types';

type SidebarProps = {
  onNavItemClick?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onNavItemClick }) => {
  const { projects } = useProject();

  const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Improve My Idea', href: '/ideas', icon: Lightbulb },
    { title: 'User Stories', href: '/stories', icon: Users },
    { title: 'Analytics', href: '/analytics', icon: BarChart },
  ];

  const handleClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="p-4 flex items-center border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 rounded bg-primary-600 text-white flex items-center justify-center mr-2 text-xl font-semibold">
          P
        </div>
        <h1 className="text-lg font-display font-semibold text-primary-900 dark:text-primary-100">
          ProductMind
        </h1>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 px-3">
            Main
          </h2>
          <ul className="space-y-1">
            {mainNavItems.map(item => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={handleClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Projects section */}
        <div className="px-3 mb-6">
          <div className="flex items-center justify-between mb-2 px-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Projects
            </h2>
            <button className="p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Folder className="h-4 w-4" />
            </button>
          </div>
          <ul className="space-y-1">
            {projects.map(project => (
              <li key={project.id}>
                <NavLink
                  to={`/projects/${project.id}`}
                  onClick={handleClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )
                  }
                >
                  <div className="mr-3 h-2 w-2 rounded-full bg-accent-500" />
                  <span className="truncate">{project.title}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <button className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="mr-3 h-5 w-5 flex items-center justify-center text-gray-500">
                  +
                </span>
                <span>New Project</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Bottom links */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <NavLink
          to="/settings"
          onClick={handleClick}
          className={({ isActive }) =>
            cn(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )
          }
        >
          <Settings className="mr-3 h-5 w-5" />
          <span>Settings</span>
        </NavLink>
        <NavLink
          to="/help"
          onClick={handleClick}
          className={({ isActive }) =>
            cn(
              'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            )
          }
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          <span>Help & Support</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
