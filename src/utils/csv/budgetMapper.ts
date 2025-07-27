import { CsvBudgetData } from '@/types/csv';

export interface BudgetData {
  id?: string;
  client_name: string;
  client_phone?: string;
  device_type: string;
  device_model: string;
  total_price: number;
  cash_price: number;
  installment_price: number;
  installments: number;
  payment_condition: string;
  warranty_months: number;
  valid_until: Date;
  part_quality?: string;
  notes?: string;
  includes_delivery: boolean;
  includes_screen_protector: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export class BudgetMapper {
  /**
   * Converte dados CSV para formato de orçamento do sistema
   * CORREÇÃO: Converte valores do CSV (reais) para banco (centavos)
   */
  static csvToBudget(csvData: CsvBudgetData): BudgetData {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + csvData.validade_dias);

    // CORREÇÃO CRÍTICA: Converter reais para centavos
    // Valores no CSV estão em reais (2589), banco deve ter centavos (258900)
    const cashPriceCentavos = Math.round(csvData.preco_vista * 100);
    const installmentPriceCentavos = Math.round(csvData.preco_parcelado * 100);

    console.log(`BudgetMapper.csvToBudget: Convertendo preços:`, {
      original_cash: csvData.preco_vista,
      converted_cash: cashPriceCentavos,
      original_installment: csvData.preco_parcelado,
      converted_installment: installmentPriceCentavos
    });

    return {
      client_name: 'Cliente Importado CSV',
      client_phone: undefined,
      device_type: csvData.tipo_aparelho,
      device_model: csvData.servico_aparelho,
      total_price: cashPriceCentavos,
      cash_price: cashPriceCentavos,
      installment_price: installmentPriceCentavos,
      installments: csvData.parcelas,
      payment_condition: csvData.metodo_pagamento,
      warranty_months: csvData.garantia_meses,
      valid_until: validUntil,
      part_quality: csvData.qualidade,
      notes: csvData.observacoes,
      includes_delivery: csvData.inclui_entrega,
      includes_screen_protector: csvData.inclui_pelicula,
    };
  }

  /**
   * Converte orçamento do sistema para formato CSV
   * CORREÇÃO: Converte valores do banco (centavos) para CSV (reais)
   */
  static budgetToCsv(budgetData: BudgetData): CsvBudgetData {
    const validityDays = budgetData.valid_until 
      ? Math.ceil((budgetData.valid_until.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 15;

    // CORREÇÃO CRÍTICA: Converter centavos para reais
    // Valores no banco estão em centavos (258900), CSV deve ter reais (2589)
    const cashPriceReais = Math.round((budgetData.cash_price || budgetData.total_price) / 100);
    const installmentPriceReais = Math.round((budgetData.installment_price || budgetData.total_price) / 100);

    console.log(`BudgetMapper.budgetToCsv: Convertendo preços:`, {
      original_cash: budgetData.cash_price,
      converted_cash: cashPriceReais,
      original_installment: budgetData.installment_price,
      converted_installment: installmentPriceReais
    });

    return {
      tipo_aparelho: budgetData.device_type,
      servico_aparelho: budgetData.device_model,
      qualidade: budgetData.part_quality,
      observacoes: budgetData.notes,
      preco_vista: cashPriceReais,
      preco_parcelado: installmentPriceReais,
      parcelas: budgetData.installments || 1,
      metodo_pagamento: budgetData.payment_condition,
      garantia_meses: budgetData.warranty_months,
      validade_dias: Math.max(1, validityDays),
      inclui_entrega: budgetData.includes_delivery,
      inclui_pelicula: budgetData.includes_screen_protector,
    };
  }

  /**
   * Valida se os dados CSV podem ser convertidos para orçamento
   */
  static validateCsvForBudget(csvData: CsvBudgetData): string[] {
    const errors: string[] = [];

    if (!csvData.tipo_aparelho?.trim()) {
      errors.push('Tipo de aparelho é obrigatório');
    }

    if (!csvData.servico_aparelho?.trim()) {
      errors.push('Serviço/Aparelho é obrigatório');
    }

    if (!csvData.preco_vista || csvData.preco_vista <= 0) {
      errors.push('Preço à vista deve ser maior que zero');
    }

    if (!csvData.preco_parcelado || csvData.preco_parcelado <= 0) {
      errors.push('Preço parcelado deve ser maior que zero');
    }

    if (!csvData.parcelas || csvData.parcelas < 1) {
      errors.push('Número de parcelas deve ser maior que zero');
    }

    if (!csvData.metodo_pagamento?.trim()) {
      errors.push('Método de pagamento é obrigatório');
    }

    if (!csvData.garantia_meses || csvData.garantia_meses < 0) {
      errors.push('Garantia deve ser um valor positivo');
    }

    if (!csvData.validade_dias || csvData.validade_dias < 1) {
      errors.push('Validade deve ser pelo menos 1 dia');
    }

    return errors;
  }
}