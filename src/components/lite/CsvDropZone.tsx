import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CsvDropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const CsvDropZone: React.FC<CsvDropZoneProps> = ({ onFileSelect, isLoading }) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Arquivo inválido. Por favor, selecione um arquivo CSV.');
      return;
    }

    if (acceptedFiles.length === 0) {
      setError('Nenhum arquivo válido encontrado.');
      return;
    }

    const file = acceptedFiles[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB.');
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'text/plain': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          isLoading && "opacity-50 cursor-not-allowed",
          error && "border-destructive"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground mt-2">
                Processando arquivo...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              
              {isDragActive ? (
                <p className="text-lg font-medium text-primary">
                  Solte o arquivo aqui...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Arraste um arquivo CSV ou clique para selecionar
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Arquivos suportados: .csv (máximo 10MB)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alternative file picker button for iOS */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={open} 
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          <File className="h-4 w-4 mr-2" />
          Selecionar Arquivo
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Formato esperado:</strong></p>
        <p>Tipo Aparelho;Serviço/Aparelho;Qualidade;Observações;Preço à vista;Preço Parcelado;Parcelas;Método de Pagamento;Garantia (meses);Validade (dias);Inclui Entrega;Inclui Película</p>
      </div>
    </div>
  );
};