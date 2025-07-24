import { useState, useCallback } from 'react';
import { ImportSummary } from '@/utils/csv/validationTypes';
import { UnifiedCsvParser } from '@/utils/csv/unifiedParser';
import { useToast } from '@/hooks/useToast';
import { toast } from 'sonner';

/**
 * ✅ HOOK ESPECIALIZADO PARA PREVIEW DE IMPORTAÇÃO
 * 
 * Funcionalidades:
 * - Preview inteligente dos dados antes da importação
 * - Validação em tempo real
 * - Feedback detalhado sobre problemas
 * - Correção de dados durante o preview
 */
export const useImportPreview = () => {
  const { showError, showWarning, showSuccess } = useToast();
  const [previewData, setPreviewData] = useState<ImportSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * 🔍 GERAR PREVIEW COM VALIDAÇÃO AVANÇADA
   */
  const generatePreview = useCallback(async (file: File, userId: string) => {
    setIsProcessing(true);
    const toastId = toast.loading('Analisando arquivo...');

    try {
      const text = await file.text();
      const parser = new UnifiedCsvParser();
      
      const summary = parser.parseAndValidate(text, userId);
      
      // ✅ ANÁLISE INTELIGENTE DOS RESULTADOS
      if (summary.validRows === 0) {
        toast.dismiss(toastId);
        showError({
          title: 'Nenhum Dado Válido',
          description: 'Não foi possível processar nenhum orçamento válido do arquivo.'
        });
        setPreviewData(null);
        return;
      }

      // Categorizar problemas
      const criticalErrors = summary.errors.filter(error => 
        error.includes('obrigatório') || error.includes('negativo')
      );
      
      const warnings = summary.errors.filter(error => 
        error.includes('zero') || error.includes('padrão')
      );

      // Feedback contextual
      toast.dismiss(toastId);
      
      if (criticalErrors.length > 0) {
        showWarning({
          title: 'Problemas Encontrados',
          description: `${summary.validRows} registros válidos, ${criticalErrors.length} erros críticos encontrados.`
        });
      } else if (warnings.length > 0) {
        showWarning({
          title: 'Avisos Encontrados',
          description: `${summary.validRows} registros prontos, ${warnings.length} avisos sobre dados.`
        });
      } else {
        showSuccess({
          title: 'Arquivo Válido',
          description: `${summary.validRows} orçamentos prontos para importação.`
        });
      }

      setPreviewData(summary);

    } catch (error: any) {
      toast.dismiss(toastId);
      showError({
        title: 'Erro ao Processar Arquivo',
        description: error.message
      });
      setPreviewData(null);
    } finally {
      setIsProcessing(false);
    }
  }, [showError, showWarning, showSuccess]);

  /**
   * 🧹 LIMPAR PREVIEW
   */
  const clearPreview = useCallback(() => {
    setPreviewData(null);
  }, []);

  /**
   * 📊 ESTATÍSTICAS DO PREVIEW
   */
  const getPreviewStats = useCallback(() => {
    if (!previewData) return null;

    const draftCount = previewData.processedData.filter(item => 
      item.status === 'draft' || item.total_price === 0
    ).length;

    const activeCount = previewData.validRows - draftCount;

    return {
      total: previewData.totalRows,
      valid: previewData.validRows,
      invalid: previewData.invalidRows,
      warnings: previewData.warnings,
      drafts: draftCount,
      active: activeCount,
      hasIssues: previewData.errors.length > 0 || previewData.warnings > 0
    };
  }, [previewData]);

  return {
    previewData,
    isProcessing,
    generatePreview,
    clearPreview,
    getPreviewStats
  };
};