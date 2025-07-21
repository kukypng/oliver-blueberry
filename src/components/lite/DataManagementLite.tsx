import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Upload, Trash2, Database, FileText, Search, RotateCcw, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCsvData } from '@/hooks/useCsvDataUnified';
import { DevelopmentWarning } from '@/components/ui/DevelopmentWarning';
import { useDevWarning } from '@/hooks/useDevWarning';

interface DataManagementLiteProps {
  userId: string;
  onBack: () => void;
}

export const DataManagementLite = ({ userId, onBack }: DataManagementLiteProps) => {
  const { isProcessing, fetchAndExportBudgets, downloadImportTemplate, processImportedFile } = useCsvData();
  const { showWarning, title, message, loading: devWarningLoading } = useDevWarning();
  
  const [stats, setStats] = useState({
    totalBudgets: 0,
    deletedBudgets: 0
  });
  const [loading, setLoading] = useState(true);
  const [deletedBudgets, setDeletedBudgets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredBudgets, setFilteredBudgets] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // iOS otimização: timeout para evitar requests longos
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Buscar estatísticas - ativas
        const activePromise = supabase
          .from('budgets')
          .select('id', { count: 'exact' })
          .eq('owner_id', userId)
          .is('deleted_at', null);
          
        // Buscar orçamentos deletados - usando audit table correta para iOS
        const trashedPromise = supabase
          .from('budget_deletion_audit')
          .select('*')
          .eq('deleted_by', userId)
          .eq('can_restore', true)
          .order('created_at', { ascending: false });

        const [activeResult, trashedResult] = await Promise.all([
          activePromise,
          trashedPromise
        ]);

        clearTimeout(timeoutId);

        if (activeResult.error) {
          console.error('Error fetching active budgets:', activeResult.error);
        }
        
        if (trashedResult.error) {
          console.error('Error fetching trashed budgets:', trashedResult.error);
        }

        // iOS: garantir que os dados sempre sejam arrays válidos
        const activeBudgets = activeResult.data || [];
        const trashedBudgets = trashedResult.data || [];
        
        // Converter dados da audit para formato compatível
        const formattedTrashedBudgets = trashedBudgets.map(audit => ({
          ...(typeof audit.budget_data === 'object' && audit.budget_data !== null ? audit.budget_data : {}),
          deletion_reason: audit.deletion_reason,
          deleted_at: audit.created_at,
          audit_id: audit.id
        }));
        
        console.log('Debug - Trashed budgets found:', trashedBudgets.length, trashedBudgets);

        setStats({
          totalBudgets: activeBudgets.length,
          deletedBudgets: formattedTrashedBudgets.length
        });
        
        setDeletedBudgets(formattedTrashedBudgets);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading data:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    return () => {
      controller.abort();
    };
  }, [userId]);

  useEffect(() => {
    let filtered = deletedBudgets;
    
    if (searchTerm) {
      filtered = filtered.filter(budget => 
        budget.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType !== 'all') {
      filtered = filtered.filter(budget => budget.device_type === filterType);
    }
    
    setFilteredBudgets(filtered);
  }, [deletedBudgets, searchTerm, filterType]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && !isProcessing) {
      processImportedFile(file);
      event.target.value = ''; // Reseta o input para permitir selecionar o mesmo arquivo novamente
    }
  };
  
  const handleEmptyTrash = async () => {
    if (!deletedBudgets || deletedBudgets.length === 0) {
      alert('Não há orçamentos na lixeira para excluir.');
      return;
    }
    
    if (!confirm('Deseja realmente esvaziar a lixeira? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      setLoading(true);
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;
      
      if (!userId) {
        alert('Usuário não autenticado');
        return;
      }
      
      let successCount = 0;
      let errorCount = 0;

      // Processar cada orçamento excluído usando funções do sistema
      for (const budget of deletedBudgets) {
        try {
          // Usar a função RPC que gerencia exclusão permanente e auditoria
          const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
            p_budget_id: budget.id,
            p_deletion_reason: 'Exclusão permanente via lixeira iOS'
          });

          if (error) {
            console.error(`Erro ao excluir orçamento ${budget.id}:`, error);
            errorCount++;
            continue;
          }

          // Marcar como não restaurável na auditoria
          const { error: auditError } = await supabase
            .from('budget_deletion_audit')
            .update({ can_restore: false })
            .eq('budget_id', budget.id)
            .eq('deleted_by', userId);

          if (auditError) {
            console.error(`Erro ao atualizar auditoria ${budget.id}:`, auditError);
          }

          successCount++;
        } catch (error) {
          console.error(`Falha ao processar orçamento ${budget.id}:`, error);
          errorCount++;
        }
      }

      // Atualizar estado local
      setDeletedBudgets([]);
      setStats(prev => ({
        ...prev,
        deletedBudgets: 0
      }));

      if (errorCount === 0) {
        alert(`${successCount} orçamento(s) foram excluídos permanentemente.`);
      } else if (successCount > 0) {
        alert(`${successCount} de ${deletedBudgets.length} orçamentos foram excluídos. ${errorCount} falharam.`);
      } else {
        alert('Não foi possível excluir nenhum orçamento da lixeira.');
      }
    } catch (error) {
      console.error('Erro ao esvaziar lixeira:', error);
      alert('Erro ao esvaziar a lixeira');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRestore = async (budget: any) => {
    try {
      // Usar a função RPC segura para restauração
      const { data, error } = await supabase.rpc('restore_deleted_budget', {
        p_budget_id: budget.id
      });
        
      if (error) throw error;
      
      const response = data as any;
      if (!response?.success) {
        throw new Error(response?.error || 'Falha na restauração do orçamento');
      }
      
      // Recarregar dados
      setDeletedBudgets(prev => prev.filter(b => b.id !== budget.id));
      setStats(prev => ({
        ...prev,
        totalBudgets: prev.totalBudgets + 1,
        deletedBudgets: prev.deletedBudgets - 1
      }));
      
      alert('Orçamento restaurado com sucesso!');
    } catch (error) {
      console.error('Error restoring budget:', error);
      alert('Erro ao restaurar orçamento');
    }
  };
  
  const handlePermanentDelete = async (budget: any) => {
    if (!confirm('Deseja excluir permanentemente este orçamento? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const currentUser = await supabase.auth.getUser();
      const userId = currentUser.data.user?.id;
      
      if (!userId) {
        alert('Usuário não autenticado');
        return;
      }

      // Usar a função RPC que gerencia exclusão permanente e auditoria
      const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
        p_budget_id: budget.id,
        p_deletion_reason: 'Exclusão permanente individual via iOS'
      });

      if (error) {
        console.error('Erro ao excluir orçamento:', error);
        alert('Erro ao excluir orçamento');
        return;
      }

      // Marcar como não restaurável na auditoria
      const { error: auditError } = await supabase
        .from('budget_deletion_audit')
        .update({ can_restore: false })
        .eq('budget_id', budget.id)
        .eq('deleted_by', userId);

      if (auditError) {
        console.error('Erro ao atualizar auditoria:', auditError);
      }
      
      setDeletedBudgets(prev => prev.filter(b => b.id !== budget.id));
      setStats(prev => ({
        ...prev,
        deletedBudgets: prev.deletedBudgets - 1
      }));
      
      alert('Orçamento excluído permanentemente!');
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Erro ao excluir orçamento');
    }
  };

  const handleRefresh = async () => {
    const controller = new AbortController();
    
    try {
      setLoading(true);
      
      // iOS: timeout otimizado
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      // Buscar dados em paralelo
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

      clearTimeout(timeoutId);

      if (activeResult.error || trashedResult.error) {
        console.error('Error fetching data:', { 
          activeError: activeResult.error, 
          trashedError: trashedResult.error 
        });
        return;
      }

      const activeBudgets = activeResult.data || [];
      const trashedBudgets = trashedResult.data || [];
      
      // Converter dados da audit para formato compatível
      const formattedTrashedBudgets = trashedBudgets.map(audit => ({
        ...(typeof audit.budget_data === 'object' && audit.budget_data !== null ? audit.budget_data : {}),
        deletion_reason: audit.deletion_reason,
        deleted_at: audit.created_at,
        audit_id: audit.id
      }));
      
      console.log('Debug - Refresh: Trashed budgets found:', formattedTrashedBudgets.length);

      setStats({
        totalBudgets: activeBudgets.length,
        deletedBudgets: formattedTrashedBudgets.length
      });
      
      setDeletedBudgets(formattedTrashedBudgets);
      
      // iOS: feedback visual
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error refreshing data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Gestão de Dados</h1>
      </div>

      <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch">
        {/* Aviso de Desenvolvimento - iOS Otimizado */}
        {showWarning && !devWarningLoading && (
          <div className="p-4 pb-0">
            <DevelopmentWarning 
              title={title}
              message={message}
              className="mb-4"
            />
          </div>
        )}
        
        {/* Importação e Exportação */}
        <div className="p-4 space-y-4">
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Database className="h-5 w-5 text-primary" />
                Gestão de Dados
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Exporte seus dados de orçamentos ou importe novos dados usando um arquivo CSV
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Export */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Exportar Dados
                </h3>
                <p className="text-sm text-muted-foreground">
                  Baixe um arquivo CSV com todos os seus orçamentos.
                </p>
                <Button 
                  onClick={fetchAndExportBudgets}
                  disabled={isProcessing || loading || stats.totalBudgets === 0}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4" />
                  )}
                  {isProcessing ? 'Processando...' : 'Exportar Orçamentos'}
                </Button>
              </div>

              {/* Import */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" />
                  Importar Dados
                </h3>
                <p className="text-sm text-muted-foreground">
                  Faça o upload de um arquivo CSV para adicionar novos orçamentos.
                </p>
                <Button 
                  variant="outline"
                  className="w-full"
                  size="lg"
                  asChild
                  disabled={isProcessing}
                >
                  <label htmlFor="import-file-lite" className={isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}>
                    {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isProcessing ? 'Processando...' : 'Selecionar Arquivo'}
                    <input 
                      type="file" 
                      id="import-file-lite" 
                      className="hidden" 
                      accept=".csv" 
                      onChange={handleFileSelect} 
                      disabled={isProcessing}
                    />
                  </label>
                </Button>
                <Button 
                  onClick={downloadImportTemplate}
                  variant="outline"
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isProcessing ? 'Processando...' : 'Baixar Modelo'}
                 </Button>
               </div>

               {/* Suporte WhatsApp */}
               <div className="pt-4 border-t">
                 <h3 className="font-medium text-foreground flex items-center gap-2 mb-3">
                   <MessageCircle className="h-4 w-4 text-green-600" />
                   Suporte
                 </h3>
                 <Button 
                   onClick={() => window.open('https://wa.me/556496028022', '_blank')}
                   variant="outline"
                   className="w-full border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-950"
                   size="lg"
                 >
                   <MessageCircle className="mr-2 h-4 w-4" />
                   Suporte WhatsApp
                 </Button>
               </div>
             </CardContent>
           </Card>

          {/* Lixeira de Orçamentos */}
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground">
                <Trash2 className="h-5 w-5 text-primary" />
                Lixeira de Orçamentos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gerencie os orçamentos excluídos. Os orçamentos ficam na lixeira por 90 dias antes da exclusão automática.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    inputMode="search"
                    placeholder="Buscar por dispositivo, cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value="Celular">Celular</SelectItem>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Notebook">Notebook</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value="all">
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="all">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {filteredBudgets.length} item(s) na lixeira
              </div>

              {/* Empty Trash Button */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleEmptyTrash}
                  disabled={loading || stats.deletedBudgets === 0}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Esvaziar Lixeira
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RotateCcw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              {/* Deleted Items List - iOS Optimizado */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto -webkit-overflow-scrolling-touch">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse border border-border rounded-lg p-3 bg-card">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredBudgets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">
                      {deletedBudgets.length === 0 
                        ? 'Nenhum orçamento na lixeira' 
                        : 'Nenhum orçamento encontrado com os filtros aplicados'
                      }
                    </p>
                    {deletedBudgets.length > 0 && filteredBudgets.length === 0 && (
                      <p className="text-xs mt-2 opacity-75">
                        Total na lixeira: {deletedBudgets.length} item(s)
                      </p>
                    )}
                  </div>
                ) : (
                  filteredBudgets.map((budget) => (
                    <div key={budget.id} className="border border-border rounded-lg p-4 space-y-3 bg-card">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {budget.device_model || 'Modelo não informado'}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {budget.device_type || 'Tipo não informado'}
                            </p>
                            {budget.client_name && (
                              <p className="text-xs text-muted-foreground">
                                Cliente: {budget.client_name}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-sm font-medium text-success">
                              R$ {Number(budget.cash_price / 100 || 0).toLocaleString('pt-BR', { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2 
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>
                            Excluído: {budget.deleted_at ? new Date(budget.deleted_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                          </span>
                          <span className="font-medium">
                            {budget.deleted_at 
                              ? Math.max(0, 90 - Math.floor((Date.now() - new Date(budget.deleted_at).getTime()) / (1000 * 60 * 60 * 24))) 
                              : 90
                            } dias restantes
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRestore(budget)}
                          className="flex-1 min-h-[44px] touch-manipulation"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Restaurar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handlePermanentDelete(budget)}
                          className="flex-1 min-h-[44px] touch-manipulation"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};