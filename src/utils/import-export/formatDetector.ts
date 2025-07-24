/**
 * Sistema Avançado de Detecção de Formatos
 * 
 * Detecta automaticamente o formato de arquivos de dados e valida
 * compatibilidade com o sistema de importação/exportação.
 */

export enum SupportedFormat {
  CSV = 'csv',
  EXCEL = 'xlsx',
  JSON = 'json',
  XML = 'xml',
  TSV = 'tsv'
}

export interface FormatDetectionResult {
  format: SupportedFormat;
  confidence: number; // 0-1
  encoding?: string;
  delimiter?: string;
  hasHeader?: boolean;
  metadata?: FormatMetadata;
}

export interface FormatMetadata {
  fileSize: number;
  estimatedRows?: number;
  sheetNames?: string[]; // Para Excel
  rootElements?: string[]; // Para XML/JSON
  encoding: string;
  bom?: boolean; // Byte Order Mark
  delimiter?: string; // Para CSV/TSV
  hasHeader?: boolean; // Para CSV/TSV
}

export interface FormatValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class FormatDetector {
  private static readonly MAGIC_NUMBERS = {
    // Excel (XLSX) - ZIP signature
    XLSX: [0x50, 0x4B, 0x03, 0x04],
    // Excel (XLS) - OLE signature  
    XLS: [0xD0, 0xCF, 0x11, 0xE0],
    // UTF-8 BOM
    UTF8_BOM: [0xEF, 0xBB, 0xBF],
    // UTF-16 BOM
    UTF16_BOM: [0xFF, 0xFE]
  };

  private static readonly CSV_DELIMITERS = [',', ';', '\t', '|'];
  private static readonly ENCODING_PATTERNS = {
    UTF8: /^[\x00-\x7F]|[\xC2-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}$/,
    LATIN1: /^[\x00-\xFF]*$/
  };

  /**
   * Detecta o formato de um arquivo automaticamente
   */
  async detectFormat(file: File): Promise<FormatDetectionResult> {
    const buffer = await this.readFileBuffer(file, 1024); // Primeiros 1KB
    const bytes = new Uint8Array(buffer);
    
    // Detectar encoding e BOM
    const encoding = this.detectEncoding(bytes);
    const hasBOM = this.detectBOM(bytes);
    
    // Detectar formato por magic numbers
    const magicFormat = this.detectByMagicNumbers(bytes);
    if (magicFormat) {
      return {
        format: magicFormat,
        confidence: 0.95,
        encoding,
        metadata: {
          fileSize: file.size,
          encoding,
          bom: hasBOM
        }
      };
    }

    // Detectar formato por extensão e conteúdo
    const extensionFormat = this.detectByExtension(file.name);
    const contentFormat = await this.detectByContent(file, encoding);
    
    // Combinar resultados para determinar formato mais provável
    return this.combineDetectionResults(extensionFormat, contentFormat, {
      fileSize: file.size,
      encoding,
      bom: hasBOM
    });
  }

  /**
   * Valida se um arquivo está no formato esperado
   */
  async validateFormat(file: File, expectedFormat: SupportedFormat): Promise<FormatValidationResult> {
    const detection = await this.detectFormat(file);
    const result: FormatValidationResult = {
      isValid: detection.format === expectedFormat,
      errors: [],
      warnings: [],
      suggestions: []
    };

    if (!result.isValid) {
      result.errors.push(
        `Formato esperado: ${expectedFormat}, detectado: ${detection.format}`
      );
      
      if (detection.confidence < 0.8) {
        result.warnings.push(
          `Detecção de formato com baixa confiança (${Math.round(detection.confidence * 100)}%)`
        );
      }

      result.suggestions.push(
        `Considere converter o arquivo para ${expectedFormat} ou verificar a extensão`
      );
    }

    // Validações específicas por formato
    await this.validateFormatSpecific(file, expectedFormat, result);

    return result;
  }

  /**
   * Retorna lista de formatos suportados
   */
  getSupportedFormats(): SupportedFormat[] {
    return Object.values(SupportedFormat);
  }

  /**
   * Detecta encoding do arquivo
   */
  private detectEncoding(bytes: Uint8Array): string {
    // Verificar BOM UTF-8
    if (this.matchesSignature(bytes, FormatDetector.MAGIC_NUMBERS.UTF8_BOM)) {
      return 'utf-8';
    }

    // Verificar BOM UTF-16
    if (this.matchesSignature(bytes, FormatDetector.MAGIC_NUMBERS.UTF16_BOM)) {
      return 'utf-16le';
    }

    // Análise heurística do conteúdo
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    
    // Verificar se é UTF-8 válido
    if (FormatDetector.ENCODING_PATTERNS.UTF8.test(text)) {
      return 'utf-8';
    }

    // Fallback para Latin-1
    return 'latin1';
  }

