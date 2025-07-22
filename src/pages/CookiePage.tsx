import React from 'react';
import { DebugInvadersGame } from '@/components/game/DebugInvadersGame';
import { useAuth } from '@/hooks/useAuth';
export const CookiePage = () => {
  const {
    profile
  } = useAuth();
  return <div className="min-h-screen bg-black text-green-400 font-mono relative">
      {/* Terminal Header */}
      <div className="border-b border-green-400/30 p-4 py-[29px]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          
          
          <span className="ml-4 text-sm">terminal@kuky.png</span>
        </div>
      </div>

      {/* User Badge - Hacker Style */}
      {profile && <div className="fixed top-4 right-4 z-10">
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
        </div>}

      {/* Game Container */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-green-400 text-sm mb-2 font-mono">
            $ sudo ./debug_hunter --mode=professional --target=production
          </div>
          <div className="text-3xl font-bold mb-2 animate-pulse text-green-400">🐛 Caçador de Bugs</div>
          <div className="text-sm opacity-70 font-mono">[SISTEMA] Parabéns você achou um easter egg.</div>
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
    </div>;
};