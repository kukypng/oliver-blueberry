import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CacheClearSettingsLite = () => {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const clearSiteCache = async (): Promise<void> => {
    setIsClearing(true);
    try {
      // Importar o storage manager
      const { storageManager } = await import('@/utils/localStorageManager');
      
      // Limpeza inteligente - preserva configurações essenciais
      storageManager.smartClear();
      
      // Clear sessionStorage (dados temporários)
      sessionStorage.clear();
      
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear IndexedDB data (iOS Safari 10+ com tratamento especial)
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases?.();
          if (databases) {
            // Filtrar apenas databases não essenciais
            const nonEssentialDbs = databases.filter(db => 
              db.name && !db.name.includes('supabase-auth')
            );
            
            await Promise.all(
              nonEssentialDbs.map(db => {
                if (db.name) {
                  return new Promise<void>((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(db.name!);
                    deleteReq.onsuccess = () => resolve();
                    deleteReq.onerror = () => reject(deleteReq.error);
                    deleteReq.onblocked = () => {
                      console.warn(`Blocked deleting database: ${db.name}`);
                      resolve(); // Continue anyway
                    };
                  });
                }
                return Promise.resolve();
              })
            );
          }
        } catch (error) {
          // iOS Safari pode não suportar IndexedDB.databases()
          console.warn('IndexedDB cleanup skipped:', error);
        }
      }

      toast({
        title: "Cache otimizado! ✨",
        description: "Configurações preservadas. Recarregando...",
      });

      // Reload page after successful cache clear
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast({
        title: "Erro",
        description: "Erro ao limpar cache.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="border-warning/20 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-warning flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Limpar Cache
        </CardTitle>
        <CardDescription className="text-sm">
          Remove todos os dados salvos localmente no dispositivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full gap-2 border-warning text-warning hover:bg-warning/10"
              disabled={isClearing}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {isClearing ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Limpar Dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent 
            className="max-w-[90vw] mx-auto rounded-lg"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">⚠️ Limpar Cache</AlertDialogTitle>
              <AlertDialogDescription className="text-sm space-y-3">
                <p>Esta ação irá remover:</p>
                <div className="bg-muted/50 p-3 rounded-md">
                  <ul className="text-xs space-y-1">
                    <li>• Configurações salvas</li>
                    <li>• Dados em cache</li>
                    <li>• Sessão atual</li>
                    <li>• Preferências</li>
                  </ul>
                </div>
                <p className="font-medium text-destructive text-sm">
                  Você precisará fazer login novamente.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel 
                className="flex-1"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={clearSiteCache}
                className="flex-1 bg-warning hover:bg-warning/90 text-warning-foreground"
                disabled={isClearing}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {isClearing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-1" />
                    Limpando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};