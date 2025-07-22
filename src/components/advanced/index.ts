/**
 * Sistema Avançado de Importação e Exportação
 * 
 * Exportações centralizadas para todos os componentes avançados
 * de gestão de dados.
 */

// Componentes principais
export { AdvancedDataManagement } from './AdvancedDataManagement';
export { ImportWizard } from './ImportWizard';
export { DragDropZone } from './DragDropZone';
export { DataPreviewTable } from './DataPreviewTable';

// Tipos e interfaces
export type { 
  ImportResult, 
  ImportSummary, 
  ImportConfiguration 
} from './ImportWizard';

export type { 
  FileWithPreview 
} from './DragDropZone';

export type { 
  ColumnDefinition 
} from './DataPreviewTable';

// Utilitários
export { 
  SupportedFormat,
  formatDetector,
  type FormatDetectionResult,
  type FormatMetadata
} from '../../utils/import-export/formatDetector';

export {
  universalParser,
  type ParseResult,
  type ParseConfig,
  type ValidationRule,
  type FieldMapping
} from '../../utils/import-export/universalParser';