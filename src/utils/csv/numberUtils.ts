export class NumberUtils {
  /**
   * Formata um número para CSV garantindo que seja limpo e sem separadores de milhares
   * @param value - O valor numérico
   * @param forceInteger - Se true, força o valor a ser inteiro
   */
  static formatForCsv(value: number, forceInteger: boolean = false): string {
    if (forceInteger) {
      return Math.round(value).toString();
    }
    
    // Remove zeros desnecessários à direita e garante formato limpo
    const formatted = value.toString();
    return formatted.replace(/\.0+$/, ''); // Remove .0, .00, etc.
  }

  /**
   * Faz o parsing de uma string para número, lidando com diferentes formatos
   * @param valueStr - String do valor
   * @param forceInteger - Se true, força conversão para inteiro
   */
  static parseFromCsv(valueStr: string, forceInteger: boolean = false): number {
    if (!valueStr || valueStr.trim() === '') {
      return 0;
    }

    // Remove espaços e caracteres especiais
    let cleanValue = valueStr.trim();
    
    // Remove separadores de milhares (pontos e vírgulas em posições específicas)
    cleanValue = this.removeThousandsSeparators(cleanValue);
    
    // Converte vírgula decimal para ponto (formato brasileiro para internacional)
    const lastComma = cleanValue.lastIndexOf(',');
    const lastDot = cleanValue.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // Vírgula é separador decimal
      cleanValue = cleanValue.slice(0, lastComma) + '.' + cleanValue.slice(lastComma + 1);
      cleanValue = cleanValue.replace(/,/g, ''); // Remove outras vírgulas
    }

    const parsed = parseFloat(cleanValue);
    
    if (isNaN(parsed)) {
      console.warn(`Não foi possível converter "${valueStr}" para número`);
      return 0;
    }

    return forceInteger ? Math.round(parsed) : parsed;
  }

  /**
   * Remove separadores de milhares mantendo apenas o separador decimal
   */
  private static removeThousandsSeparators(value: string): string {
    // Identifica padrões de separadores de milhares
    // Ex: 1.000,50 -> 1000,50
    // Ex: 1,000.50 -> 1000.50
    // Ex: 1.000 -> 1000
    
    const dotCount = (value.match(/\./g) || []).length;
    const commaCount = (value.match(/,/g) || []).length;
    
    // Se há apenas pontos e são múltiplos de 3 posições, são separadores de milhares
    if (dotCount > 0 && commaCount === 0) {
      const parts = value.split('.');
      if (parts.length > 1) {
        const lastPart = parts[parts.length - 1];
        if (lastPart.length === 3 && parts.length > 2) {
          // Múltiplos pontos com grupos de 3: separadores de milhares
          return value.replace(/\./g, '');
        } else if (lastPart.length <= 2) {
          // Último grupo pequeno: provavelmente decimal
          const integerPart = parts.slice(0, -1).join('');
          return integerPart + '.' + lastPart;
        }
      }
    }
    
    // Se há vírgulas e pontos, remove pontos (assumindo formato brasileiro)
    if (dotCount > 0 && commaCount > 0) {
      return value.replace(/\./g, '');
    }
    
    return value;
  }

  /**
   * Valida se um valor está no formato esperado
   */
  static validateNumber(valueStr: string): { isValid: boolean; message?: string } {
    if (!valueStr || valueStr.trim() === '') {
      return { isValid: false, message: 'Valor vazio' };
    }

    const cleanValue = valueStr.trim();
    const parsed = this.parseFromCsv(cleanValue);
    
    if (isNaN(parsed)) {
      return { isValid: false, message: 'Formato de número inválido' };
    }

    if (parsed < 0) {
      return { isValid: false, message: 'Valor não pode ser negativo' };
    }

    return { isValid: true };
  }

  /**
   * Detecta se um conjunto de valores são predominantemente inteiros
   */
  static detectIntegerMode(values: string[]): boolean {
    const numbers = values
      .filter(v => v && v.trim())
      .map(v => this.parseFromCsv(v))
      .filter(n => !isNaN(n));

    if (numbers.length === 0) return true;

    const integerCount = numbers.filter(n => Number.isInteger(n)).length;
    return (integerCount / numbers.length) >= 0.9; // 90% threshold
  }
}