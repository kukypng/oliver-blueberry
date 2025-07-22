/**
 * 🚀 SMART CSV PROCESSOR - Processamento Inteligente e Otimizado
 * 
 * Sistema principal que orquestra detecção, mapeamento, validação
 * e processamento de arquivos CSV com máxima flexibilidade.
 */

import { IntelligentCsvDetector, DetectionResult, ColumnMapping } from './intelligentDetector';
import { FlexibleValidator, FlexibleValidationResult } from './flexibleValidator';
import { BudgetInsert } from './validationTypes';

export interface ProcessingOptions {
  userId: string;
  allowPartialData?: boolean;
  autoFillMissing?: boolean;
  strictMode?: boolean;
  batchSize?: number;
  progressCallback?: (progress: number, status: string) => void;
}

export interface ProcessingResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  errors: string[];
  warnings: string[];
  autoFixes: string[];
  data: BudgetInsert[];
  detection: DetectionResult;
  mappings: ColumnMapping[];
  processingTime: number;
}

export interface PreviewResult {
  canProcess: boolean;
  detection: DetectionResult;
  mappings: ColumnMapping[];
  preview: {
    headers: string[];
    rows: any[][];
    mappingPreview: { csvHeader: string; mappedField: string; confidence: number }[];
  };
  suggestions: string[];
  warnings: string[];
}

export class SmartCsvProcessor {
  private detector = new IntelligentCsvDetector();
  private validator = new FlexibleValidator();

  /**
   * Preview do arquivo antes do processamento
   */
  async previewFile(csvText: string): Promise<PreviewResult> {
    const startTime = Date.now();
    
    try {
      // Detecção da estrutura
      const detection = await this.detector.detectStructure(csvText);
      
      // Mapeamento de colunas
      const mappings = this.detector.mapColumns(csvText, detection);
      
      // Preparar preview dos dados
      const preview = this.generatePreview(csvText, detection, mappings);
      
      // Gerar sugestões e avisos
      const { suggestions, warnings } = this.generatePreviewAnalysis(detection, mappings, preview);
      
      return {
        canProcess: detection.confidence > 50 && mappings.length > 0,
        detection,
        mappings,
        preview,
        suggestions,
        warnings
      };
      
    } catch (error) {
      console.error('Erro no preview do arquivo:', error);
      throw new Error(`Falha no preview: ${error.message}`);
    }
  }

  /**
   * Processamento principal do arquivo CSV
   */
  async processFile(csvText: string, options: ProcessingOptions): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    const result: ProcessingResult = {
      success: false,
      totalRows: 0,
      processedRows: 0,
      validRows: 0,
      invalidRows: 0,
      warningRows: 0,
      errors: [],
      warnings: [],
      autoFixes: [],
      data: [],
      detection: {} as DetectionResult,
      mappings: [],
      processingTime: 0
    };

