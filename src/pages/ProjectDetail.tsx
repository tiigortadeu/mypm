import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import TabNavigation, { TabItem } from '../components/ui/TabNavigation';
import ProjectOverviewTab from '../components/project/ProjectOverviewTab';
import ProjectTasksMilestonesTab from '../components/project/ProjectTasksMilestonesTab';
import ProjectRisksTab from '../components/project/ProjectRisksTab';
import ProjectDocumentsTab from '../components/project/ProjectDocumentsTab';
import ProjectAnalyticsTab from '../components/project/ProjectAnalyticsTab';
import ProjectFinancialTab from '../components/project/ProjectFinancialTab';
import { useProject } from '../contexts/ProjectContext';
import {
  Calendar,
  ListTodo,
  Target,
  BarChart2,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Edit,
  FileText,
  TrendingUp,
  DollarSign,
  Shield,
  Star,
  Eye,
  FolderOpen,
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks, milestones } = useProject();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL state management for active tab
  const activeTab = searchParams.get('tab') || 'overview';

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(t => t.projectId === id);
  const projectMilestones = milestones.filter(m => m.projectId === id);

  // Calculate task statistics
  const completedTasks = projectTasks.filter(
    t => t.status === 'completed'
  ).length;
  const totalTasks = projectTasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate milestone statistics
  const completedMilestones = projectMilestones.filter(
    m => m.status === 'completed'
  ).length;
  const totalMilestones = projectMilestones.length;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  // Calculate urgent tasks
  const urgentTasks = projectTasks.filter(
    t => t.priority === 'urgent' && t.status !== 'completed'
  );

  // Calculate overdue milestones
  const overdueMilestones = projectMilestones.filter(m => {
    if (m.status === 'completed') return false;
    return new Date(m.dueDate) < new Date();
  });

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  // Tab configuration
  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Eye,
    },
    {
      id: 'tasks-milestones',
      label: 'Tasks & Milestones',
      icon: ListTodo,
      badge: totalTasks > 0 ? totalTasks : undefined,
    },
    {
      id: 'risks',
      label: 'Risks & Issues',
      icon: Shield,
      badge: project?.risks?.length || undefined,
    },
    {
      id: 'documents',
      label: 'Documents & Assets',
      icon: FileText,
      badge: project?.documents?.length || undefined,
    },
    {
      id: 'financial',
      label: 'Financeiro',
      icon: DollarSign,
      badge: project?.financialTransactions?.length || undefined,
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: BarChart2,
    },
  ];

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get milestone status color
  const getMilestoneStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'primary';
      case 'delayed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Projeto não encontrado
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          O projeto que você está procurando não existe ou foi deletado.
        </p>
        <Link to="/">
          <Button variant="primary">Voltar ao Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header - Compact */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-semibold text-gray-900 dark:text-gray-50 mb-1">
          {project.title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {project.description}
        </p>
      </div>

      {/* Metrics Cards - Inline Format */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-4 md:gap-6"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {project.progress}%
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Progress
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <ListTodo className="h-4 w-4 text-accent-600 dark:text-accent-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {completedTasks}/{totalTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Tasks
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <Target className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {completedMilestones}/{totalMilestones}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Milestones
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
          <CheckCircle className={`h-4 w-4 ${
            project.status === 'completed' ? 'text-success-600 dark:text-success-400' :
            project.status === 'in-progress' ? 'text-primary-600 dark:text-primary-400' :
            project.status === 'on-hold' ? 'text-warning-600 dark:text-warning-400' :
            'text-gray-600 dark:text-gray-400'
          }`} />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {project.status === 'in-progress' ? 'Em Progresso' :
             project.status === 'completed' ? 'Concluído' :
             project.status === 'on-hold' ? 'Em Pausa' : 'Planejamento'}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Status
          </span>
        </div>

        {project.budget && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
            <DollarSign className="h-4 w-4 text-success-600 dark:text-success-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              R$ {project.budget.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Orçamento
            </span>
          </div>
        )}
      </motion.div>

      {/* Tab Navigation with Action Buttons */}
      <div className="flex justify-between items-center">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Edit size={16} />}>
            Editar Projeto
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Target size={16} />}>
            Adicionar Milestone
          </Button>
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="min-h-[300px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <ProjectOverviewTab
            project={project}
            taskProgress={taskProgress}
            milestoneProgress={milestoneProgress}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
            completedMilestones={completedMilestones}
            totalMilestones={totalMilestones}
            urgentTasks={urgentTasks}
            overdueMilestones={overdueMilestones}
            formatDate={formatDate}
            projectTasks={projectTasks}
            projectMilestones={projectMilestones}
            handleTabChange={handleTabChange}
          />
        )}

        {/* Tasks & Milestones Tab */}
        {activeTab === 'tasks-milestones' && (
          <ProjectTasksMilestonesTab
            projectId={id!}
            projectTasks={projectTasks}
            projectMilestones={projectMilestones}
            formatDate={formatDate}
            getMilestoneStatusColor={getMilestoneStatusColor}
          />
        )}

        {/* Risks & Issues Tab */}
        {activeTab === 'risks' && (
          <ProjectRisksTab project={project} />
        )}

        {/* Documents & Assets Tab */}
        {activeTab === 'documents' && (
          <ProjectDocumentsTab 
            project={project}
            formatDate={formatDate}
          />
        )}

        {/* Financial Tab */}
        {activeTab === 'financial' && (
          <ProjectFinancialTab
            project={project}
            formatDate={formatDate}
          />
        )}

        {/* Analytics & Reports Tab */}
        {activeTab === 'analytics' && (
          <ProjectAnalyticsTab
            project={project}
            projectTasks={projectTasks}
            projectMilestones={projectMilestones}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
