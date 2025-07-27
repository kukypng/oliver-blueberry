import { useState, useCallback } from 'react';
import { CsvBudgetData, CsvImportResult, CsvExportFilters, CsvPreviewData } from '@/types/csv';
import { CsvParser } from '@/utils/csv/parser';
import { CsvFormatter } from '@/utils/csv/formatter';
import { useToast } from '@/hooks/use-toast';

export const useCsvData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<CsvPreviewData | null>(null);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const { toast } = useToast();

  const parseFile = useCallback(async (file: File): Promise<void> => {
    setIsLoading(true);
    
    try {
      const content = await file.text();
      const result = CsvParser.parse(content);
      
      setImportResult(result);
      
      // Create preview data
      const lines = content.trim().split('\n');
      const headers = lines[0] ? lines[0].split(';') : [];
      const rows = lines.slice(1, 6).map(line => line.split(';')); // Preview first 5 rows
      
      setPreviewData({
        headers,
        rows,
        isValid: result.success,
        errors: result.errors
      });

      if (result.success) {
        toast({
          title: "Arquivo processado com sucesso",
          description: `${result.validRows} linhas válidas encontradas`,
        });
      } else {
        toast({
          title: "Erros encontrados no arquivo",
          description: `${result.errors.length} erros encontrados`,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      toast({
        title: "Erro ao processar arquivo",
        description: "Não foi possível ler o arquivo CSV",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const exportData = useCallback((data: CsvBudgetData[], filters?: CsvExportFilters): void => {
    try {
      const csvContent = CsvFormatter.format(data, filters);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      const filename = `onedrip-export-${new Date().toISOString().split('T')[0]}.csv`;
      
      if ((navigator as any).msSaveBlob) {
        (navigator as any).msSaveBlob(blob, filename);
      } else {
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Exportação concluída",
        description: `Arquivo ${filename} baixado com sucesso`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível gerar o arquivo CSV",
        variant: "destructive",
      });
    }
  }, [toast]);

  const downloadTemplate = useCallback((): void => {
    try {
      const templateContent = CsvFormatter.generateTemplate();
      const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      link.href = URL.createObjectURL(blob);
      link.download = 'onedrip-template.csv';
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Template baixado",
        description: "Use este arquivo como exemplo para importação",
      });
      
    } catch (error) {
      toast({
        title: "Erro ao baixar template",
        description: "Não foi possível gerar o arquivo template",
        variant: "destructive",
      });
    }
  }, [toast]);

  const clearData = useCallback(() => {
    setPreviewData(null);
    setImportResult(null);
  }, []);

  return {
    isLoading,
    previewData,
    importResult,
    parseFile,
    exportData,
    downloadTemplate,
    clearData
  };
};