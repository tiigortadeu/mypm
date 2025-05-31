import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { useProject } from '../contexts/ProjectContext';
import {
  Calendar,
  ListTodo,
  Users,
  BarChart2,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Edit,
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks, stories } = useProject();

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(t => t.projectId === id);
  const projectStories = stories.filter(s => s.projectId === id);

  // Calculate task statistics
  const completedTasks = projectTasks.filter(
    t => t.status === 'completed'
  ).length;
  const totalTasks = projectTasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate urgent tasks
  const urgentTasks = projectTasks.filter(
    t => t.priority === 'urgent' && t.status !== 'completed'
  );

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Project not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 dark:text-gray-50">
              {project.title}
            </h1>
            <Badge
              variant={
                project.status === 'completed'
                  ? 'success'
                  : project.status === 'in-progress'
                    ? 'primary'
                    : project.status === 'on-hold'
                      ? 'warning'
                      : 'default'
              }
            >
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {project.description}
          </p>
          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>Created: {formatDate(project.createdAt)}</span>
            </div>
            {project.dueDate && (
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>Due: {formatDate(project.dueDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" leftIcon={<Edit size={16} />}>
            Edit Project
          </Button>
          <Button variant="primary" leftIcon={<ListTodo size={16} />}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Progress overview */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall Progress
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {project.progress}%
                </div>
                <ProgressBar
                  value={project.progress}
                  size="lg"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tasks
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {completedTasks}/{totalTasks}
                </div>
                <ProgressBar
                  value={taskProgress}
                  size="lg"
                  variant="success"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                User Stories
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {projectStories.length}
                </div>
                <div className="flex-1 flex items-center">
                  <Users className="h-5 w-5 text-secondary-500" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Urgent Tasks
              </h3>
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                  {urgentTasks.length}
                </div>
                <div className="flex-1 flex items-center">
                  <AlertTriangle
                    className={`h-5 w-5 ${urgentTasks.length > 0 ? 'text-warning-500' : 'text-gray-400'}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Tasks</CardTitle>
              <Link to={`/projects/${id}/tasks`}>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight size={16} />}
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {projectTasks.length > 0 ? (
              <div className="space-y-3">
                {projectTasks.slice(0, 5).map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center space-x-3">
                      {task.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-success-500" />
                      ) : (
                        <div
                          className={`h-3 w-3 rounded-full ${
                            task.priority === 'high' ||
                            task.priority === 'urgent'
                              ? 'bg-warning-500'
                              : task.priority === 'medium'
                                ? 'bg-accent-500'
                                : 'bg-success-500'
                          }`}
                        />
                      )}
                      <div>
                        <h5
                          className={`font-medium ${task.status === 'completed' ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-gray-100'}`}
                        >
                          {task.title}
                        </h5>
                        {task.dueDate && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Due {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                    </div>
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ListTodo className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No tasks yet. Add your first task to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Stories section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Stories</CardTitle>
              <Link to={`/projects/${id}/stories`}>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight size={16} />}
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {projectStories.length > 0 ? (
              <div className="space-y-3">
                {projectStories.slice(0, 5).map(story => (
                  <div
                    key={story.id}
                    className="p-3 rounded-lg border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex justify-between">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100">
                        {story.title}
                      </h5>
                      <Badge
                        variant={
                          story.status === 'implemented' ||
                          story.status === 'validated'
                            ? 'success'
                            : story.status === 'implementing'
                              ? 'primary'
                              : story.status === 'planned'
                                ? 'accent'
                                : 'default'
                        }
                      >
                        {story.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {story.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No user stories yet. Add your first story to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Project Timeline</CardTitle>
            <BarChart2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Timeline visualization will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetail;
