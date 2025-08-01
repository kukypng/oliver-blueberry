import React, { useCallback, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import { GameStats } from './GameStats';
import { GameOver } from './GameOver';
import { Ranking } from './Ranking';
import { GameConfigDisplay } from './GameConfigDisplay';
import { ParticleEffect } from './ParticleEffect';
import { useDebugInvadersGame } from '@/hooks/useDebugInvadersGame';
import { useGameSounds } from '@/hooks/useGameSounds';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { AnimatePresence } from 'framer-motion';
export const DebugInvadersGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useMobileDetection();
  const { playBugClick, playGameOver } = useGameSounds();
  const {
    gameState,
    score,
    level,
    lives,
    bugs,
    logs,
    particles,
    isGameOver,
    isPlaying,
    startGame,
    clickBug,
    restartGame,
    removeParticle
  } = useDebugInvadersGame();
  const handleBugClick = useCallback((bugId: string) => {
    clickBug(bugId);
    playBugClick();
  }, [clickBug, playBugClick]);

  // Handle ESC key to exit
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate('/');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  // Play game over sound
  useEffect(() => {
    if (isGameOver) {
      playGameOver();
    }
  }, [isGameOver, playGameOver]);

  // Se não está logado, mostrar mensagem de login necessário
  if (!user) {
    return <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 border border-red-400/30 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">Acesso Restrito</h2>
          <p className="text-green-400 mb-6">Você precisa estar logado para jogar!</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors">
              Fazer Login
            </button>
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors">
              Voltar ao Site
            </button>
          </div>
        </div>
      </div>;
  }
  if (isMobile) {
    return (
      <div className="h-full flex flex-col">
        {/* Mobile Game Stats - Compacto */}
        <div className="flex-shrink-0 bg-gray-900/90 border-b border-green-400/30 p-2">
          <div className="flex justify-between items-center text-xs">
            <div className="flex gap-4">
              <span className="text-green-400">Score: <span className="text-white font-bold">{score}</span></span>
              <span className="text-blue-400">Lvl: <span className="text-white">{level}</span></span>
              <span className="text-red-400">Lives: <span className="text-white">{lives}</span></span>
            </div>
            {bugs.length > 0 && (
              <span className="text-yellow-400">Bugs: {bugs.length}</span>
            )}
          </div>
        </div>

        {/* Mobile Game Board - Tela Cheia */}
        <div className="flex-1 relative">
          <GameBoard bugs={bugs} onBugClick={handleBugClick} isPlaying={isPlaying} isMobile={true} />
          
          {/* Particle Effects */}
          <AnimatePresence>
            {particles.map(particle => (
              <ParticleEffect
                key={particle.id}
                x={particle.x}
                y={particle.y}
                type={particle.type}
                onComplete={() => removeParticle(particle.id)}
              />
            ))}
          </AnimatePresence>
          
          {!isPlaying && !isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm">
              <div className="text-center p-4">
                <div className="text-green-400 text-sm mb-4 font-mono">// Inicializar debug mobile</div>
                <button 
                  onClick={startGame} 
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-colors font-mono"
                >
                  🚀 START
                </button>
                <div className="text-xs text-green-400/70 mt-2">Toque nos bugs para eliminá-los!</div>
              </div>
            </div>
          )}

          {isGameOver && <GameOver score={score} onRestart={restartGame} />}
        </div>

        {/* Mobile Quick Logs - Bottom */}
        {isPlaying && logs.length > 0 && (
          <div className="flex-shrink-0 bg-gray-900/95 border-t border-green-400/30 p-2 max-h-20 overflow-hidden">
            <div className="text-xs font-mono text-green-400/80">
              {logs[0]?.message}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3 space-y-4">
          <GameConfigDisplay />
          <GameStats score={score} level={level} lives={lives} />
          
          <div className="relative">
            <GameBoard bugs={bugs} onBugClick={handleBugClick} isPlaying={isPlaying} />
            
            {/* Particle Effects */}
            <AnimatePresence>
              {particles.map(particle => (
                <ParticleEffect
                  key={particle.id}
                  x={particle.x}
                  y={particle.y}
                  type={particle.type}
                  onComplete={() => removeParticle(particle.id)}
                />
              ))}
            </AnimatePresence>
            
            {!isPlaying && !isGameOver && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-green-400 text-lg mb-4">// Inicializar sistema de debug</div>
                  <button onClick={startGame} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xl transition-colors font-mono">
                    ./start_debug_hunter.sh
                  </button>
                </div>
              </div>
            )}

            {isGameOver && <GameOver score={score} onRestart={restartGame} />}
          </div>
        </div>

        {/* Sidebar with Logs and Ranking */}
        <div className="lg:col-span-1 space-y-6">
          {/* System Logs */}
          <div className="bg-gray-900 border border-green-400/30 rounded-lg">
            <div className="border-b border-green-400/30 p-3">
              <h3 className="text-green-400 font-mono text-sm uppercase tracking-wide">System Logs</h3>
            </div>
            <div className="p-3 max-h-64 overflow-y-auto space-y-2">
              {/* System Health Status */}
              {isPlaying && (
                <div className="text-xs font-mono border-b border-green-400/20 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400/70">[REAL-TIME]</span>
                    <span className="text-blue-400">STATUS</span>
                  </div>
                  <div className="text-green-300/80 ml-2 mt-1">
                    SAÚDE DO SYSTEM: {lives < 4 ? (
                      <span className="text-red-400 font-bold">PERIGO</span>
                    ) : (
                      <span className="text-green-400">SEGURO</span>
                    )}
                  </div>
                </div>
              )}
              
              {logs.length === 0 ? (
                <div className="text-green-400/50 text-xs font-mono">Sistema aguardando inicialização...</div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400/70">[{log.timestamp}]</span>
                      <span className={`
                        ${log.type === 'error' ? 'text-red-400' : ''}
                        ${log.type === 'warning' ? 'text-yellow-400' : ''}
                        ${log.type === 'success' ? 'text-green-400' : ''}
                        ${log.type === 'info' ? 'text-blue-400' : ''}
                      `}>
                        {log.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-green-300/80 ml-2 mt-1">{log.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ranking */}
          <Ranking />
        </div>
      </div>
    </div>
  );
};