/**
 * 🎯 SMART CSV IMPORTER - Interface Revolucionária para Importação
 * 
 * Preview inteligente, correção interativa, feedback em tempo real
 * e experiência de usuário otimizada para qualquer tipo de CSV.
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Eye,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { SmartCsvProcessor, ProcessingResult, PreviewResult } from '@/utils/csv/smartProcessor';

interface SmartCsvImporterProps {
  userId: string;
  onImportComplete?: (result: ProcessingResult) => void;
  onClose?: () => void;
}

export const SmartCsvImporter: React.FC<SmartCsvImporterProps> = ({
  userId,
  onImportComplete,
  onClose
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  
  const { toast } = useToast();
  const processor = new SmartCsvProcessor();

  // Configuração do dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        variant: 'destructive',
        title: 'Formato Inválido',
        description: 'Por favor, selecione apenas arquivos CSV.',
      });
      return;
    }

    setFile(selectedFile);
    
    try {
      const content = await readFileAsText(selectedFile);
      setCsvContent(content);
      
      // Gerar preview automaticamente
      await generatePreview(content);
      
      toast({
        title: 'Arquivo Carregado',
        description: `${selectedFile.name} foi carregado com sucesso.`,
      });
      
      setActiveTab('preview');
      
    } catch (error) {
      console.error('Erro ao ler arquivo:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Leitura',
        description: 'Não foi possível ler o arquivo CSV.',
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  // Gerar preview do arquivo
  const generatePreview = async (content: string) => {
    try {
      setIsProcessing(true);
      const previewResult = await processor.previewFile(content);
      setPreview(previewResult);
    } catch (error) {
      console.error('Erro no preview:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Preview',
        description: 'Não foi possível analisar o arquivo.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Processar arquivo
  const processFile = async () => {
    if (!csvContent) return;

    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      setProcessingStatus('Iniciando processamento...');
      setActiveTab('processing');

      const processingResult = await processor.processFile(csvContent, {
        userId,
        allowPartialData: true,
        autoFillMissing: true,
        strictMode: false,
        progressCallback: (progress, status) => {
          setProcessingProgress(progress);
          setProcessingStatus(status);
        }
      });

      setResult(processingResult);
      
      if (processingResult.success) {
        toast({
          title: 'Processamento Concluído',
          description: `${processingResult.validRows} orçamentos processados com sucesso.`,
        });
        
        setActiveTab('results');
        
        if (onImportComplete) {
          onImportComplete(processingResult);
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Processamento Falhou',
          description: 'Não foi possível processar o arquivo. Verifique os erros.',
        });
        setActiveTab('results');
      }
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no Processamento',
        description: 'Falha crítica durante o processamento.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset do componente
  const resetImporter = () => {
    setFile(null);
    setCsvContent('');
    setPreview(null);
    setResult(null);
    setProcessingProgress(0);
    setProcessingStatus('');
    setActiveTab('upload');
  };

  // Helper para ler arquivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Importador Inteligente de CSV
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema avançado que detecta automaticamente qualquer formato CSV
            </p>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!preview} className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="processing" disabled={!csvContent} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Processamento
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!result} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resultados
            </TabsTrigger>
          </TabsList>

          {/* ABA UPLOAD */}
          <TabsContent value="upload" className="space-y-4">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${file ? 'bg-muted/50' : ''}
              `}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="space-y-2">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <Button variant="outline" size="sm" onClick={resetImporter}>
                    Escolher Outro Arquivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Solte o arquivo aqui' : 'Arraste seu arquivo CSV aqui'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Suporte a qualquer formato CSV • Detecção automática
                  </p>
                </div>
              )}
            </div>

            {/* Instruções */}
            <Alert>
              <Zap className="h-4 w-4" />
              <AlertTitle>Sistema Inteligente</AlertTitle>
              <AlertDescription>
                Este importador detecta automaticamente separadores, encoding e estrutura dos dados.
                Apenas os campos <strong>Modelo do Aparelho</strong> e <strong>Preço Total</strong> são obrigatórios.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* ABA PREVIEW */}
          <TabsContent value="preview" className="space-y-4">
            {preview && (
              <>
                {/* Estatísticas de Detecção */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{preview.detection.confidence}%</div>
                      <p className="text-xs text-muted-foreground">Confiança</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{preview.detection.totalRows}</div>
                      <p className="text-xs text-muted-foreground">Linhas</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{preview.mappings.length}</div>
                      <p className="text-xs text-muted-foreground">Colunas</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold capitalize">{preview.detection.fileType}</div>
                      <p className="text-xs text-muted-foreground">Tipo</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Detecção Automática */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detecção Automática</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Separador:</span>
                        <Badge variant="secondary" className="ml-2">
                          {preview.detection.separator === '\t' ? 'Tab' : preview.detection.separator}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cabeçalhos:</span>
                        <Badge variant={preview.detection.hasHeaders ? 'default' : 'secondary'} className="ml-2">
                          {preview.detection.hasHeaders ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Encoding:</span>
                        <Badge variant="secondary" className="ml-2">
                          {preview.detection.encoding.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mapeamento de Colunas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Mapeamento de Colunas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {preview.preview.mappingPreview.map((mapping, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded border">
                          <span className="font-medium">{mapping.csvHeader}</span>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={mapping.confidence > 70 ? 'default' : mapping.confidence > 40 ? 'secondary' : 'destructive'}
                            >
                              {mapping.confidence}%
                            </Badge>
                            <span className="text-sm text-muted-foreground">→</span>
                            <span className="text-sm">{mapping.mappedField}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview dos Dados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Preview dos Dados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            {preview.preview.headers.map((header, index) => (
                              <th key={index} className="text-left p-2 border-b">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.preview.rows.slice(0, 5).map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="p-2 border-b">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Avisos e Sugestões */}
                {(preview.warnings.length > 0 || preview.suggestions.length > 0) && (
                  <div className="space-y-2">
                    {preview.warnings.map((warning, index) => (
                      <Alert key={`warning-${index}`} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{warning}</AlertDescription>
                      </Alert>
                    ))}
                    
                    {preview.suggestions.map((suggestion, index) => (
                      <Alert key={`suggestion-${index}`}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{suggestion}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}

                {/* Botão para Processar */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetImporter}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={processFile} 
                    disabled={!preview.canProcess || isProcessing}
                  >
                    {isProcessing ? 'Processando...' : 'Processar Arquivo'}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* ABA PROCESSAMENTO */}
          <TabsContent value="processing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
                  Processando Arquivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={processingProgress} className="w-full" />
                  <div className="text-center">
                    <p className="text-lg font-medium">{Math.round(processingProgress)}%</p>
                    <p className="text-sm text-muted-foreground">{processingStatus}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA RESULTADOS */}
          <TabsContent value="results" className="space-y-4">
            {result && (
              <>
                {/* Estatísticas Finais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{result.validRows}</div>
                      <p className="text-xs text-muted-foreground">Válidos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-yellow-600">{result.warningRows}</div>
                      <p className="text-xs text-muted-foreground">Avisos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-red-600">{result.invalidRows}</div>
                      <p className="text-xs text-muted-foreground">Inválidos</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold">{processor.formatProcessingTime(result.processingTime)}</div>
                      <p className="text-xs text-muted-foreground">Tempo</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Final */}
                <Alert variant={result.success ? 'default' : 'destructive'}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {result.success ? 'Processamento Concluído' : 'Processamento Falhou'}
                  </AlertTitle>
                  <AlertDescription>
                    {result.success 
                      ? `${result.validRows} orçamentos foram processados com sucesso.`
                      : 'Não foi possível processar o arquivo. Verifique os erros abaixo.'
                    }
                  </AlertDescription>
                </Alert>

                {/* Correções Automáticas */}
                {result.autoFixes.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-green-600">Correções Automáticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {result.autoFixes.slice(0, 10).map((fix, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {fix}
                          </li>
                        ))}
                        {result.autoFixes.length > 10 && (
                          <li className="text-muted-foreground">
                            ... e mais {result.autoFixes.length - 10} correções
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Avisos */}
                {result.warnings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-yellow-600">Avisos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {result.warnings.slice(0, 10).map((warning, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            {warning}
                          </li>
                        ))}
                        {result.warnings.length > 10 && (
                          <li className="text-muted-foreground">
                            ... e mais {result.warnings.length - 10} avisos
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Erros */}
                {result.errors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-red-600">Erros</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {result.errors.slice(0, 10).map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                        {result.errors.length > 10 && (
                          <li className="text-muted-foreground">
                            ... e mais {result.errors.length - 10} erros
                          </li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Ações Finais */}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={resetImporter}>
                    Importar Outro Arquivo
                  </Button>
                  {onClose && (
                    <Button onClick={onClose}>
                      Concluir
                    </Button>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};