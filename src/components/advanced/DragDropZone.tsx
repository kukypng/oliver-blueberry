/**
 * Zona de Drag & Drop Avançada
 * 
 * Componente moderno para upload de arquivos com suporte a múltiplos formatos,
 * validação em tempo real e preview visual.
 */

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import { SupportedFormat, formatDetector, FormatDetectionResult } from '@/utils/import-export/formatDetector';
import { universalParser, ParseResult } from '@/utils/import-export/universalParser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface FileWithPreview extends File {
  preview?: string;
  detection?: FormatDetectionResult;
  parseResult?: ParseResult;
  status: 'pending' | 'analyzing' | 'ready' | 'error';
  error?: string;
}

export interface DragDropZoneProps {
  acceptedFormats?: SupportedFormat[];
  maxFileSize?: number; // em bytes
  maxFiles?: number;
  onFilesAccepted: (files: FileWithPreview[]) => void;
  onFileRemoved: (file: FileWithPreview) => void;
  onPreviewData?: (file: FileWithPreview, data: any[]) => void;
  disabled?: boolean;
  className?: string;
}

const FORMAT_ICONS = {
  [SupportedFormat.CSV]: FileText,
  [SupportedFormat.TSV]: FileText,
  [SupportedFormat.EXCEL]: FileSpreadsheet,
  [SupportedFormat.JSON]: File,
  [SupportedFormat.XML]: File
};

