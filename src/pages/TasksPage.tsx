import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useProject } from '../contexts/ProjectContext';
import {
  ListTodo,
  Plus,
  Filter,
  CheckCircle,
  Clock,
  Calendar,
  MoreHorizontal,
  ArrowDownUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

type TaskStatus =
  | 'all'
  | 'backlog'
  | 'todo'
  | 'in-progress'
  | 'review'
  | 'completed';
type TaskPriority = 'all' | 'low' | 'medium' | 'high' | 'urgent';

const TasksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks, updateTask } = useProject();

  const [statusFilter, setStatusFilter] = useState<TaskStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority>('all');
  const [sortOrder, setSortOrder] = useState<
    'newest' | 'oldest' | 'priority' | 'dueDate'
  >('dueDate');

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(t => t.projectId === id);

  // Apply filters
  const filteredTasks = projectTasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch =
      priorityFilter === 'all' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Apply sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortOrder === 'priority') {
      const priorityValues = { urgent: 3, high: 2, medium: 1, low: 0 };
      return priorityValues[b.priority] - priorityValues[a.priority];
    } else if (sortOrder === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  const handleToggleTaskCompletion = (
    taskId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
    updateTask(taskId, { status: newStatus });
  };

  // Format date as "Oct 15"
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate if a task is overdue
  const isOverdue = (dateString?: string) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 dark:text-gray-50">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {project
              ? `${project.title} - Tasks`
              : 'Manage tasks for this project'}
          </p>
        </div>

        <Button variant="primary" leftIcon={<Plus size={16} />}>
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            className="input pr-8 appearance-none"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as TaskStatus)}
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          <Filter className="absolute right-2 bottom-2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            className="input pr-8 appearance-none"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as TaskPriority)}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Filter className="absolute right-2 bottom-2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Sort By
          </label>
          <select
            className="input pr-8 appearance-none"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as any)}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          <ArrowDownUp className="absolute right-2 bottom-2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Tasks list */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {statusFilter === 'all'
                ? 'All Tasks'
                : statusFilter.charAt(0).toUpperCase() +
                  statusFilter.slice(1).replace('-', ' ') +
                  ' Tasks'}
            </CardTitle>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTasks.length}{' '}
              {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {sortedTasks.length > 0 ? (
            <div className="space-y-4">
              {sortedTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() =>
                        handleToggleTaskCompletion(task.id, task.status)
                      }
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        task.status === 'completed'
                          ? 'bg-success-500 border-success-500 text-white'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h3
                        className={`font-medium ${
                          task.status === 'completed'
                            ? 'text-gray-500 dark:text-gray-500 line-through'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-md">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {task.dueDate && (
                      <div
                        className={`flex items-center text-sm ${
                          isOverdue(task.dueDate) && task.status !== 'completed'
                            ? 'text-error-600 dark:text-error-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}

                    <Badge
                      variant={
                        task.status === 'completed'
                          ? 'success'
                          : task.priority === 'urgent'
                            ? 'error'
                            : task.priority === 'high'
                              ? 'warning'
                              : task.priority === 'medium'
                                ? 'accent'
                                : 'default'
                      }
                    >
                      {task.status === 'completed'
                        ? 'completed'
                        : task.priority}
                    </Badge>

                    <button className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <ListTodo className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No tasks found
              </h3>
              <p className="max-w-md mx-auto mb-6">
                {statusFilter === 'all' && priorityFilter === 'all'
                  ? "You haven't created any tasks for this project yet."
                  : 'No tasks match the current filters.'}
              </p>
              <div className="flex justify-center space-x-3">
                {(statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStatusFilter('all');
                      setPriorityFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                <Button variant="primary" leftIcon={<Plus size={16} />}>
                  Add Task
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
