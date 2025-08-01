import React, { useEffect, useState } from 'react';
import { DebugInvadersGame } from '@/components/game/DebugInvadersGame';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDetection } from '@/hooks/useMobileDetection';

export const CookiePage = () => {
  const { profile } = useAuth();
  const isMobile = useMobileDetection();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto fullscreen no mobile
  useEffect(() => {
    if (isMobile && !isFullscreen) {
      const enterFullscreen = async () => {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
            setIsFullscreen(true);
          }
        } catch (error) {
          console.log('Fullscreen não suportado');
        }
      };
      
      // Delay para dar tempo do usuário interagir
      const timer = setTimeout(enterFullscreen, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMobile, isFullscreen]);

  // Detectar saída do fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Forçar orientação landscape no mobile se possível
  useEffect(() => {
    if (isMobile && 'screen' in window && 'orientation' in window.screen) {
      try {
        (window.screen.orientation as any).lock?.('landscape-primary');
      } catch (error) {
        console.log('Orientação landscape não forçada');
      }
    }
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden">
        {/* Mobile Header Compacto */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-black/90 border-b border-green-400/30 px-2 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs">kuky.png</span>
            </div>
            {profile && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs truncate max-w-20">
                  {profile.name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Exit Button - Mobile */}
        <button 
          onClick={() => window.location.href = '/'} 
          className="absolute top-2 right-2 z-30 w-8 h-8 bg-red-500/20 border border-red-400/50 rounded-full flex items-center justify-center text-xs text-red-400 hover:bg-red-500/40"
        >
          ✕
        </button>

        {/* Fullscreen Game */}
        <div className="absolute inset-0 pt-10">
          <DebugInvadersGame />
        </div>

        {/* Fullscreen Toggle */}
        {!isFullscreen && (
          <button
            onClick={async () => {
              try {
                await document.documentElement.requestFullscreen();
              } catch (error) {
                console.log('Fullscreen failed');
              }
            }}
            className="absolute bottom-4 left-4 z-30 px-3 py-2 bg-green-600/80 border border-green-400 rounded text-xs text-white backdrop-blur-sm"
          >
            📱 Tela Cheia
          </button>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative">
      {/* Terminal Header */}
      <div className="border-b border-green-400/30 p-4 py-[29px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="ml-4 text-sm">terminal@kuky.png</span>
        </div>
      </div>

      {/* User Badge - Hacker Style */}
      {profile && (
        <div className="fixed top-4 right-4 z-10">
          <div className="bg-gray-900/80 border border-green-400/50 rounded-md backdrop-blur-sm my-0 px-[17px] py-[9px]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-mono">
                root@{profile.name.toLowerCase().replace(/\s+/g, '_')}
              </span>
            </div>
            <div className="text-[10px] text-green-400/70 mt-1">
              Access_Level: {profile.role.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Game Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-green-400 text-sm mb-2 font-mono">
            $ sudo ./debug_hunter --mode=professional --target=production
          </div>
          <div className="text-3xl font-bold mb-2 animate-pulse text-green-400">🐛 Caçador de Bugs</div>
          <div className="text-sm opacity-70 font-mono">[SISTEMA] Parabéns você achou um easter egg.</div>
          <div className="text-xs text-green-400/60 mt-2">Desenvolvido por: kuky.png</div>
        </div>

        <DebugInvadersGame />
      </div>

      {/* Footer com botão de voltar - mais escondido */}
      <div className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity duration-300">
        <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 px-3 py-2 bg-gray-900/60 border border-green-400/30 rounded-md backdrop-blur-sm hover:bg-green-900/40 hover:border-green-400/60 transition-all duration-300 group">
          <span className="text-green-400/70 text-sm group-hover:text-green-400">←</span>
          <span className="text-green-400/70 text-xs group-hover:text-white transition-colors">
            exit
          </span>
        </button>
      </div>
    </div>
  );
};