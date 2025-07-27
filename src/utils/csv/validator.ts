import { CsvBudgetData, CsvError } from '@/types/csv';

export class CsvValidator {
  /**
   * Valida dados individuais de orçamento
   */
  static validateBudgetData(data: CsvBudgetData, rowNumber: number): CsvError[] {
    const errors: CsvError[] = [];

    // Validação de tipo de aparelho
    if (!data.tipo_aparelho?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'tipo_aparelho',
        message: 'Tipo de aparelho é obrigatório',
        value: data.tipo_aparelho || ''
      });
    }

    // Validação de serviço/aparelho
    if (!data.servico_aparelho?.trim()) {
      errors.push({
        row: rowNumber,
        field: 'servico_aparelho',
        message: 'Serviço/Aparelho é obrigatório',
        value: data.servico_aparelho || ''
      });
    }

    // Validação de preços
    if (data.preco_vista <= 0) {
      errors.push({
        row: rowNumber,
        field: 'preco_vista',
        message: 'Preço à vista deve ser maior que zero',
        value: data.preco_vista.toString()
      });
    }

    if (data.preco_parcelado <= 0) {
      errors.push({
        row: rowNumber,
        field: 'preco_parcelado',
        message: 'Preço parcelado deve ser maior que zero',
        value: data.preco_parcelado.toString()
      });
    }

    if (data.preco_parcelado < data.preco_vista) {
      errors.push({
        row: rowNumber,
        field: 'preco_parcelado',
        message: 'Preço parcelado não pode ser menor que o preço à vista',
        value: `À vista: ${data.preco_vista}, Parcelado: ${data.preco_parcelado}`
      });
    }

    // Validação de parcelas
    if (data.parcelas < 1 || data.parcelas > 24) {
      errors.push({
        row: rowNumber,
        field: 'parcelas',
        message: 'Número de parcelas deve estar entre 1 e 24',
        value: data.parcelas.toString()
      });
    }

    // Validação de método de pagamento
    const validPaymentMethods = ['À Vista', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Dinheiro'];
    if (!validPaymentMethods.includes(data.metodo_pagamento)) {
      errors.push({
        row: rowNumber,
        field: 'metodo_pagamento',
        message: `Método de pagamento inválido. Use: ${validPaymentMethods.join(', ')}`,
        value: data.metodo_pagamento
      });
    }

    // Validação de garantia
    if (data.garantia_meses < 0 || data.garantia_meses > 60) {
      errors.push({
        row: rowNumber,
        field: 'garantia_meses',
        message: 'Garantia deve estar entre 0 e 60 meses',
        value: data.garantia_meses.toString()
      });
    }

    // Validação de validade
    if (data.validade_dias < 1 || data.validade_dias > 365) {
      errors.push({
        row: rowNumber,
        field: 'validade_dias',
        message: 'Validade deve estar entre 1 e 365 dias',
        value: data.validade_dias.toString()
      });
    }

    // Validação de tipos de aparelho conhecidos
    const validDeviceTypes = ['celular', 'tablet', 'notebook', 'smartwatch', 'acessorio'];
    if (!validDeviceTypes.includes(data.tipo_aparelho.toLowerCase())) {
      // Warning, não erro
      console.warn(`Tipo de aparelho não reconhecido: ${data.tipo_aparelho}`);
    }

    return errors;
  }

  /**
   * Detecta duplicatas nos dados
   */
  static findDuplicates(data: CsvBudgetData[]): CsvError[] {
    const errors: CsvError[] = [];
    const seen = new Map<string, number>();

    data.forEach((item, index) => {
      const key = `${item.tipo_aparelho}-${item.servico_aparelho}-${item.preco_vista}`;
      const rowNumber = index + 2; // +2 porque começa na linha 1 (header) e index é 0-based

      if (seen.has(key)) {
        const originalRow = seen.get(key)!;
        errors.push({
          row: rowNumber,
          field: 'duplicata',
          message: `Registro duplicado encontrado na linha ${originalRow}`,
          value: `${item.tipo_aparelho} - ${item.servico_aparelho}`
        });
      } else {
        seen.set(key, rowNumber);
      }
    });

    return errors;
  }

  /**
   * Sugere correções para valores inválidos
   */
  static suggestCorrections(data: CsvBudgetData): Partial<CsvBudgetData> {
    const suggestions: Partial<CsvBudgetData> = {};

    // Correção de tipo de aparelho
    if (data.tipo_aparelho) {
      const normalized = data.tipo_aparelho.toLowerCase().trim();
      if (normalized.includes('cel') || normalized.includes('phone')) {
        suggestions.tipo_aparelho = 'celular';
      } else if (normalized.includes('tab')) {
        suggestions.tipo_aparelho = 'tablet';
      } else if (normalized.includes('note') || normalized.includes('laptop')) {
        suggestions.tipo_aparelho = 'notebook';
      } else if (normalized.includes('watch') || normalized.includes('relogio')) {
        suggestions.tipo_aparelho = 'smartwatch';
      }
    }

    // Correção de método de pagamento
    if (data.metodo_pagamento) {
      const normalized = data.metodo_pagamento.toLowerCase().trim();
      if (normalized.includes('vista') || normalized.includes('dinheiro')) {
        suggestions.metodo_pagamento = 'À Vista';
      } else if (normalized.includes('credito') || normalized.includes('crédito')) {
        suggestions.metodo_pagamento = 'Cartão de Crédito';
      } else if (normalized.includes('debito') || normalized.includes('débito')) {
        suggestions.metodo_pagamento = 'Cartão de Débito';
      } else if (normalized.includes('pix')) {
        suggestions.metodo_pagamento = 'PIX';
      }
    }

    // Correção de valores negativos
    if (data.preco_vista < 0) {
      suggestions.preco_vista = Math.abs(data.preco_vista);
    }
    if (data.preco_parcelado < 0) {
      suggestions.preco_parcelado = Math.abs(data.preco_parcelado);
    }
    if (data.garantia_meses < 0) {
      suggestions.garantia_meses = Math.abs(data.garantia_meses);
    }
    if (data.validade_dias < 0) {
      suggestions.validade_dias = Math.abs(data.validade_dias);
    }

    return suggestions;
  }

  /**
   * Valida integridade entre campos relacionados
   */
  static validateFieldRelationships(data: CsvBudgetData, rowNumber: number): CsvError[] {
    const errors: CsvError[] = [];

    // Se tem parcelas > 1, preço parcelado deve ser maior que à vista
    if (data.parcelas > 1 && data.preco_parcelado <= data.preco_vista) {
      errors.push({
        row: rowNumber,
        field: 'relacao_precos',
        message: 'Com parcelamento, o preço parcelado deveria ser maior que à vista',
        value: `Parcelas: ${data.parcelas}, À vista: ${data.preco_vista}, Parcelado: ${data.preco_parcelado}`
      });
    }

    // Se método é "À Vista", parcelas deve ser 1
    if (data.metodo_pagamento === 'À Vista' && data.parcelas > 1) {
      errors.push({
        row: rowNumber,
        field: 'metodo_parcelas',
        message: 'Pagamento à vista deve ter apenas 1 parcela',
        value: `Método: ${data.metodo_pagamento}, Parcelas: ${data.parcelas}`
      });
    }

    return errors;
  }
}