import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, User, Building2, Shield, Settings, Save, Star } from 'lucide-react';
import { useIOSDetection } from '@/hooks/useIOSDetection';
import { ProfileSettingsLite } from '@/components/lite/ProfileSettingsLite';
import { SecuritySettingsLite } from '@/components/lite/SecuritySettingsLite';
import { CompanySettingsLite } from '@/components/lite/CompanySettingsLite';
import { BudgetWarningSettingsLite } from '@/components/lite/BudgetWarningSettingsLite';
import { AdvancedFeaturesSettingsLite } from '@/components/lite/AdvancedFeaturesSettingsLite';
import { CacheClearSettingsLite } from '@/components/lite/CacheClearSettingsLite';
interface SettingsLiteProps {
  userId: string;
  profile: any;
  onBack: () => void;
}
export const SettingsLite = ({
  userId,
  profile,
  onBack
}: SettingsLiteProps) => {
  const [activeSection, setActiveSection] = useState<string>('account');
  const { isIOS } = useIOSDetection();
  
  const sections = [{
    id: 'account',
    name: 'Conta e Segurança',
    icon: User
  }, {
    id: 'app',
    name: 'Preferências da Aplicação',
    icon: Settings
  }
  // Seção "Recursos Avançados" removida da navegação mas funcionalidade mantida
  ];
  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return <div className="space-y-6">
            <ProfileSettingsLite userId={userId} profile={profile} />
            <SecuritySettingsLite />
          </div>;
      case 'app':
        return <div className="space-y-6">
            <BudgetWarningSettingsLite userId={userId} profile={profile} />
            <CompanySettingsLite userId={userId} profile={profile} />
            <CacheClearSettingsLite />
          </div>;
      case 'advanced':
        return <div className="space-y-6">
            <AdvancedFeaturesSettingsLite userId={userId} profile={profile} />
          </div>;
      default:
        return null;
    }
  };
  return <div className="h-[100dvh] bg-background flex flex-col">
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        
      </div>

      <div className="flex-1 overflow-auto">
        {/* Section tabs */}
        <div className="p-4 border-b">
          <div className="flex gap-2 overflow-x-auto">
            {sections.map(section => {
            const Icon = section.icon;
            return <Button 
              key={section.id} 
              variant={activeSection === section.id ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveSection(section.id)} 
              className="flex items-center justify-center min-w-[40px]">
                  <Icon className="h-4 w-4" />
                </Button>;
          })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
    </div>;
};