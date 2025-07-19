
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadCloud, Download, FileSpreadsheet, Loader2, Info } from 'lucide-react';
import { useEnhancedCsvData } from '@/hooks/useEnhancedCsvData';
import { ImportPreview } from '@/components/ImportPreview';

export const DataManagementSettings = () => {
  const { 
    isProcessing, 
    importPreview, 
    fetchAndExportBudgets, 
    downloadImportTemplate, 
    processImportFile, 
    confirmImport, 
    cancelImport 
  } = useEnhancedCsvData();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !isProcessing) {
      processImportFile(file);
      event.target.value = ''; // Reseta o input para permitir selecionar o mesmo arquivo novamente
    }
  };

  return (
    <>
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Gestão de Dados Aprimorada</CardTitle>
          <CardDescription>
            Sistema aprimorado que aceita dados incompletos e fornece validação flexível. 
            Campos obrigatórios são validados, mas dados faltantes são preenchidos automaticamente.
          </CardDescription>
        </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Baixe um arquivo CSV com todos os seus orçamentos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchAndExportBudgets} className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Processando...' : 'Exportar Orçamentos'}
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5" />
              Importar Dados
            </CardTitle>
            <CardDescription>
              Sistema flexível que aceita dados incompletos. Campos obrigatórios são validados 
              e dados faltantes são preenchidos automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Campos Obrigatórios
                  </div>
                  <div className="text-blue-800 dark:text-blue-200 space-y-1">
                    <div>• Tipo do Aparelho</div>
                    <div>• Modelo do Aparelho</div>
                    <div>• Defeito/Problema</div>
                    <div>• Serviço Realizado</div>
                    <div>• Preço Total</div>
                  </div>
                  <div className="text-blue-700 dark:text-blue-300 mt-2 text-xs">
                    Campos opcionais serão preenchidos com valores padrão se estiverem vazios.
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" asChild disabled={isProcessing}>
              <label htmlFor="import-file" className={isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}>
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {isProcessing ? 'Analisando...' : 'Selecionar Arquivo CSV'}
                <input type="file" id="import-file" className="hidden" accept=".csv" onChange={handleFileSelect} disabled={isProcessing}/>
              </label>
            </Button>
            <Button variant="secondary" onClick={downloadImportTemplate} className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Processando...' : 'Baixar Modelo Aprimorado'}
            </Button>
          </CardContent>
        </Card>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!importPreview} onOpenChange={() => cancelImport()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prévia da Importação</DialogTitle>
            <DialogDescription>
              Revise os dados antes de confirmar a importação
            </DialogDescription>
          </DialogHeader>
          {importPreview && (
            <ImportPreview
              summary={importPreview}
              onConfirm={confirmImport}
              onCancel={cancelImport}
              isProcessing={isProcessing}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
