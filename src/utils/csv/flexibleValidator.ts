/**
 * 🔧 FLEXIBLE VALIDATOR - Sistema de Validação Flexível e Resiliente
 * 
 * Apenas 2 campos obrigatórios, auto-preenchimento inteligente,
 * correção automática e validação progressiva.
 */

import { BudgetInsert, ValidationResult, ParsedRow } from './validationTypes';

export interface ValidationConfig {
  requiredFields: string[];
  autoFillFields: Record<string, (row: any) => any>;
  cleanupRules: Record<string, (value: any) => any>;
  businessRules: Record<string, (value: any, row: any) => ValidationResult>;
}

export interface FlexibleValidationResult {
  isValid: boolean;
  canProceed: boolean; // true se apenas avisos, false se erros críticos
  errors: string[];
  warnings: string[];
  autoFixes: string[];
  data: any;
}

export class FlexibleValidator {
  private config: ValidationConfig = {
    requiredFields: ['device_model', 'total_price'],
    autoFillFields: {
      'device_type': this.inferDeviceType,
      'part_type': () => 'Reparo Geral',
      'issue': () => 'Não informado',
      'status': () => 'pending',
      'workflow_status': () => 'pending',
      'warranty_months': () => 3,
      'payment_condition': () => 'À Vista',
      'installments': () => 1,
      'includes_delivery': () => false,
      'includes_screen_protector': () => false,
    },
    cleanupRules: {
      'total_price': this.cleanPrice,
      'cash_price': this.cleanPrice,
      'installment_price': this.cleanPrice,
      'client_phone': this.cleanPhone,
      'device_model': this.cleanText,
      'device_type': this.cleanText,
      'client_name': this.cleanText,
      'warranty_months': this.cleanNumber,
      'installments': this.cleanNumber,
      'includes_delivery': this.cleanBoolean,
      'includes_screen_protector': this.cleanBoolean,
    },
    businessRules: {
      'total_price': this.validatePrice,
      'cash_price': this.validateOptionalPrice,
      'warranty_months': this.validateWarranty,
      'installments': this.validateInstallments,
      'client_phone': this.validatePhone,
    }
  };

  /**
   * Validação principal - flexível e resiliente
   */
  validateRow(rawData: any, rowIndex: number): FlexibleValidationResult {
    const result: FlexibleValidationResult = {
      isValid: false,
      canProceed: false,
      errors: [],
      warnings: [],
      autoFixes: [],
      data: { ...rawData }
    };

    // Etapa 1: Limpeza automática de dados
    this.cleanupData(result);

    // Etapa 2: Auto-preenchimento inteligente
    this.autoFillMissingFields(result);

    // Etapa 3: Validação de campos obrigatórios
    this.validateRequiredFields(result);

    // Etapa 4: Validação de regras de negócio
    this.validateBusinessRules(result);

    // Etapa 5: Determinação final
    result.isValid = result.errors.length === 0;
    result.canProceed = result.errors.length === 0; // Pode prosseguir mesmo com warnings

    return result;
  }

  /**
   * Validação em lote - otimizada para grandes arquivos
   */
  validateBatch(rawDataArray: any[]): FlexibleValidationResult[] {
    return rawDataArray.map((data, index) => this.validateRow(data, index));
  }

  /**
   * Limpeza automática de dados
   */
  private cleanupData(result: FlexibleValidationResult): void {
    for (const [field, cleanupFn] of Object.entries(this.config.cleanupRules)) {
      if (result.data[field] !== undefined && result.data[field] !== null) {
        const originalValue = result.data[field];
        const cleanedValue = cleanupFn(originalValue);
        
        if (originalValue !== cleanedValue) {
          result.autoFixes.push(`Campo '${field}': '${originalValue}' → '${cleanedValue}'`);
          result.data[field] = cleanedValue;
        }
      }
    }
  }

  /**
   * Auto-preenchimento inteligente
   */
  private autoFillMissingFields(result: FlexibleValidationResult): void {
    for (const [field, autoFillFn] of Object.entries(this.config.autoFillFields)) {
      if (!result.data[field] || result.data[field] === '' || result.data[field] === null) {
        const autoValue = autoFillFn(result.data);
        if (autoValue !== null && autoValue !== undefined) {
          result.data[field] = autoValue;
          result.autoFixes.push(`Campo '${field}' preenchido automaticamente: '${autoValue}'`);
        }
      }
    }
  }

