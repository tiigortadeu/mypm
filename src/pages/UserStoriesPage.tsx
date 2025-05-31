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
  Users,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Filter,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserStoriesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, stories, addStory, deleteStory } = useProject();

  const [expandedStory, setExpandedStory] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const project = projects.find(p => p.id === id);
  const projectStories = stories.filter(s => s.projectId === id);

  const toggleStoryExpansion = (storyId: string) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };

  const filteredStories =
    filter === 'all'
      ? projectStories
      : projectStories.filter(story => story.status === filter);

  const handleGenerateStory = () => {
    // This would typically open a modal, but for simplicity we'll just add a sample story
    const newStory = {
      id: Date.now().toString(),
      projectId: id || '',
      title: 'New user story',
      description:
        'As a user, I want to perform an action so that I can achieve a goal',
      priority: 'medium' as const,
      status: 'backlog' as const,
      createdAt: new Date().toISOString(),
      acceptanceCriteria: [
        'Criteria 1: The user can successfully perform the action',
        'Criteria 2: The system validates the input appropriately',
        'Criteria 3: The user receives confirmation when the goal is achieved',
      ],
    };

    addStory(newStory);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 dark:text-gray-50">
            User Stories
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {project
              ? `${project.title} - User Stories`
              : 'Manage user stories for this project'}
          </p>
        </div>

        <div className="flex space-x-3">
          <div className="relative">
            <select
              className="input pr-8 appearance-none"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Stories</option>
              <option value="backlog">Backlog</option>
              <option value="planned">Planned</option>
              <option value="implementing">Implementing</option>
              <option value="implemented">Implemented</option>
              <option value="validated">Validated</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          <Button
            variant="outline"
            leftIcon={<Sparkles size={16} />}
            onClick={handleGenerateStory}
          >
            Generate Story
          </Button>

          <Button variant="primary" leftIcon={<Plus size={16} />}>
            Add Story
          </Button>
        </div>
      </div>

      {/* User stories list */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Stories</CardTitle>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {projectStories.length}{' '}
              {projectStories.length === 1 ? 'story' : 'stories'}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredStories.length > 0 ? (
            <div className="space-y-4">
              {filteredStories.map(story => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden"
                >
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={() => toggleStoryExpansion(story.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          story.priority === 'high' ||
                          story.priority === 'urgent'
                            ? 'bg-warning-500'
                            : story.priority === 'medium'
                              ? 'bg-accent-500'
                              : 'bg-success-500'
                        }`}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {story.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {story.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
                      {expandedStory === story.id ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedStory === story.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-200 dark:border-gray-800"
                      >
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                          <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                            Description
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {story.description}
                          </p>

                          {story.acceptanceCriteria &&
                            story.acceptanceCriteria.length > 0 && (
                              <>
                                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                                  Acceptance Criteria
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300 mb-4">
                                  {story.acceptanceCriteria.map(
                                    (criteria, index) => (
                                      <li key={index}>{criteria}</li>
                                    )
                                  )}
                                </ul>
                              </>
                            )}

                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Created:{' '}
                              {new Date(story.createdAt).toLocaleDateString()}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Edit size={14} />}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                leftIcon={<Trash2 size={14} />}
                                className="text-error-600 hover:text-error-700 border-error-200 hover:border-error-300 dark:text-error-400 dark:hover:text-error-300 dark:border-error-900 dark:hover:border-error-800"
                                onClick={() => deleteStory(story.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No user stories found
              </h3>
              <p className="max-w-md mx-auto mb-6">
                {filter === 'all'
                  ? "You haven't created any user stories for this project yet."
                  : `No user stories with the status "${filter}" found.`}
              </p>
              <div className="flex justify-center space-x-3">
                {filter !== 'all' && (
                  <Button variant="outline\" onClick={() => setFilter('all')}>
                    Show All Stories
                  </Button>
                )}
                <Button variant="primary" leftIcon={<Plus size={16} />}>
                  Add User Story
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStoriesPage;