  /**
   * Detecta presença de BOM
   */
  private detectBOM(bytes: Uint8Array): boolean {
    return this.matchesSignature(bytes, FormatDetector.MAGIC_NUMBERS.UTF8_BOM) ||
           this.matchesSignature(bytes, FormatDetector.MAGIC_NUMBERS.UTF16_BOM);
  }

  /**
   * Detecta formato por magic numbers
   */
  private detectByMagicNumbers(bytes: Uint8Array): SupportedFormat | null {
    if (this.matchesSignature(bytes, FormatDetector.MAGIC_NUMBERS.XLSX)) {
      return SupportedFormat.EXCEL;
    }
    
    if (this.matchesSignature(bytes, FormatDetector.MAGIC_NUMBERS.XLS)) {
      return SupportedFormat.EXCEL;
    }

    return null;
  }

  /**
   * Detecta formato por extensão do arquivo
   */
  private detectByExtension(filename: string): { format: SupportedFormat; confidence: number } | null {
    const extension = filename.toLowerCase().split('.').pop();
    
    const extensionMap: Record<string, { format: SupportedFormat; confidence: number }> = {
      'csv': { format: SupportedFormat.CSV, confidence: 0.8 },
      'xlsx': { format: SupportedFormat.EXCEL, confidence: 0.9 },
      'xls': { format: SupportedFormat.EXCEL, confidence: 0.9 },
      'json': { format: SupportedFormat.JSON, confidence: 0.8 },
      'xml': { format: SupportedFormat.XML, confidence: 0.8 },
      'tsv': { format: SupportedFormat.TSV, confidence: 0.8 },
      'txt': { format: SupportedFormat.CSV, confidence: 0.3 }
    };

    return extensionMap[extension || ''] || null;
  }

  /**
   * Detecta formato analisando o conteúdo
   */
  private async detectByContent(file: File, encoding: string): Promise<{ format: SupportedFormat; confidence: number; metadata?: any } | null> {
    const text = await this.readFileText(file, encoding, 2048); // Primeiros 2KB
    
    // Detectar JSON
    if (this.looksLikeJSON(text)) {
      return {
        format: SupportedFormat.JSON,
        confidence: 0.9,
        metadata: { rootElements: this.extractJSONRootElements(text) }
      };
    }

    // Detectar XML
    if (this.looksLikeXML(text)) {
      return {
        format: SupportedFormat.XML,
        confidence: 0.9,
        metadata: { rootElements: this.extractXMLRootElements(text) }
      };
    }

    // Detectar CSV/TSV
    const csvAnalysis = this.analyzeCSVContent(text);
    if (csvAnalysis.confidence > 0.5) {
      return {
        format: csvAnalysis.delimiter === '\t' ? SupportedFormat.TSV : SupportedFormat.CSV,
        confidence: csvAnalysis.confidence,
        metadata: {
          delimiter: csvAnalysis.delimiter,
          hasHeader: csvAnalysis.hasHeader,
          estimatedRows: csvAnalysis.estimatedRows
        }
      };
    }

    return null;
  }

  /**
   * Combina resultados de diferentes métodos de detecção
   */
  private combineDetectionResults(
    extensionResult: { format: SupportedFormat; confidence: number } | null,
    contentResult: { format: SupportedFormat; confidence: number; metadata?: any } | null,
    baseMetadata: Partial<FormatMetadata>
  ): FormatDetectionResult {
    
    // Se ambos concordam, alta confiança
    if (extensionResult && contentResult && extensionResult.format === contentResult.format) {
      return {
        format: extensionResult.format,
        confidence: Math.min(0.95, (extensionResult.confidence + contentResult.confidence) / 2 + 0.2),
        encoding: baseMetadata.encoding,
        metadata: {
          ...baseMetadata,
          ...contentResult.metadata
        } as FormatMetadata
      };
    }

    // Priorizar conteúdo se confiança for alta
    if (contentResult && contentResult.confidence > 0.8) {
      return {
        format: contentResult.format,
        confidence: contentResult.confidence,
        encoding: baseMetadata.encoding,
        metadata: {
          ...baseMetadata,
          ...contentResult.metadata
        } as FormatMetadata
      };
    }

    // Fallback para extensão
    if (extensionResult) {
      return {
        format: extensionResult.format,
        confidence: extensionResult.confidence * 0.8, // Reduzir confiança
        encoding: baseMetadata.encoding,
        metadata: baseMetadata as FormatMetadata
      };
    }

    // Fallback padrão para CSV
    return {
      format: SupportedFormat.CSV,
      confidence: 0.3,
      encoding: baseMetadata.encoding,
      metadata: baseMetadata as FormatMetadata
    };
  }

