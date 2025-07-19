import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const CacheClearSettings = () => {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const clearSiteCache = async () => {
    setIsClearing(true);
    
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear Cache API if supported
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear IndexedDB data
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases?.();
          if (databases) {
            await Promise.all(
              databases.map(db => {
                if (db.name) {
                  return new Promise<void>((resolve, reject) => {
                    const deleteReq = indexedDB.deleteDatabase(db.name!);
                    deleteReq.onsuccess = () => resolve();
                    deleteReq.onerror = () => reject(deleteReq.error);
                  });
                }
                return Promise.resolve();
              })
            );
          }
        } catch (error) {
          console.warn('Não foi possível limpar IndexedDB:', error);
        }
      }

      toast({
        title: "Cache limpo com sucesso",
        description: "Todos os dados locais foram removidos. A página será recarregada.",
      });

      // Delay for user to see the toast
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
      toast({
        title: "Erro ao limpar cache",
        description: "Ocorreu um erro ao tentar limpar os dados locais.",
        variant: "destructive"
      });
      setIsClearing(false);
    }
  };

  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="text-warning flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Limpar Cache e Dados Locais
        </CardTitle>
        <CardDescription>
          Remove todos os dados armazenados localmente no seu dispositivo, incluindo preferências e cache do aplicativo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 border-warning text-warning hover:bg-warning/10"
              disabled={isClearing}
            >
              {isClearing ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Limpar Cache
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Confirmar Limpeza de Cache</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>Esta ação irá remover todos os dados locais salvos, incluindo:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Configurações e preferências</li>
                  <li>Dados em cache</li>
                  <li>Sessões armazenadas</li>
                  <li>Dados temporários</li>
                </ul>
                <p className="font-medium text-destructive">
                  Você precisará fazer login novamente e reconfigurar suas preferências.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={clearSiteCache}
                className="bg-warning hover:bg-warning/90 text-warning-foreground"
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin mr-2" />
                    Limpando...
                  </>
                ) : (
                  'Confirmar Limpeza'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};