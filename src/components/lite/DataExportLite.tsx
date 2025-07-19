import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Upload, FileText, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useCsvData } from '@/hooks/useCsvData';

interface DataExportLiteProps {
  onBack: () => void;
}

export const DataExportLite = ({ onBack }: DataExportLiteProps) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { fetchAndExportBudgets, processImportedFile } = useCsvData();
  const [stats, setStats] = useState({
    totalBudgets: 0,
    totalClients: 0,
    trashedBudgets: 0
  });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Contar orçamentos totais
      const { count: totalBudgets } = await supabase
        .from('budgets')
        .select('id', { count: 'exact' })
        .eq('owner_id', user.id);

      // Contar orçamentos na lixeira
      const { count: trashedBudgets } = await supabase
        .from('budgets')
        .select('id', { count: 'exact' })
        .eq('owner_id', user.id)
        .not('deleted_at', 'is', null);

      // Contar clientes únicos
      const { data: clients } = await supabase
        .from('budgets')
        .select('client_name')
        .eq('owner_id', user.id)
        .not('client_name', 'is', null);

      const uniqueClients = new Set(clients?.map(c => c.client_name)).size;

      setStats({
        totalBudgets: totalBudgets || 0,
        totalClients: uniqueClients,
        trashedBudgets: trashedBudgets || 0
      });

    } catch (error: any) {
      console.error('Error loading stats:', error);
      showError({
        title: 'Erro ao carregar estatísticas',
        description: error.message || 'Não foi possível carregar os dados.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      await fetchAndExportBudgets();
      showSuccess({
        title: 'Dados exportados!',
        description: 'O arquivo CSV foi baixado com seus dados.'
      });
    } catch (error: any) {
      console.error('Error exporting data:', error);
      showError({
        title: 'Erro na exportação',
        description: error.message || 'Não foi possível exportar os dados.'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      showError({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo CSV.'
      });
      return;
    }

    setIsImporting(true);

    try {
      await processImportedFile(file);
      showSuccess({
        title: 'Dados importados!',
        description: 'Os dados foram importados com sucesso.'
      });
      loadStats(); // Recarregar estatísticas
    } catch (error: any) {
      console.error('Error importing data:', error);
      showError({
        title: 'Erro na importação',
        description: error.message || 'Não foi possível importar os dados.'
      });
    } finally {
      setIsImporting(false);
      // Limpar o input
      event.target.value = '';
    }
  };

  const handleViewTrash = () => {
    // Navegar para visualização da lixeira
    showSuccess({
      title: 'Em desenvolvimento',
      description: 'A visualização da lixeira será implementada em breve.'
    });
  };

  const handleEmptyTrash = async () => {
    if (!window.confirm('Tem certeza que deseja esvaziar a lixeira? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('owner_id', user?.id)
        .not('deleted_at', 'is', null);

      if (error) throw error;

      showSuccess({
        title: 'Lixeira esvaziada',
        description: 'Todos os itens da lixeira foram permanentemente excluídos.'
      });

      loadStats();

    } catch (error: any) {
      console.error('Error emptying trash:', error);
      showError({
        title: 'Erro ao esvaziar lixeira',
        description: error.message || 'Não foi possível esvaziar a lixeira.'
      });
    }
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Gestão de Dados</h1>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="animate-pulse h-4 bg-muted rounded"></div>
                <div className="animate-pulse h-4 bg-muted rounded"></div>
                <div className="animate-pulse h-4 bg-muted rounded"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total de Orçamentos</span>
                  <span className="font-medium">{stats.totalBudgets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Clientes Únicos</span>
                  <span className="font-medium">{stats.totalClients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Na Lixeira</span>
                  <span className="font-medium">{stats.trashedBudgets}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exportar Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Baixe todos os seus dados em formato CSV para backup ou análise.
            </p>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Baixar CSV'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Importar Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Importe dados de um arquivo CSV. Use o mesmo formato do arquivo exportado.
            </p>
            <div>
              <Label htmlFor="csvFile">Selecionar arquivo CSV</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleImport}
                disabled={isImporting}
                className="mt-2"
              />
            </div>
            {isImporting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" />
                Importando dados...
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lixeira</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gerencie os itens excluídos. Itens na lixeira podem ser restaurados.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleViewTrash}
                className="flex-1"
              >
                <FileText className="mr-2 h-4 w-4" />
                Ver Lixeira
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleEmptyTrash}
                disabled={stats.trashedBudgets === 0}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Esvaziar
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-muted-foreground p-4">
          <p>Mantenha sempre um backup dos seus dados importantes.</p>
        </div>
      </div>
    </div>
  );
};