  /**
   * Validações específicas por formato
   */
  private async validateFormatSpecific(
    file: File, 
    format: SupportedFormat, 
    result: FormatValidationResult
  ): Promise<void> {
    switch (format) {
      case SupportedFormat.CSV:
      case SupportedFormat.TSV:
        await this.validateCSV(file, result);
        break;
      case SupportedFormat.EXCEL:
        await this.validateExcel(file, result);
        break;
      case SupportedFormat.JSON:
        await this.validateJSON(file, result);
        break;
      case SupportedFormat.XML:
        await this.validateXML(file, result);
        break;
    }
  }

  // Métodos auxiliares de validação
  private async validateCSV(file: File, result: FormatValidationResult): Promise<void> {
    try {
      const text = await this.readFileText(file, 'utf-8', 1024);
      const analysis = this.analyzeCSVContent(text);
      
      if (analysis.confidence < 0.5) {
        result.warnings.push('Arquivo não parece ser um CSV válido');
      }
      
      if (!analysis.hasHeader) {
        result.warnings.push('Arquivo pode não ter cabeçalho');
      }
    } catch (error) {
      result.errors.push('Erro ao validar CSV: ' + (error as Error).message);
    }
  }

  private async validateExcel(file: File, result: FormatValidationResult): Promise<void> {
    if (file.size > 50 * 1024 * 1024) { // 50MB
      result.warnings.push('Arquivo Excel muito grande, processamento pode ser lento');
    }
  }

  private async validateJSON(file: File, result: FormatValidationResult): Promise<void> {
    try {
      const text = await this.readFileText(file, 'utf-8');
      JSON.parse(text);
    } catch (error) {
      result.errors.push('JSON inválido: ' + (error as Error).message);
    }
  }

  private async validateXML(file: File, result: FormatValidationResult): Promise<void> {
    try {
      const text = await this.readFileText(file, 'utf-8', 1024);
      if (!text.trim().startsWith('<')) {
        result.errors.push('XML deve começar com uma tag');
      }
    } catch (error) {
      result.errors.push('Erro ao validar XML: ' + (error as Error).message);
    }
  }

  // Métodos utilitários
  private async readFileBuffer(file: File, maxBytes?: number): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      
      const blob = maxBytes ? file.slice(0, maxBytes) : file;
      reader.readAsArrayBuffer(blob);
    });
  }

  private async readFileText(file: File, encoding: string, maxBytes?: number): Promise<string> {
    const buffer = await this.readFileBuffer(file, maxBytes);
    return new TextDecoder(encoding).decode(buffer);
  }

  private matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
    if (bytes.length < signature.length) return false;
    return signature.every((byte, index) => bytes[index] === byte);
  }

  private looksLikeJSON(text: string): boolean {
    const trimmed = text.trim();
    return (trimmed.startsWith('{') && trimmed.includes('}')) ||
           (trimmed.startsWith('[') && trimmed.includes(']'));
  }

  private looksLikeXML(text: string): boolean {
    const trimmed = text.trim();
    return trimmed.startsWith('<') && trimmed.includes('>');
  }

  private analyzeCSVContent(text: string): {
    confidence: number;
    delimiter: string;
    hasHeader: boolean;
    estimatedRows: number;
  } {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { confidence: 0, delimiter: ',', hasHeader: false, estimatedRows: 0 };
    }

    // Detectar delimitador mais provável
    let bestDelimiter = ',';
    let bestScore = 0;

    for (const delimiter of FormatDetector.CSV_DELIMITERS) {
      const firstLineCount = (lines[0].match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      const secondLineCount = (lines[1].match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      
      if (firstLineCount > 0 && firstLineCount === secondLineCount) {
        const score = firstLineCount;
        if (score > bestScore) {
          bestScore = score;
          bestDelimiter = delimiter;
        }
      }
    }

    // Verificar se primeira linha parece cabeçalho
    const firstLine = lines[0].split(bestDelimiter);
    const hasHeader = firstLine.some(cell => 
      isNaN(Number(cell.trim())) && cell.trim().length > 0
    );

    const confidence = bestScore > 0 ? Math.min(0.9, bestScore / 10 + 0.5) : 0.2;

    return {
      confidence,
      delimiter: bestDelimiter,
      hasHeader,
      estimatedRows: lines.length
    };
  }

  private extractJSONRootElements(text: string): string[] {
    try {
      const obj = JSON.parse(text.substring(0, 500)); // Amostra pequena
      return Object.keys(obj).slice(0, 5); // Primeiras 5 chaves
    } catch {
      return [];
    }
  }

  private extractXMLRootElements(text: string): string[] {
    const matches = text.match(/<(\w+)[^>]*>/g);
    if (!matches) return [];
    
    return matches
      .map(match => match.replace(/<(\w+)[^>]*>/, '$1'))
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 5);
  }
}

// Instância singleton para uso global
export const formatDetector = new FormatDetector();