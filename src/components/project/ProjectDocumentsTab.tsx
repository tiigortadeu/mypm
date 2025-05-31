import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Calendar,
  File,
  Image,
  Video,
  Paperclip,
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

interface ProjectDocumentsTabProps {
  project: Project;
  formatDate: (dateString?: string) => string;
}

const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ 
  project, 
  formatDate 
}) => {
  // Local state for filters and search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    if (!project.documents) return [];
    
    return project.documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [project.documents, searchTerm, typeFilter]);

  // Group documents by type
  const documentsByType = useMemo(() => {
    return filteredDocuments.reduce((groups, doc) => {
      if (!groups[doc.type]) {
        groups[doc.type] = [];
      }
      groups[doc.type].push(doc);
      return groups;
    }, {} as Record<string, typeof filteredDocuments>);
  }, [filteredDocuments]);

  // Get document type icon
  const getDocumentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return FileText;
      case 'image':
      case 'photo':
        return Image;
      case 'video':
        return Video;
      case 'attachment':
        return Paperclip;
      default:
        return File;
    }
  };

  // Get document type color
  const getDocumentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
      case 'document':
        return 'primary';
      case 'image':
      case 'photo':
        return 'success';
      case 'video':
        return 'accent';
      case 'attachment':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get unique document types
  const documentTypes = useMemo(() => {
    if (!project.documents) return [];
    return [...new Set(project.documents.map(doc => doc.type))];
  }, [project.documents]);

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">Todos os Tipos</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Upload Button */}
            <Button variant="primary" leftIcon={<Upload size={16} />}>
              Upload Documento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-6">
          {/* Document Types */}
          {Object.entries(documentsByType).map(([type, docs]) => (
            <Card key={type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {React.createElement(getDocumentIcon(type), { className: 'h-5 w-5' })}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                    <Badge variant="default" className="text-xs">
                      {docs.length} {docs.length === 1 ? 'documento' : 'documentos'}
                    </Badge>
                  </CardTitle>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map(doc => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {React.createElement(getDocumentIcon(doc.type), { 
                            className: 'h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0' 
                          })}
                          <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                            {doc.title}
                          </h4>
                        </div>
                        
                        <Badge 
                          variant={getDocumentTypeColor(doc.type) as any}
                          className="text-xs flex-shrink-0"
                        >
                          {doc.type}
                        </Badge>
                      </div>
                      
                      {/* Document Metadata */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>Atualizado: {formatDate(doc.updatedAt)}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}>
                          Visualizar
                        </Button>
                        <Button variant="ghost" size="sm" leftIcon={<Download size={14} />}>
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {project.documents && project.documents.length > 0 
                  ? 'Nenhum documento corresponde aos filtros'
                  : 'Nenhum documento anexado'
                }
              </h3>
              <p className="text-sm mb-6">
                {project.documents && project.documents.length > 0 
                  ? 'Tente ajustar os filtros ou termo de busca'
                  : 'Comece adicionando documentos relevantes ao projeto'
                }
              </p>
              
              {!project.documents || project.documents.length === 0 ? (
                <div className="space-y-3">
                  <Button variant="primary" leftIcon={<Upload size={16} />}>
                    Upload Primeiro Documento
                  </Button>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Suporte para PDF, Word, Excel, Imagens, etc.
                  </div>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}>
                  Limpar Filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Upload Area - Future Feature */}
      <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
        <CardContent className="py-8">
          <div className="text-center">
            <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Área de Upload Rápido
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Arraste e solte arquivos aqui ou clique para selecionar
            </p>
            
            <div className="flex justify-center gap-2">
              <Button variant="ghost" size="sm" leftIcon={<Plus size={16} />}>
                Selecionar Arquivos
              </Button>
              <Button variant="ghost" size="sm">
                Configurar Upload
              </Button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">Tipos suportados:</span> PDF, DOC, XLS, PPT, PNG, JPG, MP4
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Categories Summary */}
      {project.documents && project.documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(documentsByType).map(([type, docs]) => (
                <div key={type} className="text-center p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg">
                  <div className="flex justify-center mb-2">
                    {React.createElement(getDocumentIcon(type), { 
                      className: 'h-6 w-6 text-gray-600 dark:text-gray-400' 
                    })}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {docs.length}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {type}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectDocumentsTab; 