/**
 * CSV Import/Export Demo - Oliver
 * Demonstração da funcionalidade de importação/exportação simétrica
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { generateExportCsv, generateTemplateCsv, parseAndPrepareBudgets } from '@/utils/csv';
import { UnifiedCsvParser } from '@/utils/csv/unifiedParser';
import { Heading, Text } from '@/components/ui/typography';
import { GlassCard } from '@/components/ui/modern-cards';
import { FadeInUp } from '@/components/ui/animations';

// Dados de exemplo para demonstração
const sampleBudgets = [
  {
    id: '1',
    device_type: 'Smartphone',
    device_model: 'iPhone 13',
    part_quality: 'Original',
    part_type: 'Troca de Tela',
    notes: 'Tela quebrada, touch funcionando',
    total_price: 45000, // R$ 450,00 em centavos
    installment_price: 50000, // R$ 500,00 em centavos
    installments: 2,
    payment_condition: 'Cartao de Credito',
    warranty_months: 3,
    includes_delivery: false,
    includes_screen_protector: true,
    valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    device_type: 'Notebook',
    device_model: 'MacBook Pro',
    part_quality: 'Compatível',
    part_type: 'Troca de Teclado',
    notes: 'Algumas teclas não funcionam',
    total_price: 120000, // R$ 1200,00 em centavos
    installment_price: null,
    installments: 1,
    payment_condition: 'A Vista',
    warranty_months: 6,
    includes_delivery: true,
    includes_screen_protector: false,
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const CsvImportExportDemo: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [csvContent, setCsvContent] = React.useState('');
  const [importResult, setImportResult] = React.useState<any>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Gerar CSV de exemplo
  const handleGenerateExample = () => {
    try {
      const csvContent = generateExportCsv(sampleBudgets);
      setCsvContent(csvContent);
      showSuccess({ 
        title: 'CSV Gerado', 
        description: 'CSV de exemplo gerado com dados de demonstração' 
      });
    } catch (error: any) {
      showError({ 
        title: 'Erro ao Gerar CSV', 
        description: error.message 
      });
    }
  };

  // Baixar template
  const handleDownloadTemplate = () => {
    try {
      const templateContent = generateTemplateCsv();
      const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template_importacao.csv';
      link.click();
      URL.revokeObjectURL(url);
      
      showSuccess({ 
        title: 'Template Baixado', 
        description: 'Template de importação baixado com sucesso' 
      });
    } catch (error: any) {
      showError({ 
        title: 'Erro ao Baixar Template', 
        description: error.message 
      });
    }
  };

  // Baixar CSV gerado
  const handleDownloadCsv = () => {
    if (!csvContent) {
      showWarning({ 
        title: 'Nenhum CSV', 
        description: 'Gere um CSV primeiro antes de baixar' 
      });
      return;
    }

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `exemplo_exportacao_${new Date().toISOString().slice(0,10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      
      showSuccess({ 
        title: 'CSV Baixado', 
        description: 'Arquivo CSV baixado com sucesso' 
      });
    } catch (error: any) {
      showError({ 
        title: 'Erro ao Baixar CSV', 
        description: error.message 
      });
    }
  };

  // Testar importação do CSV gerado
  const handleTestImport = async () => {
    if (!csvContent) {
      showWarning({ 
        title: 'Nenhum CSV', 
        description: 'Gere um CSV primeiro antes de testar a importação' 
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('=== TESTE DE IMPORTAÇÃO ===');
      console.log('Conteúdo CSV a ser testado:');
      console.log(csvContent);
      
      // Usar o parser unificado para teste
      const parser = new UnifiedCsvParser();
      const result = parser.parseAndValidate(csvContent, 'demo-user-id');
      
      setImportResult(result);
      
      if (result.errors.length > 0) {
        showError({ 
          title: 'Erros na Importação', 
          description: `${result.errors.length} erro(s) encontrado(s)` 
        });
      } else {
        showSuccess({ 
          title: 'Importação Testada', 
          description: `${result.validRows} linha(s) processada(s) com sucesso` 
        });
      }
    } catch (error: any) {
      console.error('Erro no teste de importação:', error);
      showError({ 
        title: 'Erro no Teste', 
        description: error.message 
      });
      setImportResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para testar com CSV simples
  const handleTestSimpleCsv = () => {
    const simpleCsv = `Tipo Aparelho;Modelo Aparelho;Qualidade;Servico Realizado;Observacoes;Preco Total;Preco Parcelado;Parcelas;Metodo de Pagamento;Garantia (meses);Validade (dias);Inclui Entrega;Inclui Pelicula
Smartphone;iPhone 13;Original;Troca de Tela;Teste de importação;450.00;500.00;2;Cartao de Credito;3;15;nao;sim`;
    
    setCsvContent(simpleCsv);
    showSuccess({ 
      title: 'CSV Simples Gerado', 
      description: 'CSV simples criado para teste de importação' 
    });
  };

  // Upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      showSuccess({ 
        title: 'Arquivo Carregado', 
        description: 'Arquivo CSV carregado com sucesso' 
      });
    };
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <FadeInUp>
        <div className="text-center mb-8">
          <Heading level="h1" size="3xl" className="mb-4">
            Demonstração CSV Import/Export
          </Heading>
          <Text size="lg" color="secondary">
            Teste a funcionalidade de importação e exportação simétrica de orçamentos
          </Text>
        </div>
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Seção de Exportação */}
        <FadeInUp delay={0.1}>
          <GlassCard variant="premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Exportação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  onClick={handleGenerateExample}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar CSV de Exemplo
                </Button>
                
                <Button 
                  onClick={handleDownloadTemplate}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Template
                </Button>
                
                <Button 
                  onClick={handleDownloadCsv}
                  className="w-full"
                  disabled={!csvContent}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Baixar CSV Gerado
                </Button>
                
                <Button 
                  onClick={handleTestSimpleCsv}
                  className="w-full"
                  variant="secondary"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  CSV Simples para Teste
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        </FadeInUp>

        {/* Seção de Importação */}
        <FadeInUp delay={0.2}>
          <GlassCard variant="premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Importação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload">Carregar Arquivo CSV</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                />
                
                <Button 
                  onClick={handleTestImport}
                  className="w-full"
                  disabled={!csvContent || isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  Testar Importação
                </Button>
              </div>
            </CardContent>
          </GlassCard>
        </FadeInUp>
      </div>

      {/* Visualização do CSV */}
      {csvContent && (
        <FadeInUp delay={0.3}>
          <GlassCard variant="premium">
            <CardHeader>
              <CardTitle>Conteúdo do CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
                placeholder="Conteúdo do CSV aparecerá aqui..."
              />
            </CardContent>
          </GlassCard>
        </FadeInUp>
      )}

      {/* Resultado da Importação */}
      {importResult && (
        <FadeInUp delay={0.4}>
          <GlassCard variant="premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {importResult.errors.length > 0 ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                Resultado da Importação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {importResult.totalRows}
                  </div>
                  <Text size="sm" color="secondary">Total de Linhas</Text>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {importResult.validRows}
                  </div>
                  <Text size="sm" color="secondary">Linhas Válidas</Text>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {importResult.invalidRows}
                  </div>
                  <Text size="sm" color="secondary">Linhas Inválidas</Text>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {importResult.warnings}
                  </div>
                  <Text size="sm" color="secondary">Avisos</Text>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-4">
                  <Heading level="h4" size="sm" className="mb-2 text-red-600">
                    Erros Encontrados:
                  </Heading>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    {importResult.errors.map((error: string, index: number) => (
                      <Text key={index} size="sm" className="text-red-700 dark:text-red-400">
                        • {error}
                      </Text>
                    ))}
                  </div>
                </div>
              )}

              {importResult.validRows > 0 && (
                <div className="mt-4">
                  <Heading level="h4" size="sm" className="mb-2 text-green-600">
                    Dados Processados com Sucesso:
                  </Heading>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <Text size="sm" color="secondary">
                      {importResult.validRows} orçamento(s) processado(s) e pronto(s) para importação
                    </Text>
                  </div>
                </div>
              )}
            </CardContent>
          </GlassCard>
        </FadeInUp>
      )}

      {/* Instruções */}
      <FadeInUp delay={0.5}>
        <GlassCard variant="gradient">
          <CardHeader>
            <CardTitle>Como Usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <Text size="sm">Clique em "Gerar CSV de Exemplo" para criar um arquivo com dados de demonstração</Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <Text size="sm">Baixe o CSV gerado e abra em um editor de planilhas (Excel, Google Sheets)</Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
              <Text size="sm">Faça modificações nos dados e salve o arquivo</Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">4</div>
              <Text size="sm">Carregue o arquivo modificado e teste a importação</Text>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">5</div>
              <Text size="sm">Verifique se o formato exportado pode ser re-importado sem erros</Text>
            </div>
          </CardContent>
        </GlassCard>
      </FadeInUp>
    </div>
  );
};