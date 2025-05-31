import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  File,
  Image,
  Video,
  User,
  MoreHorizontal
} from 'lucide-react';
import Button from '../ui/Button';
import { Project, DocumentType } from '../../types';
import { useProject } from '../../contexts/ProjectContext';

interface ProjectDocumentsTabProps {
  project: Project;
  formatDate: (dateString?: string) => string;
}

const ProjectDocumentsTab: React.FC<ProjectDocumentsTabProps> = ({ 
  project, 
  formatDate 
}) => {
  const { deleteDocument } = useProject();
  
  // Local state for filters and search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    if (!project.documents) return [];
    
    return project.documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [project.documents, searchTerm, typeFilter]);

  // Get unique document types
  const documentTypes = useMemo(() => {
    if (!project.documents) return [];
    return [...new Set(project.documents.map(doc => doc.type))];
  }, [project.documents]);

  // Get document type icon
  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'doc':
        return FileText;
      case 'xls':
        return FileText;
      case 'image':
        return Image;
      case 'video':
        return Video;
      default:
        return File;
    }
  };

  // Get document type color
  const getDocumentTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'pdf':
        return 'text-red-500';
      case 'doc':
        return 'text-blue-500';
      case 'xls':
        return 'text-green-600';
      case 'image':
        return 'text-green-500';
      case 'video':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleViewDocument = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadDocument = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      deleteDocument(documentId);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Section - Inline, no cards */}
      <div className="bg-gray-50/30 dark:bg-gray-800/20 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-transparent border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 placeholder-gray-500"
            />
          </div>
          
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-0 rounded-lg px-3 py-3 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200"
            >
              <option value="all">Todos os Tipos</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List - Minimalista */}
      {filteredDocuments.length > 0 ? (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento' : 'documentos'}
            </p>
          </div>

          {/* Document Items */}
          <div className="space-y-1">
            {filteredDocuments.map((doc) => {
              const IconComponent = getDocumentIcon(doc.type);
              
              return (
                <div
                  key={doc.id}
                  className="group flex items-center gap-4 p-4 rounded-lg transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/50"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-5 w-5 ${getDocumentTypeColor(doc.type)}`} />
                  </div>
                  
                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {doc.title}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                        {doc.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{doc.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(doc.updatedAt)}</span>
                      </div>
                      {doc.size && (
                        <span>{formatFileSize(doc.size)}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(doc.url)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc.url, doc.title)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gray-50/30 dark:bg-gray-800/20 rounded-lg p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {project.documents && project.documents.length > 0 
                ? 'Nenhum documento corresponde aos filtros'
                : 'Nenhum documento anexado'
              }
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {project.documents && project.documents.length > 0 
                ? 'Tente ajustar os filtros ou termo de busca para encontrar os documentos que procura.'
                : 'Comece adicionando documentos relevantes ao projeto usando o botão de upload.'
              }
            </p>
            
            {project.documents && project.documents.length > 0 ? (
              <Button
                variant="ghost"
                onClick={clearFilters}
              >
                Limpar Filtros
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use o botão flutuante no canto inferior direito para fazer upload
                </p>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Tipos suportados: PDF, DOC, XLS, Imagens, Vídeos
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDocumentsTab; 