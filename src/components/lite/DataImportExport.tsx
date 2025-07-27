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
    clearData 
  } = useCsvData();

  const handleFileSelect = async (file: File) => {
    await parseFile(file);
  };

  const handleConfirmImport = () => {
    if (importResult?.data) {
      // TODO: Integrate with budget creation logic
      console.log('Importing data:', importResult.data);
      clearData();
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

          {/* Preview and Results */}
          {importResult && (
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

                {/* Errors */}
                {importResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <details>
                        <summary className="cursor-pointer font-medium">
                          {importResult.errors.length} erro(s) encontrado(s)
                        </summary>
                        <div className="mt-2 space-y-1">
                          {importResult.errors.slice(0, 5).map((error, index) => (
                            <div key={index} className="text-xs">
                              Linha {error.row}, campo "{error.field}": {error.message}
                            </div>
                          ))}
                          {importResult.errors.length > 5 && (
                            <div className="text-xs italic">
                              ... e mais {importResult.errors.length - 5} erro(s)
                            </div>
                          )}
                        </div>
                      </details>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Preview */}
                {previewData && (
                  <CsvImportPreview 
                    previewData={previewData} 
                    validData={importResult.data}
                  />
                )}

                {/* Actions */}
                {importResult.success && importResult.validRows > 0 && (
                  <div className="flex gap-2">
                    <Button onClick={handleConfirmImport}>
                      Confirmar Importação ({importResult.validRows} orçamentos)
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
          <CsvExportFilters onExport={exportData} />
        </div>
      )}
    </div>
  );
};