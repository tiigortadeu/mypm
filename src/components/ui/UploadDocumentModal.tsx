import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, Image, Download, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import Button from './Button';
import { Document, DocumentType } from '../../types';
import { useProject } from '../../contexts/ProjectContext';
import { cn } from '../../utils/cn';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface FileWithPreview extends File {
  preview?: string;
  id: string;
}

interface UploadProgress {
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  projectId,
}) => {
  const { addDocument } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Padrões de design estabelecidos
  const containerClasses = "bg-gray-50/30 dark:bg-gray-800/20 rounded-lg";
  const inputBaseClasses = "w-full px-4 py-3 bg-transparent border-0 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition-all duration-200";

  // Configurações de upload
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ACCEPTED_TYPES = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'doc',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xls',
    'video/mp4': 'video',
    'video/webm': 'video',
    'video/ogg': 'video',
  } as const;

  const getDocumentType = (mimeType: string): DocumentType => {
    return (ACCEPTED_TYPES as any)[mimeType] || 'other';
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE / 1024 / 1024}MB`;
    }
    
    if (!Object.keys(ACCEPTED_TYPES).includes(file.type)) {
      return 'Tipo de arquivo não suportado';
    }
    
    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: FileWithPreview[] = [];
    
    for (const file of Array.from(fileList)) {
      const validation = validateFile(file);
      if (validation) {
        // Mostrar erro de validação
        console.error(`Erro no arquivo ${file.name}: ${validation}`);
        continue;
      }
      
      const preview = await createFilePreview(file);
      const fileWithPreview: FileWithPreview = Object.assign(file, {
        preview,
        id: crypto.randomUUID(),
      });
      
      newFiles.push(fileWithPreview);
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  // File input handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => prev.filter(p => p.id !== fileId));
  };

  const simulateUpload = async (file: FileWithPreview): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        setUploadProgress(prev => 
          prev.map(p => 
            p.id === file.id 
              ? { ...p, progress: Math.min(progress, 100) }
              : p
          )
        );
        
        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(prev => 
            prev.map(p => 
              p.id === file.id 
                ? { ...p, progress: 100, status: 'completed' }
                : p
            )
          );
          
          // Simular sucesso ou erro (5% chance de erro)
          if (Math.random() < 0.05) {
            setUploadProgress(prev => 
              prev.map(p => 
                p.id === file.id 
                  ? { ...p, status: 'error', error: 'Erro de upload simulado' }
                  : p
              )
            );
            reject(new Error('Upload failed'));
          } else {
            resolve();
          }
        }
      }, 200);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Inicializar progress para todos os arquivos
    setUploadProgress(
      files.map(file => ({
        id: file.id,
        progress: 0,
        status: 'uploading' as const,
      }))
    );
    
    try {
      // Upload todos os arquivos simultaneamente
      await Promise.all(
        files.map(async (file) => {
          try {
            await simulateUpload(file);
            
            // Criar objeto Document
            const documentData: Omit<Document, 'id' | 'createdAt' | 'updatedAt'> = {
              projectId,
              title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
              type: getDocumentType(file.type),
              url: URL.createObjectURL(file), // Em produção seria a URL real
              size: file.size,
              uploadedBy: 'Usuário Atual', // Em produção seria o usuário logado
            };
            
            // Adicionar ao contexto
            addDocument(projectId, documentData);
            
          } catch (error) {
            console.error(`Erro no upload de ${file.name}:`, error);
          }
        })
      );
      
      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
        // Reset state
        setFiles([]);
        setUploadProgress([]);
        setIsUploading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro geral no upload:', error);
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    const type = getDocumentType(file.type);
    switch (type) {
      case 'image':
        return <Image className="w-8 h-8 text-green-500" />;
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'xls':
        return <FileText className="w-8 h-8 text-green-600" />;
      case 'video':
        return <FileText className="w-8 h-8 text-purple-500" />;
      default:
        return <FileText className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClose = () => {
    if (!isUploading) {
      setFiles([]);
      setUploadProgress([]);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title=""
      size="xl"
      className="text-left"
    >
      <div className="flex flex-col h-[80vh]">
        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Header */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Upload de Documentos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Faça upload de documentos para o projeto. Tipos suportados: PDF, DOC, XLS, imagens e vídeos.
              </p>
            </div>

            {/* Drop Zone */}
            <div className={containerClasses}>
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative p-8 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
                  "hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20",
                  isDragOver 
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30" 
                    : "border-gray-300 dark:border-gray-600"
                )}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <motion.div
                    animate={{ 
                      scale: isDragOver ? 1.1 : 1,
                      rotate: isDragOver ? 5 : 0 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                  </motion.div>
                  
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      {isDragOver ? 'Solte os arquivos aqui' : 'Arraste arquivos aqui'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      ou clique para selecionar
                    </p>
                  </div>
                  
                  <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    <p>Tamanho máximo: 10MB por arquivo</p>
                    <p>PDF, DOC, XLS, Imagens, Vídeos</p>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.ogg"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Files List */}
            <AnimatePresence mode="popLayout">
              {files.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(containerClasses, "p-6")}
                >
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Arquivos Selecionados ({files.length})
                  </h3>
                  
                  <div className="space-y-3">
                    {files.map((file) => {
                      const progress = uploadProgress.find(p => p.id === file.id);
                      
                      return (
                        <motion.div
                          key={file.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg"
                        >
                          {/* File Icon/Preview */}
                          <div className="flex-shrink-0">
                            {file.preview ? (
                              <img 
                                src={file.preview} 
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ) : (
                              getFileIcon(file)
                            )}
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                            
                            {/* Progress Bar */}
                            {progress && (
                              <div className="mt-2">
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                                    <motion.div
                                      className={cn(
                                        "h-1.5 rounded-full transition-all duration-200",
                                        progress.status === 'error' 
                                          ? "bg-red-500" 
                                          : progress.status === 'completed'
                                          ? "bg-green-500"
                                          : "bg-primary-500"
                                      )}
                                      style={{ width: `${progress.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {Math.round(progress.progress)}%
                                  </span>
                                </div>
                                {progress.error && (
                                  <p className="text-xs text-red-500 mt-1 flex items-center">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    {progress.error}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Remove Button */}
                          {!isUploading && (
                            <button
                              onClick={() => removeFile(file.id)}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Botões fixos na parte inferior */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            isLoading={isUploading}
          >
            {isUploading ? 'Enviando...' : `Enviar ${files.length > 0 ? `(${files.length})` : ''}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadDocumentModal; 