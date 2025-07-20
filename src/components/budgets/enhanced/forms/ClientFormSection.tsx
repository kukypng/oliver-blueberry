import React from 'react';
import { User, Search, Loader2, Users } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Client {
  name: string;
  phone: string;
}

interface ClientFormSectionProps {
  formData: {
    client_name: string;
    client_phone: string;
  };
  existingClients: Client[];
  showClientSearch: boolean;
  clientSearchTerm: string;
  isLoadingClients: boolean;
  onInputChange: (field: string, value: string) => void;
  onToggleClientSearch: () => void;
  onSearchTermChange: (term: string) => void;
  onClientSelect: (client: Client) => void;
}

export const ClientFormSection: React.FC<ClientFormSectionProps> = ({
  formData,
  existingClients,
  showClientSearch,
  clientSearchTerm,
  isLoadingClients,
  onInputChange,
  onToggleClientSearch,
  onSearchTermChange,
  onClientSelect
}) => {
  const filteredClients = existingClients.filter(client =>
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.includes(clientSearchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <User className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Informações do Cliente</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="client_name" className="text-sm font-medium">
              Nome do Cliente
            </Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleClientSearch}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <Users className="h-3 w-3 mr-1" />
              {showClientSearch ? 'Ocultar' : 'Buscar'}
            </Button>
          </div>
          
          <Input
            id="client_name"
            value={formData.client_name}
            onChange={(e) => onInputChange('client_name', e.target.value)}
            placeholder="Nome completo do cliente"
            className="bg-background border-border"
          />
        </div>

        {showClientSearch && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente existente..."
                value={clientSearchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="flex-1 h-8 text-sm"
              />
              {isLoadingClients && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {filteredClients.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {filteredClients.map((client, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onClientSelect(client)}
                    className="w-full justify-start h-auto p-2 text-left"
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{client.name}</span>
                      {client.phone && (
                        <span className="text-xs text-muted-foreground">{client.phone}</span>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {!isLoadingClients && existingClients.length > 0 && filteredClients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Nenhum cliente encontrado
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="client_phone" className="text-sm font-medium">
            Telefone do Cliente
          </Label>
          <Input
            id="client_phone"
            value={formData.client_phone}
            onChange={(e) => onInputChange('client_phone', e.target.value)}
            placeholder="(00) 00000-0000"
            className="bg-background border-border"
          />
        </div>
      </div>
    </div>
  );
};