import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  test_name: string;
  result: boolean;
  details: string;
}
interface DebugInfo {
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  is_active: boolean | null;
  is_admin: boolean | null;
}
export const AdminTestPanel = () => {
  const {
    showSuccess,
    showError
  } = useToast();
  const queryClient = useQueryClient();

  // Debug query para informações do usuário atual
  const {
    data: debugInfo,
    isLoading: debugLoading,
    refetch: refetchDebug
  } = useQuery({
    queryKey: ['debug-current-user-test'],
    queryFn: async (): Promise<DebugInfo | null> => {
      try {
        console.log('AdminTestPanel: Fetching debug info...');
        const {
          data,
          error
        } = await supabase.rpc('debug_current_user');
        if (error) {
          console.error('AdminTestPanel: Error fetching debug info:', error);
          throw error;
        }
        console.log('AdminTestPanel: Debug info received:', data);
        if (!data || !Array.isArray(data) || data.length === 0) {
          console.warn('AdminTestPanel: No debug data returned');
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
        console.error('AdminTestPanel: Failed to fetch debug info:', err);
        return null;
      }
    },
    retry: false
  });

  // Test permissions query
  const {
    data: testResults,
    isLoading: testLoading,
    refetch: refetchTests
  } = useQuery({
    queryKey: ['test-admin-permissions'],
    queryFn: async (): Promise<TestResult[]> => {
      try {
        console.log('AdminTestPanel: Running permission tests...');
        const {
          data,
          error
        } = await supabase.rpc('test_admin_permissions');
        if (error) {
          console.error('AdminTestPanel: Error running tests:', error);
          throw error;
        }
        console.log('AdminTestPanel: Test results received:', data);
        if (!data || !Array.isArray(data)) {
          console.warn('AdminTestPanel: No test data returned');
          return [];
        }
        return data.map((test: any) => ({
          test_name: test.test_name || 'Unknown Test',
          result: Boolean(test.result),
          details: test.details || 'No details'
        }));
      } catch (err) {
        console.error('AdminTestPanel: Failed to run tests:', err);
        throw err;
      }
    },
    retry: false
  });

  // Test users query
  const {
    data: usersTest,
    isLoading: usersLoading,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['test-admin-users'],
    queryFn: async () => {
      try {
        console.log('AdminTestPanel: Testing user fetch...');
        const {
          data,
          error
        } = await supabase.rpc('admin_get_all_users');
        if (error) {
          console.error('AdminTestPanel: Error fetching users:', error);
          return {
            success: false,
            error: error.message,
            count: 0
          };
        }
        console.log('AdminTestPanel: Users fetched successfully:', data?.length || 0);
        return {
          success: true,
          error: null,
          count: data?.length || 0
        };
      } catch (err: any) {
        console.error('AdminTestPanel: Failed to fetch users:', err);
        return {
          success: false,
          error: err.message,
          count: 0
        };
      }
    },
    enabled: !!debugInfo?.is_admin,
    retry: false
  });
  const refreshAllTests = async () => {
    try {
      await Promise.all([refetchDebug(), refetchTests(), refetchUsers()]);
      showSuccess({
        title: 'Testes atualizados',
        description: 'Todos os testes foram executados novamente.'
      });
    } catch (error) {
      showError({
        title: 'Erro ao atualizar testes',
        description: 'Ocorreu um erro ao executar os testes.'
      });
    }
  };
  const getStatusIcon = (success: boolean | null | undefined) => {
    if (success === null || success === undefined) return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
  };
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span>Painel de Testes</span>
            <Button onClick={refreshAllTests} variant="outline" size="sm" disabled={debugLoading || testLoading || usersLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${debugLoading || testLoading || usersLoading ? 'animate-spin' : ''}`} />
              Atualizar Testes
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Debug Info Section */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center text-lg">
              {getStatusIcon(debugInfo?.is_admin)}
              <span className="ml-2">Usuário Atual</span>
            </h3>
            {debugLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : debugInfo ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><strong>ID:</strong> <code className="text-xs bg-muted px-1 rounded">{debugInfo.user_id || 'N/A'}</code></div>
                <div><strong>Email:</strong> {debugInfo.user_email || 'N/A'}</div>
                <div><strong>Role:</strong> <Badge variant="secondary">{debugInfo.user_role || 'N/A'}</Badge></div>
                <div><strong>Ativo:</strong> {debugInfo.is_active ? <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Sim</Badge> : <Badge variant="destructive">Não</Badge>}</div>
                <div><strong>É Admin:</strong> {debugInfo.is_admin ? <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Sim</Badge> : <Badge variant="destructive">Não</Badge>}</div>
                <div><strong>Status:</strong> {debugInfo.is_admin ? <Badge className="border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Admin Ativo</Badge> : (debugInfo.user_role === 'admin' ? <Badge className="border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Admin Inativo</Badge> : <Badge variant="secondary">Usuário</Badge>)}</div>
              </div> : <p className="text-sm text-destructive">Erro ao carregar informações do usuário.</p>}
          </div>

          {/* Permission Tests Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Testes de Permissão</h3>
            {testLoading ? <p className="text-sm text-muted-foreground">Executando testes...</p> : testResults && testResults.length > 0 ? <div className="space-y-4">
                {testResults.map((test, index) => <div key={index} className="p-3 border rounded-md bg-card">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                      <div className="flex items-center">
                        {getStatusIcon(test.result)}
                        <span className="ml-2 font-medium">{test.test_name}</span>
                      </div>
                      <span className={`text-sm font-semibold ${test.result ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {test.result ? 'Passou' : 'Falhou'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 sm:pl-7">{test.details}</p>
                  </div>)}
              </div> : <p className="text-sm text-muted-foreground">Nenhum teste de permissão disponível.</p>}
          </div>

          {/* Users Access Test Section */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center text-lg">
              {getStatusIcon(usersTest?.success)}
              <span className="ml-2">Acesso aos Usuários</span>
            </h3>
            {usersLoading ? <p className="text-sm text-muted-foreground">Testando acesso...</p> : usersTest ? <div className="text-sm">
                {usersTest.success ? <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-400 flex items-center"><CheckCircle className="h-4 w-4 mr-2"/> Acesso concedido</p>
                    <p><strong>Usuários encontrados:</strong> {usersTest.count}</p>
                  </div> : <div className="space-y-1">
                    <p className="text-red-600 dark:text-red-400 flex items-center"><XCircle className="h-4 w-4 mr-2"/> Acesso negado</p>
                    <p><strong>Erro:</strong> {usersTest.error}</p>
                  </div>}
              </div> : <p className="text-sm text-muted-foreground">Teste não executado.</p>}
          </div>

          {/* Summary */}
          <div className="p-4 rounded-lg bg-muted">
            <h3 className="font-semibold mb-2 text-lg">Resumo do Sistema</h3>
            <div className="text-sm space-y-2">
              <p><strong>Status Admin:</strong> {debugInfo?.is_admin ? <span className="text-green-600 dark:text-green-400">OK</span> : debugInfo?.user_role === 'admin' ? <span className="text-yellow-600 dark:text-yellow-400">Inativo</span> : <span className="text-red-600 dark:text-red-400">Não é admin</span>}</p>
              <p><strong>Acesso a Usuários:</strong> {usersTest?.success ? <span className="text-green-600 dark:text-green-400">OK ({usersTest.count})</span> : <span className="text-red-600 dark:text-red-400">Bloqueado</span>}</p>
              <p><strong>Testes de Permissão:</strong> {testResults ? <span className={`${testResults.filter(t => !t.result).length > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{testResults.filter(t => t.result).length}/{testResults.length} passaram</span> : <span className="text-yellow-600 dark:text-yellow-400">Não executados</span>}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};
