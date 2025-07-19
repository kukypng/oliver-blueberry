import React from 'react';
import { DataManagementSettings } from '@/components/DataManagementSettings';
import { TrashManagement } from '@/components/TrashManagement';
import { Separator } from '@/components/ui/separator';
import { Database } from 'lucide-react';

export const DataManagementContent = () => {
  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in max-w-7xl mx-auto">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <Database className="h-8 w-8 text-primary" />
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Gestão de Dados
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Gerencie suas informações, faça backup dos dados e acesse a lixeira de orçamentos.
        </p>
      </header>

      <div className="space-y-12">
        <section id="data-management">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground pb-4">
            Importação e Exportação
          </h2>
          <Separator />
          <div className="pt-6">
            <DataManagementSettings />
          </div>
        </section>
        
        <section id="trash-management">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground pb-4">
            Lixeira de Orçamentos
          </h2>
          <Separator />
          <div className="pt-6">
            <TrashManagement />
          </div>
        </section>
      </div>
    </div>
  );
};