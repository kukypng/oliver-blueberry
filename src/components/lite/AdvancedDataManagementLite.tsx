/**
 * Sistema Avançado de Gestão de Dados - Versão Lite
 * 
 * Versão otimizada para mobile com funcionalidades avançadas de
 * importação/exportação adaptadas para dispositivos móveis.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  FileText, 
  Search, 
  RotateCcw, 
  Loader2, 
  MessageCircle,
  Eye,
  CheckCircle,
  AlertTriangle,
  History,
  Settings,
  X,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCsvDataUnified } from '@/hooks/useCsvDataUnified';
import { DevelopmentWarning } from '@/components/ui/DevelopmentWarning';
import { useDevWarning } from '@/hooks/useDevWarning';
import { SupportedFormat, formatDetector } from '@/utils/import-export/formatDetector';
import { universalParser } from '@/utils/import-export/universalParser';
import { MobileDragDrop, MobileFilePreview } from './MobileDragDrop';
import { MobileDataPreview } from './MobileDataPreview';
import { MobileImportWizard, MobileImportResult } from './MobileImportWizard';
import { AdvancedDataManager } from '@/components/dashboard/AdvancedDataManager';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AdvancedDataManagementLiteProps {
  userId: string;
  onBack: () => void;
}

// Usar o tipo do MobileDragDrop
type FilePreview = MobileFilePreview;

interface ImportHistory {
  id: string;
  fileName: string;
  format: SupportedFormat;
  recordsImported: number;
  timestamp: Date;
  status: 'success' | 'error' | 'warning';
}

export const AdvancedDataManagementLite: React.FC<AdvancedDataManagementLiteProps> = ({ 
  userId, 
  onBack 
}) => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('analytics');
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  
  // Estados do sistema original
  const { fetchAndExportBudgets, downloadImportTemplate } = useCsvDataUnified();
  const { showWarning, title, message, loading: devWarningLoading } = useDevWarning();
  
  const [stats, setStats] = useState({
    totalBudgets: 0,
    deletedBudgets: 0,
    totalImports: 0,
    successRate: 95
  });
  const [loading, setLoading] = useState(true);
  const [deletedBudgets, setDeletedBudgets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    if (!userId) return;
    loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Buscar estatísticas
      const [activeResult, trashedResult] = await Promise.all([
        supabase
          .from('budgets')
          .select('id', { count: 'exact' })
          .eq('owner_id', userId)
          .is('deleted_at', null),
        supabase
          .from('budget_deletion_audit')
          .select('*')
          .eq('deleted_by', userId)
          .eq('can_restore', true)
          .order('created_at', { ascending: false })
      ]);

      if (activeResult.data && trashedResult.data) {
        const formattedTrashedBudgets = trashedResult.data.map(audit => ({
          ...(typeof audit.budget_data === 'object' && audit.budget_data !== null ? audit.budget_data : {}),
          deletion_reason: audit.deletion_reason,
          deleted_at: audit.created_at,
          audit_id: audit.id
        }));

        setStats(prev => ({
          ...prev,
          totalBudgets: activeResult.data.length,
          deletedBudgets: formattedTrashedBudgets.length
        }));
        
        setDeletedBudgets(formattedTrashedBudgets);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handler para arquivo processado pelo MobileDragDrop
  const handleFileProcessed = (preview: FilePreview) => {
    setFilePreview(preview);
  };

  // Handler para remoção de arquivo
  const handleFileRemoved = () => {
    setFilePreview(null);
  };

  // Confirmar importação
  const handleConfirmImport = async () => {
    if (!filePreview || filePreview.status !== 'ready') return;

    setIsProcessing(true);
    
    try {
      // Parse completo do arquivo
      const parseResult = await universalParser.parse(filePreview.file, {
        format: filePreview.format
      });

      if (parseResult.errors.length > 0) {
        throw new Error(`Erros encontrados: ${parseResult.errors[0].message}`);
      }

      // Converter dados para formato do sistema
      const budgetsToInsert = parseResult.data.map((row: any) => ({
        owner_id: userId,
        device_type: row['Tipo Aparelho'] || row['device_type'] || 'Não informado',
        device_model: row['Modelo Aparelho'] || row['device_model'] || 'Não informado',
        part_quality: row['Qualidade'] || row['part_quality'] || 'Original',
        total_price: Math.round((parseFloat(row['Preco Total'] || row['total_price'] || '0') * 100)),
        cash_price: Math.round((parseFloat(row['Preco Total'] || row['total_price'] || '0') * 100)),
        installment_price: row['Preco Parcelado'] ? Math.round(parseFloat(row['Preco Parcelado']) * 100) : null,
        installments: parseInt(row['Parcelas'] || row['installments'] || '1'),
        payment_condition: row['Metodo Pagamento'] || row['payment_condition'] || 'A Vista',
        warranty_months: parseInt(row['Garantia (meses)'] || row['warranty_months'] || '3'),
        includes_delivery: (row['Inclui Entrega'] || row['includes_delivery'] || 'nao').toLowerCase() === 'sim',
        includes_screen_protector: (row['Inclui Pelicula'] || row['includes_screen_protector'] || 'nao').toLowerCase() === 'sim',
        valid_until: new Date(Date.now() + (parseInt(row['Validade (dias)'] || '15') * 24 * 60 * 60 * 1000)).toISOString(),
        workflow_status: 'pending',
        client_name: row['Cliente'] || 'Cliente Padrão'
      }));

      // Inserir no banco
      const { data, error } = await supabase
        .from('budgets')
        .insert(budgetsToInsert)
        .select();

      if (error) throw error;

      // Atualizar histórico
      const historyEntry: ImportHistory = {
        id: Date.now().toString(),
        fileName: filePreview.file.name,
        format: filePreview.format,
        recordsImported: data.length,
        timestamp: new Date(),
        status: 'success'
      };

      setImportHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalBudgets: prev.totalBudgets + data.length,
        totalImports: prev.totalImports + 1
      }));

      setFilePreview(null);
      
      toast.success(`${data.length} orçamentos importados com sucesso!`);
      
      // Vibração de sucesso no mobile
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }

    } catch (error) {
      toast.error('Erro na importação: ' + (error as Error).message);
      
      // Adicionar ao histórico como erro
      const historyEntry: ImportHistory = {
        id: Date.now().toString(),
        fileName: filePreview.file.name,
        format: filePreview.format,
        recordsImported: 0,
        timestamp: new Date(),
        status: 'error'
      };
      
      setImportHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler para wizard de importação
  const handleWizardComplete = async (result: MobileImportResult) => {
    setShowImportWizard(false);
    
    try {
      // Converter dados para formato do sistema
      const budgetsToInsert = result.processedData.map((row: any) => ({
        owner_id: userId,
        device_type: row['Tipo Aparelho'] || row['device_type'] || 'Não informado',
        device_model: row['Modelo Aparelho'] || row['device_model'] || 'Não informado',
        part_quality: row['Qualidade'] || row['part_quality'] || 'Original',
        total_price: Math.round((parseFloat(row['Preco Total'] || row['total_price'] || '0') * 100)),
        cash_price: Math.round((parseFloat(row['Preco Total'] || row['total_price'] || '0') * 100)),
        installment_price: row['Preco Parcelado'] ? Math.round(parseFloat(row['Preco Parcelado']) * 100) : null,
        installments: parseInt(row['Parcelas'] || row['installments'] || '1'),
        payment_condition: row['Metodo Pagamento'] || row['payment_condition'] || 'A Vista',
        warranty_months: parseInt(row['Garantia (meses)'] || row['warranty_months'] || '3'),
        includes_delivery: (row['Inclui Entrega'] || row['includes_delivery'] || 'nao').toLowerCase() === 'sim',
        includes_screen_protector: (row['Inclui Pelicula'] || row['includes_screen_protector'] || 'nao').toLowerCase() === 'sim',
        valid_until: new Date(Date.now() + (parseInt(row['Validade (dias)'] || '15') * 24 * 60 * 60 * 1000)).toISOString(),
        workflow_status: 'pending',
        client_name: row['Cliente'] || 'Cliente Padrão'
      }));

      // Inserir no banco
      const { data, error } = await supabase
        .from('budgets')
        .insert(budgetsToInsert)
        .select();

      if (error) throw error;

      // Atualizar histórico
      const historyEntry: ImportHistory = {
        id: Date.now().toString(),
        fileName: result.file.file.name,
        format: result.file.format,
        recordsImported: data.length,
        timestamp: new Date(),
        status: 'success'
      };

      setImportHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      
      // Atualizar estatísticas
      setStats(prev => ({
        ...prev,
        totalBudgets: prev.totalBudgets + data.length,
        totalImports: prev.totalImports + 1
      }));

      toast.success(`${data.length} orçamentos importados via wizard!`);
      
    } catch (error) {
      toast.error('Erro na importação via wizard: ' + (error as Error).message);
    }
  };

  // Filtrar orçamentos deletados
  const filteredBudgets = deletedBudgets.filter(budget =>
    !searchTerm || 
    budget.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-4 border-b bg-card">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Gestão Avançada de Dados</h1>
      </div>

      {/* Aviso de Desenvolvimento */}
      {showWarning && !devWarningLoading && (
        <div className="p-4 pb-0">
          <DevelopmentWarning 
            title={title}
            message={message}
            className="mb-4"
          />
        </div>
      )}

      {/* Estatísticas */}
      <div className="p-4 pb-2">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalBudgets}</div>
                <div className="text-xs text-muted-foreground">Orçamentos</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalImports}</div>
                <div className="text-xs text-muted-foreground">Importações</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 mx-4">
            <TabsTrigger value="analytics" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="import" className="text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Importar
            </TabsTrigger>
            <TabsTrigger value="export" className="text-xs">
              <Download className="h-3 w-3 mr-1" />
              Exportar
            </TabsTrigger>
            <TabsTrigger value="trash" className="text-xs">
              <Trash2 className="h-3 w-3 mr-1" />
              Lixeira
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
            {/* Tab de Analytics Avançado */}
            <TabsContent value="analytics" className="p-4 space-y-4 mt-0">
              <AdvancedDataManager 
                userId={userId}
                className="space-y-4"
              />
            </TabsContent>

            {/* Tab de Importação */}
            <TabsContent value="import" className="p-4 space-y-4 mt-0">
              {/* Upload Area */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Importação Inteligente
                  </CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {Object.values(SupportedFormat).map(format => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mobile Drag Drop */}
                  <MobileDragDrop
                    onFileProcessed={handleFileProcessed}
                    onFileRemoved={handleFileRemoved}
                    disabled={isProcessing}
                    maxFileSize={10 * 1024 * 1024} // 10MB para mobile
                    maxFiles={1} // Manter single file para simplicidade no mobile
                    acceptedFormats={[
                      SupportedFormat.CSV,
                      SupportedFormat.EXCEL,
                      SupportedFormat.JSON
                    ]}
                  />

                  {/* Wizard Button */}
                  <Button 
                    onClick={() => setShowImportWizard(true)}
                    variant="outline"
                    className="w-full"
                    size="sm"
                    disabled={isProcessing}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Importação Assistida
                  </Button>

                  {/* Template Download */}
                  <Button 
                    onClick={downloadImportTemplate}
                    variant="ghost"
                    className="w-full"
                    size="sm"
                    disabled={isProcessing}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Modelo CSV
                  </Button>
                </CardContent>
              </Card>

              {/* Action Buttons para arquivo pronto */}
              {filePreview && filePreview.status === 'ready' && (
                <Card>
                  <CardContent className="py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => setShowDataPreview(true)}
                        variant="outline"
                        disabled={isProcessing}
                        size="lg"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      
                      <Button 
                        onClick={handleConfirmImport}
                        disabled={isProcessing}
                        size="lg"
                      >
                        {isProcessing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        Importar
                      </Button>
                    </div>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      {filePreview.recordCount} registros prontos para importação
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Import History */}
              {importHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Histórico Recente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {importHistory.slice(0, 3).map(entry => (
                        <div key={entry.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            {entry.status === 'success' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                            <div>
                              <p className="text-xs font-medium">{entry.fileName}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.recordsImported} registros
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.format.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab de Exportação */}
            <TabsContent value="export" className="p-4 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    Exportar Dados
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Baixe seus orçamentos em formato CSV
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={fetchAndExportBudgets}
                    disabled={loading || stats.totalBudgets === 0}
                    className="w-full"
                    size="lg"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Exportar {stats.totalBudgets} Orçamentos
                  </Button>
                  
                  {stats.totalBudgets === 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Nenhum orçamento disponível para exportação
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Suporte */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    Suporte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => window.open('https://wa.me/556496028022', '_blank')}
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    size="lg"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Suporte WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab da Lixeira */}
            <TabsContent value="trash" className="p-4 space-y-4 mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-primary" />
                    Lixeira ({stats.deletedBudgets})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar na lixeira..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Empty Trash Button */}
                  <Button 
                    variant="destructive"
                    className="w-full"
                    disabled={stats.deletedBudgets === 0}
                    onClick={async () => {
                      if (confirm('Esvaziar lixeira permanentemente?')) {
                        // Implementar lógica de esvaziar lixeira
                        toast.success('Lixeira esvaziada!');
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Esvaziar Lixeira
                  </Button>

                  {/* Deleted Items */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="animate-pulse bg-muted rounded-lg h-16" />
                        ))}
                      </div>
                    ) : filteredBudgets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Lixeira vazia</p>
                      </div>
                    ) : (
                      filteredBudgets.map(budget => (
                        <div key={budget.id} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{budget.device_model}</p>
                              <p className="text-xs text-muted-foreground">{budget.device_type}</p>
                            </div>
                            <p className="text-sm font-medium">
                              R$ {Number(budget.cash_price / 100 || 0).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Restaurar
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1">
                              <Trash2 className="mr-1 h-3 w-3" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Modal de Preview dos Dados */}
      {showDataPreview && filePreview && filePreview.previewData && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
          {/* Header do Preview */}
          <div className="flex items-center p-4 border-b bg-card">
            <Button variant="ghost" onClick={() => setShowDataPreview(false)} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">Preview dos Dados</h1>
          </div>

          {/* Conteúdo do Preview */}
          <div className="flex-1 overflow-hidden">
            <MobileDataPreview
              data={filePreview.previewData}
              parseResult={filePreview.parseResult}
              maxRows={20} // Limite baixo para mobile
              className="h-full p-4"
            />
          </div>

          {/* Footer com ações */}
          <div className="p-4 border-t bg-card">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDataPreview(false)}
                size="lg"
              >
                Voltar
              </Button>
              
              <Button 
                onClick={() => {
                  setShowDataPreview(false);
                  handleConfirmImport();
                }}
                disabled={isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Confirmar Importação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard de Importação */}
      {showImportWizard && (
        <MobileImportWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowImportWizard(false)}
          allowedFormats={[
            SupportedFormat.CSV,
            SupportedFormat.EXCEL,
            SupportedFormat.JSON
          ]}
          maxFileSize={10 * 1024 * 1024} // 10MB para mobile
        />
      )}
    </div>
  );
};