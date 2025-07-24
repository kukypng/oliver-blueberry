import { BudgetInsert } from './validationTypes';

/**
 * ✅ SISTEMA DE RECUPERAÇÃO DE ERROS
 * 
 * Funcionalidades:
 * - Tentativa de correção automática de dados
 * - Sugestões de correção para o usuário
 * - Importação parcial de registros válidos
 * - Relatório detalhado de problemas
 */

export interface DataSuggestion {
  field: string;
  currentValue: any;
  suggestedValue: any;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface ErrorRecoveryResult {
  canRecover: boolean;
  suggestions: DataSuggestion[];
  correctedData?: BudgetInsert;
  warningMessage?: string;
}

export class ErrorRecovery {
  
  /**
   * 🔧 TENTATIVA DE CORREÇÃO AUTOMÁTICA
   */
  static attemptAutoCorrection(invalidData: any, errors: string[]): ErrorRecoveryResult {
    const suggestions: DataSuggestion[] = [];
    let correctedData = { ...invalidData };
    let canRecover = true;

    errors.forEach(error => {
      const suggestion = this.analyzeError(error, invalidData);
      if (suggestion) {
        suggestions.push(suggestion);
        
        // Aplicar correção se confiança alta
        if (suggestion.confidence === 'high') {
          correctedData[suggestion.field] = suggestion.suggestedValue;
        } else {
          canRecover = false;
        }
      } else {
        canRecover = false;
      }
    });

    return {
      canRecover,
      suggestions,
      correctedData: canRecover ? correctedData : undefined,
      warningMessage: canRecover 
        ? 'Dados corrigidos automaticamente'
        : 'Correção manual necessária'
    };
  }

  /**
   * 🔍 ANÁLISE INTELIGENTE DE ERROS
   */
  private static analyzeError(error: string, data: any): DataSuggestion | null {
    // Preço negativo
    if (error.includes('negativo') && error.includes('preco')) {
      const currentValue = data.preco_total || data.total_price;
      if (typeof currentValue === 'number' && currentValue < 0) {
        return {
          field: 'preco_total',
          currentValue,
          suggestedValue: Math.abs(currentValue),
          reason: 'Converter valor negativo para positivo',
          confidence: 'high'
        };
      }
    }

    // Campo obrigatório vazio
    if (error.includes('obrigatório') && error.includes('vazio')) {
      if (error.includes('Tipo Aparelho')) {
        return {
          field: 'tipo_aparelho',
          currentValue: data.tipo_aparelho || '',
          suggestedValue: 'Smartphone',
          reason: 'Valor padrão para tipo de aparelho',
          confidence: 'medium'
        };
      }

      if (error.includes('Modelo Aparelho')) {
        return {
          field: 'modelo_aparelho',
          currentValue: data.modelo_aparelho || '',
          suggestedValue: 'Modelo não informado',
          reason: 'Valor padrão para modelo',
          confidence: 'medium'
        };
      }

      if (error.includes('Qualidade')) {
        return {
          field: 'qualidade',
          currentValue: data.qualidade || '',
          suggestedValue: 'Original',
          reason: 'Qualidade padrão',
          confidence: 'high'
        };
      }
    }

    // Formato de número inválido
    if (error.includes('número válido')) {
      const fieldMatch = error.match(/'([^']+)'/);
      if (fieldMatch) {
        const field = fieldMatch[1];
        const currentValue = data[this.csvHeaderToField(field)];
        
        // Tentar extrair números da string
        const numMatch = String(currentValue).match(/\d+[.,]?\d*/);
        if (numMatch) {
          const suggestedValue = parseFloat(numMatch[0].replace(',', '.'));
          if (!isNaN(suggestedValue)) {
            return {
              field: this.csvHeaderToField(field),
              currentValue,
              suggestedValue,
              reason: 'Extrair número válido do texto',
              confidence: 'medium'
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * 🗺️ MAPEAMENTO DE CABEÇALHO CSV PARA CAMPO
   */
  private static csvHeaderToField(csvHeader: string): string {
    const mapping: { [key: string]: string } = {
      'Tipo Aparelho': 'tipo_aparelho',
      'Modelo Aparelho': 'modelo_aparelho',
      'Qualidade': 'qualidade',
      'Preco Total': 'preco_total',
      'Preco Parcelado': 'preco_parcelado',
      'Parcelas': 'parcelas',
      'Metodo Pagamento': 'metodo_pagamento',
      'Garantia (meses)': 'garantia_meses',
      'Validade (dias)': 'validade_dias'
    };

    return mapping[csvHeader] || csvHeader.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * 📊 GERAR RELATÓRIO DE RECUPERAÇÃO
   */
  static generateRecoveryReport(results: ErrorRecoveryResult[]): string {
    const totalErrors = results.length;
    const recovered = results.filter(r => r.canRecover).length;
    const needsAttention = totalErrors - recovered;

    let report = `=== RELATÓRIO DE RECUPERAÇÃO DE DADOS ===\n\n`;
    report += `Total de problemas: ${totalErrors}\n`;
    report += `Corrigidos automaticamente: ${recovered}\n`;
    report += `Requerem atenção manual: ${needsAttention}\n\n`;

    if (needsAttention > 0) {
      report += `AÇÕES NECESSÁRIAS:\n`;
      results.forEach((result, index) => {
        if (!result.canRecover) {
          report += `\n${index + 1}. Registro com problemas:\n`;
          result.suggestions.forEach(suggestion => {
            report += `   • ${suggestion.field}: "${suggestion.currentValue}" → "${suggestion.suggestedValue}"\n`;
            report += `     Motivo: ${suggestion.reason}\n`;
          });
        }
      });
    }

    return report;
  }
}