import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Bug {
  id: string;
  x: number;
  y: number;
  speed: number;
  type: 'bug' | 'critical-bug' | 'memory-leak' | 'boss-bug' | 'speed-bug';
  bossTimer?: number; // Para controlar o tempo do boss
}

export interface GameLog {
  id: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export type GameState = 'idle' | 'playing' | 'paused' | 'gameOver';

export const useDebugInvadersGame = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(5);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [logs, setLogs] = useState<GameLog[]>([]);
  const [gameSettings, setGameSettings] = useState({ speed_bug_spawn_rate: 0.02, speed_bug_speed_multiplier: 2.0 });
  
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const spawnTimerRef = useRef<NodeJS.Timeout>();
  const lastSpawnRef = useRef(0);

  const isPlaying = gameState === 'playing';
  const isGameOver = gameState === 'gameOver';

  // Add log entry
  const addLog = useCallback((type: GameLog['type'], message: string) => {
    const newLog: GameLog = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep last 10 logs
  }, []);

  // Generate random bug
  const createBug = useCallback((): Bug => {
    // Speed bug - chance baseada na configuração
    if (Math.random() < gameSettings.speed_bug_spawn_rate) {
      addLog('error', '⚡ BUG CRÍTICO: Processo ultrarrápido detectado!');
      return {
        id: `speed-${Date.now()}-${Math.random()}`,
        x: Math.random() * 90,
        y: -5,
        speed: (0.8 + (level * 0.1)) * gameSettings.speed_bug_speed_multiplier, // Super rápido
        type: 'speed-bug'
      };
    }
    
    // 0.1% chance for boss bug
    if (Math.random() < 0.001) {
      addLog('warning', 'ALERTA: Sistema crítico comprometido! Boss detectado!');
      return {
        id: `boss-${Date.now()}-${Math.random()}`,
        x: Math.random() * 90,
        y: -5,
        speed: 0.2 + (level * 0.05), // Boss moves slower
        type: 'boss-bug',
        bossTimer: 5000 // 5 seconds to click
      };
    }
    
    const bugTypes: Bug['type'][] = ['bug', 'critical-bug', 'memory-leak'];
    const type = bugTypes[Math.floor(Math.random() * bugTypes.length)];
    
    return {
      id: `bug-${Date.now()}-${Math.random()}`,
      x: Math.random() * 90,
      y: -5,
      speed: 0.3 + (level * 0.1) + Math.random() * 0.3,
      type
    };
  }, [level, addLog, gameSettings]);

  // Spawn bugs
  const spawnBug = useCallback(() => {
    if (!isPlaying) return;
    
    const now = Date.now();
    const spawnRate = Math.max(1200 - (level * 80), 500); // Mais tempo entre spawns
    
    if (now - lastSpawnRef.current > spawnRate) {
      setBugs(prev => [...prev, createBug()]);
      lastSpawnRef.current = now;
    }
  }, [isPlaying, level, createBug]);

