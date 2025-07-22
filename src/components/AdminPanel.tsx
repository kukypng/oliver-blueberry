
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/UserManagement';
import { AdminLogs } from '@/components/AdminLogs';
import { AdminDebugPanel } from '@/components/AdminDebugPanel';
import { AdminTestPanel } from '@/components/AdminTestPanel';
import { SiteSettingsContent } from '@/components/SiteSettingsContent';
import { AdminImageManager } from '@/components/admin/AdminImageManager';
import { GameSettingsPanel } from '@/components/admin/GameSettingsPanel';
import { AdminLicenseManagerEnhanced } from '@/components/admin/AdminLicenseManagerEnhanced';
import { Users, Shield, UserPlus, Settings, ChevronLeft, Globe, Image, Gamepad2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const AdminPanel = () => {
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return (
      <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSettings(false)}
            className="h-10 w-10 p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Configurações Avançadas</h1>
              <p className="text-muted-foreground">Ferramentas de diagnóstico e teste</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="test" className="w-full">
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <TabsList className="grid w-full min-w-max grid-cols-5 gap-2">
              <TabsTrigger value="test" className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                <span>Testes</span>
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                <span>Logs</span>
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                <span>Debug</span>
              </TabsTrigger>
              <TabsTrigger value="images" className="flex items-center gap-2 text-sm">
                <Image className="h-4 w-4" />
                <span>Imagens</span>
              </TabsTrigger>
              <TabsTrigger value="game" className="flex items-center gap-2 text-sm">
                <Gamepad2 className="h-4 w-4" />
                <span>Jogo</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="test" className="mt-6 animate-fade-in">
            <AdminTestPanel />
          </TabsContent>

          <TabsContent value="logs" className="mt-6 animate-fade-in">
            <AdminLogs />
          </TabsContent>

          <TabsContent value="debug" className="mt-6 animate-fade-in">
            <AdminDebugPanel />
          </TabsContent>

          <TabsContent value="images" className="mt-6 animate-fade-in">
            <AdminImageManager />
          </TabsContent>

          <TabsContent value="game" className="mt-6 animate-fade-in">
            <GameSettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 gap-4">
        <div className="flex items-center space-x-4">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-muted-foreground">Gerencie usuários e configurações do sistema</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Configurações</span>
          </Button>
          <Link to="/signup">
            <Button size="sm" className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-4 w-4" />
              Criar Usuário
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <TabsList className="grid w-full min-w-max grid-cols-3 gap-2">
            <TabsTrigger value="users" className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4" />
              <span>Licenças</span>
            </TabsTrigger>
            <TabsTrigger value="site" className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4" />
              <span>Site</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="users" className="mt-6 animate-fade-in">
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Gerenciamento de Usuários</h2>
              </div>
            </div>
            
            <div className="p-0">
              <UserManagement />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="licenses" className="mt-6 animate-fade-in">
          <AdminLicenseManagerEnhanced />
        </TabsContent>

        <TabsContent value="site" className="mt-6 animate-fade-in">
          <SiteSettingsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};
