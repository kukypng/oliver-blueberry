import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Eye, EyeOff, RefreshCw } from 'lucide-react';

interface DebugInfo {
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  is_active: boolean | null;
  is_admin: boolean | null;
}
interface AdminDebugPanelProps {
  error?: Error | null;
  showByDefault?: boolean;
}
export const AdminDebugPanel = ({
  error,
  showByDefault = false
}: AdminDebugPanelProps) => {
  const [isVisible, setIsVisible] = useState(showByDefault);
  const {
    data: debugInfo,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['debug-current-user'],
    queryFn: async (): Promise<DebugInfo | null> => {
      try {
        console.log('AdminDebugPanel: Fetching debug info...');
        const {
          data,
          error
        } = await supabase.rpc('debug_current_user');
        if (error) {
          console.error('AdminDebugPanel: Error fetching debug info:', error);
          throw error;
        }
        console.log('AdminDebugPanel: Debug info received:', data);
        if (!data || !Array.isArray(data) || data.length === 0) {
          return null;
        }
        const debugData = data[0];
        return {
          user_id: debugData?.user_id || null,
          user_email: debugData?.user_email || null,
          user_role: debugData?.user_role || null,
          is_active: debugData?.is_active || null,
          is_admin: debugData?.is_admin || null
        };
      } catch (err) {
        console.error('AdminDebugPanel: Failed to fetch debug info:', err);
        return null;
      }
    },
    retry: false
  });
  if (!isVisible && !error) {
    return <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => setIsVisible(true)} className="text-xs text-muted-foreground">
          <Eye className="h-3 w-3 mr-1" />
          Mostrar Debug
        </Button>
      </div>;
  }
  return <Card className="mb-4 border-yellow-500/30 bg-yellow-500/10">
      <CardHeader className="py-3 px-4">
        <CardTitle className="flex items-center justify-between text-yellow-800 dark:text-yellow-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Painel de Debug</span>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading} className="text-yellow-700 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 h-8 w-8">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="text-yellow-700 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300 h-8 w-8">
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm px-4 pb-4">
        {isLoading ? <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-yellow-300/30 rounded w-3/4"></div>
            <div className="h-4 bg-yellow-300/30 rounded w-full"></div>
            <div className="h-4 bg-yellow-300/30 rounded w-1/2"></div>
          </div> : debugInfo ? <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Informações do Usuário</h4>
              <div className="space-y-1 text-yellow-800 dark:text-yellow-300">
                <p><strong>ID:</strong> <code className="text-xs bg-yellow-500/20 px-1 py-0.5 rounded">{debugInfo.user_id || 'N/A'}</code></p>
                <p><strong>Email:</strong> {debugInfo.user_email || 'N/A'}</p>
                <p><strong>Role:</strong> 
                  <Badge variant="secondary" className="bg-yellow-500/20 border-yellow-500/30 text-yellow-900 dark:text-yellow-200">
                    {debugInfo.user_role || 'N/A'}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-200">Status de Permissões</h4>
              <div className="space-y-1 text-yellow-800 dark:text-yellow-300">
                <p><strong>Usuário Ativo:</strong> 
                  <Badge className={`${debugInfo.is_active ? 'bg-green-500/20 text-green-900 dark:text-green-200' : 'bg-red-500/20 text-red-900 dark:text-red-200'} border-none`}>
                    {debugInfo.is_active ? 'Sim' : 'Não'}
                  </Badge>
                </p>
                <p><strong>Permissão Admin:</strong> 
                  <Badge className={`${debugInfo.is_admin ? 'bg-green-500/20 text-green-900 dark:text-green-200' : 'bg-red-500/20 text-red-900 dark:text-red-200'} border-none`}>
                    {debugInfo.is_admin ? 'Sim' : 'Não'}
                  </Badge>
                </p>
              </div>
            </div>
          </div> : <p className="text-yellow-700 dark:text-yellow-400">Não foi possível carregar informações de debug</p>}
        
        {error && <div className="mt-4 p-3 bg-red-500/10 rounded border border-red-500/20">
            <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Erro Detectado:</h4>
            <p className="text-red-800 dark:text-red-300 text-sm">{error.message}</p>
            {debugInfo && !debugInfo.is_admin && <div className="mt-2 p-2 bg-red-500/20 rounded">
                <p className="text-red-800 dark:text-red-300 text-xs">
                  <strong>Possível Causa:</strong> O usuário atual não possui permissões de administrador. 
                  Verifique se o role está correto e se o usuário está ativo.
                </p>
              </div>}
          </div>}
      </CardContent>
    </Card>;
};
