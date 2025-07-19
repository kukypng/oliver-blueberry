import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BudgetLiteSearchiOS } from './BudgetLiteSearchiOS';
import { BudgetLiteCardiOS } from './BudgetLiteCardiOS';
import { BudgetLiteStatusBadge } from './BudgetLiteStatusBadge';
import { useToast } from '@/hooks/use-toast';
import { generateWhatsAppMessage, shareViaWhatsApp } from '@/utils/whatsappUtils';
import { RefreshCw, Filter, Plus } from 'lucide-react';
import { SecureRedirect } from '@/utils/secureRedirect';
interface Budget {
  id: string;
  client_name?: string;
  device_model?: string;
  device_type?: string;
  total_price?: number;
  workflow_status?: string;
  is_paid?: boolean;
  is_delivered?: boolean;
  expires_at?: string;
  approved_at?: string;
  payment_confirmed_at?: string;
  delivery_confirmed_at?: string;
  created_at: string;
  installments?: number;
  cash_price?: number;
  installment_price?: number;
  warranty_months?: number;
  includes_delivery?: boolean;
  includes_screen_protector?: boolean;
  valid_until?: string;
  part_type?: string;
  brand?: string;
  owner_id?: string;
  deleted_at?: string | null;
  delivery_date?: string;
  notes?: string;
}
interface BudgetLiteListiOSProps {
  userId: string;
  profile: any;
}
export const BudgetLiteListiOS = ({
  userId,
  profile
}: BudgetLiteListiOSProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch otimizado para iOS usando supabase simplificado
  const fetchBudgets = useCallback(async (showRefreshing = false) => {
    if (!userId) return;
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const {
        data,
        error: fetchError
      } = await supabase.from('budgets').select('*').eq('owner_id', userId).is('deleted_at', null).order('created_at', {
        ascending: false
      }).limit(100);
      if (fetchError) throw fetchError;
      setBudgets(data || []);
    } catch (err: any) {
      console.error('Error fetching budgets:', err);
      setError('Erro ao carregar orçamentos');
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar os orçamentos.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, toast]);

  // Real-time subscription otimizada para iOS
  useEffect(() => {
    if (!userId) return;
    fetchBudgets();
    
    let subscription: any = null;
    let debounceTimer: NodeJS.Timeout | null = null;
    
    subscription = supabase.channel(`budget_changes_ios_${userId}`).on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'budgets',
      filter: `owner_id=eq.${userId}`
    }, payload => {
      console.log('Budget change detected:', payload);
      
      // Clear previous timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Debounce para evitar múltiplas atualizações
      debounceTimer = setTimeout(() => {
        fetchBudgets();
        debounceTimer = null;
      }, 500);
    }).subscribe();
    
    return () => {
      // Clear debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Remove subscription properly
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [userId, fetchBudgets]);

  // Filtro avançado otimizado para iOS
  const filteredAndSortedBudgets = useMemo(() => {
    let filtered = budgets;

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(budget => budget.client_name?.toLowerCase().includes(searchLower) || budget.device_model?.toLowerCase().includes(searchLower) || budget.device_type?.toLowerCase().includes(searchLower));
    }

    // Filtro por status - apenas se funcionalidades avançadas estão habilitadas
    if (profile?.advanced_features_enabled && filterStatus !== 'all') {
      switch (filterStatus) {
        case 'pending':
          filtered = filtered.filter(b => b.workflow_status === 'pending');
          break;
        case 'approved':
          filtered = filtered.filter(b => b.workflow_status === 'approved');
          break;
        case 'paid':
          filtered = filtered.filter(b => b.is_paid === true);
          break;
        case 'delivered':
          filtered = filtered.filter(b => b.is_delivered === true);
          break;
        case 'completed':
          filtered = filtered.filter(b => b.workflow_status === 'completed');
          break;
        case 'expired':
          filtered = filtered.filter(b => {
            if (!b.expires_at) return false;
            return new Date(b.expires_at) < new Date();
          });
          break;
      }
    }
    return filtered;
  }, [budgets, searchTerm, filterStatus, profile?.advanced_features_enabled]);

  // Pull to refresh para iOS
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    await fetchBudgets(true);
  }, [fetchBudgets, refreshing]);
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // Compartilhamento WhatsApp usando utilitário original
  const handleShareWhatsApp = useCallback(async (budget: Budget) => {
    try {
      // Buscar dados completos do orçamento
      const { data: fullBudget, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budget.id)
        .single();

      if (error) {
        console.error('Erro ao buscar orçamento:', error);
        // Fallback com dados básicos
        const budgetData = {
          id: budget.id,
          device_model: budget.device_model || 'Dispositivo',
          device_type: budget.device_type || 'Smartphone',
          
          part_type: budget.part_type || 'Serviço',
          part_quality: budget.part_type || 'Reparo geral',
          cash_price: budget.cash_price || budget.total_price || 0,
          installment_price: budget.installment_price || 0,
          installments: budget.installments || 1,
          total_price: budget.total_price || 0,
          warranty_months: budget.warranty_months || 3,
          payment_condition: 'Cartão de Crédito',
          includes_delivery: budget.includes_delivery || false,
          includes_screen_protector: budget.includes_screen_protector || false,
          delivery_date: budget.delivery_date,
          notes: budget.notes,
          status: 'pending',
          workflow_status: budget.workflow_status || 'pending',
          created_at: budget.created_at,
          valid_until: budget.valid_until || budget.expires_at || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          expires_at: budget.expires_at
        };
        
        const message = generateWhatsAppMessage(budgetData);
        shareViaWhatsApp(message);
      } else {
        // Usar dados completos do banco
        const message = generateWhatsAppMessage({
          ...fullBudget,
          part_quality: fullBudget.part_quality || fullBudget.part_type || 'Reparo'
        });
        shareViaWhatsApp(message);
      }

      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o WhatsApp."
      });
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Ocorreu um erro ao preparar o compartilhamento.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Geração de PDF simplificada
  const handleViewPDF = useCallback(async (budget: Budget) => {
    try {
      setUpdating(budget.id);

      // Simplified PDF generation using direct URL approach for iOS compatibility
      const pdfData = encodeURIComponent(JSON.stringify({
        id: budget.id,
        device_model: budget.device_model || 'Dispositivo',
        device_type: budget.device_type || 'Celular',
        part_quality: budget.part_type || 'Reparo',
        cash_price: budget.cash_price || budget.total_price || 0,
        client_name: budget.client_name,
        created_at: budget.created_at
      }));

      // Use a simpler approach that works on iOS
      const safeUrl = SecureRedirect.getSafeRedirectUrl(`/print-budget?data=${pdfData}`);
      window.open(safeUrl, '_blank');

      toast({
        title: "PDF gerado!",
        description: "O PDF foi aberto em uma nova aba."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  }, [toast]);

  // Exclusão (move para lixeira)
  const handleDelete = useCallback(async (budgetId: string) => {
    try {
      setUpdating(budgetId);
      
      // Usar a função RPC segura para exclusão
      const { data, error } = await supabase.rpc('soft_delete_budget_with_audit', {
        p_budget_id: budgetId,
        p_deletion_reason: 'Exclusão via interface mobile'
      });
      
      if (error) throw error;
      
      const response = data as any;
      if (!response?.success) {
        throw new Error(response?.error || 'Falha na exclusão do orçamento');
      }
      
      toast({
        title: "Orçamento removido",
        description: "O orçamento foi movido para a lixeira."
      });

      // Atualização local otimista
      setBudgets(prev => prev.filter(b => b.id !== budgetId));
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast({
        title: "Erro ao remover",
        description: error instanceof Error ? error.message : "Não foi possível remover o orçamento.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  }, [toast]);

  // Callback para atualização de orçamento
  const handleBudgetUpdate = useCallback((budgetId: string, updates: Partial<Budget>) => {
    setBudgets(prev => prev.map(budget => budget.id === budgetId ? {
      ...budget,
      ...updates
    } : budget));

    // Acionar refresh automaticamente após update
    setTimeout(() => {
      fetchBudgets(true);
    }, 500);
  }, [fetchBudgets]);

  // Estados de loading e erro
  if (loading) {
    return <div className="min-h-[100dvh] bg-background text-foreground">
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-6 bg-muted rounded w-1/3"></div>
              </div>
            </div>)}
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-[100dvh] bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-destructive text-6xl">⚠️</div>
          <p className="text-destructive text-lg">{error}</p>
          <button onClick={handleRefresh} className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg font-medium transition-colors w-full" style={{
          touchAction: 'manipulation'
        }}>
            Tentar Novamente
          </button>
        </div>
      </div>;
  }
  return <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Header Contextual Otimizado */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-3" style={{ paddingTop: 'env(safe-area-inset-top, 8px)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">Orçamentos</h1>
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedBudgets.length} {filteredAndSortedBudgets.length === 1 ? 'item' : 'itens'}
                {searchTerm && ` • "${searchTerm}"`}
              </p>
            </div>
            <button 
              onClick={handleRefresh} 
              disabled={refreshing} 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 hover:bg-muted transition-colors disabled:opacity-50" 
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <RefreshCw className={`h-5 w-5 text-foreground ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <BudgetLiteSearchiOS 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
            onClearSearch={handleClearSearch} 
          />
        </div>
      </div>

      {/* Pull to refresh indicator */}
      {refreshing && <div className="bg-primary/20 text-primary text-center py-2 text-sm">
          Atualizando...
        </div>}

      {/* Content com scroll otimizado para iOS */}
      <div 
        className="overflow-auto" 
        style={{
          WebkitOverflowScrolling: 'touch',
          height: 'calc(100dvh - 140px)',
          overscrollBehavior: 'none',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }} 
        onTouchStart={e => {
          // Detect pull to refresh gesture
          if (e.currentTarget.scrollTop === 0) {
            e.currentTarget.dataset.pullStart = e.touches[0].clientY.toString();
          }
        }} 
        onTouchMove={e => {
          const pullStart = e.currentTarget.dataset.pullStart;
          if (pullStart && e.currentTarget.scrollTop === 0) {
            const pullDistance = e.touches[0].clientY - parseInt(pullStart);
            if (pullDistance > 120 && !refreshing) {
              handleRefresh();
            }
          }
        }}
      >
        <div className="px-4 py-3">

          {/* Empty state otimizado */}
          {filteredAndSortedBudgets.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-6">📋</div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || filterStatus !== 'all' ? 'Nenhum resultado' : 'Nenhum orçamento'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Tente ajustar sua busca ou filtros' 
                  : 'Comece criando seu primeiro orçamento'
                }
              </p>
              {(searchTerm || filterStatus !== 'all') && (
                <div className="flex gap-3 justify-center">
                  {searchTerm && (
                    <button 
                      onClick={handleClearSearch} 
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium" 
                      style={{ touchAction: 'manipulation' }}
                    >
                      Limpar busca
                    </button>
                  )}
                  {filterStatus !== 'all' && (
                    <button 
                      onClick={() => setFilterStatus('all')} 
                      className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium" 
                      style={{ touchAction: 'manipulation' }}
                    >
                      Remover filtros
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Lista de orçamentos com performance otimizada */
            <div className="space-y-3">
              {filteredAndSortedBudgets.map((budget, index) => (
                <div 
                  key={budget.id} 
                  className={`transition-opacity duration-200 ${updating === budget.id ? 'opacity-50' : 'opacity-100'}`}
                  style={{
                    transform: 'translateZ(0)', // Force GPU acceleration
                    animationDelay: `${Math.min(index * 50, 300)}ms`,
                    willChange: 'transform'
                  }}
                >
                  <BudgetLiteCardiOS 
                    budget={budget} 
                    profile={profile} 
                    onShareWhatsApp={handleShareWhatsApp} 
                    onDelete={handleDelete} 
                    onBudgetUpdate={updates => handleBudgetUpdate(budget.id, updates)} 
                  />
                </div>
              ))}
              
              {/* Spacing para iOS safe area */}
              <div className="h-6"></div>
            </div>
          )}
        </div>
      </div>
    </div>;
};