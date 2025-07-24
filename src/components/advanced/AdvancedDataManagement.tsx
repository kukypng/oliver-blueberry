/**
 * Sistema Avançado de Gestão de Dados
 * 
 * Hub principal que integra todas as funcionalidades avançadas de
 * importação e exportação de dados.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  History, 
  Settings, 
  FileText, 
  Database,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ImportWizard, ImportResult } from './ImportWizard';
import { DragDropZone, FileWithPreview } from './DragDropZone';
import { DataPreviewTable } from './DataPreviewTable';
import { SupportedFormat } from '@/utils/import-export/formatDetector';
import { toast } from 'sonner';

export interface AdvancedDataManagementProps {
  userId: string;
  onDataImported?: (result: ImportResult) => void;
  onDataExported?: (format: SupportedFormat, data: any[]) => void;
  className?: string;
}

interface ImportHistory {
  id: string;
  fileName: string;
  format: SupportedFormat;
  recordsImported: number;
  timestamp: Date;
  status: 'success' | 'error' | 'warning';
}

export const AdvancedDataManagement: React.FC<AdvancedDataManagementProps> = ({
  userId,
  onDataImported,
  onDataExported,
  className
}) => {
  const [activeTab, setActiveTab] = useState('import');
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [quickPreviewData, setQuickPreviewData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalImports: 0,
    totalRecords: 0,
    successRate: 95,
    lastImport: null as Date | null
  });

  // Handlers
  const handleImportComplete = (result: ImportResult) => {
    setShowImportWizard(false);
    
    // Atualizar histórico
    const newHistoryEntry: ImportHistory = {
      id: Date.now().toString(),
      fileName: result.files.map(f => f.name).join(', '),
      format: result.configuration.format,
      recordsImported: result.summary.validRecords,
      timestamp: new Date(),
      status: result.summary.errors.length > 0 ? 'warning' : 'success'
    };
    
    setImportHistory(prev => [newHistoryEntry, ...prev.slice(0, 9)]); // Manter últimos 10
    
    // Atualizar estatísticas
    setStats(prev => ({
      totalImports: prev.totalImports + 1,
      totalRecords: prev.totalRecords + result.summary.validRecords,
      successRate: Math.round(((prev.totalImports * prev.successRate + (result.summary.errors.length === 0 ? 100 : 80)) / (prev.totalImports + 1))),
      lastImport: new Date()
    }));
    
    toast.success(`Importação concluída! ${result.summary.validRecords} registros importados.`);
    
    if (onDataImported) {
      onDataImported(result);
    }
  };

  const handleQuickImport = (files: FileWithPreview[]) => {
    if (files.length > 0 && files[0].parseResult) {
      setQuickPreviewData(files[0].parseResult.data.slice(0, 100)); // Preview dos primeiros 100
    }
  };

  const handleExport = (format: SupportedFormat) => {
    // Implementar exportação
    toast.success(`Exportação em ${format.toUpperCase()} iniciada!`);
    
    if (onDataExported) {
      onDataExported(format, quickPreviewData);
    }
  };

  if (showImportWizard) {
    return (
      <ImportWizard
        onComplete={handleImportComplete}
        onCancel={() => setShowImportWizard(false)}
        allowedFormats={Object.values(SupportedFormat)}
        maxFileSize={50 * 1024 * 1024} // 50MB
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header com Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Importações</p>
                  <p className="text-2xl font-bold">{stats.totalImports}</p>
                </div>
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registros Processados</p>
                  <p className="text-2xl font-bold">{stats.totalRecords.toLocaleString()}</p>
                </div>
                <Database className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">{stats.successRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Última Importação</p>
                  <p className="text-sm font-bold">
                    {stats.lastImport ? stats.lastImport.toLocaleDateString() : 'Nunca'}
                  </p>
                </div>
                <History className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab de Importação */}
          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Importação Rápida */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Importação Rápida
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Para arquivos simples com configurações padrão
                  </p>
                </CardHeader>
                <CardContent>
                  <DragDropZone
                    maxFiles={1}
                    onFilesAccepted={handleQuickImport}
                    onFileRemoved={() => setQuickPreviewData([])}
                  />
                </CardContent>
              </Card>

              {/* Importação Avançada */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Importação Avançada
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Com wizard completo e configurações personalizadas
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Suporte a múltiplos formatos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Validação avançada de dados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Preview e edição antes da importação</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Mapeamento de campos customizável</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowImportWizard(true)}
                      className="w-full"
                    >
                      Iniciar Wizard de Importação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview dos Dados */}
            {quickPreviewData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview dos Dados</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Primeiros 100 registros do arquivo importado
                  </p>
                </CardHeader>
                <CardContent>
                  <DataPreviewTable 
                    data={quickPreviewData}
                    maxHeight={400}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab de Exportação */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(SupportedFormat).map(format => (
                <Card key={format} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="py-6">
                    <div className="text-center space-y-4">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{format.toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">
                          Exportar como {format.toUpperCase()}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleExport(format)}
                        variant="outline"
                        className="w-full"
                      >
                        Exportar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab de Histórico */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Importações</CardTitle>
              </CardHeader>
              <CardContent>
                {importHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma importação realizada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {importHistory.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            entry.status === 'success' ? 'bg-green-500' :
                            entry.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="font-medium">{entry.fileName}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.recordsImported} registros • {entry.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {entry.format.toUpperCase()}
                          </Badge>
                          {entry.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : entry.status === 'warning' ? (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Configurações */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Importação/Exportação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Formatos Suportados</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(SupportedFormat).map(format => (
                        <Badge key={format} variant="outline">
                          {format.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Limites</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Tamanho máximo por arquivo: 50MB</p>
                      <p>• Máximo de arquivos simultâneos: 5</p>
                      <p>• Registros por importação: Ilimitado</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recursos Avançados</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Detecção automática de formato</p>
                      <p>• Validação em tempo real</p>
                      <p>• Preview interativo de dados</p>
                      <p>• Mapeamento de campos flexível</p>
                      <p>• Tratamento inteligente de duplicatas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};