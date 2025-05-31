import React from 'react';
import { ArrowRight, BarChart2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';
import { useProject } from '../../contexts/ProjectContext';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const ProjectsOverview: React.FC = () => {
  const { projects } = useProject();

  // Calculate overall progress
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    p => p.status === 'completed'
  ).length;
  const inProgressProjects = projects.filter(
    p => p.status === 'in-progress'
  ).length;
  const planningProjects = projects.filter(p => p.status === 'planning').length;

  const overallProgress =
    totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Projects Overview</CardTitle>
          <BarChart2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Progress
              </h4>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <ProgressBar value={overallProgress} size="lg" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {totalProjects}
              </p>
            </div>
            <div className="bg-accent-50 dark:bg-accent-900/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                In Progress
              </p>
              <p className="text-lg font-semibold text-accent-700 dark:text-accent-400">
                {inProgressProjects}
              </p>
            </div>
            <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Planning
              </p>
              <p className="text-lg font-semibold text-secondary-700 dark:text-secondary-400">
                {planningProjects}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Recent Projects
            </h4>

            {projects.slice(0, 3).map(project => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block"
              >
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-gray-100">
                      {project.title}
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}{' '}
                      • {project.progress}%
                    </p>
                  </div>
                  <ProgressBar value={project.progress} className="w-20" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Link to="/projects" className="w-full">
          <Button
            variant="ghost"
            className="w-full justify-center"
            rightIcon={<ArrowRight size={16} />}
          >
            View All Projects
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProjectsOverview;
