import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
  Search,
  SortAsc,
  DollarSign,
  Settings,
  Globe,
  Users,
  Flag,
  CheckCircle,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import TabNavigation, { TabItem } from '../ui/TabNavigation';
import { Project, Risk, RiskCategory, RiskImpact, RiskProbability, RiskStatus } from '../../types';

interface ProjectRisksTabProps {
  project: Project;
}

const ProjectRisksTab: React.FC<ProjectRisksTabProps> = ({ project }) => {
  // Local state for current view and filters
  const [currentView, setCurrentView] = useState<'risks' | 'issues' | 'benefits' | 'decisions'>('risks');
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [probabilityFilter, setProbabilityFilter] = useState<string>('all');

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Get filtered risks by category and search for each tab
  const risksByCategory = useMemo(() => {
    if (!project.risks) return { 'risks': [], 'issues': [], 'benefits': [], 'decisions': [] };
    
    // Apply search filter first
    const searchFiltered = project.risks.filter(risk => {
      if (searchQuery === '') return true;
      const searchTerm = searchQuery.toLowerCase();
      return (
        risk.title?.toLowerCase().includes(searchTerm) ||
        risk.description?.toLowerCase().includes(searchTerm) ||
        risk.mitigation?.toLowerCase().includes(searchTerm)
      );
    });
    
    // Then apply tab-specific filters and categorization
    const categorized = {
      'risks': searchFiltered.filter(risk => {
        // Apply additional filters for risks
        const categoryMatch = categoryFilter === 'all' || risk.category === categoryFilter;
        const impactMatch = impactFilter === 'all' || risk.impact === impactFilter;
        const statusMatch = statusFilter === 'all' || risk.status === statusFilter;
        const probabilityMatch = probabilityFilter === 'all' || risk.probability === probabilityFilter;
        
        // Include technical and financial risks for risks tab
        const tabMatch = ['technical', 'financial'].includes(risk.category);
        
        return tabMatch && categoryMatch && impactMatch && statusMatch && probabilityMatch;
      }),
      'issues': searchFiltered.filter(risk => {
        // Apply filters for issues (operational and external)
        const categoryMatch = categoryFilter === 'all' || risk.category === categoryFilter;
        const statusMatch = statusFilter === 'all' || risk.status === statusFilter;
        
        // For issues, use operational and external risks
        const tabMatch = ['operational', 'external'].includes(risk.category);
        
        return tabMatch && categoryMatch && statusMatch;
      }),
      'benefits': searchFiltered.filter(risk => {
        // For benefits, use resource-related positive outcomes
        const statusMatch = statusFilter === 'all' || risk.status === statusFilter;
        const tabMatch = risk.category === 'resource';
        
        return tabMatch && statusMatch;
      }),
      'decisions': [] as typeof project.risks // Placeholder for decisions - to be implemented
    };
    
    return categorized;
  }, [project.risks, searchQuery, categoryFilter, impactFilter, statusFilter, probabilityFilter]);

  // Helper Functions - Following ProjectTasksMilestonesTab pattern
  
  // Get risk category icon (TypeScript strict)
  const getRiskCategoryIcon = (category: RiskCategory) => {
    switch (category) {
      case 'technical': return AlertTriangle;
      case 'financial': return DollarSign;
      case 'operational': return Settings;
      case 'external': return Globe;
      case 'resource': return Users;
      default: return AlertTriangle;
    }
  };

  // Get risk impact color (TypeScript strict)
  const getRiskImpactColor = (impact: RiskImpact) => {
    switch (impact) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get risk status color (TypeScript strict)
  const getRiskStatusColor = (status: RiskStatus) => {
    switch (status) {
      case 'open': return 'error';
      case 'mitigated': return 'warning';
      case 'closed': return 'success';
      case 'accepted': return 'accent';
      default: return 'default';
    }
  };

  // Get risk probability color (TypeScript strict)
  const getRiskProbabilityColor = (probability: RiskProbability) => {
    switch (probability) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Get category label in Portuguese (TypeScript strict)
  const getCategoryLabel = (category: RiskCategory) => {
    switch (category) {
      case 'technical': return 'Técnico';
      case 'financial': return 'Financeiro';
      case 'operational': return 'Operacional';
      case 'external': return 'Externo';
      case 'resource': return 'Recursos';
      default: return category;
    }
  };

  // Get impact label in Portuguese (TypeScript strict)
  const getImpactLabel = (impact: RiskImpact) => {
    switch (impact) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return impact;
    }
  };

  // Get status label in Portuguese (TypeScript strict)
  const getStatusLabel = (status: RiskStatus) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'mitigated': return 'Mitigado';
      case 'closed': return 'Fechado';
      case 'accepted': return 'Aceito';
      default: return status;
    }
  };

  // Get probability label in Portuguese (TypeScript strict)
  const getProbabilityLabel = (probability: RiskProbability) => {
    switch (probability) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return probability;
    }
  };

  // Additional helper functions for UX
  
  // Check if risk is high priority based on impact and probability
  const isHighPriorityRisk = (impact: RiskImpact, probability: RiskProbability) => {
    return (impact === 'critical' || impact === 'high') && (probability === 'high' || probability === 'medium');
  };

  // Get placeholder text based on current view
  const getSearchPlaceholder = () => {
    switch (currentView) {
      case 'risks': return 'Buscar riscos...';
      case 'issues': return 'Buscar issues...';
      case 'benefits': return 'Buscar benefícios...';
      case 'decisions': return 'Buscar decisões...';
      default: return 'Buscar...';
    }
  };

  // Get contextual empty state messages
  const getEmptyState = () => {
    const hasActiveFilters = categoryFilter !== 'all' || impactFilter !== 'all' || 
                           statusFilter !== 'all' || probabilityFilter !== 'all';
    const hasSearchQuery = searchQuery.trim() !== '';

    if (hasSearchQuery) {
      return {
        title: `Nenhum resultado encontrado`,
        message: `Não encontramos ${
          currentView === 'risks' ? 'riscos' :
          currentView === 'issues' ? 'issues' :
          currentView === 'benefits' ? 'benefícios' : 'decisões'
        } que correspondam à sua busca "${searchQuery}".`,
        action: 'Tente termos diferentes ou limpe os filtros.',
        showClearButton: true
      };
    }

    if (hasActiveFilters) {
      return {
        title: `Nenhum item encontrado`,
        message: `Não há ${
          currentView === 'risks' ? 'riscos' :
          currentView === 'issues' ? 'issues' :
          currentView === 'benefits' ? 'benefícios' : 'decisões'
        } que correspondam aos filtros aplicados.`,
        action: 'Ajuste os filtros ou limpe-os para ver mais resultados.',
        showClearButton: true
      };
    }

    // No filters, no search - default empty states
    switch (currentView) {
      case 'risks':
        return {
          title: 'Nenhum risco cadastrado',
          message: 'Este projeto ainda não possui riscos identificados.',
          action: 'Identifique e cadastre os primeiros riscos do projeto.',
          showClearButton: false
        };
      case 'issues':
        return {
          title: 'Nenhum issue reportado',
          message: 'Nenhum problema ou issue foi reportado para este projeto.',
          action: 'Documente issues conforme eles surgirem durante o projeto.',
          showClearButton: false
        };
      case 'benefits':
        return {
          title: 'Benefícios não catalogados',
          message: 'Os benefícios deste projeto ainda não foram documentados.',
          action: 'Identifique e documente os benefícios esperados.',
          showClearButton: false
        };
      case 'decisions':
        return {
          title: 'Nenhuma decisão registrada',
          message: 'As decisões importantes do projeto serão listadas aqui.',
          action: 'Funcionalidade em desenvolvimento - em breve!',
          showClearButton: false
        };
      default:
        return {
          title: 'Nenhum item encontrado',
          message: 'Não há itens para exibir nesta seção.',
          action: 'Verifique outras abas ou adicione novos itens.',
          showClearButton: false
        };
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setCategoryFilter('all');
    setImpactFilter('all');
    setStatusFilter('all');
    setProbabilityFilter('all');
    setSearchQuery('');
  };

  // Placeholder action handlers (to be integrated with actual functionality)
  const handleCreateRisk = () => {
    // TODO: Implement risk creation modal
    alert('Funcionalidade de criação de risco será implementada em breve!');
  };

  const handleCreateDependency = () => {
    // TODO: Implement dependency creation modal  
    alert('Funcionalidade de criação de dependência será implementada em breve!');
  };

  const handleCreateAssumption = () => {
    // TODO: Implement assumption creation modal
    alert('Funcionalidade de criação de premissa será implementada em breve!');
  };

  // Render contextual empty state component
  const renderEmptyState = () => {
    const emptyState = getEmptyState();
    
    return (
      <div 
        className="text-center py-12 text-gray-500 dark:text-gray-400"
        role="status"
        aria-live="polite"
        aria-label={`${emptyState.title}. ${emptyState.message}`}
      >
        <AlertTriangle 
          className="h-16 w-16 mx-auto mb-4 opacity-20" 
          aria-hidden="true"
        />
        <h3 className="text-lg font-medium mb-2">
          {emptyState.title}
        </h3>
        <p className="text-sm mb-4 max-w-md mx-auto">
          {emptyState.message}
        </p>
        <p className="text-xs text-gray-400 mb-4">
          {emptyState.action}
        </p>
        {emptyState.showClearButton && (
          <Button 
            variant="ghost" 
            leftIcon={<Plus size={16} />}
            onClick={clearAllFilters}
            className="focus:ring-2 focus:ring-primary-500 focus:outline-none"
            aria-label="Limpar filtros ativos"
          >
            Limpar Filtros
          </Button>
        )}
      </div>
    );
  };

  // Internal tab configuration
  const internalTabs: TabItem[] = [
    {
      id: 'risks',
      label: 'Riscos',
      icon: AlertTriangle,
      badge: risksByCategory['risks'].length > 0 ? risksByCategory['risks'].length : undefined,
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: Flag,
      badge: risksByCategory['issues'].length > 0 ? risksByCategory['issues'].length : undefined,
    },
    {
      id: 'benefits',
      label: 'Benefícios',
      icon: Star,
      badge: risksByCategory['benefits'].length > 0 ? risksByCategory['benefits'].length : undefined,
    },
    {
      id: 'decisions',
      label: 'Decisões',
      icon: CheckCircle,
      badge: risksByCategory['decisions'].length > 0 ? risksByCategory['decisions'].length : undefined,
    },
  ];

  const toggleRiskExpansion = (riskId: string) => {
    setExpandedRisk(expandedRisk === riskId ? null : riskId);
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
      transition={prefersReducedMotion ? {} : { duration: 0.3 }}
    >
      {/* Header with Internal Tabs */}
      <motion.div 
        className="text-center space-y-4"
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={prefersReducedMotion ? {} : { opacity: 1 }}
        transition={prefersReducedMotion ? {} : { delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Riscos & Gestão RIDAC
        </h2>
        
        <TabNavigation
          tabs={internalTabs}
          activeTab={currentView}
          onTabChange={(tabId) => setCurrentView(tabId as 'risks' | 'issues' | 'benefits' | 'decisions')}
          variant="compact"
        />
      </motion.div>

      {/* Universal Search Field */}
      <motion.div 
        className="flex justify-center"
        initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? {} : { delay: 0.2 }}
      >
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-transparent focus:border-primary-300 dark:focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 text-sm"
            aria-label={`Buscar em ${currentView === 'risks' ? 'riscos' : 
                        currentView === 'issues' ? 'issues' : 
                        currentView === 'benefits' ? 'benefícios' : 'decisões'}`}
            aria-describedby="search-help"
          />
          <div id="search-help" className="sr-only">
            Digite para buscar por título, descrição ou mitigação
          </div>
        </div>
      </motion.div>

      {/* Risks & Issues View */}
      <AnimatePresence mode="wait">
        {currentView === 'risks' && (
          <motion.div 
            className="space-y-6"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            transition={prefersReducedMotion ? {} : { duration: 0.3 }}
          >
            {/* Intelligent Filters for Risks & Issues */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.3 }}
              role="group"
              aria-label="Filtros para riscos e issues"
            >
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <Filter className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <label htmlFor="category-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">Categoria:</label>
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded text-gray-700 dark:text-gray-300 cursor-pointer"
                  aria-label="Filtrar por categoria de risco"
                >
                  <option value="all">Todas</option>
                  <option value="technical">Técnico</option>
                  <option value="financial">Financeiro</option>
                  <option value="operational">Operacional</option>
                  <option value="external">Externo</option>
                  <option value="resource">Recursos</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <label htmlFor="impact-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">Impacto:</label>
                <select
                  id="impact-filter"
                  value={impactFilter}
                  onChange={(e) => setImpactFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded text-gray-700 dark:text-gray-300 cursor-pointer"
                  aria-label="Filtrar por nível de impacto"
                >
                  <option value="all">Todos</option>
                  <option value="critical">Crítico</option>
                  <option value="high">Alto</option>
                  <option value="medium">Médio</option>
                  <option value="low">Baixo</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <label htmlFor="status-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded text-gray-700 dark:text-gray-300 cursor-pointer"
                  aria-label="Filtrar por status do risco"
                >
                  <option value="all">Todos</option>
                  <option value="open">Aberto</option>
                  <option value="mitigated">Mitigado</option>
                  <option value="closed">Fechado</option>
                  <option value="accepted">Aceito</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <label htmlFor="probability-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">Probabilidade:</label>
                <select
                  id="probability-filter"
                  value={probabilityFilter}
                  onChange={(e) => setProbabilityFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none focus:ring-2 focus:ring-primary-500/50 rounded text-gray-700 dark:text-gray-300 cursor-pointer"
                  aria-label="Filtrar por probabilidade de ocorrência"
                >
                  <option value="all">Todas</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </motion.div>

            {risksByCategory['risks'].length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={prefersReducedMotion ? {} : { opacity: 1 }}
                transition={prefersReducedMotion ? {} : { delay: 0.4 }}
              >
                <AnimatePresence>
                  {risksByCategory['risks'].map((risk, index) => {
                    const isHighRisk = isHighPriorityRisk(risk.impact, risk.probability);
                    const CategoryIcon = getRiskCategoryIcon(risk.category);

                    return (
                      <motion.div
                        key={risk.id}
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, y: -20, scale: 0.95 }}
                        transition={prefersReducedMotion ? {} : { 
                          delay: 0.1 * (index % 6), // Stagger animation for first 6 items
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        whileHover={prefersReducedMotion ? {} : { 
                          scale: 1.02,
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          transition: { duration: 0.2 }
                        }}
                        className={`p-6 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer ${
                          isHighRisk ? 'border-l-4 border-error-500' : ''
                        }`}
                        role="article"
                        aria-label={`Risco: ${risk.title || 'Sem título'}. Impacto: ${getImpactLabel(risk.impact)}. Status: ${getStatusLabel(risk.status)}. ${isHighRisk ? 'Risco de alta prioridade.' : ''}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleRiskExpansion(risk.id);
                          }
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <CategoryIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                                {risk.title || 'Risco sem título'}
                              </h3>
                              {risk.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                                  {risk.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {isHighRisk && (
                            <AlertTriangle className="h-5 w-5 text-error-500 flex-shrink-0 ml-2" />
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* Impact and Status Badges */}
                          <div className="flex justify-center gap-2">
                            <Badge variant={getRiskImpactColor(risk.impact) as any} className="px-3 py-1">
                              {getImpactLabel(risk.impact)}
                            </Badge>
                            <Badge variant={getRiskStatusColor(risk.status) as any} className="px-3 py-1">
                              {getStatusLabel(risk.status)}
                            </Badge>
                          </div>

                          {/* Category and Probability */}
                          <div className="flex justify-center gap-2">
                            <Badge variant="default" className="px-2 py-1 text-xs">
                              {getCategoryLabel(risk.category)}
                            </Badge>
                            <Badge variant={getRiskProbabilityColor(risk.probability) as any} className="px-2 py-1 text-xs">
                              P: {getProbabilityLabel(risk.probability)}
                            </Badge>
                          </div>

                          {/* Owner and Created Date */}
                          <div className="space-y-2">
                            {risk.owner && (
                              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Responsável:</span> {risk.owner}
                              </div>
                            )}
                            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                              Criado: {new Date(risk.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          {/* Mitigation Preview */}
                          {risk.mitigation && (
                            <div className="mt-3 p-2 bg-primary-50/50 dark:bg-primary-900/20 rounded text-xs">
                              <span className="font-medium text-primary-700 dark:text-primary-300">Mitigação:</span>
                              <p className="text-primary-600 dark:text-primary-400 line-clamp-2 mt-1">
                                {risk.mitigation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              renderEmptyState()
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dependencies & Constraints View */}
      <AnimatePresence mode="wait">
        {currentView === 'issues' && (
          <motion.div 
            className="space-y-6"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            transition={prefersReducedMotion ? {} : { duration: 0.3 }}
          >
            {/* Simplified Filters for Dependencies */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.3 }}
            >
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Categoria:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="all">Todas</option>
                  <option value="technical">Técnico</option>
                  <option value="external">Externo</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="open">Aberto</option>
                  <option value="mitigated">Mitigado</option>
                  <option value="closed">Fechado</option>
                  <option value="accepted">Aceito</option>
                </select>
              </div>
            </motion.div>

            {risksByCategory['issues'].length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={prefersReducedMotion ? {} : { opacity: 0 }}
                animate={prefersReducedMotion ? {} : { opacity: 1 }}
                transition={prefersReducedMotion ? {} : { delay: 0.4 }}
              >
                <AnimatePresence>
                  {risksByCategory['issues'].map((risk, index) => {
                    const CategoryIcon = getRiskCategoryIcon(risk.category);
                    const isHighImpact = risk.impact === 'critical' || risk.impact === 'high';

                    return (
                      <motion.div
                        key={risk.id}
                        initial={prefersReducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                        animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, y: -20, scale: 0.95 }}
                        transition={prefersReducedMotion ? {} : { 
                          delay: 0.1 * (index % 6), // Stagger animation for first 6 items
                          type: "spring",
                          stiffness: 300,
                          damping: 25
                        }}
                        whileHover={prefersReducedMotion ? {} : { 
                          scale: 1.02,
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                          transition: { duration: 0.2 }
                        }}
                        className={`p-6 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer ${
                          isHighImpact ? 'border-l-4 border-warning-500' : ''
                        }`}
                        role="article"
                        aria-label={`Dependência: ${risk.title || 'Sem título'}. Impacto: ${getImpactLabel(risk.impact)}. Status: ${getStatusLabel(risk.status)}. ${isHighImpact ? 'Dependência de alta prioridade.' : ''}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleRiskExpansion(risk.id);
                          }
                        }}
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <CategoryIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                                {risk.title || 'Dependência sem título'}
                              </h3>
                              {risk.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                                  {risk.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {isHighImpact && (
                            <Shield className="h-5 w-5 text-warning-500 flex-shrink-0 ml-2" />
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* Impact and Status Badges */}
                          <div className="flex justify-center gap-2">
                            <Badge variant={getRiskImpactColor(risk.impact) as any} className="px-3 py-1">
                              {getImpactLabel(risk.impact)}
                            </Badge>
                            <Badge variant={getRiskStatusColor(risk.status) as any} className="px-3 py-1">
                              {getStatusLabel(risk.status)}
                            </Badge>
                          </div>

                          {/* Category */}
                          <div className="flex justify-center">
                            <Badge variant="default" className="px-2 py-1 text-xs">
                              {getCategoryLabel(risk.category)}
                            </Badge>
                          </div>

                          {/* Owner and Created Date */}
                          <div className="space-y-2">
                            {risk.owner && (
                              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Responsável:</span> {risk.owner}
                              </div>
                            )}
                            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                              Criado: {new Date(risk.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          {/* Mitigation Preview */}
                          {risk.mitigation && (
                            <div className="mt-3 p-2 bg-accent-50/50 dark:bg-accent-900/20 rounded text-xs">
                              <span className="font-medium text-accent-700 dark:text-accent-300">Estratégia:</span>
                              <p className="text-accent-600 dark:text-accent-400 line-clamp-2 mt-1">
                                {risk.mitigation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              renderEmptyState()
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assumptions & Benefits View */}
      <AnimatePresence mode="wait">
        {currentView === 'benefits' && (
          <motion.div 
            className="space-y-6"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            transition={prefersReducedMotion ? {} : { duration: 0.3 }}
          >
            {/* Minimal Filter for Assumptions */}
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.3 }}
            >
              <div className="flex items-center gap-2 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-all duration-200">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="open">Aberto</option>
                  <option value="mitigated">Validado</option>
                  <option value="closed">Fechado</option>
                  <option value="accepted">Aceito</option>
                </select>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assumptions Section */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? {} : { delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Premissas
                </h3>
                {risksByCategory['benefits'].length > 0 ? (
                  <motion.div 
                    className="grid grid-cols-1 gap-4"
                    initial={prefersReducedMotion ? {} : { opacity: 0 }}
                    animate={prefersReducedMotion ? {} : { opacity: 1 }}
                    transition={prefersReducedMotion ? {} : { delay: 0.5 }}
                  >
                    <AnimatePresence>
                      {risksByCategory['benefits'].map((risk, index) => (
                        <motion.div
                          key={risk.id}
                          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20, scale: 0.95 }}
                          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                          exit={prefersReducedMotion ? {} : { opacity: 0, y: -20, scale: 0.95 }}
                          transition={prefersReducedMotion ? {} : { 
                            delay: 0.1 * index,
                            type: "spring",
                            stiffness: 300,
                            damping: 25
                          }}
                          whileHover={prefersReducedMotion ? {} : { 
                            scale: 1.02,
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                            transition: { duration: 0.2 }
                          }}
                          className="p-4 rounded-lg bg-accent-50/50 dark:bg-accent-900/20 border-l-2 border-accent-200 dark:border-accent-800 hover:bg-accent-100/60 dark:hover:bg-accent-900/30 transition-all duration-200 cursor-pointer"
                          role="article"
                          aria-label={`Premissa: ${risk.title || 'Sem título'}. Status: ${getStatusLabel(risk.status)}. ${risk.status === 'accepted' ? 'Premissa aceita.' : ''}`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              toggleRiskExpansion(risk.id);
                            }
                          }}
                        >
                          <h4 className="font-medium text-accent-900 dark:text-accent-100 mb-2">
                            {risk.title || 'Premissa'}
                          </h4>
                          <p className="text-sm text-accent-700 dark:text-accent-300 mb-3 line-clamp-3">
                            {risk.description}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <Badge variant={getRiskStatusColor(risk.status) as any} className="text-xs px-2 py-1">
                              {getStatusLabel(risk.status)}
                            </Badge>
                            <div className="text-xs text-accent-600 dark:text-accent-400">
                              {new Date(risk.createdAt).toLocaleDateString('pt-BR')}
                            </div>
                          </div>

                          {risk.mitigation && (
                            <div className="mt-3 p-2 bg-accent-100/50 dark:bg-accent-800/20 rounded text-xs">
                              <span className="font-medium text-accent-800 dark:text-accent-200">Validação:</span>
                              <p className="text-accent-700 dark:text-accent-300 mt-1">
                                {risk.mitigation}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  renderEmptyState()
                )}
              </motion.div>

              {/* Benefits Section */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? {} : { delay: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Benefícios Esperados
                </h3>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm mb-3">Funcionalidade de benefícios será implementada</p>
                  <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />}>
                    Adicionar Benefício
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decisions View */}
      <AnimatePresence mode="wait">
        {currentView === 'decisions' && (
          <motion.div 
            className="space-y-6"
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -20 }}
            transition={prefersReducedMotion ? {} : { duration: 0.3 }}
          >
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 0.4 }}
              className="text-center py-12 text-gray-500 dark:text-gray-400"
            >
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">
                Registro de Decisões
              </h3>
              <p className="text-sm mb-4 max-w-md mx-auto">
                As decisões importantes do projeto serão documentadas aqui.
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Funcionalidade em desenvolvimento - em breve!
              </p>
              <Button 
                variant="ghost" 
                leftIcon={<CheckCircle size={16} />}
                disabled
                className="focus:ring-2 focus:ring-primary-500 focus:outline-none opacity-50 cursor-not-allowed"
              >
                Adicionar Decisão
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectRisksTab; 