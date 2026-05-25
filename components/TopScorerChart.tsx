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
  const maxValue = Math.max(...scorers.map(s => s.goals), 1);
  const topThree = scorers.slice(0, 3);

  const colors = ['from-yellow-400 to-yellow-600', 'from-slate-300 to-slate-500', 'from-orange-400 to-orange-600'];
  const badges = ['🏆', '🥈', '🥉'];
  const icon = type === 'scorers' ? '⚽' : '👟';

  return (
    <div className="flex items-end justify-center gap-4 md:gap-8 h-48 pt-10">
      {topThree.map((scorer, idx) => {
        const height = (scorer.goals / maxValue) * 100;
        return (
          <div key={idx} className="flex flex-col items-center flex-1 max-w-[80px]">
            <div className="text-xl md:text-2xl mb-1">{badges[idx]}</div>
            <div className="relative w-full flex flex-col items-center">
              <span className="absolute -top-7 text-xs font-bold text-white flex items-center gap-1">
                {scorer.goals}<span className="text-[10px]">{icon}</span>
              </span>
              <div
                className={`w-8 md:w-12 bg-gradient-to-t ${colors[idx]} rounded-t-lg shadow-lg transition-all duration-500`}
                style={{ height: `${Math.max(height, 10)}%` }}
              />
            </div>
            <p className="mt-2 font-semibold text-white text-[10px] md:text-xs text-center truncate w-full">{scorer.name}</p>
          </div>
        );
      })}
    </div>
  );
}
