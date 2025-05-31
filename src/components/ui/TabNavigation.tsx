import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'default'
}) => {
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Focus management - focus active tab when component mounts
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.focus();
    }
  }, []);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    const enabledTabs = tabs.filter(tab => !tab.disabled);
    const currentEnabledIndex = enabledTabs.findIndex(tab => tab.id === tabs[currentIndex].id);
    
    let targetIndex = currentEnabledIndex;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        targetIndex = currentEnabledIndex > 0 ? currentEnabledIndex - 1 : enabledTabs.length - 1;
        break;
      case 'ArrowRight':
        event.preventDefault();
        targetIndex = currentEnabledIndex < enabledTabs.length - 1 ? currentEnabledIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        targetIndex = enabledTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!tabs[currentIndex].disabled) {
          onTabChange(tabs[currentIndex].id);
        }
        return;
      default:
        return;
    }

    const targetTab = enabledTabs[targetIndex];
    if (targetTab) {
      const targetButton = tabListRef.current?.querySelector(
        `[data-tab-id="${targetTab.id}"]`
      ) as HTMLButtonElement;
      targetButton?.focus();
    }
  };

  // Handle tab click
  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (!disabled) {
      onTabChange(tabId);
    }
  };

  // Base classes for different variants
  const getTabClasses = (tab: TabItem, isActive: boolean) => {
    const baseClasses = cn(
      'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'compact' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
    );

    if (tab.disabled) {
      return cn(baseClasses, 'text-gray-400 dark:text-gray-600 cursor-not-allowed');
    }

    if (isActive) {
      return cn(
        baseClasses,
        'text-primary-700 dark:text-primary-300',
        'bg-primary-50/50 dark:bg-primary-900/30',
        'border-b-2 border-primary-500',
        'backdrop-blur-sm'
      );
    }

    return cn(
      baseClasses,
      'text-gray-600 dark:text-gray-400',
      'hover:text-gray-900 dark:hover:text-gray-100',
      'hover:bg-gray-100/50 dark:hover:bg-gray-800/30',
      'border-b-2 border-transparent',
      'hover:backdrop-blur-sm'
    );
  };

  const getBadgeClasses = (isActive: boolean) => {
    if (isActive) {
      return 'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300';
    }
    return 'inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className={cn('border-b border-gray-200/50 dark:border-gray-700/50', className)}>
      <div
        ref={tabListRef}
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          'flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600',
          'md:overflow-x-visible',
          variant === 'compact' ? 'gap-1' : 'gap-2'
        )}
      >
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              ref={isActive ? activeTabRef : undefined}
              data-tab-id={tab.id}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={getTabClasses(tab, isActive)}
              whileHover={!tab.disabled ? { y: -1 } : undefined}
              whileTap={!tab.disabled ? { y: 0 } : undefined}
              initial={false}
              animate={{
                opacity: tab.disabled ? 0.5 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon */}
              {Icon && (
                <Icon 
                  className={cn(
                    'h-4 w-4 flex-shrink-0',
                    variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'
                  )} 
                />
              )}
              
              {/* Label */}
              <span className="whitespace-nowrap">
                {tab.label}
              </span>
              
              {/* Badge */}
              {tab.badge && (
                <span className={getBadgeClasses(isActive)}>
                  {tab.badge}
                </span>
              )}

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default TabNavigation; 