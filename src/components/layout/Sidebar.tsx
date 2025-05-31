import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Folder,
  ListTodo,
  BarChart,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useProject } from '../../contexts/ProjectContext';
import { NavItem } from '../../types';
import { motion } from 'framer-motion';

type SidebarProps = {
  onNavItemClick?: () => void;
  collapsed?: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ onNavItemClick, collapsed = false }) => {
  const { projects } = useProject();

  const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/', icon: LayoutDashboard },
    { title: 'Analytics', href: '/analytics', icon: BarChart },
    { title: 'Projects', href: '/projects', icon: Folder },
    { title: 'Tasks', href: '/tasks', icon: ListTodo },
  ];

  const handleClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 shadow-sm">
      {/* Logo */}
      <div className={cn(
        "p-6 flex items-center",
        collapsed ? "justify-center px-4" : ""
      )}>
        <div className="w-8 h-8 rounded bg-primary-600 text-white flex items-center justify-center text-xl font-semibold">
          P
        </div>
        {!collapsed && (
          <motion.h1
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-2 text-lg font-display font-semibold text-primary-900 dark:text-primary-100"
          >
            ProductMind
          </motion.h1>
        )}
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className={cn("px-4", collapsed ? "px-2" : "")}>
          <ul className="space-y-1">
            {mainNavItems.map(item => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  onClick={handleClick}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                      collapsed ? 'p-3 justify-center' : 'px-4 py-3',
                      isActive
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                    )
                  }
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.title}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Projects section - only show when expanded */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-4 mt-8"
          >
            <div className="flex items-center justify-between mb-4 px-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Recent Projects
              </h2>
            </div>
            <ul className="space-y-1">
              {projects.slice(0, 3).map(project => (
                <li key={project.id}>
                  <NavLink
                    to={`/projects/${project.id}`}
                    onClick={handleClick}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-200'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/80'
                      )
                    }
                  >
                    <div className="mr-3 h-2 w-2 rounded-full bg-accent-500" />
                    <span className="truncate">{project.title}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
