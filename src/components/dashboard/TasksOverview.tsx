import React from 'react';
import { CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';
import { useProject } from '../../contexts/ProjectContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const TasksOverview: React.FC = () => {
  const { tasks } = useProject();

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
  const urgentTasks = tasks.filter(task => task.priority === 'urgent');

  // Get tasks due soon (in the next 7 days)
  const today = new Date();
  const next7Days = new Date(today);
  next7Days.setDate(today.getDate() + 7);

  const tasksDueSoon = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return (
      dueDate > today && dueDate <= next7Days && task.status !== 'completed'
    );
  });

  // Format date as "Oct 15"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tasks Overview</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-success-50 dark:bg-success-900/20 rounded-xl p-4 text-center">
              <CheckCircle className="h-5 w-5 mx-auto mb-2 text-success-500 dark:text-success-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Completed
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {completedTasks.length}
              </p>
            </div>
            <div className="bg-accent-50 dark:bg-accent-900/20 rounded-xl p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-accent-500 dark:text-accent-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                In Progress
              </p>
              <p className="text-lg font-semibold text-accent-700 dark:text-accent-400">
                {inProgressTasks.length}
              </p>
            </div>
            <div className="bg-warning-50 dark:bg-warning-900/20 rounded-xl p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-warning-500 dark:text-warning-400" />
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Urgent</p>
              <p className="text-lg font-semibold text-warning-700 dark:text-warning-400">
                {urgentTasks.length}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Due Soon
            </h4>

            {tasksDueSoon.length > 0 ? (
              tasksDueSoon.slice(0, 4).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        task.priority === 'high' || task.priority === 'urgent'
                          ? 'bg-warning-500'
                          : task.priority === 'medium'
                            ? 'bg-accent-500'
                            : 'bg-success-500'
                      }`}
                    />
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        {task.title}
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Due {formatDate(task.dueDate || '')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.priority === 'urgent'
                        ? 'error'
                        : task.priority === 'high'
                          ? 'warning'
                          : task.priority === 'medium'
                            ? 'accent'
                            : 'success'
                    }
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tasks due soon
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link to="/tasks" className="w-full">
          <Button 
            variant="ghost" 
            className="w-full justify-center"
            rightIcon={<ArrowRight size={16} />}
          >
            View All Tasks
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TasksOverview;