    try {
      // Callback de progresso
      options.progressCallback?.(10, 'Detectando estrutura do arquivo...');
      
      // Etapa 1: Detecção inteligente
      result.detection = await this.detector.detectStructure(csvText);
      
      if (result.detection.confidence < 30) {
        throw new Error('Não foi possível detectar a estrutura do arquivo CSV');
      }

      // Etapa 2: Mapeamento de colunas
      options.progressCallback?.(20, 'Mapeando colunas...');
      result.mappings = this.detector.mapColumns(csvText, result.detection);
      
      // Etapa 3: Preparação dos dados
      options.progressCallback?.(30, 'Preparando dados para processamento...');
      const rawData = this.extractData(csvText, result.detection, result.mappings);
      result.totalRows = rawData.length;

      if (result.totalRows === 0) {
        throw new Error('Nenhuma linha de dados encontrada no arquivo');
      }

      // Etapa 4: Processamento em lotes para performance
      const batchSize = options.batchSize || 100;
      const batches = this.createBatches(rawData, batchSize);
      
      let processedCount = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const progress = 30 + ((i / batches.length) * 60);
        
        options.progressCallback?.(
          progress, 
          `Processando lote ${i + 1} de ${batches.length}...`
        );
        
        // Validação do lote
        const batchResults = this.validator.validateBatch(batch);
        
        for (const validationResult of batchResults) {
          processedCount++;
          result.processedRows = processedCount;
          
          // Coletar estatísticas
          if (validationResult.isValid) {
            result.validRows++;
            
            // Converter para formato de inserção no banco
            const budgetInsert = this.validator.convertToBudgetInsert(
              validationResult.data, 
              options.userId
            );
            result.data.push(budgetInsert);
          } else {
            result.invalidRows++;
          }
          
          if (validationResult.warnings.length > 0) {
            result.warningRows++;
          }
          
          // Coletar erros, avisos e correções
          result.errors.push(...validationResult.errors);
          result.warnings.push(...validationResult.warnings);
          result.autoFixes.push(...validationResult.autoFixes);
        }
        
        // Permitir que a UI respire entre lotes
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      options.progressCallback?.(95, 'Finalizando processamento...');
      
      // Resultado final
      result.success = result.validRows > 0;
      result.processingTime = Date.now() - startTime;
      
      options.progressCallback?.(100, 'Processamento concluído!');
      
      return result;
      
    } catch (error) {
      console.error('Erro no processamento do arquivo:', error);
      result.errors.push(`Erro crítico: ${error.message}`);
      result.processingTime = Date.now() - startTime;
      
      return result;
    }
  }

  /**
   * Processamento rápido para arquivos pequenos
   */
  async quickProcess(csvText: string, userId: string): Promise<ProcessingResult> {
    return this.processFile(csvText, {
      userId,
      allowPartialData: true,
      autoFillMissing: true,
      strictMode: false,
      batchSize: 1000
    });
  }

  /**
   * Extrai dados do CSV baseado na detecção e mapeamento
   */
  private extractData(csvText: string, detection: DetectionResult, mappings: ColumnMapping[]): any[] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    const dataStartRow = detection.headerRow + (detection.hasHeaders ? 1 : 0);
    const dataLines = lines.slice(dataStartRow);
    
    const results: any[] = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      
      const columns = this.parseRow(line, detection.separator);
      const rowData: any = {};
      
      // Mapear colunas para campos padrão
      for (const mapping of mappings) {
        if (mapping.csvIndex < columns.length && mapping.standardField !== 'unknown') {
          const value = columns[mapping.csvIndex]?.trim();
          if (value && value !== '') {
            rowData[mapping.standardField] = value;
          }
        }
      }
      
      // Apenas adicionar se há dados úteis
      if (Object.keys(rowData).length > 0) {
        results.push(rowData);
      }
    }
    
    return results;
  }

  /**
   * Gera preview dos dados
   */
  private generatePreview(csvText: string, detection: DetectionResult, mappings: ColumnMapping[]): PreviewResult['preview'] {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    const previewLines = lines.slice(0, Math.min(6, lines.length)); // Headers + 5 rows
    
    const headers: string[] = [];
    const rows: any[][] = [];
    
    if (detection.hasHeaders && detection.headerRow < previewLines.length) {
      const headerLine = previewLines[detection.headerRow];
      headers.push(...this.parseRow(headerLine, detection.separator));
    }
    
    const dataStartRow = detection.headerRow + (detection.hasHeaders ? 1 : 0);
    const dataLines = previewLines.slice(dataStartRow);
    
    for (const line of dataLines) {
      const columns = this.parseRow(line, detection.separator);
      rows.push(columns);
    }
    
    // Criar preview do mapeamento
    const mappingPreview = mappings.map(mapping => ({
      csvHeader: mapping.csvHeader,
      mappedField: mapping.standardField,
      confidence: mapping.confidence
    }));
    
    return {
      headers,
      rows,
      mappingPreview
    };
  }

  /**
   * Gera análise do preview com sugestões e avisos
   */
  private generatePreviewAnalysis(
    detection: DetectionResult, 
    mappings: ColumnMapping[], 
    preview: PreviewResult['preview']
  ): { suggestions: string[]; warnings: string[] } {
    
    const suggestions: string[] = [...detection.suggestions];
    const warnings: string[] = [];
    
    // Análise de confiança
    if (detection.confidence < 70) {
      warnings.push(`Confiança na detecção é baixa (${detection.confidence}%). Verifique se o arquivo está no formato correto.`);
    }
    
    // Análise de mapeamentos
    const unmappedColumns = mappings.filter(m => m.standardField === 'unknown').length;
    if (unmappedColumns > 0) {
      warnings.push(`${unmappedColumns} colunas não foram mapeadas automaticamente. Você pode ajustar o mapeamento se necessário.`);
    }
    
    const lowConfidenceColumns = mappings.filter(m => m.confidence < 50).length;
    if (lowConfidenceColumns > 0) {
      suggestions.push(`${lowConfidenceColumns} colunas têm mapeamento de baixa confiança. Revise os mapeamentos sugeridos.`);
    }
    
    // Verificar campos obrigatórios
    const hasDeviceModel = mappings.some(m => m.standardField === 'device_model');
    const hasTotalPrice = mappings.some(m => m.standardField === 'total_price');
    
    if (!hasDeviceModel) {
      warnings.push('Campo obrigatório "Modelo do Aparelho" não foi identificado. Certifique-se de que existe uma coluna com essa informação.');
    }
    
    if (!hasTotalPrice) {
      warnings.push('Campo obrigatório "Preço Total" não foi identificado. Certifique-se de que existe uma coluna com essa informação.');
    }
    
    // Análise de dados
    if (preview.rows.length === 0) {
      warnings.push('Nenhuma linha de dados encontrada. Verifique se o arquivo contém dados além dos cabeçalhos.');
    } else if (preview.rows.length < 3) {
      suggestions.push('Arquivo parece ter poucos dados. Certifique-se de que todas as informações foram incluídas.');
    }
    
    return { suggestions, warnings };
  }

  /**
   * Cria lotes para processamento otimizado
   */
  private createBatches<T>(data: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    
    return batches;
  }

  /**
   * Parse de linha CSV considerando aspas e separadores
   */
  private parseRow(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Aspas duplas escapadas
          current += '"';
          i++; // Pula a próxima aspa
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === separator && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
      
      i++;
    }
    
    result.push(current.trim());
    return result.map(col => col.replace(/^"|"$/g, ''));
  }

  /**
   * Métodos utilitários para estatísticas
   */
  getSuccessRate(result: ProcessingResult): number {
    if (result.totalRows === 0) return 0;
    return (result.validRows / result.totalRows) * 100;
  }

  getWarningRate(result: ProcessingResult): number {
    if (result.totalRows === 0) return 0;
    return (result.warningRows / result.totalRows) * 100;
  }

  formatProcessingTime(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }
}