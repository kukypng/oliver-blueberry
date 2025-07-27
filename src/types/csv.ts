export interface CsvBudgetData {
  tipo_aparelho: string;
  servico_aparelho: string;
  qualidade?: string;
  observacoes?: string;
  preco_vista: number;
  preco_parcelado: number;
  parcelas: number;
  metodo_pagamento: string;
  garantia_meses: number;
  validade_dias: number;
  inclui_entrega: boolean;
  inclui_pelicula: boolean;
}

export interface CsvImportResult {
  success: boolean;
  data: CsvBudgetData[];
  errors: CsvError[];
  totalRows: number;
  validRows: number;
}

export interface CsvError {
  row: number;
  field: string;
  message: string;
  value: string;
}

export interface CsvExportFilters {
  tipo_aparelho?: string[];
  garantia_min?: number;
  garantia_max?: number;
  validade_min?: number;
  validade_max?: number;
  preco_min?: number;
  preco_max?: number;
  metodo_pagamento?: string[];
  inclui_entrega?: boolean;
  inclui_pelicula?: boolean;
}

export interface CsvPreviewData {
  headers: string[];
  rows: string[][];
  isValid: boolean;
  errors: CsvError[];
}