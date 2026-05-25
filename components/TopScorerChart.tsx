import React from 'react';

interface TopScorer {
  name: string;
  goals: number;
}

interface TopScorerChartProps {
  scorers: TopScorer[];
  type: 'scorers' | 'assisters';
}

export default function TopScorerChart({ scorers, type }: TopScorerChartProps) {
  // Handle empty or invalid data
  if (!scorers || scorers.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-slate-500 text-sm">
          {type === 'scorers' ? 'Aucun buteur enregistré' : 'Aucun passeur enregistré'}
        </p>
      </div>
    );
  }

  const maxValue = Math.max(...scorers.map(s => s.goals || 0), 1);
  const topThree = scorers.slice(0, 3);
  
  // If less than 3 scorers, fill with placeholders
  while (topThree.length < 3) {
    topThree.push({ name: '-', goals: 0 });
  }

  // 3 different colors for the bars
  const colors = [
    'from-yellow-400 via-yellow-500 to-yellow-600',
    'from-blue-400 via-blue-500 to-blue-600', 
    'from-green-400 via-green-500 to-green-600'
  ];
  const barColors = ['bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
  const badges = ['🥇', '🥈', '🥉'];
  const icon = type === 'scorers' ? '⚽' : '👟';

  return (
    <div className="flex items-end justify-center gap-3 md:gap-6 h-56 px-2 pb-2">
      {topThree.map((scorer, idx) => {
        const goalCount = scorer.goals || 0;
        const height = maxValue > 0 ? (goalCount / maxValue) * 100 : 10;
        const isEmpty = scorer.name === '-' || goalCount === 0;
        const minHeight = goalCount > 0 ? 20 : 10;
        
        return (
          <div key={idx} className="flex flex-col items-center flex-1 max-w-[100px] h-full justify-end">
            {/* Badge */}
            <div className="text-2xl md:text-3xl mb-2">{badges[idx]}</div>
            
            {/* Count label on top */}
            <div 
              className={`text-xs md:text-sm font-bold mb-1 flex items-center gap-1 ${
                isEmpty ? 'text-slate-600' : 'text-white'
              }`}
            >
              {goalCount > 0 ? (
                <>
                  {goalCount}<span className="text-xs">{icon}</span>
                </>
              ) : (
                ''
              )}
            </div>
            
            {/* Bar container */}
            <div className="relative w-full flex flex-col items-center justify-end flex-1">
              <div
                className={`w-10 sm:w-14 md:w-16 rounded-t-xl shadow-lg transition-all duration-500 ${
                  isEmpty ? 'bg-slate-700/30' : `bg-gradient-to-t ${colors[idx]} ${barColors[idx]}`
                }`}
                style={{ height: `${Math.max(height, minHeight)}%` }}
              />
            </div>
            
            {/* Name */}
            <p className={`mt-3 font-semibold text-center truncate w-full px-1 text-[10px] md:text-xs ${
              isEmpty ? 'text-slate-600' : 'text-slate-200'
            }`}>
              {scorer.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
