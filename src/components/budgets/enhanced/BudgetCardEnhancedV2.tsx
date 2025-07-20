import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Share, FileText, Trash2, Eye, Clock, DollarSign, Edit, Calendar } from 'lucide-react';
import { BudgetCardMobileSimplified } from './BudgetCardMobileSimplified';
import { useMobileDetection } from '../../../hooks/useMobileDetection';
import { DeleteConfirmDialog } from '../../ui/DeleteConfirmDialog';
import { useToast } from '../../../hooks/use-toast';
import { BudgetEditDialog } from './BudgetEditDialog';
import { StatusProgressBar } from './StatusProgressBar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Budget } from '../../../types/budget';

interface BudgetCardEnhancedV2Props {
  budget: Budget;
  profile: any;
  isUpdating: boolean;
  onShareWhatsApp: (budget: Budget) => void;
  onViewPDF: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
  onBudgetUpdate: (budgetId: string, updates: Partial<Budget>) => void;
  index?: number;
}

export const BudgetCardEnhancedV2: React.FC<BudgetCardEnhancedV2Props> = ({
  budget,
  profile,
  isUpdating,
  onShareWhatsApp,
  onViewPDF,
  onDelete,
  onBudgetUpdate,
  index = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { isMobile } = useMobileDetection();
  const { toast } = useToast();

  const handleAction = async (action: string, callback: () => void) => {
    setActionLoading(action);
    try {
      await callback();
    } finally {
      setActionLoading(null);
    }
  };

  const handlePDFAction = async () => {
    if (isMobile && navigator.share) {
      // Para dispositivos móveis, usar compartilhamento nativo
      try {
        setActionLoading('pdf');
        
        // Gerar PDF
        const budgetData = {
          id: budget.id,
          device_model: budget.device_model || 'Dispositivo',
          device_type: budget.device_type || 'Celular',
          part_quality: budget.part_type || 'Reparo',
          cash_price: budget.cash_price || budget.total_price || 0,
          installment_price: budget.installment_price || 0,
          installments: budget.installments || 1,
          warranty_months: budget.warranty_months || 3,
          created_at: budget.created_at,
          valid_until: budget.valid_until || budget.expires_at || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          client_name: budget.client_name || '',
          client_phone: budget.client_phone || '',
          shop_name: 'Minha Loja',
          shop_address: 'Endereço da Loja',
          shop_phone: '(11) 99999-9999'
        };

        const { generateBudgetPDF } = await import('@/utils/pdfGenerator');
        const pdfBlob = await generateBudgetPDF(budgetData);
        
        const file = new File([pdfBlob], `orcamento-${budget.id}.pdf`, { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Orçamento - ${budget.device_model}`,
            text: `Orçamento para ${budget.device_model}`,
            files: [file]
          });
        } else {
          // Fallback para download
          onViewPDF(budget);
        }
      } catch (error) {
        console.error('Erro ao compartilhar PDF:', error);
        onViewPDF(budget);
      } finally {
        setActionLoading(null);
      }
    } else {
      // Para desktop, usar método padrão
      handleAction('pdf', () => onViewPDF(budget));
    }
  };

  const formatCurrency = (value: number) => {
    // Converter de centavos para reais
    const valueInReais = value / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valueInReais);
  };

  const formatInstallmentPrice = (value: number) => {
    // Para valores de parcela que podem estar em formato inconsistente
    // Se o valor for muito alto (acima de 10000), dividir por 1000 adicional
    let adjustedValue = value / 100;
    if (adjustedValue > 10000) {
      adjustedValue = adjustedValue / 100; // Dividir mais uma vez se estiver muito alto
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(adjustedValue);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setActionLoading('delete');
    try {
      await onDelete(budget.id);
      setShowDeleteDialog(false);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div 
      className="transition-all duration-300"
      style={{
        animationDelay: `${Math.min(index * 50, 300)}ms`,
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      {/* Card principal - versão simplificada para móvel */}
      <div className="relative">
        <BudgetCardMobileSimplified
          budget={budget}
          isUpdating={isUpdating}
        />

        {/* Botão de expansão melhorado para móvel */}
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <span>{isExpanded ? 'Menos detalhes' : 'Mais detalhes'}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Painel expandido */}
      {isExpanded && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm animate-fade-in">
          {/* Informações detalhadas */}
          <div className="p-4 space-y-3">
            {/* Detalhes do serviço */}
            {budget.notes && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Observações
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                  {budget.notes}
                </p>
              </div>
            )}

            {/* Detalhes financeiros */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Detalhes Financeiros
              </h4>
              <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço total:</span>
                  <span className="font-medium">{formatCurrency(budget.total_price || 0)}</span>
                </div>
                {budget.cash_price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">À vista:</span>
                    <span className="font-medium text-green-600">{formatCurrency(budget.cash_price)}</span>
                  </div>
                )}
                {budget.installments && budget.installments > 1 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Parcelado:</span>
                    <span className="font-medium">{budget.installments}x {formatInstallmentPrice(budget.installment_price || 0)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar do Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Progresso do Orçamento
              </h4>
              <StatusProgressBar budget={budget} />
            </div>

            {/* Status do Orçamento */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Controles de Status
              </h4>
              
              {/* Checkboxes de Status */}
              <div className="bg-muted/30 p-3 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" onClick={(e) => e.preventDefault()}>
                    <input
                      type="checkbox"
                      checked={!!budget.approved_at}
                      onChange={async (e) => {
                        setActionLoading('approved');
                        try {
                          await onBudgetUpdate(budget.id, {
                            approved_at: e.target.checked ? new Date().toISOString() : null
                          });
                          toast({
                            description: e.target.checked ? "Orçamento aprovado!" : "Aprovação removida",
                          });
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            description: "Erro ao atualizar status",
                          });
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                      disabled={actionLoading === 'approved'}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-foreground">Aprovado</span>
                    {actionLoading === 'approved' && (
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin ml-1" />
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    {budget.approved_at && (
                      <span className="text-xs text-muted-foreground">{formatDate(budget.approved_at)}</span>
                    )}
                    {budget.approved_at && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Calendar className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={budget.approved_at ? new Date(budget.approved_at) : undefined}
                            onSelect={async (date) => {
                              if (date) {
                                setActionLoading('approved');
                                try {
                                  await onBudgetUpdate(budget.id, {
                                    approved_at: date.toISOString()
                                  });
                                  toast({
                                    description: "Data de aprovação atualizada!",
                                  });
                                } catch (error) {
                                  toast({
                                    variant: "destructive",
                                    description: "Erro ao atualizar data",
                                  });
                                } finally {
                                  setActionLoading(null);
                                }
                              }
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" onClick={(e) => e.preventDefault()}>
                    <input
                      type="checkbox"
                      checked={!!budget.payment_confirmed_at}
                      onChange={async (e) => {
                        setActionLoading('payment');
                        try {
                          await onBudgetUpdate(budget.id, {
                            payment_confirmed_at: e.target.checked ? new Date().toISOString() : null,
                            is_paid: e.target.checked
                          });
                          toast({
                            description: e.target.checked ? "Pagamento confirmado!" : "Confirmação de pagamento removida",
                          });
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            description: "Erro ao atualizar status",
                          });
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                      disabled={actionLoading === 'payment'}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-foreground">Pago</span>
                    {actionLoading === 'payment' && (
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin ml-1" />
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    {budget.payment_confirmed_at && (
                      <span className="text-xs text-muted-foreground">{formatDate(budget.payment_confirmed_at)}</span>
                    )}
                    {budget.payment_confirmed_at && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Calendar className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={budget.payment_confirmed_at ? new Date(budget.payment_confirmed_at) : undefined}
                            onSelect={async (date) => {
                              if (date) {
                                setActionLoading('payment');
                                try {
                                  await onBudgetUpdate(budget.id, {
                                    payment_confirmed_at: date.toISOString()
                                  });
                                  toast({
                                    description: "Data de pagamento atualizada!",
                                  });
                                } catch (error) {
                                  toast({
                                    variant: "destructive",
                                    description: "Erro ao atualizar data",
                                  });
                                } finally {
                                  setActionLoading(null);
                                }
                              }
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" onClick={(e) => e.preventDefault()}>
                    <input
                      type="checkbox"
                      checked={!!budget.delivery_confirmed_at}
                      onChange={async (e) => {
                        setActionLoading('delivery');
                        try {
                          await onBudgetUpdate(budget.id, {
                            delivery_confirmed_at: e.target.checked ? new Date().toISOString() : null,
                            is_delivered: e.target.checked
                          });
                          toast({
                            description: e.target.checked ? "Entrega confirmada!" : "Confirmação de entrega removida",
                          });
                        } catch (error) {
                          toast({
                            variant: "destructive",
                            description: "Erro ao atualizar status",
                          });
                        } finally {
                          setActionLoading(null);
                        }
                      }}
                      disabled={actionLoading === 'delivery'}
                      className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-foreground">Entregue</span>
                    {actionLoading === 'delivery' && (
                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin ml-1" />
                    )}
                  </label>
                  <div className="flex items-center gap-2">
                    {budget.delivery_confirmed_at && (
                      <span className="text-xs text-muted-foreground">{formatDate(budget.delivery_confirmed_at)}</span>
                    )}
                    {budget.delivery_confirmed_at && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Calendar className="h-3 w-3" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <CalendarComponent
                            mode="single"
                            selected={budget.delivery_confirmed_at ? new Date(budget.delivery_confirmed_at) : undefined}
                            onSelect={async (date) => {
                              if (date) {
                                setActionLoading('delivery');
                                try {
                                  await onBudgetUpdate(budget.id, {
                                    delivery_confirmed_at: date.toISOString()
                                  });
                                  toast({
                                    description: "Data de entrega atualizada!",
                                  });
                                } catch (error) {
                                  toast({
                                    variant: "destructive",
                                    description: "Erro ao atualizar data",
                                  });
                                } finally {
                                  setActionLoading(null);
                                }
                              }
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    setActionLoading('complete');
                    try {
                      await onBudgetUpdate(budget.id, { 
                        status: 'completed',
                        workflow_status: 'completed'
                      });
                      toast({
                        description: "Orçamento concluído!",
                      });
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        description: "Erro ao concluir orçamento",
                      });
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  disabled={actionLoading === 'complete'}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-950 dark:hover:bg-green-900 dark:text-green-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ touchAction: 'manipulation' }}
                >
                  {actionLoading === 'complete' ? (
                    <div className="w-4 h-4 border-2 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Concluir</span>
                  )}
                </button>
                
                <button
                  onClick={() => setShowEditDialog(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                  style={{ touchAction: 'manipulation' }}
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Ações rápidas */}
          <div className="border-t border-border bg-muted/20 p-4">
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleAction('share', () => onShareWhatsApp(budget))}
                disabled={actionLoading === 'share'}
                className="flex flex-col items-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-400 rounded-xl transition-colors disabled:opacity-50"
                style={{ touchAction: 'manipulation' }}
              >
                {actionLoading === 'share' ? (
                  <div className="w-5 h-5 border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Share className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">Copiar & Enviar</span>
              </button>

              <button
                onClick={handlePDFAction}
                disabled={actionLoading === 'pdf'}
                className="flex flex-col items-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 text-sky-600 dark:bg-sky-950 dark:hover:bg-sky-900 dark:text-sky-400 rounded-xl transition-colors disabled:opacity-50"
                style={{ touchAction: 'manipulation' }}
              >
                {actionLoading === 'pdf' ? (
                  <div className="w-5 h-5 border-2 border-sky-600 dark:border-sky-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">{isMobile ? 'Compartilhar PDF' : 'PDF'}</span>
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={actionLoading === 'delete'}
                className="flex flex-col items-center gap-2 p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-400 rounded-xl transition-colors disabled:opacity-50"
                style={{ touchAction: 'manipulation' }}
              >
                {actionLoading === 'delete' ? (
                  <div className="w-5 h-5 border-2 border-rose-600 dark:border-rose-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
                <span className="text-xs font-medium">Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        itemName={`o orçamento de ${budget.client_name || 'cliente'}`}
        isLoading={actionLoading === 'delete'}
      />

      {/* Dialog de edição */}
      <BudgetEditDialog
        budget={budget}
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onBudgetUpdate={(updates) => onBudgetUpdate(budget.id, updates)}
      />
    </div>
  );
};