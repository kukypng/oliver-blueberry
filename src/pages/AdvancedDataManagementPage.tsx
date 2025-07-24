/**
 * Página de Demonstração do Sistema Avançado
 * 
 * Exemplo completo de como usar o novo sistema de importação/exportação
 * com todas as funcionalidades avançadas.
 */

import React from 'react';
import { AdvancedDataManagement, ImportResult, SupportedFormat } from '@/components/advanced';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const AdvancedDataManagementPage: React.FC = () => {
  const handleDataImported = (result: ImportResult) => {
    console.log('📊 Dados importados:', result);
    
    // Aqui você pode processar os dados importados
    // Por exemplo, salvar no banco de dados
    const { processedData, summary, configuration } = result;
    
    toast.success(
      `Importação concluída! ${summary.validRecords} registros processados com sucesso.`,
      {
        description: `Formato: ${configuration.format.toUpperCase()} • ${summary.totalFiles} arquivo(s)`
      }
    );
    
    // Exemplo de como usar os dados
    if (processedData.length > 0) {
      console.log('Primeiro registro:', processedData[0]);
      console.log('Campos disponíveis:', Object.keys(processedData[0]));
    }
  };

  const handleDataExported = (format: SupportedFormat, data: any[]) => {
    console.log('📤 Dados exportados:', { format, recordCount: data.length });
    
    toast.success(
      `Exportação em ${format.toUpperCase()} concluída!`,
      {
        description: `${data.length} registros exportados`
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Sistema Avançado de Dados</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Importação e exportação de dados com suporte a múltiplos formatos, 
            validação avançada e interface moderna.
          </p>
          
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="outline">CSV</Badge>
            <Badge variant="outline">Excel</Badge>
            <Badge variant="outline">JSON</Badge>
            <Badge variant="outline">XML</Badge>
            <Badge variant="outline">TSV</Badge>
          </div>
        </div>

        {/* Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🎯 Detecção Automática</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detecta automaticamente o formato, encoding e estrutura dos seus arquivos.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">✨ Interface Moderna</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Drag & drop intuitivo, preview interativo e wizard guiado.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🔧 Validação Avançada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Regras customizáveis, detecção de duplicatas e correção automática.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sistema Principal */}
        <AdvancedDataManagement
          userId="demo-user"
          onDataImported={handleDataImported}
          onDataExported={handleDataExported}
        />

        {/* Instruções */}
        <Card>
          <CardHeader>
            <CardTitle>💡 Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Importação Rápida</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Arraste um arquivo para a zona de upload</li>
                  <li>O sistema detecta automaticamente o formato</li>
                  <li>Visualize o preview dos dados</li>
                  <li>Confirme a importação</li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Importação Avançada</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Clique em "Iniciar Wizard de Importação"</li>
                  <li>Selecione e configure seus arquivos</li>
                  <li>Configure validações e mapeamentos</li>
                  <li>Revise e confirme a importação</li>
                </ol>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🚀 Recursos Avançados
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                <div>
                  <strong>Formatos Suportados:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• CSV (Comma Separated Values)</li>
                    <li>• Excel (.xlsx, .xls)</li>
                    <li>• JSON (JavaScript Object Notation)</li>
                    <li>• XML (eXtensible Markup Language)</li>
                    <li>• TSV (Tab Separated Values)</li>
                  </ul>
                </div>
                <div>
                  <strong>Funcionalidades:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>• Detecção automática de formato</li>
                    <li>• Preview interativo com edição</li>
                    <li>• Validação de dados em tempo real</li>
                    <li>• Mapeamento de campos flexível</li>
                    <li>• Histórico de operações</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedDataManagementPage;