import React, { useMemo } from 'react';
import { BarChart, TrendingUp, Target, Calendar, CheckCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProject } from '../contexts/ProjectContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/Card';

const AnalyticsPage: React.FC = () => {
  const { projects, milestones, tasks } = useProject();

  // Calculate comprehensive metrics
  const analytics = useMemo(() => {
    // Project metrics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in-progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const averageProgress = totalProjects > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / totalProjects)
      : 0;

    // Task metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(t.dueDate) < new Date();
    }).length;

    // Milestone metrics
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const delayedMilestones = milestones.filter(m => m.status === 'delayed').length;

    // Productivity metrics
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // Priority distribution
    const urgentTasks = tasks.filter(t => t.priority === 'urgent').length;
    const highTasks = tasks.filter(t => t.priority === 'high').length;
    const mediumTasks = tasks.filter(t => t.priority === 'medium').length;
    const lowTasks = tasks.filter(t => t.priority === 'low').length;

    // Project status distribution
    const planningProjects = projects.filter(p => p.status === 'planning').length;
    const onHoldProjects = projects.filter(p => p.status === 'on-hold').length;

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        planning: planningProjects,
        onHold: onHoldProjects,
        averageProgress
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        overdue: overdueTasks,
        urgent: urgentTasks,
        high: highTasks,
        medium: mediumTasks,
        low: lowTasks,
        completionRate
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        delayed: delayedMilestones
      }
    };
  }, [projects, tasks, milestones]);

  // Simple progress bar component
  const ProgressBar: React.FC<{ value: number; max: number; label: string; color: string }> = ({ value, max, label, color }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{value}/{max}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  // Simple chart component for priority distribution
  const PriorityChart: React.FC = () => {
    const { urgent, high, medium, low, total } = analytics.tasks;
    
    const chartData = [
      { label: 'Urgent', value: urgent, color: 'bg-error-500', percentage: total > 0 ? (urgent / total) * 100 : 0 },
      { label: 'High', value: high, color: 'bg-warning-500', percentage: total > 0 ? (high / total) * 100 : 0 },
      { label: 'Medium', value: medium, color: 'bg-accent-500', percentage: total > 0 ? (medium / total) * 100 : 0 },
      { label: 'Low', value: low, color: 'bg-gray-500', percentage: total > 0 ? (low / total) * 100 : 0 }
    ];

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Task Priority Distribution</h4>
        <div className="space-y-3">
          {chartData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-8 text-right">
                  {item.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // Project status chart
  const ProjectStatusChart: React.FC = () => {
    const { completed, active, planning, onHold } = analytics.projects;
    
    const statusData = [
      { label: 'Completed', value: completed, color: 'bg-success-500' },
      { label: 'Active', value: active, color: 'bg-accent-500' },
      { label: 'Planning', value: planning, color: 'bg-warning-500' },
      { label: 'On Hold', value: onHold, color: 'bg-gray-500' }
    ];

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Project Status Overview</h4>
        <div className="grid grid-cols-2 gap-4">
          {statusData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className={`w-8 h-8 rounded-full ${item.color} mx-auto mb-2`} />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{item.value}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-display font-semibold text-gray-900 dark:text-gray-50 mb-2">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Performance insights and project metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="h-8 w-8 mx-auto mb-3 text-primary-600 dark:text-primary-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {analytics.projects.total}
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
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-success-600 dark:text-success-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {analytics.tasks.completionRate}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Completion Rate
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
              <BarChart className="h-8 w-8 mx-auto mb-3 text-accent-600 dark:text-accent-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {analytics.projects.averageProgress}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Progress
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
              <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-warning-600 dark:text-warning-400" />
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {analytics.tasks.overdue}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overdue Tasks
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Project Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar 
                value={analytics.projects.completed} 
                max={analytics.projects.total}
                label="Completed Projects"
                color="bg-success-500"
              />
              <ProgressBar 
                value={analytics.projects.active} 
                max={analytics.projects.total}
                label="Active Projects"
                color="bg-accent-500"
              />
              <ProgressBar 
                value={analytics.projects.planning} 
                max={analytics.projects.total}
                label="Planning Projects"
                color="bg-warning-500"
              />
              
              <div className="pt-6 mt-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-4">
                <ProjectStatusChart />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Task Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar 
                value={analytics.tasks.completed} 
                max={analytics.tasks.total}
                label="Completed Tasks"
                color="bg-success-500"
              />
              <ProgressBar 
                value={analytics.tasks.inProgress} 
                max={analytics.tasks.total}
                label="In Progress Tasks"
                color="bg-accent-500"
              />
              <ProgressBar 
                value={analytics.tasks.overdue} 
                max={analytics.tasks.total}
                label="Overdue Tasks"
                color="bg-error-500"
              />
              
              <div className="pt-6 mt-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-4">
                <PriorityChart />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Milestones Overview */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Milestones
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{analytics.milestones.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="font-medium text-success-600 dark:text-success-400">{analytics.milestones.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Delayed</span>
                    <span className="font-medium text-error-600 dark:text-error-400">{analytics.milestones.delayed}</span>
                  </div>
                </div>
              </div>

              {/* Task Status Summary */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Task Status
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{analytics.tasks.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                    <span className="font-medium text-accent-600 dark:text-accent-400">{analytics.tasks.inProgress}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overdue</span>
                    <span className="font-medium text-error-600 dark:text-error-400">{analytics.tasks.overdue}</span>
                  </div>
                </div>
              </div>

              {/* Project Health */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Project Health
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                    <span className="font-medium text-accent-600 dark:text-accent-400">{analytics.projects.active}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                    <span className="font-medium text-success-600 dark:text-success-400">{analytics.projects.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">On Hold</span>
                    <span className="font-medium text-warning-600 dark:text-warning-400">{analytics.projects.onHold}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage; 