  /**
   * Validação de campos obrigatórios (apenas 2!)
   */
  private validateRequiredFields(result: FlexibleValidationResult): void {
    for (const field of this.config.requiredFields) {
      const value = result.data[field];
      
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && value.trim() === '')) {
        result.errors.push(`Campo obrigatório '${field}' está vazio`);
      }
    }
  }

  /**
   * Validação de regras de negócio
   */
  private validateBusinessRules(result: FlexibleValidationResult): void {
    for (const [field, validationFn] of Object.entries(this.config.businessRules)) {
      if (result.data[field] !== undefined && result.data[field] !== null) {
        const validation = validationFn(result.data[field], result.data);
        
        if (!validation.isValid) {
          result.errors.push(...validation.errors);
        }
        
        if (validation.warnings) {
          result.warnings.push(...validation.warnings);
        }
      }
    }
  }

  // =================================
  // FUNÇÕES DE AUTO-PREENCHIMENTO
  // =================================

  private inferDeviceType(row: any): string {
    const model = (row.device_model || '').toLowerCase();
    
    if (model.includes('iphone') || model.includes('samsung') || model.includes('xiaomi') || 
        model.includes('motorola') || model.includes('lg') || model.includes('huawei')) {
      return 'Smartphone';
    }
    if (model.includes('ipad') || model.includes('tablet') || model.includes('tab ')) {
      return 'Tablet';
    }
    if (model.includes('macbook') || model.includes('notebook') || model.includes('laptop')) {
      return 'Notebook';
    }
    if (model.includes('imac') || model.includes('pc') || model.includes('desktop')) {
      return 'Desktop';
    }
    if (model.includes('watch') || model.includes('smartwatch')) {
      return 'Smartwatch';
    }
    if (model.includes('airpods') || model.includes('fone') || model.includes('headphone')) {
      return 'Acessório';
    }
    
    return 'Smartphone'; // Default mais comum
  }

  // =================================
  // FUNÇÕES DE LIMPEZA
  // =================================

  private cleanPrice(value: any): number {
    if (typeof value === 'number') return Math.round(value * 100); // Convert to cents
    
    const str = String(value).trim();
    
    // Remove símbolos monetários e espaços
    let cleaned = str.replace(/[R$\s€£¥₹]/g, '');
    
    // Handle different decimal separators
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Format like "1.234,50" or "1,234.50"
      const lastComma = cleaned.lastIndexOf(',');
      const lastDot = cleaned.lastIndexOf('.');
      
      if (lastComma > lastDot) {
        // "1.234,50" format - comma is decimal
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // "1,234.50" format - dot is decimal
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // Only comma - could be thousands or decimal
      const commaCount = (cleaned.match(/,/g) || []).length;
      if (commaCount === 1 && cleaned.split(',')[1].length <= 2) {
        // Likely decimal: "15,50"
        cleaned = cleaned.replace(',', '.');
      } else {
        // Likely thousands: "1,234"
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : Math.round(number * 100); // Convert to cents
  }

  private cleanPhone(value: any): string {
    if (!value) return '';
    
    const str = String(value).trim();
    
    // Remove all non-numeric characters
    const numbers = str.replace(/\D/g, '');
    
    // Brazilian phone format
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    
    return numbers; // Return just numbers if format is unknown
  }

  private cleanText(value: any): string {
    if (!value) return '';
    return String(value).trim().replace(/\s+/g, ' ');
  }

  private cleanNumber(value: any): number {
    if (typeof value === 'number') return Math.round(value);
    
    const str = String(value).trim().replace(/\D/g, '');
    const number = parseInt(str);
    return isNaN(number) ? 0 : number;
  }

  private cleanBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    
    const str = String(value).toLowerCase().trim();
    
    return ['true', '1', 'sim', 's', 'yes', 'y', 'verdadeiro'].includes(str);
  }

  // =================================
  // FUNÇÕES DE VALIDAÇÃO
  // =================================

  private validatePrice(value: any): ValidationResult {
    const price = typeof value === 'number' ? value : this.cleanPrice(value);
    
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (price <= 0) {
      result.isValid = false;
      result.errors.push('Preço deve ser maior que zero');
    }

    if (price > 1000000) { // R$ 10,000.00 in cents
      result.warnings.push('Preço muito alto, verifique se está correto');
    }

    if (price < 1000) { // R$ 10.00 in cents
      result.warnings.push('Preço muito baixo, verifique se está correto');
    }

    return result;
  }

  private validateOptionalPrice(value: any): ValidationResult {
    if (!value || value === 0) {
      return { isValid: true, errors: [], warnings: [] };
    }
    return this.validatePrice(value);
  }

  private validateWarranty(value: any): ValidationResult {
    const months = this.cleanNumber(value);
    
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (months < 0) {
      result.isValid = false;
      result.errors.push('Garantia não pode ser negativa');
    }

    if (months > 60) {
      result.warnings.push('Garantia muito longa, verifique se está correto');
    }

    return result;
  }

  private validateInstallments(value: any): ValidationResult {
    const installments = this.cleanNumber(value);
    
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (installments < 1) {
      result.isValid = false;
      result.errors.push('Número de parcelas deve ser pelo menos 1');
    }

    if (installments > 24) {
      result.warnings.push('Muitas parcelas, verifique se está correto');
    }

    return result;
  }

  private validatePhone(value: any): ValidationResult {
    const phone = this.cleanPhone(value);
    
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (phone && !/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) {
      result.warnings.push('Formato de telefone pode estar incorreto');
    }

    return result;
  }

  /**
   * Converte dados validados para formato de inserção no banco
   */
  convertToBudgetInsert(validatedData: any, userId: string): BudgetInsert {
    const now = new Date().toISOString();
    
    // Calcular data de validade (15 dias por padrão)
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + 15);
    
    return {
      owner_id: userId,
      device_type: validatedData.device_type || 'Smartphone',
      device_model: validatedData.device_model,
      issue: validatedData.issue || 'Não informado',
      part_quality: validatedData.part_quality || null,
      part_type: validatedData.part_type || 'Reparo Geral',
      notes: validatedData.notes || null,
      total_price: validatedData.total_price,
      cash_price: validatedData.cash_price || validatedData.total_price,
      installment_price: validatedData.installment_price || null,
      installments: validatedData.installments || 1,
      payment_condition: validatedData.payment_condition || 'À Vista',
      warranty_months: validatedData.warranty_months || 3,
      includes_delivery: validatedData.includes_delivery || false,
      includes_screen_protector: validatedData.includes_screen_protector || false,
      valid_until: validityDate.toISOString().split('T')[0],
      expires_at: validityDate.toISOString().split('T')[0],
      status: validatedData.status || 'pending',
      workflow_status: validatedData.workflow_status || 'pending',
      client_name: validatedData.client_name || null,
      client_phone: validatedData.client_phone || null,
    };
  }
}