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
      case 'speed-bug': return '⚡';
      default: return '🐞';
    }
  };

  const getBugColor = (type: Bug['type']) => {
    switch (type) {
      case 'critical-bug': return 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]';
      case 'memory-leak': return 'text-purple-400 drop-shadow-[0_0_8px_rgba(196,181,253,0.6)]';
      case 'boss-bug': return 'text-yellow-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]';
      case 'speed-bug': return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]';
      default: return 'text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]';
    }
  };

  const getBugSize = (type: Bug['type']) => {
    if (type === 'boss-bug') return 'text-5xl w-16 h-16';
    if (type === 'speed-bug') return 'text-3xl w-12 h-12';
    return 'text-2xl w-10 h-10';
  };

  const getClickEffect = () => ({
    scale: [1, 1.3, 0.8],
    rotate: [0, 180, 360],
    opacity: [1, 0.8, 0],
    transition: { duration: 0.3 }
  });

  return (
    <motion.button
      onClick={onClick}
      className={`absolute z-10 ${getBugSize(bug.type)} hover:scale-110 transition-transform cursor-pointer select-none ${getBugColor(bug.type)}`}
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
  const speedBugCount = bugs.filter(bug => bug.type === 'speed-bug').length;
  
  return (
    <div className="relative w-full h-96 bg-gradient-to-b from-gray-900 to-gray-800 border-2 border-green-400/30 rounded-lg overflow-hidden shadow-2xl">
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-20 h-full">
          {Array.from({ length: 200 }).map((_, i) => (
            <motion.div 
              key={i} 
              className="border border-green-400/10 bg-green-400/5"
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </div>
      </div>

      {/* Scanning lines effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/10 to-transparent h-4"
        animate={{ y: [0, 384, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Bugs */}
      <AnimatePresence mode="popLayout">
        {isPlaying && bugs.map(bug => (
          <BugComponent
            key={bug.id}
            bug={bug}
            onClick={() => onBugClick(bug.id)}
          />
        ))}
      </AnimatePresence>

      {/* Enhanced debug info */}
      {isPlaying && (
        <div className="absolute top-2 left-2 text-xs text-green-400/80 space-y-1 bg-black/30 p-2 rounded backdrop-blur-sm">
          <div className="font-mono">
            <span className="text-green-300">PROC:</span> {bugs.length}
          </div>
          <div className="font-mono">
            <span className="text-yellow-300">STATUS:</span> {bossCount > 0 ? '🚨 CRITICAL' : speedBugCount > 0 ? '⚡ ALERT' : '✅ STABLE'}
          </div>
          <div className="font-mono text-blue-300">
            <span>THREATS:</span> {bugs.filter(b => b.type !== 'bug').length}
          </div>
        </div>
      )}

      {/* Enhanced boss alert */}
      {bossCount > 0 && (
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/30 border-2 border-red-400 rounded-lg p-6 text-center backdrop-blur-sm"
          animate={{ 
            scale: [1, 1.05, 1],
            boxShadow: ['0 0 20px rgba(239,68,68,0.5)', '0 0 40px rgba(239,68,68,0.8)', '0 0 20px rgba(239,68,68,0.5)']
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="text-red-300 font-bold text-lg animate-pulse mb-2">🚨 SISTEMA COMPROMETIDO 🚨</div>
          <div className="text-sm text-red-200">Elimine o boss rapidamente!</div>
        </motion.div>
      )}

      {/* Speed bug warning */}
      {speedBugCount > 0 && bossCount === 0 && (
        <motion.div 
          className="absolute top-4 right-4 bg-cyan-500/20 border border-cyan-400 rounded-lg p-3 text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <div className="text-cyan-300 font-bold text-sm">⚡ BUG CRÍTICO DETECTADO</div>
          <div className="text-xs text-cyan-200">Não deixe passar!</div>
        </motion.div>
      )}

      {/* Enhanced game area indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500/50 via-yellow-500/50 to-red-500/50 animate-pulse"></div>
      
      {/* Corner decorations */}
      <div className="absolute top-1 left-1 w-6 h-6 border-l-2 border-t-2 border-green-400/50"></div>
      <div className="absolute top-1 right-1 w-6 h-6 border-r-2 border-t-2 border-green-400/50"></div>
      <div className="absolute bottom-1 left-1 w-6 h-6 border-l-2 border-b-2 border-green-400/50"></div>
      <div className="absolute bottom-1 right-1 w-6 h-6 border-r-2 border-b-2 border-green-400/50"></div>
    </div>
  );
};