/**
 * Sistema Universal de Parsing
 * 
 * Parser unificado que suporta múltiplos formatos de dados
 * com validação avançada e transformação de dados.
 */

import { SupportedFormat, FormatDetectionResult } from './formatDetector';
import * as XLSX from 'xlsx';

export interface ParseConfig {
  format: SupportedFormat;
  encoding?: string;
  delimiter?: string;
  hasHeader?: boolean;
  sheetName?: string; // Para Excel
  rootElement?: string; // Para XML/JSON
  skipRows?: number;
  maxRows?: number;
  columns?: string[]; // Colunas específicas para processar
}

export interface ParseResult<T = any> {
  data: T[];
  headers: string[];
  metadata: ParseMetadata;
  errors: ParseError[];
  warnings: ParseWarning[];
}

export interface ParseMetadata {
  totalRows: number;
  processedRows: number;
  skippedRows: number;
  format: SupportedFormat;
  encoding: string;
  processingTime: number;
  fileSize: number;
  sheetNames?: string[]; // Para Excel
}

export interface ParseError {
  row: number;
  column?: string;
  message: string;
  severity: 'error' | 'warning';
  code: string;
}

export interface ParseWarning {
  row?: number;
  column?: string;
  message: string;
  suggestion?: string;
}

export interface ValidationRule {
  field: string;
  type: 'required' | 'type' | 'format' | 'range' | 'custom';
  params?: any;
  message?: string;
  validator?: (value: any, row: any) => boolean | string;
}

export interface FieldMapping {
  source: string;
  target: string;
  transform?: (value: any) => any;
  defaultValue?: any;
}

export class UniversalParser {
  private startTime: number = 0;

  /**
   * Parse principal que detecta formato e aplica parser apropriado
   */
  async parse<T = any>(
    file: File, 
    config?: Partial<ParseConfig>
  ): Promise<ParseResult<T>> {
    this.startTime = Date.now();
    
    try {
      // Auto-detectar formato se não especificado
      const finalConfig = await this.prepareConfig(file, config);
      
      // Aplicar parser específico baseado no formato
      switch (finalConfig.format) {
        case SupportedFormat.CSV:
        case SupportedFormat.TSV:
          return await this.parseCSV<T>(file, finalConfig);
        case SupportedFormat.EXCEL:
          return await this.parseExcel<T>(file, finalConfig);
        case SupportedFormat.JSON:
          return await this.parseJSON<T>(file, finalConfig);
        case SupportedFormat.XML:
          return await this.parseXML<T>(file, finalConfig);
        default:
          throw new Error(`Formato não suportado: ${finalConfig.format}`);
      }
    } catch (error) {
      return this.createErrorResult<T>(file, error as Error);
    }
  }

