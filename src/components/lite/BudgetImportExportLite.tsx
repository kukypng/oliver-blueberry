import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useBudgetImportExport } from '@/hooks/useBudgetImportExport';

export const BudgetImportExportLite = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    exportBudgets,
    importBudgets,
    clearImportResults,
    isExporting,
    isImporting,
    importResults
  } = useBudgetImportExport();

  const handleExport = async () => {
    await exportBudgets();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await importBudgets(file);
    
    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Exportação */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-4 w-4" />
            Exportar
          </CardTitle>
          <CardDescription className="text-sm">
            Baixe seus orçamentos em CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            onClick={handleExport}
            disabled={isExporting}
            className="w-full"
            size="sm"
          >
            {isExporting ? (
              <>Exportando...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Importação */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="h-4 w-4" />
            Importar
          </CardTitle>
          <CardDescription className="text-sm">
            Importe orçamentos de um arquivo CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="import-file" className="text-sm">Arquivo CSV</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImport}
              disabled={isImporting}
              className="text-sm"
            />
          </div>

          {isImporting && (
            <Alert className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Processando arquivo...
              </AlertDescription>
            </Alert>
          )}

          {importResults && (
            <Alert className={`py-2 ${importResults.errors.length > 0 ? "border-yellow-500" : "border-green-500"}`}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Importação concluída</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearImportResults}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm">✅ {importResults.success} importados</p>
                  {importResults.errors.length > 0 && (
                    <div>
                      <p className="text-sm">❌ {importResults.errors.length} erros</p>
                      <div className="max-h-20 overflow-y-auto mt-1">
                        {importResults.errors.slice(0, 3).map((error, index) => (
                          <p key={index} className="text-xs text-muted-foreground">{error}</p>
                        ))}
                        {importResults.errors.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{importResults.errors.length - 3} mais erros...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Formato do arquivo - Versão compacta */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-4 w-4" />
            Formato CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Colunas necessárias (separadas por ;):
            </p>
            <div className="bg-muted p-3 rounded-md text-xs space-y-1">
              <div>1. Tipo Aparelho*</div>
              <div>2. Serviço/Aparelho*</div>
              <div>3. Qualidade</div>
              <div>4. Observações</div>
              <div>5. Preço à Vista*</div>
              <div>6. Preço Parcelado*</div>
              <div>7. Parcelas*</div>
              <div>8. Método Pagamento</div>
              <div>9. Garantia (meses)</div>
              <div>10. Validade (dias)</div>
              <div>11. Inclui Entrega (sim/não)</div>
              <div>12. Inclui Película (sim/não)</div>
            </div>
            <p className="text-xs text-muted-foreground">
              * = obrigatório
            </p>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                💡 Campos 3 e 4 são opcionais mas as colunas devem existir
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};