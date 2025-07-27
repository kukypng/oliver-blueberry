/**
 * Validador Unificado para Sistema CSV
 * Validação completa com correções automáticas e sugestões inteligentes
 */

import { CsvBudgetData, CsvError } from '@/types/csv';
import { UnifiedBudgetData, UnifiedValidationResult, SuggestedFix, CorrectionsSummary } from '@/types/unifiedBudget';
import { CsvValueConverter } from './csvValueConverter';
import { DatabaseValueConverter } from './databaseValueConverter';
import { NumberUtils } from './numberUtils';

export class UnifiedCsvValidator {
  private static readonly REQUIRED_FIELDS = [
    'tipo_aparelho',
    'servico_aparelho', 
    'preco_vista',
    'preco_parcelado',
    'parcelas',
    'metodo_pagamento',
    'garantia_meses',
    'validade_dias'
  ];

  private static readonly DEVICE_TYPES = [
    'celular', 'smartphone', 'iphone', 'android',
    'tablet', 'ipad', 'notebook', 'laptop',
    'smartwatch', 'relogio', 'fone', 'earbuds'
  ];

  private static readonly PAYMENT_METHODS = [
    'À Vista', 'Cartão de Crédito', 'Cartão de Débito',
    'PIX', 'Dinheiro', 'Transferência', 'Parcelado'
  ];

  /**
   * Valida dados CSV completos com correções automáticas
   */
  static validateAndCorrect(data: CsvBudgetData[]): UnifiedValidationResult {
    const errors: CsvError[] = [];
    const warnings: CsvError[] = [];
    const suggestedFixes: SuggestedFix[] = [];
    let corrections: CorrectionsSummary = {
      valueCorrections: 0,
      scaleCorrections: 0,
      formatCorrections: 0,
      validationErrors: 0,
      appliedCorrections: []
    };

    data.forEach((row, index) => {
      const rowNumber = index + 2; // +2 porque a linha 1 é o cabeçalho
      
      // Validação de campos obrigatórios
      const requiredFieldErrors = this.validateRequiredFields(row, rowNumber);
      errors.push(...requiredFieldErrors);

      // Validação de valores monetários
      const { errors: valueErrors, warnings: valueWarnings, corrections: valueCorrections } = 
        this.validateMonetaryValues(row, rowNumber);
      errors.push(...valueErrors);
      warnings.push(...valueWarnings);
      corrections.valueCorrections += valueCorrections.count;
      corrections.appliedCorrections.push(...valueCorrections.details);

      // Validação de tipos de dispositivo
      const deviceValidation = this.validateDeviceType(row, rowNumber);
      if (deviceValidation.error) {
        warnings.push(deviceValidation.error);
      }
      if (deviceValidation.suggestion) {
        suggestedFixes.push(deviceValidation.suggestion);
      }

      // Validação de método de pagamento
      const paymentValidation = this.validatePaymentMethod(row, rowNumber);
      if (paymentValidation.error) {
        warnings.push(paymentValidation.error);
      }
      if (paymentValidation.suggestion) {
        suggestedFixes.push(paymentValidation.suggestion);
      }

      // Validação de relacionamentos entre campos
      const relationshipErrors = this.validateFieldRelationships(row, rowNumber);
      errors.push(...relationshipErrors);

      // Validação de ranges (garantia, validade)
      const rangeWarnings = this.validateRanges(row, rowNumber);
      warnings.push(...rangeWarnings);
    });

    // Detectar duplicatas
    const duplicateErrors = this.findDuplicates(data);
    errors.push(...duplicateErrors);

    // Análise global de valores
    const globalAnalysis = this.analyzeGlobalValues(data);
    warnings.push(...globalAnalysis.warnings);
    corrections.scaleCorrections += globalAnalysis.scaleCorrections;
    corrections.appliedCorrections.push(...globalAnalysis.corrections);

    const isValid = errors.length === 0;

    return {
      isValid,
      errors,
      warnings,
      corrections,
      suggestedFixes
    };
  }

  /**
   * Valida campos obrigatórios
   */
  private static validateRequiredFields(data: CsvBudgetData, rowNumber: number): CsvError[] {
    const errors: CsvError[] = [];

    this.REQUIRED_FIELDS.forEach(field => {
      const value = (data as any)[field];
      
      if (value === undefined || value === null || value === '') {
        errors.push({
          row: rowNumber,
          field,
          message: `Campo obrigatório não informado`,
          value: String(value || '')
        });
      }
    });

    return errors;
  }