  // Move bugs down and handle boss timer
  const updateBugs = useCallback(() => {
    if (!isPlaying) return;

    setBugs(prev => {
      const updatedBugs = prev.map(bug => {
        if (bug.type === 'boss-bug' && bug.bossTimer) {
          // Decrease boss timer
          const newTimer = bug.bossTimer - 50;
          if (newTimer <= 0) {
            // Boss timeout - deal 5 damage
            addLog('error', 'FALHA CRÍTICA: Sistema comprometido! -5 vidas');
            setLives(current => {
              const newLives = current - 5;
              if (newLives <= 0) {
                setGameState('gameOver');
              }
              return newLives;
            });
            return null; // Remove boss
          }
          return { ...bug, y: bug.y + bug.speed, bossTimer: newTimer };
        }
        return { ...bug, y: bug.y + bug.speed };
      }).filter(Boolean) as Bug[];
      
      // Verificar se speed-bug passou - se sim, deletar pontuação
      const speedBugPassed = updatedBugs.filter(bug => 
        bug.type === 'speed-bug' && bug.y >= 100 && (bug.y - bug.speed) < 100
      ).length;
      
      if (speedBugPassed > 0) {
        addLog('error', '💀 GAME OVER: Bug crítico passou! Pontuação deletada!');
        
        // Deletar todas as pontuações do usuário
        if (user?.id) {
          supabase
            .from('ranking_invaders')
            .delete()
            .eq('user_id', user.id)
            .then(() => {
              addLog('warning', 'Todas as pontuações anteriores foram deletadas');
            });
        }
        
        setGameState('gameOver');
        return updatedBugs.filter(bug => bug.type === 'boss-bug' || bug.y < 100);
      }
      
      // Count regular bugs that passed the bottom line
      const bugsPassedCount = updatedBugs.filter(bug => 
        bug.type !== 'boss-bug' && bug.type !== 'speed-bug' && bug.y >= 100 && (bug.y - bug.speed) < 100
      ).length;
      
      // Remove life for each regular bug that passed
      if (bugsPassedCount > 0) {
        addLog('warning', `${bugsPassedCount} processo(s) não tratado(s). Sistema comprometido.`);
        setLives(current => {
          const newLives = current - bugsPassedCount;
          if (newLives <= 0) {
            setGameState('gameOver');
          }
          return newLives;
        });
      }

      // Remove bugs that passed the bottom (except boss bugs handled above)
      return updatedBugs.filter(bug => bug.type === 'boss-bug' || bug.y < 100);
    });
  }, [isPlaying, addLog]);

  // Game loop
  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = setInterval(() => {
        updateBugs();
        spawnBug();
      }, 50); // 20 FPS

      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [isPlaying, updateBugs, spawnBug]);

  // Level progression - mais lento
  useEffect(() => {
    const newLevel = Math.floor(score / 150) + 1; // Precisa de mais pontos para subir de nível
    if (newLevel > level) {
      setLevel(newLevel);
    }
  }, [score, level]);

  // Click bug handler
  const clickBug = useCallback((bugId: string) => {
    if (!isPlaying) return;

    const clickedBug = bugs.find(bug => bug.id === bugId);
    if (!clickedBug) return;

    // Score based on bug type
    let points = 10;
    let logMessage = '';
    
    switch (clickedBug.type) {
      case 'critical-bug':
        points = 25;
        logMessage = 'Erro crítico resolvido. Sistema estabilizado.';
        break;
      case 'memory-leak':
        points = 50;
        logMessage = 'Vazamento de memória corrigido. Performance otimizada.';
        break;
      case 'boss-bug':
        points = 1000;
        logMessage = 'EXCELENTE! Boss eliminado! Sistema seguro novamente.';
        addLog('success', logMessage);
        break;
      case 'speed-bug':
        points = 200;
        logMessage = '⚡ INCRÍVEL! Bug ultrarrápido eliminado! Reflexos perfeitos!';
        addLog('success', logMessage);
        break;
      default:
        logMessage = 'Bug comum resolvido. Código limpo.';
    }

    if (clickedBug.type !== 'boss-bug' && clickedBug.type !== 'speed-bug') {
      addLog('info', logMessage);
    }

    // Update score and remove bug
    setScore(current => current + points);
    setBugs(prev => prev.filter(bug => bug.id !== bugId));
  }, [isPlaying, bugs, addLog]);

  // Game controls
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(5);
    setBugs([]);
    setLogs([]);
    lastSpawnRef.current = Date.now();
    addLog('info', 'Sistema iniciado. Caçador de bugs ativo.');
  }, [addLog]);

  const restartGame = useCallback(() => {
    setGameState('idle');
    setTimeout(startGame, 100);
  }, [startGame]);

  const pauseGame = useCallback(() => {
    if (isPlaying) {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [isPlaying, gameState]);

  // Load game settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data } = await supabase
          .from('game_settings')
          .select('*')
          .limit(1)
          .single();
        
        if (data) {
          setGameSettings({
            speed_bug_spawn_rate: data.speed_bug_spawn_rate,
            speed_bug_speed_multiplier: data.speed_bug_speed_multiplier
          });
        }
      } catch (error) {
        console.log('Usando configurações padrão do jogo');
      }
    };
    
    loadSettings();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, []);

  return {
    gameState,
    score,
    level,
    lives,
    bugs,
    logs,
    isPlaying,
    isGameOver,
    startGame,
    restartGame,
    pauseGame,
    clickBug
  };
};