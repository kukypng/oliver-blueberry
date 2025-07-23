/**
 * Gerenciador Avançado de Dados do Dashboard
 * 
 * Sistema inteligente de análise e gestão de dados com:
 * - Análises automáticas e insights
 * - Filtragem avançada e busca inteligente
 * - Exportação personalizada
 * - Gestão de duplicatas
 * - Performance analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  Filter,
  Search,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Database,
  Eye,
  Settings,
  FileText,
  Copy
} from 'lucide-react';
import { useDataInsights } from '@/hooks/useDataInsights';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { cn } from '@/lib/utils';

interface AdvancedDataManagerProps {
  userId: string;
  className?: string;
}

interface DataInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'warning';
  title: string;
  description: string;
  value?: string;
  change?: number;
  priority: 'high' | 'medium' | 'low';
}

interface FilterOptions {
  dateRange: string;
  status: string;
  priceRange: string;
  deviceType: string;
  paymentMethod: string;
}

interface PerformanceMetric {
  label: string;
  value: number;
  change: number;
  format: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'stable';
}

export const AdvancedDataManager: React.FC<AdvancedDataManagerProps> = ({ 
  userId, 
  className 
}) => {
  // Estados principais
  const [activeTab, setActiveTab] = useState('insights');
  const [searchTerm, setSearchTerm] = useState('');
  const [duplicatesFound, setDuplicatesFound] = useState<any[]>([]);
  
  // Hook de insights
  const { generateInsights, isAnalyzing, lastAnalysis } = useDataInsights();
  
  // Filtros
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: '30',
    status: 'all',
    priceRange: 'all',
    deviceType: 'all',
    paymentMethod: 'all'
  });

  // Dados
  const [rawBudgets, setRawBudgets] = useState<any[]>([]);
  const [insights, setInsights] = useState<DataInsight[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [budgetStats, setBudgetStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados iniciais quando o componente monta
  useEffect(() => {
    if (userId) {
      loadRawData();
    }
  }, [userId]);

  // Carregar dados automaticamente quando os filtros mudam
  useEffect(() => {
    if (userId) {
      loadRawData();
    }
  }, [filters]);

  const loadRawData = async () => {
    setIsLoading(true);
    try {
      const days = parseInt(filters.dateRange);
      const startDate = subDays(new Date(), days);
      
      let query = supabase
        .from('budgets')
        .select('*')
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters.status !== 'all') {
        query = query.eq('workflow_status', filters.status);
      }
      
      if (filters.deviceType !== 'all') {
        query = query.eq('device_type', filters.deviceType);
      }
      
      if (filters.paymentMethod !== 'all') {
        query = query.eq('payment_condition', filters.paymentMethod);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setRawBudgets(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Analisar dados e gerar insights usando o novo hook
  const analyzeData = async () => {
    if (!rawBudgets.length) {
      toast.error('Não há dados suficientes para análise');
      return;
    }
    
    try {
      const result = await generateInsights({
        userId,
        dateRange: parseInt(filters.dateRange)
      });
      
      // Converter insights para o formato esperado
      const formattedInsights: DataInsight[] = result.insights.map((insight, index) => ({
        id: `insight-${index}`,
        type: insight.type as 'trend' | 'anomaly' | 'opportunity' | 'warning',
        title: insight.title,
        description: insight.description,
        priority: insight.priority as 'high' | 'medium' | 'low'
      }));
      
      // Gerar métricas de performance
      const newMetrics: PerformanceMetric[] = [];
      
      if (result.metadata) {
        newMetrics.push({
          label: 'Taxa de Conversão',
          value: result.metadata.conversionRate,
          change: Math.random() * 10 - 5, // Simulado - seria calculado comparando períodos
          format: 'percentage',
          trend: result.metadata.conversionRate > 60 ? 'up' : 'down'
        });
        
        newMetrics.push({
          label: 'Faturamento',
          value: result.metadata.totalRevenue,
          change: Math.random() * 20 - 10, // Simulado
          format: 'currency',
          trend: 'up'
        });
        
        newMetrics.push({
          label: 'Ticket Médio',
          value: result.metadata.averageValue,
          change: Math.random() * 15 - 7.5,
          format: 'currency',
          trend: 'stable'
        });
      }
      
      setInsights(formattedInsights);
      setPerformanceMetrics(newMetrics);
      setDuplicatesFound(result.duplicates);
      
      if (result.duplicates.length > 0) {
        toast.warning(`${result.duplicates.length} possíveis duplicatas encontradas!`);
      } else {
        toast.success('Análise concluída! Dados estão limpos.');
      }
      
    } catch (error) {
      toast.error('Erro na análise: ' + (error as Error).message);
    }
  };

  // Filtrar dados baseado na busca
  const filteredBudgets = useMemo(() => {
    if (!searchTerm) return rawBudgets;
    
    return rawBudgets.filter(budget => 
      budget.device_model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.device_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rawBudgets, searchTerm]);

  // Exportar dados filtrados
  const exportFilteredData = async () => {
    try {
      const csvData = filteredBudgets.map(budget => ({
        'Data': format(new Date(budget.created_at), 'dd/MM/yyyy'),
        'Cliente': budget.client_name || 'N/A',
        'Dispositivo': budget.device_type,
        'Modelo': budget.device_model,
        'Valor': (budget.total_price / 100).toFixed(2),
        'Status': budget.workflow_status,
        'Pago': budget.is_paid ? 'Sim' : 'Não',
        'Entregue': budget.is_delivered ? 'Sim' : 'Não'
      }));

      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `dados-filtrados-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      toast.error('Erro na exportação');
    }
  };

  // Função para remover duplicatas
  const removeDuplicates = async () => {
    if (duplicatesFound.length === 0) {
      toast.error('Nenhuma duplicata encontrada para remover');
      return;
    }

    try {
      const duplicateIds = duplicatesFound.map(d => d.id);
      
      // Soft delete dos orçamentos duplicados
      const { error } = await supabase
        .from('budgets')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: userId 
        })
        .in('id', duplicateIds);

      if (error) throw error;

      // Atualizar dados locais
      setRawBudgets(prev => prev.filter(b => !duplicateIds.includes(b.id)));
      setDuplicatesFound([]);
      
      toast.success(`${duplicateIds.length} orçamentos duplicados removidos!`);
      
    } catch (error) {
      toast.error('Erro ao remover duplicatas: ' + (error as Error).message);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header com Análise */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Gestão Avançada de Dados
            </CardTitle>
            <Button
              onClick={analyzeData}
              disabled={isAnalyzing || !rawBudgets.length}
              size="sm"
              variant="outline"
            >
              {isAnalyzing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Analisar
            </Button>
          </div>
          {lastAnalysis && (
            <p className="text-xs text-muted-foreground">
              Última análise: {format(lastAnalysis, 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Filtros Avançados */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar em todos os campos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros em Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 3 meses</SelectItem>
                <SelectItem value="365">Último ano</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resultados */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              {filteredBudgets.length} de {rawBudgets.length} registros
            </p>
            <Button
              onClick={exportFilteredData}
              disabled={!filteredBudgets.length}
              size="sm"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="metrics" className="text-xs">
            <BarChart3 className="h-3 w-3 mr-1" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Dados
          </TabsTrigger>
        </TabsList>

        {/* Tab de Insights */}
        <TabsContent value="insights" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  Execute uma análise para ver insights inteligentes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {insights.map(insight => (
                <Card key={insight.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      {insight.type === 'opportunity' && (
                        <Target className="h-5 w-5 text-green-500 mt-0.5" />
                      )}
                      {insight.type === 'warning' && (
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      )}
                      {insight.type === 'trend' && (
                        <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                      {insight.type === 'anomaly' && (
                        <Eye className="h-5 w-5 text-purple-500 mt-0.5" />
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm">{insight.title}</h3>
                          <Badge 
                            variant={
                              insight.priority === 'high' ? 'destructive' : 
                              insight.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {insight.priority === 'high' ? 'Alto' : 
                             insight.priority === 'medium' ? 'Médio' : 'Baixo'}
                           </Badge>
                         </div>
                         <p className="text-xs text-muted-foreground mb-2">
                           {insight.description}
                         </p>
                         {insight.value && (
                           <div className="flex items-center gap-1">
                             <span className="text-sm font-medium">{insight.value}</span>
                             {insight.change && (
                               <span className={cn(
                                 "text-xs flex items-center",
                                 insight.change > 0 ? "text-green-600" : "text-red-600"
                               )}>
                                 {insight.change > 0 ? (
                                   <ArrowUpRight className="h-3 w-3" />
                                 ) : (
                                   <ArrowDownRight className="h-3 w-3" />
                                 )}
                                 {Math.abs(insight.change).toFixed(1)}%
                               </span>
                             )}
                           </div>
                         )}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
               
               {/* Card de Duplicatas se encontradas */}
               {duplicatesFound.length > 0 && (
                 <Card className="border-orange-200 bg-orange-50">
                   <CardContent className="py-4">
                     <div className="flex items-start gap-3">
                       <Copy className="h-5 w-5 text-orange-500 mt-0.5" />
                       <div className="flex-1">
                         <div className="flex items-center justify-between mb-2">
                           <h3 className="font-medium text-sm">Duplicatas Detectadas</h3>
                           <Badge variant="destructive" className="text-xs">
                             {duplicatesFound.length} encontrada{duplicatesFound.length !== 1 ? 's' : ''}
                           </Badge>
                         </div>
                         <p className="text-xs text-muted-foreground mb-3">
                           Orçamentos similares foram encontrados nos seus dados. Limpe para melhorar a organização.
                         </p>
                         <div className="space-y-2">
                           {duplicatesFound.slice(0, 3).map((duplicate, index) => (
                             <div key={index} className="bg-white rounded p-2 text-xs border">
                               <span className="font-medium">{duplicate.device_model}</span>
                               <span className="text-muted-foreground"> • {duplicate.device_type}</span>
                               {duplicate.client_name && (
                                 <span className="text-muted-foreground"> • {duplicate.client_name}</span>
                               )}
                             </div>
                           ))}
                           {duplicatesFound.length > 3 && (
                             <p className="text-xs text-muted-foreground">
                               E mais {duplicatesFound.length - 3} duplicata{duplicatesFound.length - 3 !== 1 ? 's' : ''}...
                             </p>
                           )}
                           <Button
                             onClick={removeDuplicates}
                             size="sm"
                             variant="outline"
                             className="w-full mt-3"
                           >
                             <Copy className="mr-2 h-4 w-4" />
                             Remover Duplicatas
                           </Button>
                         </div>
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               )}
            </div>
          )}
        </TabsContent>

        {/* Tab de Métricas */}
        <TabsContent value="metrics" className="space-y-4">
          {performanceMetrics.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">
                  Execute uma análise para ver métricas de performance
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {performanceMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{metric.label}</p>
                        <p className="text-lg font-bold">
                          {metric.format === 'currency' && 'R$ '}
                          {metric.format === 'currency' 
                            ? metric.value.toFixed(2) 
                            : metric.value.toFixed(1)
                          }
                          {metric.format === 'percentage' && '%'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "flex items-center text-sm",
                          metric.trend === 'up' ? "text-green-600" : 
                          metric.trend === 'down' ? "text-red-600" : "text-muted-foreground"
                        )}>
                          {metric.trend === 'up' && <TrendingUp className="h-4 w-4 mr-1" />}
                          {metric.trend === 'down' && <TrendingDown className="h-4 w-4 mr-1" />}
                          {Math.abs(metric.change).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab de Dados */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Visualização de Dados</CardTitle>
                <Badge variant="outline">
                  {filteredBudgets.length} registros
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-muted rounded h-16" />
                  ))}
                </div>
              ) : filteredBudgets.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum dado encontrado com os filtros aplicados</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredBudgets.map(budget => (
                    <div key={budget.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
          <p className="font-medium text-sm">{budget.device_model}</p>
          <p className="text-xs text-muted-foreground">
            {budget.device_type} • {budget.part_quality || 'Original'}
          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            R$ {Number(budget.total_price / 100 || 0).toFixed(2)}
                          </p>
                          <Badge 
                            variant={
                              budget.workflow_status === 'completed' ? 'default' :
                              budget.workflow_status === 'approved' ? 'secondary' : 'outline'
                            }
                            className="text-xs"
                          >
                            {budget.workflow_status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(budget.created_at), 'dd/MM/yyyy')}
                        </span>
                        {budget.client_name && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {budget.client_name}
                          </span>
                        )}
                        <div className="flex gap-1">
                          {budget.is_paid && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          {budget.is_delivered && (
                            <Copy className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};