import React from 'react';

interface VoteChartProps {
  teams: Array<{
    id: string;
    name: string;
    votes: number;
  }>;
}

export default function VoteChart({ teams }: VoteChartProps) {
  const maxVotes = Math.max(...teams.map(t => t.votes), 1);

  // Sort teams by votes descending
  const sortedTeams = [...teams].sort((a, b) => b.votes - a.votes).slice(0, 6);

  // Color palette for teams
  const colors = [
    'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]',
    'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]',
    'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]',
    'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]',
  ];

  return (
    <div className="flex items-end justify-between gap-2 h-64 px-2 pt-10">
      {sortedTeams.map((team, idx) => {
        const height = (team.votes / maxVotes) * 100;
        return (
          <div key={team.id} className="flex flex-col items-center flex-1 group">
            <div className="relative w-full flex flex-col items-center">
              <span className="absolute -top-8 text-xs font-bold text-white group-hover:text-gold transition-colors">{team.votes}</span>
              <div 
                className={`w-4 sm:w-6 md:w-8 rounded-t-md transition-all duration-500 hover:brightness-125 ${colors[idx % colors.length]}`}
                style={{ height: `${Math.max(height, 5)}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] md:text-xs font-medium text-slate-400 text-center truncate w-full" title={team.name}>
              {team.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
