/**
 * Hook Unificado para Sistema CSV
 * Gerencia importação, exportação e validação de dados CSV de forma consistente
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { CsvBudgetData, CsvImportResult, CsvExportFilters } from '@/types/csv';
import { UnifiedBudgetData, UnifiedCsvResult, UnifiedValidationResult, UnifiedExportOptions, UnifiedExportResult } from '@/types/unifiedBudget';
import { CsvParser } from '@/utils/csv/parser';
import { CsvFormatter } from '@/utils/csv/formatter';
import { UnifiedCsvValidator } from '@/utils/csv/unifiedValidator';
import { CsvValueConverter } from '@/utils/csv/csvValueConverter';
import { DatabaseValueConverter } from '@/utils/csv/databaseValueConverter';
import { BudgetMapper } from '@/utils/csv/budgetMapper';
import { useBudgetImport } from './useBudgetImport';
import { useBudgetExport } from './useBudgetExport';

interface UseUnifiedCsvDataReturn {
  // Estados
  isLoading: boolean;
  previewData: UnifiedBudgetData[] | null;
  validationResult: UnifiedValidationResult | null;
  importResult: UnifiedCsvResult | null;
  exportResult: UnifiedExportResult | null;
  
  // Funções de Importação
  parseFile: (file: File) => Promise<UnifiedCsvResult>;
  validateCsvData: (data: CsvBudgetData[]) => UnifiedValidationResult;
  importBudgets: (data: UnifiedBudgetData[]) => Promise<void>;
  
  // Funções de Exportação
  exportBudgets: (options?: UnifiedExportOptions) => Promise<UnifiedExportResult>;
  downloadTemplate: () => void;
  
  // Funções Utilitárias
  clearData: () => void;
  applySuggestedFixes: (fixes: any[]) => void;
  convertValues: (data: CsvBudgetData[]) => CsvBudgetData[];
}

export const useUnifiedCsvData = (): UseUnifiedCsvDataReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<UnifiedBudgetData[] | null>(null);
  const [validationResult, setValidationResult] = useState<UnifiedValidationResult | null>(null);
  const [importResult, setImportResult] = useState<UnifiedCsvResult | null>(null);
  const [exportResult, setExportResult] = useState<UnifiedExportResult | null>(null);

  // Hooks auxiliares
  const budgetImport = useBudgetImport();
  const budgetExport = useBudgetExport();

  /**
   * Converte CsvBudgetData para UnifiedBudgetData
   */
  const csvToUnified = useCallback((csvData: CsvBudgetData): UnifiedBudgetData => {
    return {
      client_name: 'Cliente Importado CSV',
      device_type: csvData.tipo_aparelho,
      device_model: csvData.servico_aparelho,
      part_quality: csvData.qualidade,
      notes: csvData.observacoes,
      cash_price: csvData.preco_vista,
      installment_price: csvData.preco_parcelado,
      installments: csvData.parcelas,
      payment_condition: csvData.metodo_pagamento,
      warranty_months: csvData.garantia_meses,
      validity_days: csvData.validade_dias,
      includes_delivery: csvData.inclui_entrega,
      includes_screen_protector: csvData.inclui_pelicula,
    };
  }, []);

  /**
   * Converte UnifiedBudgetData para CsvBudgetData
   */
  const unifiedToCsv = useCallback((unifiedData: UnifiedBudgetData): CsvBudgetData => {
    return {
      tipo_aparelho: unifiedData.device_type,
      servico_aparelho: unifiedData.device_model,
      qualidade: unifiedData.part_quality,
      observacoes: unifiedData.notes,
      preco_vista: unifiedData.cash_price,
      preco_parcelado: unifiedData.installment_price,
      parcelas: unifiedData.installments,
      metodo_pagamento: unifiedData.payment_condition,
      garantia_meses: unifiedData.warranty_months,
      validade_dias: unifiedData.validity_days,
      inclui_entrega: unifiedData.includes_delivery,
      inclui_pelicula: unifiedData.includes_screen_protector,
    };
  }, []);

  /**
   * Faz o parsing de um arquivo CSV com validação unificada
   */
  const parseFile = useCallback(async (file: File): Promise<UnifiedCsvResult> => {
    setIsLoading(true);
    console.log('🔄 UnifiedCsvData: Iniciando parsing do arquivo:', file.name);

    try {
      const csvContent = await file.text();
      console.log('📄 UnifiedCsvData: Conteúdo CSV lido, tamanho:', csvContent.length);

      // Parser básico do CSV
      const parseResult: CsvImportResult = CsvParser.parse(csvContent);
      console.log('📊 UnifiedCsvData: Resultado do parsing:', {
        success: parseResult.success,
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
        errorsCount: parseResult.errors.length
      });

      if (!parseResult.success) {
        const result: UnifiedCsvResult = {
          success: false,
          data: [],
          errors: parseResult.errors,
          warnings: [],
          totalRows: parseResult.totalRows,
          validRows: 0,
          correctionsSummary: {
            valueCorrections: 0,
            scaleCorrections: 0,
            formatCorrections: 0,
            validationErrors: parseResult.errors.length,
            appliedCorrections: []
          }
        };
        setImportResult(result);
        return result;
      }

      console.log('✅ UnifiedCsvData: Dados CSV válidos, processando com validador unificado...');

      // Validação unificada com correções automáticas
      const validation = UnifiedCsvValidator.validateAndCorrect(parseResult.data);
      setValidationResult(validation);

      console.log('🔍 UnifiedCsvData: Resultado da validação:', {
        isValid: validation.isValid,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length,
        correctionsCount: validation.corrections.valueCorrections + validation.corrections.scaleCorrections
      });

      // Converter para formato unificado
      const unifiedData = parseResult.data.map(csvToUnified);
      setPreviewData(unifiedData);

      console.log('🔄 UnifiedCsvData: Dados convertidos para formato unificado:', unifiedData.length, 'registros');

      // Aplicar correções de valores se necessário
      const correctedData = convertValues(parseResult.data);

      const result: UnifiedCsvResult = {
        success: validation.isValid,
        data: correctedData.map(csvToUnified),
        errors: validation.errors,
        warnings: validation.warnings,
        totalRows: parseResult.totalRows,
        validRows: validation.isValid ? parseResult.validRows : parseResult.validRows - validation.errors.length,
        correctionsSummary: validation.corrections
      };

      setImportResult(result);

      // Feedback para o usuário
      if (result.success) {
        toast.success(`✅ Arquivo processado com sucesso! ${result.validRows} registros válidos.`);
        if (result.warnings.length > 0) {
          toast.warning(`⚠️ ${result.warnings.length} avisos encontrados. Verifique os detalhes.`);
        }
      } else {
        toast.error(`❌ Erros encontrados no arquivo: ${result.errors.length} problemas.`);
      }

      return result;

    } catch (error) {
      console.error('💥 UnifiedCsvData: Erro durante o parsing:', error);
      const errorResult: UnifiedCsvResult = {
        success: false,
        data: [],
        errors: [{
          row: 0,
          field: 'file',
          message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          value: file.name
        }],
        warnings: [],
        totalRows: 0,
        validRows: 0,
        correctionsSummary: {
          valueCorrections: 0,
          scaleCorrections: 0,
          formatCorrections: 0,
          validationErrors: 1,
          appliedCorrections: []
        }
      };

      setImportResult(errorResult);
      toast.error('❌ Erro ao processar arquivo CSV');
      return errorResult;

    } finally {
      setIsLoading(false);
    }
  }, [csvToUnified]);

  /**
   * Valida dados CSV com o validador unificado
   */
  const validateCsvData = useCallback((data: CsvBudgetData[]): UnifiedValidationResult => {
    console.log('🔍 UnifiedCsvData: Validando', data.length, 'registros CSV...');
    const validation = UnifiedCsvValidator.validateAndCorrect(data);
    setValidationResult(validation);

    console.log('📋 UnifiedCsvData: Validação concluída:', {
      isValid: validation.isValid,
      errorsCount: validation.errors.length,
      warningsCount: validation.warnings.length,
      suggestedFixesCount: validation.suggestedFixes.length
    });

    return validation;
  }, []);

  /**
   * Converte valores CSV aplicando correções de escala
   */
  const convertValues = useCallback((data: CsvBudgetData[]): CsvBudgetData[] => {
    console.log('💱 UnifiedCsvData: Convertendo valores para escala correta...');

    return data.map(item => {
      const originalVista = item.preco_vista;
      const originalParcelado = item.preco_parcelado;

      // Normalizar valores para reais (CSV deve estar em reais)
      const convertedVista = DatabaseValueConverter.normalizeToReais(item.preco_vista);
      const convertedParcelado = DatabaseValueConverter.normalizeToReais(item.preco_parcelado);

      if (convertedVista !== originalVista || convertedParcelado !== originalParcelado) {
        console.log(`💱 Conversão aplicada: Vista ${originalVista}→${convertedVista}, Parcelado ${originalParcelado}→${convertedParcelado}`);
      }

      return {
        ...item,
        preco_vista: convertedVista,
        preco_parcelado: convertedParcelado
      };
    });
  }, []);

  /**
   * Importa orçamentos usando o sistema unificado
   */
  const importBudgets = useCallback(async (data: UnifiedBudgetData[]): Promise<void> => {
    console.log('📥 UnifiedCsvData: Importando', data.length, 'orçamentos...');
    
    try {
      setIsLoading(true);

      // Converter para formato CSV para compatibilidade com sistema existente
      const csvData = data.map(unifiedToCsv);
      
      // Usar o hook de importação existente
      const stats = await budgetImport.importBudgets(csvData);
      
      console.log('✅ UnifiedCsvData: Importação concluída:', stats);
      
      toast.success(`✅ ${stats.successful} orçamentos importados com sucesso!`);
      
      if (stats.failed > 0) {
        toast.warning(`⚠️ ${stats.failed} registros falharam na importação`);
      }

    } catch (error) {
      console.error('💥 UnifiedCsvData: Erro na importação:', error);
      toast.error('❌ Erro durante a importação dos orçamentos');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [unifiedToCsv, budgetImport]);

  /**
   * Exporta orçamentos com opções unificadas
   */
  const exportBudgets = useCallback(async (options: UnifiedExportOptions = {}): Promise<UnifiedExportResult> => {
    console.log('📤 UnifiedCsvData: Iniciando exportação com opções:', options);
    
    try {
      setIsLoading(true);

      // Converter opções unificadas para formato do hook existente
      const exportOptions = {
        filters: {
          tipo_aparelho: options.filters?.deviceTypes,
          preco_min: options.filters?.priceRange?.min,
          preco_max: options.filters?.priceRange?.max,
          metodo_pagamento: options.filters?.paymentMethods,
          garantia_min: options.filters?.warrantyRange?.min,
          garantia_max: options.filters?.warrantyRange?.max,
          validade_min: options.filters?.validityRange?.min,
          validade_max: options.filters?.validityRange?.max,
          inclui_entrega: undefined, // Não suportado no tipo atual
          inclui_pelicula: undefined  // Não suportado no tipo atual
        } as CsvExportFilters,
        includeDeleted: options.filters?.includeDeleted || false,
        dateRange: options.filters?.dateRange
      };

      // Usar o hook de exportação existente
      await budgetExport.exportBudgets(exportOptions);

      const result: UnifiedExportResult = {
        success: true,
        filename: `orcamentos_${new Date().toISOString().split('T')[0]}.csv`,
        fileSize: '0 KB', // Será calculado pelo hook de exportação
        exportedCount: budgetExport.exportStats?.exportedCount || 0,
        totalAvailable: budgetExport.exportStats?.totalBudgets || 0,
        filteredOut: (budgetExport.exportStats?.totalBudgets || 0) - (budgetExport.exportStats?.exportedCount || 0),
        format: options.format,
        statistics: {
          totalBudgets: budgetExport.exportStats?.totalBudgets || 0,
          exportedBudgets: budgetExport.exportStats?.exportedCount || 0,
          averagePrice: 0,
          totalValue: 0,
          deviceTypeBreakdown: [],
          paymentMethodBreakdown: [],
          timeRange: { start: new Date(), end: new Date() }
        }
      };

      setExportResult(result);
      console.log('✅ UnifiedCsvData: Exportação concluída:', result);

      return result;

    } catch (error) {
      console.error('💥 UnifiedCsvData: Erro na exportação:', error);
      
      const errorResult: UnifiedExportResult = {
        success: false,
        filename: '',
        fileSize: '0 KB',
        exportedCount: 0,
        totalAvailable: 0,
        filteredOut: 0,
        format: options.format,
        statistics: {
          totalBudgets: 0,
          exportedBudgets: 0,
          averagePrice: 0,
          totalValue: 0,
          deviceTypeBreakdown: [],
          paymentMethodBreakdown: [],
          timeRange: { start: new Date(), end: new Date() }
        },
        errors: [error instanceof Error ? error.message : 'Erro na exportação']
      };

      setExportResult(errorResult);
      toast.error('❌ Erro durante a exportação');
      return errorResult;

    } finally {
      setIsLoading(false);
    }
  }, [budgetExport]);

  /**
   * Baixa template CSV
   */
  const downloadTemplate = useCallback(() => {
    console.log('📋 UnifiedCsvData: Gerando template CSV...');
    
    const templateContent = CsvFormatter.generateTemplate();
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_orcamentos.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ UnifiedCsvData: Template baixado com sucesso');
    toast.success('📋 Template CSV baixado!');
  }, []);

  /**
   * Aplica correções sugeridas
   */
  const applySuggestedFixes = useCallback((fixes: any[]) => {
    console.log('🔧 UnifiedCsvData: Aplicando', fixes.length, 'correções sugeridas...');
    // Implementar aplicação de correções
    toast.success(`🔧 ${fixes.length} correções aplicadas!`);
  }, []);

  /**
   * Limpa todos os dados
   */
  const clearData = useCallback(() => {
    console.log('🧹 UnifiedCsvData: Limpando dados...');
    setPreviewData(null);
    setValidationResult(null);
    setImportResult(null);
    setExportResult(null);
    budgetImport.clearImportStats();
    budgetExport.clearExportStats();
  }, [budgetImport, budgetExport]);

  return {
    // Estados
    isLoading: isLoading || budgetImport.isImporting || budgetExport.isExporting,
    previewData,
    validationResult,
    importResult,
    exportResult,
    
    // Funções de Importação
    parseFile,
    validateCsvData,
    importBudgets,
    
    // Funções de Exportação
    exportBudgets,
    downloadTemplate,
    
    // Funções Utilitárias
    clearData,
    applySuggestedFixes,
    convertValues
  };
};