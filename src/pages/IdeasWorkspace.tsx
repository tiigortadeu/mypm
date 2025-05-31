import React, { useState } from 'react';
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
  Plus,
  Trash2,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const IdeasWorkspace: React.FC = () => {
  const { ideas, addIdea, updateIdea, deleteIdea } = useProject();
  const [newIdea, setNewIdea] = useState('');
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddIdea = () => {
    if (newIdea.trim() === '') return;

    const idea = {
      id: Date.now().toString(),
      title: newIdea,
      description: '',
      status: 'draft',
      createdAt: new Date().toISOString(),
    };

    addIdea(idea);
    setNewIdea('');
  };

  const handleSelectIdea = (id: string) => {
    setSelectedIdea(id);
    setBreakdown([]);
  };

  const handleGenerateBreakdown = () => {
    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const selectedIdeaObj = ideas.find(idea => idea.id === selectedIdea);

      if (selectedIdeaObj) {
        const newBreakdown = [
          'Target Audience: Define your primary user persona(s) in detail',
          'Core Problem: What specific problem does this solve for users?',
          'Unique Value Proposition: What makes your solution better than alternatives?',
          'Key Features: List 3-5 essential features for MVP',
          'Success Metrics: How will you measure if the idea is working?',
          'Potential Challenges: Technical, market, or user adoption obstacles',
          'Monetization Strategy: How will this idea generate revenue?',
          'Next Steps: Create user stories and define project scope',
        ];

        setBreakdown(newBreakdown);
        updateIdea(selectedIdeaObj.id, { status: 'exploring' });
      }

      setIsGenerating(false);
    }, 2000);
  };

  const handleValidateIdea = () => {
    if (selectedIdea) {
      updateIdea(selectedIdea, { status: 'validated' });
    }
  };

  const handleRejectIdea = () => {
    if (selectedIdea) {
      updateIdea(selectedIdea, { status: 'rejected' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 dark:text-gray-50">
            Improve My Idea
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Break down your product ideas and validate key assumptions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ideas List */}
        <Card>
          <CardHeader>
            <CardTitle>My Ideas</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newIdea}
                onChange={e => setNewIdea(e.target.value)}
                placeholder="Enter a new idea..."
                className="input flex-1"
                onKeyDown={e => e.key === 'Enter' && handleAddIdea()}
              />
              <Button onClick={handleAddIdea} leftIcon={<Plus size={16} />} />
            </div>

            <div className="space-y-2 mt-4">
              {ideas.map(idea => (
                <motion.div
                  key={idea.id}
                  whileHover={{ scale: 1.01 }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedIdea === idea.id
                      ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800'
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => handleSelectIdea(idea.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {idea.title}
                      </h3>
                      {idea.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {idea.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        idea.status === 'validated'
                          ? 'success'
                          : idea.status === 'exploring'
                            ? 'primary'
                            : idea.status === 'rejected'
                              ? 'error'
                              : 'default'
                      }
                    >
                      {idea.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(idea.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        deleteIdea(idea.id);
                        if (selectedIdea === idea.id) {
                          setSelectedIdea(null);
                          setBreakdown([]);
                        }
                      }}
                      className="text-gray-400 hover:text-error-500 dark:hover:text-error-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {ideas.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No ideas yet. Add your first idea above!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Idea Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Idea Breakdown</CardTitle>
              {selectedIdea && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<XCircle size={16} />}
                    onClick={handleRejectIdea}
                  >
                    Not Viable
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    leftIcon={<CheckCircle size={16} />}
                    onClick={handleValidateIdea}
                  >
                    Validate
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {selectedIdea ? (
              <>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100 mb-1">
                    {ideas.find(idea => idea.id === selectedIdea)?.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {ideas.find(idea => idea.id === selectedIdea)
                      ?.description ||
                      'No description provided. Add more details to improve the breakdown.'}
                  </p>
                </div>

                {breakdown.length > 0 ? (
                  <div className="space-y-4">
                    {breakdown.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {item}
                        </h4>
                        <textarea
                          className="input min-h-[80px] w-full"
                          placeholder="Add your thoughts here..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 text-secondary-500 opacity-50" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Generate AI Breakdown
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                      Let AI help you break down your idea into key components
                      to validate and develop further.
                    </p>
                    <Button
                      variant="secondary"
                      leftIcon={<ArrowUpRight size={18} />}
                      onClick={handleGenerateBreakdown}
                      isLoading={isGenerating}
                    >
                      Generate Breakdown
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select an idea to get started
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Choose an idea from the list or create a new one to break it
                  down and improve it.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IdeasWorkspace;
