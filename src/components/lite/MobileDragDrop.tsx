/**
 * Componente de Upload Otimizado para Mobile
 * 
 * Versão simplificada do drag & drop focada em dispositivos móveis
 * com interface touch-friendly e feedback visual otimizado.
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  File, 
  CheckCircle, 
  AlertTriangle,
  X,
  Plus
} from 'lucide-react';
import { SupportedFormat, formatDetector } from '@/utils/import-export/formatDetector';
import { universalParser } from '@/utils/import-export/universalParser';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface MobileFilePreview {
  file: File;
  format: SupportedFormat;
  confidence: number;
  recordCount: number;
  status: 'analyzing' | 'ready' | 'error';
  error?: string;
  previewData?: any[];
  parseResult?: any; // ParseResult do universalParser
}

export interface MobileDragDropProps {
  onFileProcessed: (preview: MobileFilePreview) => void;
  onFileRemoved: () => void;
  onMultipleFilesProcessed?: (previews: MobileFilePreview[]) => void;
  disabled?: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  acceptedFormats?: SupportedFormat[];
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

export const MobileDragDrop: React.FC<MobileDragDropProps> = ({
  onFileProcessed,
  onFileRemoved,
  onMultipleFilesProcessed,
  disabled = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB para mobile
  maxFiles = 1,
  acceptedFormats = Object.values(SupportedFormat),
  className
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<MobileFilePreview | null>(null);
  const [filePreviews, setFilePreviews] = useState<MobileFilePreview[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0 || disabled || isProcessing) return;

    // Validar número máximo de arquivos
    if (maxFiles === 1 && fileArray.length > 1) {
      toast.error('Apenas um arquivo é permitido');
      return;
    }

    if (fileArray.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} arquivos permitidos`);
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    const previews: MobileFilePreview[] = [];
    const totalFiles = fileArray.length;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        // Atualizar progresso
        setProgress((i / totalFiles) * 80);

        // Validar tamanho
        if (file.size > maxFileSize) {
          const preview: MobileFilePreview = {
            file,
            format: SupportedFormat.CSV,
            confidence: 0,
            recordCount: 0,
            status: 'error',
            error: `Arquivo muito grande. Máximo: ${Math.round(maxFileSize / 1024 / 1024)}MB`
          };
          previews.push(preview);
          continue;
        }

        // Detectar formato
        const detection = await formatDetector.detectFormat(file);
        
        // Validar formato aceito
        if (!acceptedFormats.includes(detection.format)) {
          const preview: MobileFilePreview = {
            file,
            format: detection.format,
            confidence: detection.confidence,
            recordCount: 0,
            status: 'error',
            error: `Formato ${detection.format.toUpperCase()} não é aceito`
          };
          previews.push(preview);
          continue;
        }
        
        // Parse para preview (limitado para mobile)
        const parseResult = await universalParser.parse(file, {
          format: detection.format,
          maxRows: 20 // Limite baixo para mobile
        });

        const preview: MobileFilePreview = {
          file,
          format: detection.format,
          confidence: detection.confidence,
          recordCount: parseResult.metadata.processedRows,
          status: parseResult.errors.length > 0 ? 'error' : 'ready',
          error: parseResult.errors[0]?.message,
          previewData: parseResult.data.slice(0, 5), // Apenas 5 para mobile
          parseResult: parseResult
        };

        previews.push(preview);
      }

      setProgress(100);

      // Atualizar estado baseado no modo (single ou multiple)
      if (maxFiles === 1 && previews.length > 0) {
        setFilePreview(previews[0]);
        onFileProcessed(previews[0]);
      } else {
        setFilePreviews(previews);
        onMultipleFilesProcessed?.(previews);
      }

      // Feedback tátil
      if (window.navigator.vibrate) {
        window.navigator.vibrate(100);
      }

      const successCount = previews.filter(p => p.status === 'ready').length;
      const errorCount = previews.filter(p => p.status === 'error').length;

      if (successCount > 0) {
        toast.success(
          `${successCount} arquivo(s) processado(s) com sucesso!`,
          { duration: 2000 }
        );
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} arquivo(s) com erro`);
      }

    } catch (error) {
      toast.error('Erro ao processar arquivos');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    await processFiles(files);
    event.target.value = '';
  };

  // Handlers para drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessing) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || isProcessing) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  const handleRemoveFile = (index?: number) => {
    if (maxFiles === 1) {
      setFilePreview(null);
      onFileRemoved();
    } else if (typeof index === 'number') {
      const newPreviews = filePreviews.filter((_, i) => i !== index);
      setFilePreviews(newPreviews);
      onMultipleFilesProcessed?.(newPreviews);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Renderizar preview de arquivo único
  const renderSingleFilePreview = (preview: MobileFilePreview) => {
    const IconComponent = FORMAT_ICONS[preview.format] || File;
    const formatColor = FORMAT_COLORS[preview.format] || 'bg-gray-100 text-gray-800';

    return (
      <Card className={cn('border-2', className)}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* File Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <IconComponent className="h-8 w-8 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{preview.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(preview.file.size / 1024)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile()}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Status and Format */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preview.status === 'ready' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {preview.status === 'ready' 
                    ? `${preview.recordCount} registros`
                    : 'Erro na análise'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={formatColor}>
                  {preview.format.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {Math.round(preview.confidence * 100)}%
                </Badge>
              </div>
            </div>

            {/* Error Message */}
            {preview.status === 'error' && preview.error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {preview.error}
                </p>
              </div>
            )}

            {/* Preview Data */}
            {preview.previewData && preview.previewData.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview:</p>
                <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
                  {preview.previewData.slice(0, 2).map((row, index) => (
                    <div key={index} className="text-xs space-y-1 mb-2 last:mb-0">
                      {Object.entries(row).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground truncate mr-2">{key}:</span>
                          <span className="font-medium truncate">{String(value)}</span>
                        </div>
                      ))}
                      {index < preview.previewData!.length - 1 && (
                        <hr className="border-border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar múltiplos arquivos
  const renderMultipleFilePreviews = () => {
    return (
      <div className="space-y-3">
        {filePreviews.map((preview, index) => {
          const IconComponent = FORMAT_ICONS[preview.format] || File;
          const formatColor = FORMAT_COLORS[preview.format] || 'bg-gray-100 text-gray-800';

          return (
            <Card key={index} className="border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <IconComponent className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{preview.file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{Math.round(preview.file.size / 1024)} KB</span>
                        {preview.status === 'ready' ? (
                          <>
                            <span>•</span>
                            <span>{preview.recordCount} registros</span>
                          </>
                        ) : preview.status === 'error' ? (
                          <>
                            <span>•</span>
                            <span className="text-red-500">Erro</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn('text-xs', formatColor)}>
                      {preview.format.toUpperCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Error Message */}
                {preview.status === 'error' && preview.error && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                    {preview.error}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // Se há arquivos processados, mostrar preview
  if (filePreview && maxFiles === 1) {
    return renderSingleFilePreview(filePreview);
  }

  if (filePreviews.length > 0 && maxFiles > 1) {
    return (
      <div className={cn('space-y-3', className)}>
        {renderMultipleFilePreviews()}
        
        {/* Botão para adicionar mais arquivos */}
        {filePreviews.length < maxFiles && (
          <Button
            onClick={handleButtonClick}
            disabled={disabled || isProcessing}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Mais Arquivos ({filePreviews.length}/{maxFiles})
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card 
      className={cn(
        'border-2 border-dashed transition-all duration-200',
        dragActive 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-muted-foreground/25',
        disabled && 'opacity-50',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Upload Icon */}
          <div className={cn(
            'w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors',
            dragActive 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          )}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" />
            ) : dragActive ? (
              <Upload className="h-8 w-8" />
            ) : (
              <Plus className="h-8 w-8" />
            )}
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h3 className="font-medium">
              {isProcessing 
                ? 'Processando arquivos...' 
                : dragActive 
                  ? 'Solte os arquivos aqui'
                  : maxFiles === 1 
                    ? 'Arraste ou selecione um arquivo'
                    : `Arraste ou selecione até ${maxFiles} arquivos`
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              Suporte a {acceptedFormats.map(f => f.toUpperCase()).join(', ')}
            </p>
          </div>

          {/* Progress Bar */}
          {isProcessing && progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {progress}% concluído
              </p>
            </div>
          )}

          {/* Supported Formats */}
          {!isProcessing && (
            <div className="flex flex-wrap justify-center gap-1">
              {acceptedFormats.map(format => (
                <Badge 
                  key={format} 
                  variant="outline" 
                  className={cn(
                    'text-xs',
                    FORMAT_COLORS[format]
                  )}
                >
                  {format.toUpperCase()}
                </Badge>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <Button 
            onClick={handleButtonClick}
            disabled={disabled || isProcessing}
            className="w-full"
            size="lg"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isProcessing 
              ? 'Processando...' 
              : maxFiles === 1 
                ? 'Escolher Arquivo'
                : 'Escolher Arquivos'
            }
          </Button>

          {/* Hidden Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls,.json,.xml,.tsv"
            onChange={handleFileSelect}
            disabled={disabled || isProcessing}
            multiple={maxFiles > 1}
          />

          {/* File Size Limit */}
          <p className="text-xs text-muted-foreground">
            Máximo: {Math.round(maxFileSize / 1024 / 1024)}MB por arquivo
            {maxFiles > 1 && ` • Até ${maxFiles} arquivos`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};