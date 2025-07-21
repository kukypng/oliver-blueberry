/**
 * ✅ TIPOS PADRONIZADOS - Sistema unificado de validação
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: any;
}

export interface ParsedRow {
  rowIndex: number;
  data: any;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: number;
  errors: string[];
  processedData: BudgetInsert[];
}

export interface FieldMapping {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultValue?: any;
  validator?: (value: any) => ValidationResult;
}

/**
 * 💾 Tipo para inserção no banco (padronizado)
 */
export interface BudgetInsert {
  owner_id: string;
  device_type: string;
  device_model: string;
  issue: string;
  part_quality?: string;
  part_type: string;
  notes?: string;
  total_price: number; // Em centavos
  cash_price: number; // Em centavos
  installment_price?: number | null; // Em centavos
  installments?: number;
  payment_condition?: string;
  warranty_months?: number;
  includes_delivery?: boolean;
  includes_screen_protector?: boolean;
  valid_until: string;
  expires_at?: string;
  status: string;
  workflow_status: string;
  client_name?: string | null;
  client_phone?: string | null;
}

/**
 * 🔄 MAPEAMENTO DE CAMPOS ATUALIZADO
 * Configuração única para validação de todos os campos
 */
export const FIELD_MAPPINGS: FieldMapping[] = [
  { field: 'tipo_aparelho', required: true, type: 'string' },
  { field: 'modelo_aparelho', required: true, type: 'string' },
  { field: 'qualidade', required: true, type: 'string' },
  { field: 'servico_realizado', required: true, type: 'string' },
  { field: 'observacoes', required: false, type: 'string', defaultValue: '' },
  { field: 'preco_total', required: true, type: 'number' },
  { field: 'preco_parcelado', required: false, type: 'number', defaultValue: null },
  { field: 'parcelas', required: false, type: 'number', defaultValue: 1 },
  { field: 'metodo_pagamento', required: false, type: 'string', defaultValue: 'A Vista' },
  { field: 'condicao_pagamento', required: false, type: 'string', defaultValue: 'A Vista' },
  { field: 'garantia_meses', required: false, type: 'number', defaultValue: 3 },
  { field: 'validade_dias', required: false, type: 'number', defaultValue: 15 },
  { field: 'inclui_entrega', required: false, type: 'boolean', defaultValue: false },
  { field: 'inclui_pelicula', required: false, type: 'boolean', defaultValue: false },
  
  // Campos alternativos para compatibilidade
  { field: 'defeito_ou_problema', required: false, type: 'string', defaultValue: '' },
];