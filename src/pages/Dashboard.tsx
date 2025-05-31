import React from 'react';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import TasksOverview from '../components/dashboard/TasksOverview';
import AIAssistant from '../components/dashboard/AIAssistant';
import { PlusCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 dark:text-gray-50">
            Welcome back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" rightIcon={<ArrowRight size={16} />}>
            View All Projects
          </Button>
          <Button variant="primary" leftIcon={<PlusCircle size={16} />}>
            New Project
          </Button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/ideas">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-xl font-semibold mb-2">Improve My Idea</h3>
            <p className="text-primary-100 mb-4">
              Break down your product ideas and validate key assumptions
            </p>
            <div className="flex justify-end">
              <ArrowRight className="h-5 w-5" />
            </div>
          </motion.div>
        </Link>

        <Link to="/stories">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-secondary-500 to-secondary-700 text-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-xl font-semibold mb-2">User Stories</h3>
            <p className="text-secondary-100 mb-4">
              Identify user needs and create detailed user stories
            </p>
            <div className="flex justify-end">
              <ArrowRight className="h-5 w-5" />
            </div>
          </motion.div>
        </Link>

        <Link to="/analytics">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-accent-500 to-accent-700 text-white rounded-xl p-6 shadow-md"
          >
            <h3 className="text-xl font-semibold mb-2">Progress Tracking</h3>
            <p className="text-accent-100 mb-4">
              Monitor project milestones and overall progress
            </p>
            <div className="flex justify-end">
              <ArrowRight className="h-5 w-5" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProjectsOverview />
          <TasksOverview />
        </div>

        <div className="h-[500px]">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
