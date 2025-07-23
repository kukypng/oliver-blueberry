/**
 * Wizard de Importação Otimizado para Mobile
 * 
 * Versão simplificada do wizard de importação focada em dispositivos móveis
 * com navegação por etapas otimizada para touch.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  X,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileDragDrop, MobileFilePreview } from './MobileDragDrop';
import { MobileDataPreview } from './MobileDataPreview';
import { SupportedFormat } from '@/utils/import-export/formatDetector';
import { toast } from 'sonner';

export interface MobileImportWizardProps {
  onComplete: (result: MobileImportResult) => void;
  onCancel: () => void;
  allowedFormats?: SupportedFormat[];
  maxFileSize?: number;
  className?: string;
}

export interface MobileImportResult {
  file: MobileFilePreview;
  processedData: any[];
  summary: MobileImportSummary;
}

export interface MobileImportSummary {
  fileName: string;
  totalRecords: number;
  validRecords: number;
  errors: number;
  warnings: number;
}

enum MobileWizardStep {
  UPLOAD = 'upload',
  PREVIEW = 'preview',
  CONFIRM = 'confirm'
}

const MOBILE_STEP_INFO = {
  [MobileWizardStep.UPLOAD]: {
    title: 'Selecionar Arquivo',
    description: 'Escolha o arquivo para importar',
    icon: Upload
  },
  [MobileWizardStep.PREVIEW]: {
    title: 'Visualizar Dados',
    description: 'Confira os dados antes de importar',
    icon: Eye
  },
  [MobileWizardStep.CONFIRM]: {
    title: 'Confirmar',
    description: 'Revise e confirme a importação',
    icon: CheckCircle
  }
};

export const MobileImportWizard: React.FC<MobileImportWizardProps> = ({
  onComplete,
  onCancel,
  allowedFormats = [SupportedFormat.CSV, SupportedFormat.EXCEL, SupportedFormat.JSON],
  maxFileSize = 10 * 1024 * 1024, // 10MB para mobile
  className
}) => {
  // Estados principais
  const [currentStep, setCurrentStep] = useState<MobileWizardStep>(MobileWizardStep.UPLOAD);
  const [filePreview, setFilePreview] = useState<MobileFilePreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Progresso do wizard
  const steps = Object.values(MobileWizardStep);
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
      case MobileWizardStep.UPLOAD:
        return filePreview && filePreview.status === 'ready';
      case MobileWizardStep.PREVIEW:
        return filePreview && filePreview.previewData && filePreview.previewData.length > 0;
      case MobileWizardStep.CONFIRM:
        return true;
      default:
        return false;
    }
  }, [currentStep, filePreview]);

  // Handlers de arquivos
  const handleFileProcessed = useCallback((preview: MobileFilePreview) => {
    setFilePreview(preview);
    
    // Auto-avançar para preview se arquivo estiver pronto
    if (preview.status === 'ready') {
      setTimeout(() => {
        setCurrentStep(MobileWizardStep.PREVIEW);
      }, 500);
    }
  }, []);

  const handleFileRemoved = useCallback(() => {
    setFilePreview(null);
    setCurrentStep(MobileWizardStep.UPLOAD);
  }, []);

  // Handler de conclusão
  const handleComplete = async () => {
    if (!filePreview || !filePreview.previewData) return;

    setIsProcessing(true);
    
    try {
      const summary: MobileImportSummary = {
        fileName: filePreview.file.name,
        totalRecords: filePreview.recordCount,
        validRecords: filePreview.status === 'ready' ? filePreview.recordCount : 0,
        errors: filePreview.parseResult?.errors?.length || 0,
        warnings: filePreview.parseResult?.warnings?.length || 0
      };

      const result: MobileImportResult = {
        file: filePreview,
        processedData: filePreview.previewData,
        summary
      };

      // Feedback tátil
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

      onComplete(result);
      
    } catch (error) {
      toast.error('Erro ao processar importação');
    } finally {
      setIsProcessing(false);
    }
  };

  // Renderizar conteúdo da etapa atual
  const renderStepContent = () => {
    switch (currentStep) {
      case MobileWizardStep.UPLOAD:
        return (
          <div className="space-y-4">
            <MobileDragDrop
              onFileProcessed={handleFileProcessed}
              onFileRemoved={handleFileRemoved}
              acceptedFormats={allowedFormats}
              maxFileSize={maxFileSize}
              disabled={isProcessing}
            />
            
            {filePreview && (
              <div className="text-center">
                <Badge variant="outline" className="text-green-600">
                  Arquivo processado com sucesso!
                </Badge>
              </div>
            )}
          </div>
        );

      case MobileWizardStep.PREVIEW:
        return (
          <div className="space-y-4">
            {filePreview && filePreview.previewData ? (
              <MobileDataPreview
                data={filePreview.previewData}
                parseResult={filePreview.parseResult}
                maxRows={20}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum dado para visualizar</p>
              </div>
            )}
          </div>
        );

      case MobileWizardStep.CONFIRM:
        return (
          <div className="space-y-6">
            {/* Resumo do arquivo */}
            {filePreview && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resumo da Importação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Arquivo:</span>
                      <span className="font-medium text-sm truncate max-w-48">
                        {filePreview.file.name}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Formato:</span>
                      <Badge variant="outline">
                        {filePreview.format.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Registros:</span>
                      <span className="font-medium text-green-600">
                        {filePreview.recordCount}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tamanho:</span>
                      <span className="text-sm">
                        {Math.round(filePreview.file.size / 1024)} KB
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confiança:</span>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(filePreview.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>

                  {/* Alertas de erros/avisos */}
                  {filePreview.parseResult && (
                    <div className="space-y-2">
                      {filePreview.parseResult.errors && filePreview.parseResult.errors.length > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-700 dark:text-red-300">
                            {filePreview.parseResult.errors.length} erro(s) encontrado(s)
                          </span>
                        </div>
                      )}
                      
                      {filePreview.parseResult.warnings && filePreview.parseResult.warnings.length > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-yellow-700 dark:text-yellow-300">
                            {filePreview.parseResult.warnings.length} aviso(s)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Estatísticas */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="py-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filePreview?.recordCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Registros</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="py-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filePreview?.parseResult?.errors?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Erros</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header do Wizard */}
      <div className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" onClick={onCancel} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {MOBILE_STEP_INFO[currentStep].title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {MOBILE_STEP_INFO[currentStep].description}
          </p>
        </div>
      </div>

      {/* Indicador de Progresso */}
      <div className="p-4 pb-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Etapa {currentStepIndex + 1} de {steps.length}</span>
            <span>{Math.round(progress)}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Indicador de Etapas */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepInfo = MOBILE_STEP_INFO[step];
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const IconComponent = stepInfo.icon;
            
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center space-y-1">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                    isActive && 'border-primary bg-primary text-primary-foreground',
                    isCompleted && 'border-green-500 bg-green-500 text-white',
                    !isActive && !isCompleted && 'border-muted-foreground text-muted-foreground'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <IconComponent className="h-4 w-4" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'text-xs font-medium',
                      isActive && 'text-primary',
                      isCompleted && 'text-green-600'
                    )}>
                      {stepInfo.title}
                    </div>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={cn(
                    'flex-1 h-0.5 mx-2',
                    isCompleted ? 'bg-green-500' : 'bg-muted'
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Etapa */}
      <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
        <div className="p-4">
          {renderStepContent()}
        </div>
      </div>

      {/* Controles de Navegação */}
      <div className="p-4 border-t bg-card">
        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStepIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          {currentStep === MobileWizardStep.CONFIRM ? (
            <Button 
              onClick={handleComplete} 
              disabled={!canProceed() || isProcessing}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Confirmar Importação
            </Button>
          ) : (
            <Button 
              onClick={goToNextStep} 
              disabled={!canProceed()}
              className="flex-1"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};