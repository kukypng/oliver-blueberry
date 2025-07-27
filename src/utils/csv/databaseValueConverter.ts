/**
 * Conversor de Valores do Banco de Dados
 * Responsável por converter valores entre centavos (banco) e reais (exibição)
 */

export class DatabaseValueConverter {
  /**
   * Converte valor do banco (centavos) para exibição (reais)
   * Exemplo: 258900 (centavos) → 2589 (reais)
   */
  static centavosToReais(centavos: number): number {
    if (!centavos || isNaN(centavos)) return 0;
    
    // Se o valor é menor que 100, provavelmente já está em reais
    if (centavos < 100) {
      console.warn(`Valor suspeito detectado: ${centavos}. Pode já estar em reais.`);
      return centavos;
    }
    
    const reais = centavos / 100;
    console.log(`DatabaseValueConverter: ${centavos} centavos → ${reais} reais`);
    return Math.round(reais); // Retorna inteiro para compatibilidade
  }

  /**
   * Converte valor de exibição (reais) para banco (centavos)
   * Exemplo: 2589 (reais) → 258900 (centavos)
   */
  static reaisToCentavos(reais: number): number {
    if (!reais || isNaN(reais)) return 0;
    
    // Se o valor é muito alto, pode já estar em centavos
    if (reais > 100000) {
      console.warn(`Valor suspeito detectado: ${reais}. Pode já estar em centavos.`);
      return reais;
    }
    
    const centavos = Math.round(reais * 100);
    console.log(`DatabaseValueConverter: ${reais} reais → ${centavos} centavos`);
    return centavos;
  }

  /**
   * Detecta automaticamente se um valor está em reais ou centavos
   * Baseado na magnitude do valor
   */
  static detectValueScale(value: number): 'reais' | 'centavos' {
    if (!value || isNaN(value)) return 'reais';
    
    // Se o valor é maior que 10000, provavelmente está em centavos
    // Exemplo: 258900 (centavos) vs 2589 (reais)
    if (value > 10000) {
      return 'centavos';
    }
    
    return 'reais';
  }

  /**
   * Normaliza um valor para reais, independente da escala de entrada
   */
  static normalizeToReais(value: number): number {
    const scale = this.detectValueScale(value);
    
    if (scale === 'centavos') {
      return this.centavosToReais(value);
    }
    
    return Math.round(value); // Já está em reais, apenas arredonda
  }

  /**
   * Normaliza um valor para centavos, independente da escala de entrada
   */
  static normalizeToCentavos(value: number): number {
    const scale = this.detectValueScale(value);
    
    if (scale === 'reais') {
      return this.reaisToCentavos(value);
    }
    
    return Math.round(value); // Já está em centavos, apenas arredonda
  }

  /**
   * Valida se um valor está na escala esperada
   */
  static validateScale(value: number, expectedScale: 'reais' | 'centavos'): boolean {
    const detectedScale = this.detectValueScale(value);
    return detectedScale === expectedScale;
  }

  /**
   * Formata valor para exibição em reais
   */
  static formatReais(value: number): string {
    const reais = this.normalizeToReais(value);
    return `R$ ${reais.toLocaleString('pt-BR')}`;
  }
}