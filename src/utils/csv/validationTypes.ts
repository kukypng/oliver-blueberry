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
  isValid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warnings: string[];
  errors: string[];
  data: any[];
  preview: ParsedRow[];
}

export interface FieldMapping {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'date';
  defaultValue?: any;
  validator?: (value: any) => ValidationResult;
}

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
  { field: 'garantia_meses', required: false, type: 'number', defaultValue: 3 },
  { field: 'validade_dias', required: false, type: 'number', defaultValue: 15 },
  { field: 'inclui_entrega', required: false, type: 'boolean', defaultValue: false },
  { field: 'inclui_pelicula', required: false, type: 'boolean', defaultValue: false },
];