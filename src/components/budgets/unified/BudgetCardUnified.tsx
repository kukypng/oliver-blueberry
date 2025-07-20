import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, FileText, Edit, Trash2, Clock } from 'lucide-react';
import { useLayout } from '@/contexts/LayoutContext';
import { cn } from '@/lib/utils';
import { BudgetStatusBadge } from '../BudgetStatusBadge';
import { BudgetWorkflowActions } from '../BudgetWorkflowActions';
import { BudgetEditFormIOS } from '../../lite/BudgetEditFormIOS';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAdvancedBudgets } from '@/hooks/useAdvancedBudgets';
import { useIOSFeedback } from '../../lite/IOSFeedback';

interface BudgetCardUnifiedProps {
  budget: any;
  profile: any;
  isGenerating?: boolean;
  isSelected?: boolean;
  onSelect?: (budgetId: string, isSelected: boolean) => void;
  onShareWhatsApp: (budget: any) => void;
  onViewPDF: (budget: any) => void;
  onEdit?: (budget: any) => void;
  onDelete: (budgetId: string) => void;
  onBudgetUpdate?: (budgetId: string, updates: any) => void;
  variant?: 'desktop' | 'mobile';
}

export const BudgetCardUnified = React.memo(({
  budget,
  profile,
  isGenerating = false,
  isSelected = false,
  onSelect,
  onShareWhatsApp,
  onViewPDF,
  onEdit,
  onDelete,
  onBudgetUpdate,
  variant
}: BudgetCardUnifiedProps) => {
  const { isMobile } = useLayout();
  const { isAdvancedMode } = useAdvancedBudgets();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const {
    hapticFeedback,
    showSuccessAction,
    showErrorAction
  } = useIOSFeedback();

  const actualVariant = variant || (isMobile ? 'mobile' : 'desktop');

  // Verificação de segurança
  if (!budget || !budget.id || budget.deleted_at) {
    return null;
  }

  const isBudgetOld = (createdAt: string, warningDays: number | undefined | null): boolean => {
    if (!createdAt || !warningDays) return false;
    const now = new Date();
    const budgetDate = new Date(createdAt);
    const diffTime = now.getTime() - budgetDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > warningDays;
  };

  const formatPrice = (price: number) => {
    return (price / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleEdit = () => {
    if (actualVariant === 'mobile') {
      setIsEditModalOpen(true);
    } else if (onEdit) {
      onEdit(budget);
    }
    hapticFeedback?.('light');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    hapticFeedback?.('heavy');
    try {
      await onDelete(budget.id);
      showSuccessAction?.('Orçamento excluído');
    } catch (error) {
      showErrorAction?.('Erro ao excluir orçamento');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShareWhatsApp = () => {
    hapticFeedback?.('light');
    onShareWhatsApp(budget);
  };

  const handleViewPDF = () => {
    hapticFeedback?.('light');
    onViewPDF(budget);
  };

  return (
    <>
      <Card className={cn(
        "glass-card border-0 shadow-sm bg-card/50 backdrop-blur-sm transition-all duration-200",
        actualVariant === 'mobile' ? "active:scale-[0.98]" : "hover:shadow-md",
        isSelected && "ring-2 ring-primary/20",
        budget.deleted_at && "opacity-50 pointer-events-none"
      )}>
        <CardContent className={cn(
          "space-y-3",
          actualVariant === 'mobile' ? "p-4" : "p-4"
        )}>
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate">
                {budget.device_model || 'Dispositivo não informado'}
              </h3>
              <Badge variant="outline" className="text-xs mt-1">
                {budget.device_type || 'Tipo não informado'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {budget.created_at ? new Date(budget.created_at).toLocaleDateString('pt-BR') : ''}
              </span>
              {profile?.budget_warning_enabled && budget.created_at && isBudgetOld(budget.created_at, profile.budget_warning_days) && (
                <Clock className="h-3 w-3 text-destructive" />
              )}
            </div>
          </div>

          {/* Cliente */}
          {budget.client_name && (
            <p className="text-sm text-primary/80 font-medium">
              Cliente: {budget.client_name}
            </p>
          )}

          {/* Status - Apenas em modo avançado */}
          {isAdvancedMode && (
            <BudgetStatusBadge 
              status={budget.workflow_status || 'pending'}
              isPaid={budget.is_paid || false}
              isDelivered={budget.is_delivered || false}
              expiresAt={budget.expires_at}
            />
          )}

          {/* Serviço */}
          <div>
            <p className="text-xs text-muted-foreground font-medium">Serviço:</p>
            <p className="text-sm line-clamp-2">{budget.issue || 'Problema não informado'}</p>
          </div>

          <Separator className="my-2" />

          {/* Preço */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-lg text-foreground">
                {formatPrice(budget.total_price || 0)}
              </p>
              {budget.installments > 1 && (
                <p className="text-xs text-muted-foreground">{budget.installments}x</p>
              )}
            </div>
          </div>

          {/* Workflow Actions - Apenas em modo avançado */}
          {isAdvancedMode && (
            <>
              <Separator className="my-2" />
              <BudgetWorkflowActions 
                budget={{
                  id: budget.id,
                  workflow_status: budget.workflow_status || 'pending',
                  is_paid: budget.is_paid || false,
                  is_delivered: budget.is_delivered || false,
                  expires_at: budget.expires_at,
                  approved_at: budget.approved_at,
                  payment_confirmed_at: budget.payment_confirmed_at,
                  delivery_confirmed_at: budget.delivery_confirmed_at,
                }}
              />
            </>
          )}

          <Separator className="my-2" />

          {/* Ações */}
          <div className={cn(
            "flex gap-2",
            actualVariant === 'mobile' ? "grid grid-cols-2" : "flex-wrap justify-center"
          )}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className={actualVariant === 'mobile' ? 'text-xs' : 'hidden sm:inline'}>
                WhatsApp
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleViewPDF}
              disabled={isGenerating}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors disabled:opacity-50"
            >
              <FileText className="h-4 w-4" />
              <span className={actualVariant === 'mobile' ? 'text-xs' : 'hidden sm:inline'}>
                PDF
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleEdit}
              className="flex items-center gap-2 hover:bg-muted/20 hover:text-[#fec832] transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span className={actualVariant === 'mobile' ? 'text-xs' : 'hidden sm:inline'}>
                Editar
              </span>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={isDeleting}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className={actualVariant === 'mobile' ? 'text-xs' : 'hidden sm:inline'}>
                    Excluir
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir este orçamento? Esta ação pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição para Mobile */}
      {actualVariant === 'mobile' && (
        <BudgetEditFormIOS
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          budget={budget}
          onBudgetUpdate={(updatedBudget) => {
            onBudgetUpdate?.(budget.id, updatedBudget);
            setIsEditModalOpen(false);
            showSuccessAction?.('Orçamento atualizado');
          }}
        />
      )}
    </>
  );
});

BudgetCardUnified.displayName = 'BudgetCardUnified';