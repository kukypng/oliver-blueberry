
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
 * 🔄 INTERFACE LEGACY REMOVIDA
 * FieldMapping agora é substituído pelo sistema StandardHeader
 * Mantemos apenas para compatibilidade temporária
 */
export interface FieldMapping {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultValue?: any;
  validator?: (value: any) => ValidationResult;
}

// Mantido apenas para compatibilidade com código antigo
export const FIELD_MAPPINGS: FieldMapping[] = [];