  /**
   * Valida valores monetários com correções automáticas
   */
  private static validateMonetaryValues(data: CsvBudgetData, rowNumber: number): {
    errors: CsvError[];
    warnings: CsvError[];
    corrections: { count: number; details: string[] };
  } {
    const errors: CsvError[] = [];
    const warnings: CsvError[] = [];
    const corrections = { count: 0, details: [] as string[] };

    // Validar preço à vista
    if (data.preco_vista !== undefined) {
      const validation = this.validatePrice(data.preco_vista, 'preco_vista', rowNumber);
      if (validation.error) {
        if (validation.error.message.includes('suspeito')) {
          warnings.push(validation.error);
        } else {
          errors.push(validation.error);
        }
      }
      
      if (validation.correctedValue !== undefined && validation.correctedValue !== data.preco_vista) {
        data.preco_vista = validation.correctedValue;
        corrections.count++;
        corrections.details.push(`Linha ${rowNumber}: Preço à vista corrigido de ${validation.originalValue} para ${validation.correctedValue}`);
      }
    }

    // Validar preço parcelado
    if (data.preco_parcelado !== undefined) {
      const validation = this.validatePrice(data.preco_parcelado, 'preco_parcelado', rowNumber);
      if (validation.error) {
        if (validation.error.message.includes('suspeito')) {
          warnings.push(validation.error);
        } else {
          errors.push(validation.error);
        }
      }
      
      if (validation.correctedValue !== undefined && validation.correctedValue !== data.preco_parcelado) {
        data.preco_parcelado = validation.correctedValue;
        corrections.count++;
        corrections.details.push(`Linha ${rowNumber}: Preço parcelado corrigido de ${validation.originalValue} para ${validation.correctedValue}`);
      }
    }

    return { errors, warnings, corrections };
  }

  /**
   * Valida um preço individual
   */
  private static validatePrice(price: number, field: string, rowNumber: number): {
    error?: CsvError;
    correctedValue?: number;
    originalValue: number;
  } {
    const originalValue = price;

    if (isNaN(price) || price < 0) {
      return {
        error: {
          row: rowNumber,
          field,
          message: `Valor inválido ou negativo`,
          value: String(price)
        },
        originalValue
      };
    }

    // Detectar se valor pode estar em centavos
    const scale = DatabaseValueConverter.detectValueScale(price);
    let correctedValue: number | undefined;

    if (scale === 'centavos' && price > 10000) {
      correctedValue = DatabaseValueConverter.centavosToReais(price);
      return {
        error: {
          row: rowNumber,
          field,
          message: `Valor suspeito (${price}). Pode estar em centavos. Convertido para ${correctedValue} reais.`,
          value: String(price)
        },
        correctedValue,
        originalValue
      };
    }

    // Verificar valores muito baixos ou muito altos
    if (price < 10) {
      return {
        error: {
          row: rowNumber,
          field,
          message: `Valor muito baixo (${price}). Verifique se está correto.`,
          value: String(price)
        },
        originalValue
      };
    }

    if (price > 100000) {
      return {
        error: {
          row: rowNumber,
          field,
          message: `Valor muito alto (${price}). Verifique se está correto.`,
          value: String(price)
        },
        originalValue
      };
    }

    return { originalValue };
  }

  /**
   * Valida tipo de dispositivo
   */
  private static validateDeviceType(data: CsvBudgetData, rowNumber: number): {
    error?: CsvError;
    suggestion?: SuggestedFix;
  } {
    if (!data.tipo_aparelho) return {};

    const deviceType = data.tipo_aparelho.toLowerCase().trim();
    const isValid = this.DEVICE_TYPES.some(valid => 
      deviceType.includes(valid) || valid.includes(deviceType)
    );

    if (!isValid) {
      // Tentar encontrar sugestão
      const suggestion = this.findClosestMatch(deviceType, this.DEVICE_TYPES);
      
      return {
        error: {
          row: rowNumber,
          field: 'tipo_aparelho',
          message: `Tipo de dispositivo não reconhecido: "${data.tipo_aparelho}"`,
          value: data.tipo_aparelho
        },
        suggestion: suggestion ? {
          field: 'tipo_aparelho',
          currentValue: data.tipo_aparelho,
          suggestedValue: suggestion,
          reason: `Tipo similar encontrado: "${suggestion}"`,
          confidence: 'medium',
          autoApplicable: false
        } : undefined
      };
    }

    return {};
  }

  /**
   * Valida método de pagamento
   */
  private static validatePaymentMethod(data: CsvBudgetData, rowNumber: number): {
    error?: CsvError;
    suggestion?: SuggestedFix;
  } {
    if (!data.metodo_pagamento) return {};

    const paymentMethod = data.metodo_pagamento.trim();
    const isValid = this.PAYMENT_METHODS.includes(paymentMethod);

    if (!isValid) {
      const suggestion = this.findClosestMatch(paymentMethod, this.PAYMENT_METHODS);
      
      return {
        error: {
          row: rowNumber,
          field: 'metodo_pagamento',
          message: `Método de pagamento não reconhecido: "${data.metodo_pagamento}"`,
          value: data.metodo_pagamento
        },
        suggestion: suggestion ? {
          field: 'metodo_pagamento',
          currentValue: data.metodo_pagamento,
          suggestedValue: suggestion,
          reason: `Método similar encontrado: "${suggestion}"`,
          confidence: 'high',
          autoApplicable: true
        } : undefined
      };
    }

    return {};
  }