const FORMAT_COLORS = {
  [SupportedFormat.CSV]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [SupportedFormat.TSV]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  [SupportedFormat.EXCEL]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  [SupportedFormat.JSON]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  [SupportedFormat.XML]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

export const DragDropZone: React.FC<DragDropZoneProps> = ({
  acceptedFormats = Object.values(SupportedFormat),
  maxFileSize = 50 * 1024 * 1024, // 50MB
  maxFiles = 5,
  onFilesAccepted,
  onFileRemoved,
  onPreviewData,
  disabled = false,
  className
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return;

    setIsProcessing(true);
    const newFiles: FileWithPreview[] = [];

    for (const file of acceptedFiles) {
      const fileWithPreview: FileWithPreview = {
        ...file,
        status: 'pending'
      };

      // Validar tamanho
      if (file.size > maxFileSize) {
        fileWithPreview.status = 'error';
        fileWithPreview.error = `Arquivo muito grande. Máximo: ${formatFileSize(maxFileSize)}`;
        newFiles.push(fileWithPreview);
        continue;
      }

      newFiles.push(fileWithPreview);
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    // Processar arquivos em paralelo
    await Promise.all(newFiles.map(file => processFile(file)));
    
    setIsProcessing(false);
    onFilesAccepted(newFiles.filter(f => f.status === 'ready'));
  }, [disabled, maxFileSize, onFilesAccepted]);

  const processFile = async (file: FileWithPreview) => {
    try {
      // Atualizar status
      updateFileStatus(file, 'analyzing');

      // Detectar formato
      const detection = await formatDetector.detectFormat(file);
      file.detection = detection;

      // Validar formato aceito
      if (!acceptedFormats.includes(detection.format)) {
        throw new Error(`Formato ${detection.format.toUpperCase()} não é aceito`);
      }

      // Parse básico para preview (primeiras 100 linhas)
      const parseResult = await universalParser.parse(file, {
        format: detection.format,
        maxRows: 100
      });

      file.parseResult = parseResult;

      if (parseResult.errors.length > 0) {
        const criticalErrors = parseResult.errors.filter(e => e.severity === 'error');
        if (criticalErrors.length > 0) {
          throw new Error(criticalErrors[0].message);
        }
      }

      updateFileStatus(file, 'ready');
      
      // Notificar preview de dados
      if (onPreviewData && parseResult.data.length > 0) {
        onPreviewData(file, parseResult.data);
      }

    } catch (error) {
      file.error = (error as Error).message;
      updateFileStatus(file, 'error');
      toast.error(`Erro ao processar ${file.name}: ${file.error}`);
    }
  };

  const updateFileStatus = (file: FileWithPreview, status: FileWithPreview['status']) => {
    file.status = status;
    setFiles(prev => [...prev]); // Forçar re-render
  };

  const removeFile = (fileToRemove: FileWithPreview) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove));
    onFileRemoved(fileToRemove);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    maxSize: maxFileSize,
    maxFiles: maxFiles - files.length,
    disabled: disabled || isProcessing
  });

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Zona de Drop */}
      <Card 
        {...getRootProps()} 
        className={cn(
          'border-2 border-dashed transition-all duration-200 cursor-pointer',
          isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <input {...getInputProps()} ref={fileInputRef} />
          
          <div className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors',
            isDragActive 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          )}>
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            Suporte a {acceptedFormats.map(f => f.toUpperCase()).join(', ')} • 
            Máximo {formatFileSize(maxFileSize)} por arquivo
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {acceptedFormats.map(format => (
              <Badge 
                key={format} 
                variant="secondary" 
                className={FORMAT_COLORS[format]}
              >
                {format.toUpperCase()}
              </Badge>
            ))}
          </div>

          <Button 
            type="button" 
            variant="outline" 
            onClick={handleBrowseFiles}
            disabled={disabled || isProcessing}
          >
            Selecionar Arquivos
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Arquivos Selecionados ({files.length})
          </h4>
          
          {files.map((file, index) => (
            <FilePreviewCard 
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => removeFile(file)}
              onPreview={() => onPreviewData?.(file, file.parseResult?.data || [])}
            />
          ))}
        </div>
      )}

      {/* Progress Global */}
      {isProcessing && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              <span className="text-sm">Processando arquivos...</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface FilePreviewCardProps {
  file: FileWithPreview;
  onRemove: () => void;
  onPreview?: () => void;
}

const FilePreviewCard: React.FC<FilePreviewCardProps> = ({ file, onRemove, onPreview }) => {
  const IconComponent = file.detection ? FORMAT_ICONS[file.detection.format] : File;
  const formatColor = file.detection ? FORMAT_COLORS[file.detection.format] : 'bg-gray-100 text-gray-800';

  const getStatusIcon = () => {
    switch (file.status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'analyzing':
        return <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'ready':
        return `${file.parseResult?.metadata.processedRows || 0} registros detectados`;
      case 'error':
        return file.error || 'Erro desconhecido';
      case 'analyzing':
        return 'Analisando...';
      default:
        return 'Aguardando processamento';
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200',
      file.status === 'error' && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
    )}>
      <CardContent className="py-3">
        <div className="flex items-center gap-3">
          {/* Ícone do arquivo */}
          <div className="flex-shrink-0">
            <IconComponent className="w-8 h-8 text-muted-foreground" />
          </div>

          {/* Informações do arquivo */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-sm truncate">{file.name}</h5>
              {file.detection && (
                <Badge className={cn('text-xs', formatColor)}>
                  {file.detection.format.toUpperCase()}
                </Badge>
              )}
              {file.detection && (
                <Badge variant="outline" className="text-xs">
                  {Math.round(file.detection.confidence * 100)}% confiança
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span>{getStatusText()}</span>
              </div>
            </div>

            {/* Warnings */}
            {file.parseResult?.warnings && file.parseResult.warnings.length > 0 && (
              <div className="mt-2">
                <Badge variant="outline" className="text-xs text-yellow-600">
                  {file.parseResult.warnings.length} aviso(s)
                </Badge>
              </div>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1">
            {file.status === 'ready' && onPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPreview}
                className="h-8 w-8 p-0"
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar para análise */}
        {file.status === 'analyzing' && (
          <div className="mt-3">
            <Progress value={undefined} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Utilitário para formatar tamanho de arquivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}