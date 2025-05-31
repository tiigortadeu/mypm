import React from 'react';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import TasksOverview from '../components/dashboard/TasksOverview';
import { TrendingUp, BarChart2, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import {
  Card,
  CardContent,
} from '../components/ui/Card';

const Dashboard: React.FC = () => {
  const { projects, tasks } = useProject();

  // Analytics data
  const totalProjects = projects.length;
  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overallProgress = totalProjects > 0 
    ? (projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects) 
    : 0;
  
  // Tasks due this week
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  
  const tasksThisWeek = tasks.filter(task => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= weekEnd && task.status !== 'completed';
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-display font-semibold text-gray-900 dark:text-gray-50 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor your projects and tasks progress
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-primary-600 dark:text-primary-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {totalProjects}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Projects
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <BarChart2 className="h-8 w-8 mx-auto mb-3 text-accent-600 dark:text-accent-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {Math.round(overallProgress)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overall Progress
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-8 w-8 mx-auto mb-3 text-success-600 dark:text-success-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {completedTasks.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completed Tasks
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-warning-600 dark:text-warning-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {tasksThisWeek.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Due This Week
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content - 2 Columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <div>
          <ProjectsOverview />
        </div>
        
        <div>
          <TasksOverview />
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