  /**
   * Valida dados contra regras específicas
   */
  validate(data: any[], rules: ValidationRule[]): { isValid: boolean; errors: ParseError[] } {
    const errors: ParseError[] = [];
    
    data.forEach((row, rowIndex) => {
      rules.forEach(rule => {
        const value = row[rule.field];
        const error = this.validateField(value, rule, rowIndex, row);
        if (error) {
          errors.push(error);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Transforma dados aplicando mapeamento de campos
   */
  transform(data: any[], mapping: FieldMapping[]): any[] {
    return data.map(row => {
      const transformedRow: any = {};
      
      mapping.forEach(map => {
        let value = row[map.source];
        
        // Aplicar transformação se definida
        if (map.transform && value !== undefined && value !== null) {
          try {
            value = map.transform(value);
          } catch (error) {
            console.warn(`Erro na transformação do campo ${map.source}:`, error);
            value = map.defaultValue;
          }
        }
        
        // Usar valor padrão se necessário
        if ((value === undefined || value === null || value === '') && map.defaultValue !== undefined) {
          value = map.defaultValue;
        }
        
        transformedRow[map.target] = value;
      });
      
      return transformedRow;
    });
  }

  /**
   * Parser específico para CSV/TSV
   */
  private async parseCSV<T>(file: File, config: ParseConfig): Promise<ParseResult<T>> {
    const text = await this.readFileAsText(file, config.encoding || 'utf-8');
    const lines = text.split(/\r\n|\n/).filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error('Arquivo vazio');
    }

    const delimiter = config.delimiter || (config.format === SupportedFormat.TSV ? '\t' : ',');
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];
    
    // Processar cabeçalho
    let startRow = 0;
    let headers: string[] = [];
    
    if (config.hasHeader !== false) {
      headers = this.parseCSVLine(lines[0], delimiter);
      startRow = 1;
    } else {
      // Gerar cabeçalhos automáticos
      const firstLine = this.parseCSVLine(lines[0], delimiter);
      headers = firstLine.map((_, index) => `Column_${index + 1}`);
    }

    // Processar dados
    const data: any[] = [];
    const maxRows = config.maxRows || lines.length;
    const skipRows = config.skipRows || 0;
    
    for (let i = startRow + skipRows; i < Math.min(lines.length, startRow + maxRows); i++) {
      try {
        const values = this.parseCSVLine(lines[i], delimiter);
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        data.push(row);
      } catch (error) {
        errors.push({
          row: i + 1,
          message: `Erro ao processar linha: ${(error as Error).message}`,
          severity: 'error',
          code: 'PARSE_ERROR'
        });
      }
    }

    return {
      data: data as T[],
      headers,
      metadata: this.createMetadata(file, config, data.length, lines.length),
      errors,
      warnings
    };
  }

  /**
   * Parser específico para Excel
   */
  private async parseExcel<T>(file: File, config: ParseConfig): Promise<ParseResult<T>> {
    const buffer = await this.readFileAsArrayBuffer(file);
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Selecionar planilha
    const sheetName = config.sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`Planilha "${sheetName}" não encontrada`);
    }

    // Converter para JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: config.hasHeader !== false ? 1 : undefined,
      defval: '',
      blankrows: false
    });

    const headers = Object.keys(jsonData[0] || {});
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    // Aplicar filtros se especificados
    let processedData = jsonData;
    if (config.skipRows) {
      processedData = processedData.slice(config.skipRows);
    }
    if (config.maxRows) {
      processedData = processedData.slice(0, config.maxRows);
    }

    return {
      data: processedData as T[],
      headers,
      metadata: {
        ...this.createMetadata(file, config, processedData.length, jsonData.length),
        sheetNames: workbook.SheetNames
      },
      errors,
      warnings
    };
  }

  /**
   * Parser específico para JSON
   */
  private async parseJSON<T>(file: File, config: ParseConfig): Promise<ParseResult<T>> {
    const text = await this.readFileAsText(file, config.encoding || 'utf-8');
    
    try {
      const jsonData = JSON.parse(text);
      let data: any[] = [];
      
      // Determinar estrutura dos dados
      if (Array.isArray(jsonData)) {
        data = jsonData;
      } else if (config.rootElement && jsonData[config.rootElement]) {
        data = Array.isArray(jsonData[config.rootElement]) 
          ? jsonData[config.rootElement] 
          : [jsonData[config.rootElement]];
      } else {
        // Tentar encontrar array automaticamente
        const arrayKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
        if (arrayKey) {
          data = jsonData[arrayKey];
        } else {
          data = [jsonData]; // Tratar objeto único como array de um elemento
        }
      }

      const headers = data.length > 0 ? Object.keys(data[0]) : [];
      
      // Aplicar filtros
      if (config.skipRows) {
        data = data.slice(config.skipRows);
      }
      if (config.maxRows) {
        data = data.slice(0, config.maxRows);
      }

      return {
        data: data as T[],
        headers,
        metadata: this.createMetadata(file, config, data.length, data.length),
        errors: [],
        warnings: []
      };
    } catch (error) {
      throw new Error(`JSON inválido: ${(error as Error).message}`);
    }
  }

