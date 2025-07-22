/**
 * Wizard de Importação Avançado
 * 
 * Assistente completo para importação de dados com navegação por etapas,
 * validação progressiva e configuração flexível.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Settings, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Save,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragDropZone, FileWithPreview } from './DragDropZone';
import { DataPreviewTable, ColumnDefinition } from './DataPreviewTable';
import { SupportedFormat } from '@/utils/import-export/formatDetector';
import { ParseResult, ValidationRule, FieldMapping } from '@/utils/import-export/universalParser';
import { toast } from 'sonner';

export interface ImportWizardProps {
  onComplete: (result: ImportResult) => void;
  onCancel: () => void;
  allowedFormats?: SupportedFormat[];
  maxFileSize?: number;
  validationRules?: ValidationRule[];
  fieldMappings?: FieldMapping[];
  className?: string;
}

export interface ImportResult {
  files: FileWithPreview[];
  processedData: any[];
  summary: ImportSummary;
  configuration: ImportConfiguration;
}

export interface ImportSummary {
  totalFiles: number;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warnings: number;
  errors: string[];
  processingTime: number;
}

export interface ImportConfiguration {
  format: SupportedFormat;
  encoding: string;
  delimiter?: string;
  hasHeader: boolean;
  skipRows: number;
  maxRows?: number;
  validationRules: ValidationRule[];
  fieldMappings: FieldMapping[];
  duplicateHandling: 'skip' | 'replace' | 'merge';
}

enum WizardStep {
  UPLOAD = 'upload',
  CONFIGURE = 'configure', 
  PREVIEW = 'preview',
  VALIDATE = 'validate',
  SUMMARY = 'summary'
}

const STEP_INFO = {
  [WizardStep.UPLOAD]: {
    title: 'Upload de Arquivos',
    description: 'Selecione os arquivos para importação',
    icon: Upload
  },
  [WizardStep.CONFIGURE]: {
    title: 'Configuração',
    description: 'Configure as opções de importação',
    icon: Settings
  },
  [WizardStep.PREVIEW]: {
    title: 'Preview dos Dados',
    description: 'Visualize e edite os dados antes da importação',
    icon: Eye
  },
  [WizardStep.VALIDATE]: {
    title: 'Validação',
    description: 'Valide os dados e resolva conflitos',
    icon: CheckCircle
  },
  [WizardStep.SUMMARY]: {
    title: 'Resumo',
    description: 'Confirme a importação e veja o resumo',
    icon: FileText
  }
};

export const ImportWizard: React.FC<ImportWizardProps> = ({
  onComplete,
  onCancel,
  allowedFormats,
  maxFileSize,
  validationRules = [],
  fieldMappings = [],
  className
}) => {
  // Estados principais
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.UPLOAD);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [configuration, setConfiguration] = useState<ImportConfiguration>({
    format: SupportedFormat.CSV,
    encoding: 'utf-8',
    hasHeader: true,
    skipRows: 0,
    validationRules,
    fieldMappings,
    duplicateHandling: 'skip'
  });
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Progresso do wizard
  const steps = Object.values(WizardStep);
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Handlers de navegação
  const goToNextStep = useCallback(() => {
    const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
    setCurrentStep(steps[nextIndex]);
  }, [currentStepIndex, steps]);

  const goToPreviousStep = useCallback(() => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(steps[prevIndex]);
  }, [currentStepIndex, steps]);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case WizardStep.UPLOAD:
        return files.length > 0 && files.every(f => f.status === 'ready');
      case WizardStep.CONFIGURE:
        return true; // Configuração sempre pode prosseguir
      case WizardStep.PREVIEW:
        return processedData.length > 0;
      case WizardStep.VALIDATE:
        return validationErrors.length === 0;
      case WizardStep.SUMMARY:
        return true;
      default:
        return false;
    }
  }, [currentStep, files, processedData, validationErrors]);

  // Handlers de arquivos
  const handleFilesAccepted = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-configurar baseado no primeiro arquivo
    if (newFiles.length > 0 && newFiles[0].detection) {
      const detection = newFiles[0].detection;
      setConfiguration(prev => ({
        ...prev,
        format: detection.format,
        encoding: detection.encoding || 'utf-8',
        delimiter: detection.metadata?.delimiter,
        hasHeader: detection.metadata?.hasHeader ?? true
      }));
    }
  }, []);

  const handleFileRemoved = useCallback((fileToRemove: FileWithPreview) => {
    setFiles(prev => prev.filter(f => f !== fileToRemove));
  }, []);

  // Processar dados quando configuração muda
  useEffect(() => {
    if (files.length > 0 && currentStep === WizardStep.PREVIEW) {
      processFiles();
    }
  }, [files, configuration, currentStep]);

  const processFiles = async () => {
    setIsProcessing(true);
    try {
      const allData: any[] = [];
      
      for (const file of files) {
        if (file.parseResult) {
          allData.push(...file.parseResult.data);
        }
      }
      
      setProcessedData(allData);
      
      // Executar validações
      const errors: string[] = [];
      configuration.validationRules.forEach(rule => {
        allData.forEach((row, index) => {
          const value = row[rule.field];
          if (rule.type === 'required' && (!value || String(value).trim() === '')) {
            errors.push(`Linha ${index + 1}: Campo obrigatório '${rule.field}' está vazio`);
          }
        });
      });
      
      setValidationErrors(errors);
      
    } catch (error) {
      toast.error('Erro ao processar arquivos: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler de conclusão
  const handleComplete = () => {
    const summary: ImportSummary = {
      totalFiles: files.length,
      totalRecords: processedData.length,
      validRecords: processedData.length - validationErrors.length,
      invalidRecords: validationErrors.length,
      warnings: files.reduce((acc, f) => acc + (f.parseResult?.warnings.length || 0), 0),
      errors: validationErrors,
      processingTime: 0 // TODO: calcular tempo real
    };

    const result: ImportResult = {
      files,
      processedData,
      summary,
      configuration
    };

    onComplete(result);
  };

  // Renderizar conteúdo da etapa atual
  const renderStepContent = () => {
    switch (currentStep) {
      case WizardStep.UPLOAD:
        return (
          <div className="space-y-6">
            <DragDropZone
              acceptedFormats={allowedFormats}
              maxFileSize={maxFileSize}
              onFilesAccepted={handleFilesAccepted}
              onFileRemoved={handleFileRemoved}
            />
            
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Arquivos Selecionados</h4>
                <div className="grid gap-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {file.parseResult?.metadata.processedRows || 0} registros
                        </div>
                      </div>
                      <Badge variant={file.status === 'ready' ? 'default' : 'secondary'}>
                        {file.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case WizardStep.CONFIGURE:
        return <ConfigurationStep configuration={configuration} onChange={setConfiguration} />;

      case WizardStep.PREVIEW:
        return (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4" />
                <p>Processando dados...</p>
              </div>
            ) : (
              <DataPreviewTable
                data={processedData}
                editable={true}
                maxHeight={500}
              />
            )}
          </div>
        );

      case WizardStep.VALIDATE:
        return <ValidationStep errors={validationErrors} data={processedData} />;

      case WizardStep.SUMMARY:
        return <SummaryStep files={files} data={processedData} errors={validationErrors} />;

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-6xl mx-auto space-y-6', className)}>
      {/* Header do Wizard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(STEP_INFO[currentStep].icon, { className: 'h-5 w-5' })}
                {STEP_INFO[currentStep].title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {STEP_INFO[currentStep].description}
              </p>
            </div>
            
            <Button variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Etapa {currentStepIndex + 1} de {steps.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Indicador de Etapas */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const stepInfo = STEP_INFO[step];
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const IconComponent = stepInfo.icon;
              
              return (
                <React.Fragment key={step}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors',
                      isActive && 'border-primary bg-primary text-primary-foreground',
                      isCompleted && 'border-green-500 bg-green-500 text-white',
                      !isActive && !isCompleted && 'border-muted-foreground text-muted-foreground'
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <div className={cn(
                        'text-sm font-medium',
                        isActive && 'text-primary',
                        isCompleted && 'text-green-600'
                      )}>
                        {stepInfo.title}
                      </div>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <Separator className="flex-1 mx-4" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da Etapa */}
      <Card>
        <CardContent className="py-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Controles de Navegação */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <div className="flex gap-2">
              {currentStep === WizardStep.SUMMARY ? (
                <Button onClick={handleComplete} disabled={!canProceed()}>
                  <Save className="h-4 w-4 mr-2" />
                  Confirmar Importação
                </Button>
              ) : (
                <Button onClick={goToNextStep} disabled={!canProceed()}>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componentes auxiliares para cada etapa
const ConfigurationStep: React.FC<{
  configuration: ImportConfiguration;
  onChange: (config: ImportConfiguration) => void;
}> = ({ configuration, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Configurações básicas aqui */}
            <div>
              <label className="text-sm font-medium">Formato</label>
              <Badge>{configuration.format.toUpperCase()}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Encoding</label>
              <Badge variant="outline">{configuration.encoding}</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Opções Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Opções avançadas aqui */}
            <div>
              <label className="text-sm font-medium">Tratamento de Duplicatas</label>
              <Badge variant="outline">{configuration.duplicateHandling}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ValidationStep: React.FC<{
  errors: string[];
  data: any[];
}> = ({ errors, data }) => {
  return (
    <div className="space-y-4">
      {errors.length > 0 ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Erros de Validação ({errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-auto">
              {errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Validação Concluída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-600 dark:text-green-400">
              Todos os {data.length} registros passaram na validação!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SummaryStep: React.FC<{
  files: FileWithPreview[];
  data: any[];
  errors: string[];
}> = ({ files, data, errors }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{files.length}</div>
            <div className="text-sm text-muted-foreground">Arquivos</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-6 text-center">
            <div className="text-3xl font-bold text-green-600">{data.length}</div>
            <div className="text-sm text-muted-foreground">Registros</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="py-6 text-center">
            <div className="text-3xl font-bold text-red-600">{errors.length}</div>
            <div className="text-sm text-muted-foreground">Erros</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Resumo da Importação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total de registros válidos:</span>
              <span className="font-medium">{data.length - errors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Registros com erro:</span>
              <span className="font-medium text-red-600">{errors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de sucesso:</span>
              <span className="font-medium text-green-600">
                {data.length > 0 ? Math.round(((data.length - errors.length) / data.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};