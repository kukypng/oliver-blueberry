/**
 * Conversor de Valores CSV
 * Responsável por converter valores entre CSV (reais) e banco (centavos)
 */

import { DatabaseValueConverter } from './databaseValueConverter';
import { NumberUtils } from './numberUtils';

export class CsvValueConverter {
  /**
   * Converte valor CSV (reais) para banco (centavos)
   * Exemplo: "2589" (CSV) → 258900 (banco)
   */
  static csvToDatabase(csvValue: string | number): number {
    let numericValue: number;
    
    if (typeof csvValue === 'string') {
      numericValue = NumberUtils.parseFromCsv(csvValue);
    } else {
      numericValue = csvValue;
    }
    
    if (!numericValue || isNaN(numericValue)) return 0;
    
    // Valores CSV devem estar em reais
    const centavos = DatabaseValueConverter.reaisToCentavos(numericValue);
    console.log(`CsvValueConverter: CSV "${csvValue}" → ${numericValue} reais → ${centavos} centavos`);
    
    return centavos;
  }

  /**
   * Converte valor do banco (centavos) para CSV (reais)
   * Exemplo: 258900 (banco) → "2589" (CSV)
   */
  static databaseToCsv(databaseValue: number, forceInteger: boolean = true): string {
    if (!databaseValue || isNaN(databaseValue)) return "0";
    
    // Converter centavos para reais
    const reais = DatabaseValueConverter.centavosToReais(databaseValue);
    
    // Formatar para CSV
    const csvValue = NumberUtils.formatForCsv(reais, forceInteger);
    console.log(`CsvValueConverter: ${databaseValue} centavos → ${reais} reais → "${csvValue}" CSV`);
    
    return csvValue;
  }

  /**
   * Processa um array de valores CSV para o banco
   */
  static processCsvValues(csvValues: (string | number)[]): number[] {
    return csvValues.map(value => this.csvToDatabase(value));
  }

  /**
   * Processa um array de valores do banco para CSV
   */
  static processDatabaseValues(databaseValues: number[], forceInteger: boolean = true): string[] {
    return databaseValues.map(value => this.databaseToCsv(value, forceInteger));
  }

  /**
   * Detecta se valores CSV estão na escala correta
   * Retorna sugestões de correção se necessário
   */
  static validateCsvValues(csvValues: (string | number)[]): {
    isValid: boolean;
    suggestions: string[];
    correctedValues?: number[];
  } {
    const numericValues = csvValues.map(val => 
      typeof val === 'string' ? NumberUtils.parseFromCsv(val) : val
    ).filter(val => !isNaN(val) && val > 0);

    if (numericValues.length === 0) {
      return { isValid: true, suggestions: [] };
    }

    const suggestions: string[] = [];
    let correctedValues: number[] | undefined;

    // Verificar se valores parecem estar em centavos
    const possibleCentavosCount = numericValues.filter(val => val > 10000).length;
    const totalCount = numericValues.length;

    if (possibleCentavosCount > totalCount * 0.8) {
      suggestions.push('Os valores parecem estar em centavos. Será aplicada conversão automática.');
      correctedValues = numericValues.map(val => DatabaseValueConverter.centavosToReais(val));
    }

    // Verificar valores suspeitos (muito baixos ou muito altos)
    const suspiciousLow = numericValues.filter(val => val < 10).length;
    const suspiciousHigh = numericValues.filter(val => val > 100000).length;

    if (suspiciousLow > 0) {
      suggestions.push(`${suspiciousLow} valores parecem muito baixos (< R$ 10). Verifique se estão corretos.`);
    }

    if (suspiciousHigh > 0) {
      suggestions.push(`${suspiciousHigh} valores parecem muito altos (> R$ 100.000). Verifique se estão corretos.`);
    }

    return {
      isValid: suggestions.length === 0,
      suggestions,
      correctedValues
    };
  }

  /**
   * Aplica correções automáticas nos valores CSV
   */
  static applyCsvCorrections(csvValues: (string | number)[]): {
    originalValues: (string | number)[];
    correctedValues: number[];
    corrections: string[];
  } {
    const validation = this.validateCsvValues(csvValues);
    const corrections: string[] = [];

    let correctedValues: number[];

    if (validation.correctedValues) {
      correctedValues = validation.correctedValues;
      corrections.push('Conversão automática de centavos para reais aplicada');
    } else {
      correctedValues = csvValues.map(val => 
        typeof val === 'string' ? NumberUtils.parseFromCsv(val) : val
      );
    }

    // Aplicar outras correções
    correctedValues = correctedValues.map(val => {
      if (val < 0) {
        corrections.push(`Valor negativo (${val}) convertido para positivo`);
        return Math.abs(val);
      }
      return val;
    });

    return {
      originalValues: csvValues,
      correctedValues,
      corrections
    };
  }
}