  /**
   * Parser específico para XML
   */
  private async parseXML<T>(file: File, config: ParseConfig): Promise<ParseResult<T>> {
    const text = await this.readFileAsText(file, config.encoding || 'utf-8');
    
    try {
      // Parser XML simples (para casos complexos, usar biblioteca dedicada)
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'text/xml');
      
      // Verificar erros de parsing
      const parseError = xmlDoc.querySelector('parsererror');
      if (parseError) {
        throw new Error('XML inválido: ' + parseError.textContent);
      }

      // Extrair dados (implementação básica)
      const rootElement = config.rootElement || xmlDoc.documentElement.tagName;
      const elements = xmlDoc.querySelectorAll(rootElement);
      
      const data: any[] = [];
      const headersSet = new Set<string>();

      elements.forEach(element => {
        const row: any = {};
        
        // Extrair atributos
        Array.from(element.attributes).forEach(attr => {
          row[attr.name] = attr.value;
          headersSet.add(attr.name);
        });
        
        // Extrair elementos filhos
        Array.from(element.children).forEach(child => {
          row[child.tagName] = child.textContent || '';
          headersSet.add(child.tagName);
        });
        
        if (Object.keys(row).length > 0) {
          data.push(row);
        }
      });

      const headers = Array.from(headersSet);

      return {
        data: data as T[],
        headers,
        metadata: this.createMetadata(file, config, data.length, data.length),
        errors: [],
        warnings: []
      };
    } catch (error) {
      throw new Error(`Erro ao processar XML: ${(error as Error).message}`);
    }
  }

  // Métodos auxiliares
  private async prepareConfig(file: File, config?: Partial<ParseConfig>): Promise<ParseConfig> {
    if (config?.format) {
      return config as ParseConfig;
    }

    // Auto-detectar formato
    const { formatDetector } = await import('./formatDetector');
    const detection = await formatDetector.detectFormat(file);
    
    return {
      format: detection.format,
      encoding: detection.encoding || 'utf-8',
      delimiter: detection.metadata?.delimiter,
      hasHeader: detection.metadata?.hasHeader,
      ...config
    };
  }

  private validateField(value: any, rule: ValidationRule, rowIndex: number, row: any): ParseError | null {
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          return {
            row: rowIndex + 1,
            column: rule.field,
            message: rule.message || `Campo obrigatório: ${rule.field}`,
            severity: 'error',
            code: 'REQUIRED_FIELD'
          };
        }
        break;
        
      case 'type':
        if (!this.validateType(value, rule.params)) {
          return {
            row: rowIndex + 1,
            column: rule.field,
            message: rule.message || `Tipo inválido para ${rule.field}. Esperado: ${rule.params}`,
            severity: 'error',
            code: 'INVALID_TYPE'
          };
        }
        break;
        
      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value, row);
          if (result !== true) {
            return {
              row: rowIndex + 1,
              column: rule.field,
              message: typeof result === 'string' ? result : (rule.message || `Validação falhou para ${rule.field}`),
              severity: 'error',
              code: 'CUSTOM_VALIDATION'
            };
          }
        }
        break;
    }
    
    return null;
  }

  private validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'number':
        return !isNaN(Number(value));
      case 'string':
        return typeof value === 'string';
      case 'boolean':
        return typeof value === 'boolean' || value === 'true' || value === 'false';
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }

  private parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  private createMetadata(
    file: File, 
    config: ParseConfig, 
    processedRows: number, 
    totalRows: number
  ): ParseMetadata {
    return {
      totalRows,
      processedRows,
      skippedRows: totalRows - processedRows,
      format: config.format,
      encoding: config.encoding || 'utf-8',
      processingTime: Date.now() - this.startTime,
      fileSize: file.size
    };
  }

  private createErrorResult<T>(file: File, error: Error): ParseResult<T> {
    return {
      data: [],
      headers: [],
      metadata: {
        totalRows: 0,
        processedRows: 0,
        skippedRows: 0,
        format: SupportedFormat.CSV,
        encoding: 'utf-8',
        processingTime: Date.now() - this.startTime,
        fileSize: file.size
      },
      errors: [{
        row: 0,
        message: error.message,
        severity: 'error',
        code: 'PARSE_FAILED'
      }],
      warnings: []
    };
  }

  private async readFileAsText(file: File, encoding: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, encoding);
    });
  }

  private async readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }
}

// Instância singleton
export const universalParser = new UniversalParser();