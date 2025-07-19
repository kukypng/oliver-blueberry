import React from 'react';
interface GameStatsProps {
  score: number;
  level: number;
  lives: number;
}
export const GameStats: React.FC<GameStatsProps> = ({
  score,
  level,
  lives
}) => {
  return <div className="bg-gray-900 border border-green-400/30 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-green-400 text-sm uppercase tracking-wide">Pontuação</div>
          <div className="text-2xl font-bold text-white">{score.toLocaleString()}</div>
        </div>
        
        <div>
          <div className="text-green-400 text-sm uppercase tracking-wide">Nível</div>
          <div className="text-2xl font-bold text-white">{level}</div>
        </div>
        
        <div>
          <div className="text-green-400 text-sm uppercase tracking-wide">SAÚDE DO SYSTEM</div>
          <div className="flex justify-center gap-1">
            {Array.from({
            length: 5
          }).map((_, i) => <div key={i} className={`w-4 h-4 rounded border-2 ${i < lives ? 'bg-red-500 border-red-400' : 'bg-gray-700 border-gray-600'}`} />)}
          </div>
        </div>
      </div>
      
      {/* Bug legend */}
      <div className="mt-4 pt-4 border-t border-green-400/20">
        <div className="text-xs text-green-400/70 text-center space-y-1">
          <div>
            <span className="mr-3">🐞 Bug (+10 pts)</span>
            <span className="mr-3">🔥 Crítico (+25 pts)</span>
            <span className="mr-3">💀 Vazamento (+50 pts)</span>
          </div>
          <div className="text-yellow-400 font-bold">🐛 Apple Bug (+1000 pts)</div>
          <div className="text-red-400">⚠️ Qualquer que passar -1 vida</div>
        </div>
      </div>
    </div>;
};