  /**
   * Valida relacionamentos entre campos
   */
  private static validateFieldRelationships(data: CsvBudgetData, rowNumber: number): CsvError[] {
    const errors: CsvError[] = [];

    // Preço parcelado deve ser >= preço à vista
    if (data.preco_parcelado < data.preco_vista) {
      errors.push({
        row: rowNumber,
        field: 'preco_parcelado',
        message: `Preço parcelado (${data.preco_parcelado}) não pode ser menor que preço à vista (${data.preco_vista})`,
        value: String(data.preco_parcelado)
      });
    }

    // À vista deve ter apenas 1 parcela
    if (data.metodo_pagamento === 'À Vista' && data.parcelas > 1) {
      errors.push({
        row: rowNumber,
        field: 'parcelas',
        message: `Pagamento à vista deve ter apenas 1 parcela, encontrado: ${data.parcelas}`,
        value: String(data.parcelas)
      });
    }

    return errors;
  }

  /**
   * Valida ranges de valores
   */
  private static validateRanges(data: CsvBudgetData, rowNumber: number): CsvError[] {
    const warnings: CsvError[] = [];

    // Garantia muito alta ou muito baixa
    if (data.garantia_meses > 24) {
      warnings.push({
        row: rowNumber,
        field: 'garantia_meses',
        message: `Garantia muito alta: ${data.garantia_meses} meses. Verifique se está correto.`,
        value: String(data.garantia_meses)
      });
    }

    // Validade muito alta
    if (data.validade_dias > 90) {
      warnings.push({
        row: rowNumber,
        field: 'validade_dias',
        message: `Validade muito alta: ${data.validade_dias} dias. Verifique se está correto.`,
        value: String(data.validade_dias)
      });
    }

    return warnings;
  }

  /**
   * Encontra duplicatas
   */
  private static findDuplicates(data: CsvBudgetData[]): CsvError[] {
    const errors: CsvError[] = [];
    const seen = new Set<string>();

    data.forEach((row, index) => {
      const key = `${row.tipo_aparelho}|${row.servico_aparelho}|${row.preco_vista}`;
      if (seen.has(key)) {
        errors.push({
          row: index + 2,
          field: 'duplicate',
          message: `Registro duplicado encontrado`,
          value: key
        });
      } else {
        seen.add(key);
      }
    });

    return errors;
  }

  /**
   * Análise global de valores
   */
  private static analyzeGlobalValues(data: CsvBudgetData[]): {
    warnings: CsvError[];
    scaleCorrections: number;
    corrections: string[];
  } {
    const warnings: CsvError[] = [];
    const corrections: string[] = [];
    let scaleCorrections = 0;

    const allPrices = [
      ...data.map(d => d.preco_vista),
      ...data.map(d => d.preco_parcelado)
    ].filter(p => !isNaN(p) && p > 0);

    if (allPrices.length === 0) return { warnings, scaleCorrections, corrections };

    // Verificar se maioria dos valores parece estar em centavos
    const possibleCentavos = allPrices.filter(p => p > 10000).length;
    const total = allPrices.length;

    if (possibleCentavos > total * 0.8) {
      warnings.push({
        row: 0,
        field: 'global_analysis',
        message: `${possibleCentavos}/${total} valores parecem estar em centavos. Considere verificar a escala dos valores.`,
        value: 'escala_valores'
      });
      scaleCorrections = possibleCentavos;
      corrections.push(`Detectados ${possibleCentavos} valores possivelmente em centavos`);
    }

    return { warnings, scaleCorrections, corrections };
  }

  /**
   * Encontra correspondência mais próxima
   */
  private static findClosestMatch(input: string, validOptions: string[]): string | null {
    const inputLower = input.toLowerCase();
    
    // Procura correspondência exata
    for (const option of validOptions) {
      if (option.toLowerCase() === inputLower) {
        return option;
      }
    }

    // Procura correspondência parcial
    for (const option of validOptions) {
      if (option.toLowerCase().includes(inputLower) || inputLower.includes(option.toLowerCase())) {
        return option;
      }
    }

    // Usa distância de Levenshtein simplificada
    let bestMatch = null;
    let bestScore = Infinity;

    for (const option of validOptions) {
      const score = this.levenshteinDistance(inputLower, option.toLowerCase());
      if (score < bestScore && score <= 3) { // Máximo 3 diferenças
        bestScore = score;
        bestMatch = option;
      }
    }

    return bestMatch;
  }

  /**
   * Calcula distância de Levenshtein simplificada
   */
  private static levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }
}