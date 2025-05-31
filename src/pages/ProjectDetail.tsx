import React, { useState } from 'react';
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
import FloatingActionButton from '../components/ui/FloatingActionButton';
import CreateTaskModal from '../components/ui/CreateTaskModal';
import EditProjectModal from '../components/ui/EditProjectModal';
import UploadDocumentModal from '../components/ui/UploadDocumentModal';
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
  Plus,
  Flag,
  Upload,
  Receipt,
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, tasks, milestones } = useProject();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL state management for active tab
  const activeTab = searchParams.get('tab') || 'overview';

  // Modal states
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

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
    // Parse tabId to extract tab and any query parameters
    const [tab, queryString] = tabId.includes('?') ? tabId.split('?') : [tabId, ''];
    
    // Create new search params preserving existing ones
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    
    // Add any additional query parameters from the tabId
    if (queryString) {
      const queryParams = new URLSearchParams(queryString);
      queryParams.forEach((value, key) => {
        newParams.set(key, value);
      });
    }
    
    setSearchParams(newParams);
  };

  // Modal handlers
  const handleOpenCreateTaskModal = () => {
    setIsCreateTaskModalOpen(true);
  };

  const handleCloseCreateTaskModal = () => {
    setIsCreateTaskModalOpen(false);
  };

  const handleOpenEditProjectModal = () => {
    setIsEditProjectModalOpen(true);
  };

  const handleCloseEditProjectModal = () => {
    setIsEditProjectModalOpen(false);
  };

  const handleUploadDocument = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  // Quick Action handlers
  const handleCreateMilestone = () => {
    // TODO: Implementar modal de criação de milestone no futuro
    alert('Funcionalidade de criação de milestone será implementada em breve!');
  };

  const handleCreateTransaction = () => {
    // TODO: Implementar modal de criação de transação
    alert('Funcionalidade de transação financeira será implementada em breve!');
  };

  // Risk management handlers
  const handleCreateRisk = () => {
    // TODO: Implementar modal de criação de risco
    alert('Funcionalidade de criação de risco será implementada em breve!');
  };

  const handleCreateIssue = () => {
    // TODO: Implementar modal de criação de issue
    alert('Funcionalidade de criação de issue será implementada em breve!');
  };

  const handleCreateDependency = () => {
    // TODO: Implementar modal de criação de dependência
    alert('Funcionalidade de criação de dependência será implementada em breve!');
  };

  // Contextual actions for each tab
  const getFabActions = (): { id: string; label: string; icon: React.ElementType; onClick: () => void; variant?: 'primary' | 'secondary' | 'accent' | 'ghost'; }[] => {
    switch (activeTab) {
      case 'overview':
        return [{
          id: 'edit-project',
          label: 'Editar Projeto',
          icon: Edit,
          onClick: handleOpenEditProjectModal,
          variant: 'ghost',
        }];
      
      case 'tasks-milestones':
        return [
          {
            id: 'create-task',
            label: 'Nova Tarefa',
            icon: Plus,
            onClick: handleOpenCreateTaskModal,
            variant: 'primary',
          },
          {
            id: 'create-milestone',
            label: 'Adicionar Milestone',
            icon: Target,
            onClick: handleCreateMilestone,
            variant: 'secondary',
          }
        ];
      
      case 'risks':
        return [
          {
            id: 'create-risk',
            label: 'Adicionar Risco',
            icon: AlertTriangle,
            onClick: handleCreateRisk,
            variant: 'primary',
          },
          {
            id: 'create-dependency',
            label: 'Nova Dependência',
            icon: Shield,
            onClick: handleCreateDependency,
            variant: 'secondary',
          },
          {
            id: 'create-issue',
            label: 'Reportar Issue',
            icon: Flag,
            onClick: handleCreateIssue,
            variant: 'accent',
          }
        ];
      
      case 'documents':
        return [{
          id: 'upload-document',
          label: 'Upload Documento',
          icon: Upload,
          onClick: handleUploadDocument,
          variant: 'primary',
        }];
      
      case 'financial':
        return [{
          id: 'create-transaction',
          label: 'Nova Transação',
          icon: Receipt,
          onClick: handleCreateTransaction,
          variant: 'primary',
        }];
      
      default:
        return [];
    }
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
    <div className="max-w-7xl mx-auto space-y-4 relative">
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
        <motion.div 
          className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          role="button"
          aria-label={`Progresso do projeto: ${project.progress}%`}
        >
          <TrendingUp className="h-4 w-4 text-primary-600 dark:text-primary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {project.progress}%
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Progress
          </span>
        </motion.div>

        <motion.div 
          className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          role="button"
          aria-label={`Tarefas: ${completedTasks} de ${totalTasks} concluídas`}
        >
          <ListTodo className="h-4 w-4 text-accent-600 dark:text-accent-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {completedTasks}/{totalTasks}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Tasks
          </span>
        </motion.div>

        <motion.div 
          className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          role="button"
          aria-label={`Milestones: ${completedMilestones} de ${totalMilestones} concluídos`}
        >
          <Target className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {completedMilestones}/{totalMilestones}
          </span>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Milestones
          </span>
        </motion.div>

        <motion.div 
          className={`flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          tabIndex={0}
          role="button"
          aria-label={`Status do projeto: ${
            project.status === 'in-progress' ? 'Em Progresso' :
            project.status === 'completed' ? 'Concluído' :
            project.status === 'on-hold' ? 'Em Pausa' : 'Planejamento'
          }`}
        >
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
        </motion.div>

        {project.budget && (
          <motion.div 
            className="flex items-center gap-2 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            tabIndex={0}
            role="button"
            aria-label={`Orçamento: R$ ${project.budget.toLocaleString('pt-BR')}`}
          >
            <DollarSign className="h-4 w-4 text-success-600 dark:text-success-400" />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              R$ {project.budget.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Orçamento
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
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
            focus={searchParams.get('focus') as 'tasks' | 'milestones' | null}
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

      {/* Floating Action Button - Contextual actions for all tabs */}
      {getFabActions().length > 0 && (
        <FloatingActionButton
          actions={getFabActions()}
          className="z-[100]"
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={handleCloseCreateTaskModal}
        mode="create"
        task={undefined}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditProjectModalOpen}
        onClose={handleCloseEditProjectModal}
        project={project}
      />

      {/* Upload Document Modal */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        projectId={id!}
      />
    </div>
  );
};

export default ProjectDetail;
