import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug } from '@/hooks/useDebugInvadersGame';

interface GameBoardProps {
  bugs: Bug[];
  onBugClick: (bugId: string) => void;
  isPlaying: boolean;
}

const BugComponent: React.FC<{ bug: Bug; onClick: () => void }> = ({ bug, onClick }) => {
  const getBugEmoji = (type: Bug['type']) => {
    switch (type) {
      case 'critical-bug': return '🔥';
      case 'memory-leak': return '💀';
      case 'boss-bug': return '🐛';
      case 'speed-bug': return '🐛';
      default: return '🐞';
    }
  };

  const getBugColor = (type: Bug['type']) => {
    switch (type) {
      case 'critical-bug': return 'text-red-400';
      case 'memory-leak': return 'text-purple-400';
      case 'boss-bug': return 'text-yellow-400 animate-pulse';
      case 'speed-bug': return 'text-red-500 animate-bounce';
      default: return 'text-green-400';
    }
  };

  const getBugSize = (type: Bug['type']) => {
    if (type === 'boss-bug') return 'text-4xl';
    if (type === 'speed-bug') return 'text-3xl';
    return 'text-2xl';
  };

  return (
    <motion.button
      onClick={onClick}
      className={`absolute ${getBugSize(bug.type)} hover:scale-110 transition-transform cursor-pointer select-none ${getBugColor(bug.type)}`}
      style={{
        left: `${bug.x}%`,
        top: `${bug.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      animate={
        bug.type === 'boss-bug' 
          ? { scale: [1, 1.2, 1] } 
          : bug.type === 'speed-bug' 
          ? { y: [0, -5, 0], rotate: [0, 5, -5, 0] }
          : {}
      }
      transition={
        bug.type === 'boss-bug' 
          ? { duration: 0.5, repeat: Infinity } 
          : bug.type === 'speed-bug'
          ? { duration: 0.2, repeat: Infinity }
          : {}
      }
    >
      {getBugEmoji(bug.type)}
      {bug.type === 'boss-bug' && bug.bossTimer && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          {Math.ceil(bug.bossTimer / 1000)}s
        </div>
      )}
    </motion.button>
  );
};

export const GameBoard: React.FC<GameBoardProps> = ({ bugs, onBugClick, isPlaying }) => {
  const bossCount = bugs.filter(bug => bug.type === 'boss-bug').length;
  
  return (
    <div className="relative w-full h-96 bg-gray-900 border-2 border-green-400/30 rounded-lg overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-12 h-full">
          {Array.from({ length: 120 }).map((_, i) => (
            <div key={i} className="border border-green-400/20"></div>
          ))}
        </div>
      </div>

      {/* Bugs */}
      <AnimatePresence>
        {bugs.map(bug => (
          <BugComponent
            key={bug.id}
            bug={bug}
            onClick={() => onBugClick(bug.id)}
          />
        ))}
      </AnimatePresence>

      {/* Debug info */}
      {isPlaying && (
        <div className="absolute top-2 left-2 text-xs text-green-400/70 space-y-1">
          <div>Processos ativos: {bugs.length}</div>
          <div>Sistema: {bossCount > 0 ? 'QUEBROU' : 'PERIGO'}</div>
        </div>
      )}

      {/* Boss alert */}
      {bossCount > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/20 border-2 border-red-500 rounded-lg p-4 text-center">
          <div className="text-red-400 font-bold animate-pulse">ALERTA CRÍTICO</div>
          <div className="text-sm text-red-300">Sistema sob ataque!</div>
        </div>
      )}

      {/* Game area indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500/50"></div>
    </div>
  );
};