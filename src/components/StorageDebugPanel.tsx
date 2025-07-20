import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { storageManager } from '@/utils/localStorageManager';
import { Database, HardDrive, Trash2, RefreshCw, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function StorageDebugPanel() {
  const [stats, setStats] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const refreshData = () => {
    const storageStats = storageManager.getStorageStats();
    const storageData = storageManager.getData();
    setStats(storageStats);
    setData(storageData);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleExport = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      data: storageManager.getData(),
      stats: storageManager.getStorageStats()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oliver-storage-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup exportado!",
      description: "Dados salvos com sucesso",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string);
        if (backup.data) {
          storageManager.setData(backup.data, false);
          refreshData();
          toast({
            title: "Backup restaurado!",
            description: "Dados importados com sucesso",
          });
        }
      } catch (error) {
        toast({
          title: "Erro ao importar",
          description: "Arquivo inválido",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  if (!stats || !data) {
    return <div>Carregando...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Debug do Storage Local
        </CardTitle>
        <CardDescription>
          Monitoramento e gestão do sistema de storage otimizado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="h-4 w-4" />
              <span className="font-medium">Tamanho</span>
            </div>
            <div className="text-2xl font-bold">{formatBytes(stats.size)}</div>
            <div className="text-sm text-muted-foreground">{stats.keys} chaves</div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4" />
              <span className="font-medium">Último Sync</span>
            </div>
            <div className="text-sm">{formatDate(stats.lastSync)}</div>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Cache Status</span>
            </div>
            <Badge variant={data.cache.expiry && Date.now() < data.cache.expiry ? "default" : "secondary"}>
              {data.cache.expiry && Date.now() < data.cache.expiry ? "Válido" : "Expirado"}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Dados do Usuário */}
        <div>
          <h3 className="font-semibold mb-3">Dados do Usuário</h3>
          <div className="bg-muted/30 p-4 rounded-lg">
            <pre className="text-sm overflow-auto max-h-40">
              {JSON.stringify(data.user || {}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Configurações */}
        <div>
          <h3 className="font-semibold mb-3">Configurações</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(data.settings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                <span className="text-sm font-medium">{key}</span>
                <Badge variant={value ? "default" : "secondary"}>
                  {String(value)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Session Backup */}
        {data.sessionBackup && (
          <div>
            <h3 className="font-semibold mb-3">Backup da Sessão</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium">Sessão Válida:</span>
                  <Badge variant={data.sessionBackup.hasValidSession ? "default" : "secondary"} className="ml-2">
                    {data.sessionBackup.hasValidSession ? "Sim" : "Não"}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Último Login:</span>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(data.sessionBackup.lastLogin)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Ações */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Backup
          </Button>
          
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Importar Backup
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <Button 
            onClick={() => {
              storageManager.smartClear();
              refreshData();
              toast({ title: "Storage limpo!", description: "Dados não essenciais removidos" });
            }}
            variant="outline" 
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpeza Inteligente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}