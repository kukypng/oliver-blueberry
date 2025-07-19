import React from 'react';
import { useGameSettings } from '@/hooks/useGameSettings';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, AlertTriangle } from 'lucide-react';

export const GameConfigDisplay: React.FC = () => {
  const { profile } = useAuth();
  const { settings, isLoading } = useGameSettings();

  // Só mostrar para admins
  if (!profile || profile.role !== 'admin' || isLoading || !settings) {
    return null;
  }

  return (
    <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
            Configurações Admin
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-yellow-600 dark:text-yellow-400">Bug 🐛:</span>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {(settings.speed_bug_spawn_rate * 100).toFixed(1)}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-yellow-600 dark:text-yellow-400">Velocidade:</span>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {settings.speed_bug_speed_multiplier}x
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};