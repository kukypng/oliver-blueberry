import { CsvBudgetData } from '@/types/csv';

export class CsvNumberUtils {
  /**
   * Formatar número para CSV no padrão brasileiro
   */
  static formatNumber(value: number): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '0,00';
    }
    
    // Garantir que é um número válido
    const numValue = Number(value);
    
    // Formatar com 2 casas decimais usando vírgula como separador decimal
    return numValue.toFixed(2).replace('.', ',');
  }

  /**
   * Parsear número do CSV considerando formatos brasileiros
   */
  static parseNumber(value: string): number {
    if (!value || typeof value !== 'string') {
      return 0;
    }

    // Limpar espaços
    let cleanValue = value.trim();
    
    // Se está vazio após limpeza
    if (!cleanValue) {
      return 0;
    }

    // Remover símbolos de moeda se existirem
    cleanValue = cleanValue.replace(/[R$\s]/g, '');

    // Casos especiais de formatação
    if (cleanValue.includes(',') && cleanValue.includes('.')) {
      // Formato brasileiro: 1.234,56 ou internacional: 1,234.56
      const lastComma = cleanValue.lastIndexOf(',');
      const lastDot = cleanValue.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // Formato brasileiro: 1.234,56
        cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
      } else {
        // Formato internacional: 1,234.56
        cleanValue = cleanValue.replace(/,/g, '');
      }
    } else if (cleanValue.includes(',')) {
      // Só vírgula - assumir que é decimal brasileiro
      const commaIndex = cleanValue.indexOf(',');
      const afterComma = cleanValue.substring(commaIndex + 1);
      
      // Se depois da vírgula tem mais de 2 dígitos, provavelmente é separador de milhares
      if (afterComma.length > 2) {
        cleanValue = cleanValue.replace(/,/g, '');
      } else {
        // É decimal
        cleanValue = cleanValue.replace(',', '.');
      }
    }

    const parsed = parseFloat(cleanValue);
    
    if (isNaN(parsed)) {
      console.warn(`Não foi possível converter "${value}" para número`);
      return 0;
    }

    return parsed;
  }

  /**
   * Validar se um valor de string representa um número válido
   */
  static isValidNumber(value: string): boolean {
    if (!value || typeof value !== 'string') {
      return false;
    }

    const parsed = this.parseNumber(value);
    return !isNaN(parsed) && isFinite(parsed);
  }

  /**
   * Formatar número para exibição em reais
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
}