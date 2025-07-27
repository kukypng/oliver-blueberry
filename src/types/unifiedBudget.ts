/**
 * Tipos Unificados para Sistema de Orçamentos
 * Interface comum para importação, exportação e manipulação de dados
 */

import { CsvBudgetData, CsvError } from './csv';

export interface UnifiedBudgetData {
  // Identificação
  id?: string;
  
  // Dados do Cliente
  client_name: string;
  client_phone?: string;
  
  // Dados do Dispositivo
  device_type: string;        // tipo_aparelho
  device_model: string;       // servico_aparelho
  part_quality?: string;      // qualidade
  notes?: string;             // observacoes
  
  // Preços (sempre em centavos no banco, reais na interface)
  cash_price: number;         // preco_vista
  installment_price: number;  // preco_parcelado
  installments: number;       // parcelas
  
  // Condições
  payment_condition: string;  // metodo_pagamento
  warranty_months: number;    // garantia_meses
  validity_days: number;      // validade_dias
  
  // Serviços Inclusos
  includes_delivery: boolean; // inclui_entrega
  includes_screen_protector: boolean; // inclui_pelicula
  
  // Metadados
  created_at?: Date;
  updated_at?: Date;
  valid_until?: Date;
  
  // Status do Sistema
  workflow_status?: string;
  is_deleted?: boolean;
}

export interface UnifiedCsvResult {
  success: boolean;
  data: UnifiedBudgetData[];
  errors: CsvError[];
  warnings: CsvError[];
  totalRows: number;
  validRows: number;
  correctionsSummary: CorrectionsSummary;
}

export interface CorrectionsSummary {
  valueCorrections: number;        // Quantos valores foram corrigidos
  scaleCorrections: number;        // Quantos valores mudaram de escala (centavos↔reais)
  formatCorrections: number;       // Quantos valores foram reformatados
  validationErrors: number;        // Quantos erros de validação
  appliedCorrections: string[];    // Lista das correções aplicadas
}

export interface UnifiedValidationResult {
  isValid: boolean;
  errors: CsvError[];
  warnings: CsvError[];
  corrections: CorrectionsSummary;
  suggestedFixes: SuggestedFix[];
}

export interface SuggestedFix {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  autoApplicable: boolean;
}

export interface UnifiedCsvPreview {
  headers: string[];
  rows: UnifiedBudgetData[];
  statistics: PreviewStatistics;
  validationResult: UnifiedValidationResult;
  formatDetection: FormatDetection;
}

export interface PreviewStatistics {
  totalRows: number;
  validRows: number;
  errorRows: number;
  warningRows: number;
  duplicateRows: number;
  averagePrice: number;
  priceRange: { min: number; max: number };
  commonDeviceTypes: { type: string; count: number }[];
  paymentMethods: { method: string; count: number }[];
}

export interface FormatDetection {
  valueScale: 'reais' | 'centavos' | 'mixed';
  numberFormat: 'integer' | 'decimal' | 'mixed';
  dateFormat?: string;
  encoding: string;
  delimiter: string;
  confidence: number;
  recommendations: string[];
}

export interface UnifiedExportOptions {
  // Filtros
  filters?: {
    deviceTypes?: string[];
    priceRange?: { min: number; max: number };
    dateRange?: { start: Date; end: Date };
    paymentMethods?: string[];
    warrantyRange?: { min: number; max: number };
    validityRange?: { min: number; max: number };
    includeDeleted?: boolean;
  };
  
  // Formatação
  format?: {
    valueScale: 'reais' | 'centavos';
    numberFormat: 'integer' | 'decimal';
    dateFormat?: string;
    encoding?: string;
    delimiter?: string;
  };
  
  // Metadados
  includeMetadata?: boolean;
  includeStatistics?: boolean;
  customHeaders?: string[];
}

export interface UnifiedExportResult {
  success: boolean;
  filename: string;
  fileSize: string;
  exportedCount: number;
  totalAvailable: number;
  filteredOut: number;
  format: UnifiedExportOptions['format'];
  statistics: ExportStatistics;
  errors?: string[];
}

export interface ExportStatistics {
  totalBudgets: number;
  exportedBudgets: number;
  averagePrice: number;
  totalValue: number;
  deviceTypeBreakdown: { type: string; count: number; value: number }[];
  paymentMethodBreakdown: { method: string; count: number }[];
  timeRange: { start: Date; end: Date };
}

// Utilitários de conversão serão implementados separadamente
export interface UnifiedBudgetConverter {
  fromCsv(csvData: CsvBudgetData): UnifiedBudgetData;
  toCsv(unifiedData: UnifiedBudgetData): CsvBudgetData;
  fromDatabase(dbData: any): UnifiedBudgetData;
  toDatabase(unifiedData: UnifiedBudgetData): any;
}