import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Plus,
  Filter,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Project } from '../../types';

interface ProjectRisksTabProps {
  project: Project;
}

const ProjectRisksTab: React.FC<ProjectRisksTabProps> = ({ project }) => {
  // Local state for filters and UI
  const [riskTypeFilter, setRiskTypeFilter] = useState<string>('all');
  const [riskImpactFilter, setRiskImpactFilter] = useState<string>('all');
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);

  // Filter risks
  const filteredRisks = useMemo(() => {
    if (!project.risks) return [];
    
    return project.risks.filter(risk => {
      const typeMatch = riskTypeFilter === 'all' || risk.type === riskTypeFilter;
      const impactMatch = riskImpactFilter === 'all' || risk.impact === riskImpactFilter;
      return typeMatch && impactMatch;
    });
  }, [project.risks, riskTypeFilter, riskImpactFilter]);

  // Group risks by type
  const risksByType = useMemo(() => {
    if (!project.risks) return {};
    
    return filteredRisks.reduce((groups, risk) => {
      if (!groups[risk.type]) {
        groups[risk.type] = [];
      }
      groups[risk.type].push(risk);
      return groups;
    }, {} as Record<string, typeof filteredRisks>);
  }, [filteredRisks]);

  // Get risk type display name
  const getRiskTypeDisplayName = (type: string) => {
    switch (type) {
      case 'risk': return 'Riscos';
      case 'issue': return 'Questões';
      case 'dependency': return 'Dependências';
      case 'assumption': return 'Premissas';
      case 'constraint': return 'Restrições';
      default: return type;
    }
  };

  // Get risk type icon
  const getRiskTypeIcon = (type: string) => {
    switch (type) {
      case 'risk': return AlertTriangle;
      case 'issue': return AlertTriangle;
      case 'dependency': return Shield;
      case 'assumption': return TrendingUp;
      case 'constraint': return Shield;
      default: return AlertTriangle;
    }
  };

  // Get risk impact color
  const getRiskImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const toggleRiskExpansion = (riskId: string) => {
    setExpandedRisk(expandedRisk === riskId ? null : riskId);
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filtros:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tipo:</span>
              <select
                value={riskTypeFilter}
                onChange={(e) => setRiskTypeFilter(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="risk">Riscos</option>
                <option value="issue">Questões</option>
                <option value="dependency">Dependências</option>
                <option value="assumption">Premissas</option>
                <option value="constraint">Restrições</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Impacto:</span>
              <select
                value={riskImpactFilter}
                onChange={(e) => setRiskImpactFilter(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos</option>
                <option value="high">Alto</option>
                <option value="medium">Médio</option>
                <option value="low">Baixo</option>
              </select>
            </div>

            <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
              Adicionar Item RIDAC
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RIDAC Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risks & Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Riscos & Questões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(risksByType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(risksByType).map(([type, risks]) => {
                  if (!['risk', 'issue'].includes(type)) return null;
                  
                  const TypeIcon = getRiskTypeIcon(type);
                  
                  return (
                    <div key={type} className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        {getRiskTypeDisplayName(type)}
                        <Badge variant="default" className="text-xs">
                          {risks.length}
                        </Badge>
                      </h4>
                      
                      {risks.map(risk => (
                        <div
                          key={risk.id}
                          className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => toggleRiskExpansion(risk.id)}
                                className="flex items-center gap-2 text-left w-full"
                              >
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {risk.description}
                                </span>
                                {expandedRisk === risk.id ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                            </div>
                            
                            <Badge 
                              variant={getRiskImpactColor(risk.impact) as any}
                              className="ml-2 flex-shrink-0"
                            >
                              {risk.impact === 'high' ? 'Alto' :
                               risk.impact === 'medium' ? 'Médio' : 'Baixo'}
                            </Badge>
                          </div>
                          
                          {expandedRisk === risk.id && risk.mitigation && (
                            <div className="mt-2 p-2 bg-primary-50/50 dark:bg-primary-900/20 rounded border-l-2 border-primary-200 dark:border-primary-800">
                              <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                                Mitigação:
                              </span>
                              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                                {risk.mitigation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Shield className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhum risco ou questão identificado</p>
                <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Plus size={16} />}>
                  Adicionar Risco
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dependencies & Constraints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Dependências & Restrições
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(risksByType).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(risksByType).map(([type, risks]) => {
                  if (!['dependency', 'constraint', 'assumption'].includes(type)) return null;
                  
                  const TypeIcon = getRiskTypeIcon(type);
                  
                  return (
                    <div key={type} className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <TypeIcon className="h-4 w-4" />
                        {getRiskTypeDisplayName(type)}
                        <Badge variant="default" className="text-xs">
                          {risks.length}
                        </Badge>
                      </h4>
                      
                      {risks.map(risk => (
                        <div
                          key={risk.id}
                          className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                              <button
                                onClick={() => toggleRiskExpansion(risk.id)}
                                className="flex items-center gap-2 text-left w-full"
                              >
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                  {risk.description}
                                </span>
                                {expandedRisk === risk.id ? (
                                  <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                )}
                              </button>
                            </div>
                            
                            <Badge 
                              variant={getRiskImpactColor(risk.impact) as any}
                              className="ml-2 flex-shrink-0"
                            >
                              {risk.impact === 'high' ? 'Alto' :
                               risk.impact === 'medium' ? 'Médio' : 'Baixo'}
                            </Badge>
                          </div>
                          
                          {expandedRisk === risk.id && risk.mitigation && (
                            <div className="mt-2 p-2 bg-accent-50/50 dark:bg-accent-900/20 rounded border-l-2 border-accent-200 dark:border-accent-800">
                              <span className="text-xs font-medium text-accent-700 dark:text-accent-300">
                                {type === 'assumption' ? 'Validação:' : 'Tratamento:'}
                              </span>
                              <p className="text-xs text-accent-600 dark:text-accent-400 mt-1">
                                {risk.mitigation}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nenhuma dependência ou restrição definida</p>
                <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Plus size={16} />}>
                  Adicionar Dependência
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Benefícios Esperados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {project.benefits && project.benefits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {project.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-success-50/50 dark:bg-success-900/20 rounded-lg">
                  <Star className="h-4 w-4 text-success-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Nenhum benefício definido ainda</p>
              <Button variant="ghost" size="sm" className="mt-2" leftIcon={<Plus size={16} />}>
                Adicionar Benefício
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectRisksTab; 