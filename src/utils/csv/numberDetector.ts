import { CsvBudgetData } from '@/types/csv';

export interface NumberDetectionResult {
  isIntegerMode: boolean;
  integerCount: number;
  decimalCount: number;
  totalNumbers: number;
  confidence: number;
  recommendations: string[];
}

export class NumberDetector {
  private static readonly INTEGER_THRESHOLD = 0.95; // 95% dos valores devem ser inteiros

  static analyzeData(data: CsvBudgetData[]): NumberDetectionResult {
    if (data.length === 0) {
      return {
        isIntegerMode: true,
        integerCount: 0,
        decimalCount: 0,
        totalNumbers: 0,
        confidence: 1,
        recommendations: []
      };
    }

    let integerCount = 0;
    let decimalCount = 0;
    const recommendations: string[] = [];

    // Analisa preços à vista e parcelado
    data.forEach(item => {
      if (this.isInteger(item.preco_vista)) {
        integerCount++;
      } else {
        decimalCount++;
      }

      if (this.isInteger(item.preco_parcelado)) {
        integerCount++;
      } else {
        decimalCount++;
      }
    });

    const totalNumbers = integerCount + decimalCount;
    const integerRatio = totalNumbers > 0 ? integerCount / totalNumbers : 1;
    const isIntegerMode = integerRatio >= this.INTEGER_THRESHOLD;
    const confidence = Math.abs(integerRatio - 0.5) * 2; // 0 = incerto, 1 = muito certo

    // Gerar recomendações
    if (isIntegerMode && decimalCount > 0) {
      recommendations.push(`Detectados ${decimalCount} valores com centavos. Recomenda-se arredondar para inteiros.`);
    } else if (!isIntegerMode && integerCount > decimalCount) {
      recommendations.push(`Maioria dos valores são inteiros (${integerCount}/${totalNumbers}). Considere usar modo inteiro.`);
    }

    if (confidence < 0.6) {
      recommendations.push('Dados mistos detectados. Verifique se todos os valores estão no formato correto.');
    }

    return {
      isIntegerMode,
      integerCount,
      decimalCount,
      totalNumbers,
      confidence,
      recommendations
    };
  }

  static analyzeNumbers(numbers: number[]): NumberDetectionResult {
    if (numbers.length === 0) {
      return {
        isIntegerMode: true,
        integerCount: 0,
        decimalCount: 0,
        totalNumbers: 0,
        confidence: 1,
        recommendations: []
      };
    }

    let integerCount = 0;
    let decimalCount = 0;

    numbers.forEach(num => {
      if (this.isInteger(num)) {
        integerCount++;
      } else {
        decimalCount++;
      }
    });

    const totalNumbers = numbers.length;
    const integerRatio = integerCount / totalNumbers;
    const isIntegerMode = integerRatio >= this.INTEGER_THRESHOLD;
    const confidence = Math.abs(integerRatio - 0.5) * 2;

    return {
      isIntegerMode,
      integerCount,
      decimalCount,
      totalNumbers,
      confidence,
      recommendations: []
    };
  }

  private static isInteger(value: number): boolean {
    return Number.isInteger(value) || Math.abs(value - Math.round(value)) < 0.001;
  }

  static convertToIntegers(data: CsvBudgetData[]): CsvBudgetData[] {
    return data.map(item => ({
      ...item,
      preco_vista: Math.round(item.preco_vista),
      preco_parcelado: Math.round(item.preco_parcelado)
    }));
  }
}