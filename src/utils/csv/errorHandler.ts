/**
 * ✅ SISTEMA UNIFICADO DE TRATAMENTO DE ERROS
 * 
 * Padroniza mensagens de erro e warnings em todo o sistema CSV
 */

export interface ErrorInfo {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  details?: any;
  line?: number;
  field?: string;
}

export class CsvErrorHandler {
  private errors: ErrorInfo[] = [];

  addError(code: string, message: string, details?: any, line?: number, field?: string): void {
    this.errors.push({
      type: 'error',
      code,
      message,
      details,
      line,
      field
    });
  }

  addWarning(code: string, message: string, details?: any, line?: number, field?: string): void {
    this.errors.push({
      type: 'warning',
      code,
      message,
      details,
      line,
      field
    });
  }

  addInfo(code: string, message: string, details?: any): void {
    this.errors.push({
      type: 'info',
      code,
      message,
      details
    });
  }

  getErrors(): ErrorInfo[] {
    return this.errors.filter(e => e.type === 'error');
  }

  getWarnings(): ErrorInfo[] {
    return this.errors.filter(e => e.type === 'warning');
  }

  getInfos(): ErrorInfo[] {
    return this.errors.filter(e => e.type === 'info');
  }

  hasErrors(): boolean {
    return this.getErrors().length > 0;
  }

  hasWarnings(): boolean {
    return this.getWarnings().length > 0;
  }

  clear(): void {
    this.errors = [];
  }

  /**
   * Gera mensagem de erro user-friendly
   */
  formatUserMessage(): string {
    const errors = this.getErrors();
    const warnings = this.getWarnings();

    if (errors.length === 0 && warnings.length === 0) {
      return '';
    }

    let message = '';

    if (errors.length > 0) {
      message += `❌ Encontrados ${errors.length} erro${errors.length > 1 ? 's' : ''}:\n`;
      errors.slice(0, 5).forEach(error => {
        const lineInfo = error.line ? ` (linha ${error.line})` : '';
        message += `• ${error.message}${lineInfo}\n`;
      });
      
      if (errors.length > 5) {
        message += `• ... e mais ${errors.length - 5} erro${errors.length - 5 > 1 ? 's' : ''}\n`;
      }
    }

    if (warnings.length > 0) {
      message += `\n⚠️ ${warnings.length} aviso${warnings.length > 1 ? 's' : ''}:\n`;
      warnings.slice(0, 3).forEach(warning => {
        const lineInfo = warning.line ? ` (linha ${warning.line})` : '';
        message += `• ${warning.message}${lineInfo}\n`;
      });
      
      if (warnings.length > 3) {
        message += `• ... e mais ${warnings.length - 3} aviso${warnings.length - 3 > 1 ? 's' : ''}\n`;
      }
    }

    return message.trim();
  }

  /**
   * Códigos de erro padronizados
   */
  static ERROR_CODES = {
    HEADER_NOT_FOUND: 'HEADER_NOT_FOUND',
    INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
    REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
    INVALID_NUMBER: 'INVALID_NUMBER',
    INVALID_PRICE: 'INVALID_PRICE',
    EMPTY_FILE: 'EMPTY_FILE',
    NO_DATA_ROWS: 'NO_DATA_ROWS',
    FINANCIAL_CALCULATION_ERROR: 'FINANCIAL_CALCULATION_ERROR'
  } as const;

  /**
   * Mensagens padronizadas user-friendly
   */
  static getStandardMessage(code: string, details?: any): string {
    const messages = {
      [this.ERROR_CODES.HEADER_NOT_FOUND]: 
        'Cabeçalho não encontrado. Verifique se o arquivo contém os campos obrigatórios: Tipo Aparelho, Modelo Aparelho, Preco Total.',
      
      [this.ERROR_CODES.INVALID_FILE_FORMAT]: 
        'Formato de arquivo inválido. Use um arquivo CSV com separador ponto e vírgula (;).',
      
      [this.ERROR_CODES.REQUIRED_FIELD_MISSING]: 
        `Campo obrigatório não preenchido: ${details?.field || 'desconhecido'}.`,
      
      [this.ERROR_CODES.INVALID_NUMBER]: 
        `Valor numérico inválido no campo "${details?.field || 'desconhecido'}". Use números com vírgula para decimais.`,
      
      [this.ERROR_CODES.INVALID_PRICE]: 
        'Preço total deve ser um valor maior que zero.',
      
      [this.ERROR_CODES.EMPTY_FILE]: 
        'Arquivo vazio ou não foi possível ler o conteúdo.',
      
      [this.ERROR_CODES.NO_DATA_ROWS]: 
        'Arquivo não contém dados para importar além do cabeçalho.',
      
      [this.ERROR_CODES.FINANCIAL_CALCULATION_ERROR]: 
        'Erro no cálculo de valores financeiros. Verifique os preços informados.'
    };

    return messages[code] || `Erro não identificado: ${code}`;
  }
}

/**
 * Instância global para uso em todo o sistema
 */
export const csvErrorHandler = new CsvErrorHandler();