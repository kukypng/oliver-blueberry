import React, { useState } from 'react';
import { ArrowLeft, Upload, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCsvData } from '@/hooks/useCsvData';
import { CsvImportPreview } from './CsvImportPreview';
import { CsvExportFilters } from './CsvExportFilters';
import { CsvDropZone } from './CsvDropZone';
import { CsvProgressIndicator } from './CsvProgressIndicator';
import { CsvErrorHandler } from './CsvErrorHandler';

interface DataImportExportProps {
  onBack: () => void;
}

export const DataImportExport: React.FC<DataImportExportProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const { 
    isLoading, 
    previewData, 
    importResult, 
    parseFile, 
    exportData, 
    downloadTemplate, 
    clearData,
    budgetImport,
    budgetExport
  } = useCsvData();

  const handleFileSelect = async (file: File) => {
    await parseFile(file);
  };

  const handleConfirmImport = async () => {
    if (importResult?.data) {
      const stats = await budgetImport.importBudgets(importResult.data);
      if (stats.successful > 0) {
        clearData();
      }
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Gerenciamento de Dados
          </h1>
          <p className="text-sm text-muted-foreground">
            Importe e exporte seus orçamentos em formato CSV
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-muted p-1 rounded-lg">
        <Button
          variant={activeTab === 'import' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('import')}
          className="flex-1"
        >
          <Upload className="h-4 w-4 mr-2" />
          Importar
        </Button>
        <Button
          variant={activeTab === 'export' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('export')}
          className="flex-1"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Template CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Baixe o template para ver o formato correto do arquivo CSV
              </p>
              <Button variant="outline" onClick={downloadTemplate}>
                <FileText className="h-4 w-4 mr-2" />
                Baixar Template
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload do Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <CsvDropZone 
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          {/* Import Progress */}
          {budgetImport.isImporting && budgetImport.progress && (
            <CsvProgressIndicator 
              progress={budgetImport.progress}
              isImporting={budgetImport.isImporting}
            />
          )}

          {/* Import Stats */}
          {budgetImport.importStats && (
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Importação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {budgetImport.importStats.successful}
                    </div>
                    <div className="text-sm text-muted-foreground">Sucessos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-destructive">
                      {budgetImport.importStats.failed}
                    </div>
                    <div className="text-sm text-muted-foreground">Falhas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {budgetImport.importStats.skipped}
                    </div>
                    <div className="text-sm text-muted-foreground">Ignorados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {budgetImport.importStats.totalProcessed}
                    </div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
                
                {budgetImport.importStats.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Erros de Importação:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {budgetImport.importStats.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button variant="outline" onClick={budgetImport.clearImportStats}>
                  Fechar Relatório
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Preview and Results */}
          {importResult && !budgetImport.isImporting && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {importResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistics */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    Total: {importResult.totalRows} linhas
                  </Badge>
                  <Badge variant="default">
                    Válidas: {importResult.validRows}
                  </Badge>
                  {importResult.errors.length > 0 && (
                    <Badge variant="destructive">
                      Erros: {importResult.errors.length}
                    </Badge>
                  )}
                </div>

                {/* Enhanced Error Handling */}
                {importResult.errors.length > 0 && (
                  <CsvErrorHandler errors={importResult.errors} />
                )}

                {/* Preview */}
                {previewData && (
                  <CsvImportPreview 
                    previewData={previewData} 
                    validData={importResult.data}
                  />
                )}

                {/* Actions */}
                {importResult.success && importResult.validRows > 0 && !budgetImport.isImporting && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleConfirmImport}
                      disabled={budgetImport.isImporting}
                    >
                      {budgetImport.isImporting ? 'Importando...' : `Confirmar Importação (${importResult.validRows} orçamentos)`}
                    </Button>
                    <Button variant="outline" onClick={clearData}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Export Stats */}
          {budgetExport.exportStats && (
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Exportação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {budgetExport.exportStats.totalBudgets}
                    </div>
                    <div className="text-sm text-muted-foreground">Total de Orçamentos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {budgetExport.exportStats.exportedCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Exportados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {budgetExport.exportStats.filteredOut}
                    </div>
                    <div className="text-sm text-muted-foreground">Filtrados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {budgetExport.exportStats.fileSize}
                    </div>
                    <div className="text-sm text-muted-foreground">Tamanho do Arquivo</div>
                  </div>
                </div>
                
                <Button variant="outline" onClick={budgetExport.clearExportStats}>
                  Fechar Estatísticas
                </Button>
              </CardContent>
            </Card>
          )}

          <CsvExportFilters onExport={exportData} />
        </div>
      )}
    </div>
  );
};