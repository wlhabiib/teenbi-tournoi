import React, { useState } from 'react';

interface TopScorer {
  name: string;
  goals: number;
}

interface TopScorerChartProps {
  scorers: TopScorer[];
  type: 'scorers' | 'assisters';
}

export default function TopScorerChart({ scorers, type }: TopScorerChartProps) {
  const [displayType, setDisplayType] = useState<'scorers' | 'assisters'>(type);

  const maxValue = Math.max(...scorers.map(s => s.goals), 1);
  const topThree = scorers.slice(0, 3);

  const colors = ['from-red-500 to-orange-500', 'from-orange-500 to-yellow-500', 'from-yellow-500 to-green-500'];
  const badges = ['🏆', '🥈', '🥉'];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-center gap-6 h-40">
        {topThree.map((scorer, idx) => {
          const height = (scorer.goals / maxValue) * 160;
          return (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="text-2xl">{badges[idx]}</div>
              <div
                className={`w-12 bg-gradient-to-t ${colors[idx]} rounded-t-lg transition-all duration-300`}
                style={{ height: `${height}px` }}
              />
              <p className="font-semibold text-white text-sm">{scorer.name}</p>
              <p className="font-bold text-gold text-lg">{scorer.goals}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
