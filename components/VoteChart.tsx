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

  // Ensure we have exactly 6 teams (or less if not enough)
  const displayTeams = sortedTeams.slice(0, 6);
  
  // If less than 6 teams, fill with empty placeholders
  while (displayTeams.length < 6) {
    displayTeams.push({ id: `empty-${displayTeams.length}`, name: '-', votes: 0 });
  }

  return (
    <div className="flex items-end justify-between gap-1 sm:gap-2 h-56 sm:h-64 px-1 sm:px-2 pt-8">
      {displayTeams.map((team, idx) => {
        const height = maxVotes > 0 ? (team.votes / maxVotes) * 100 : 5;
        const isEmpty = team.id.startsWith('empty');
        return (
          <div key={team.id} className="flex flex-col items-center flex-1 min-w-0">
            <div className="relative w-full flex flex-col items-center">
              {/* Vote count label - always visible */}
              <span 
                className={`text-[10px] sm:text-xs font-bold mb-1 ${isEmpty ? 'text-slate-600' : 'text-white'}`}
                style={{ minHeight: '1.2em' }}
              >
                {team.votes > 0 ? team.votes : ''}
              </span>
              {/* Bar */}
              <div 
                className={`w-3 sm:w-5 md:w-7 lg:w-8 rounded-t-md transition-all duration-500 ${
                  isEmpty ? 'bg-slate-700/30' : colors[idx % colors.length]
                }`}
                style={{ height: `${Math.max(height, isEmpty ? 2 : 5)}%` }}
              />
            </div>
            {/* Team name */}
            <p 
              className={`mt-2 text-[8px] sm:text-[10px] md:text-xs font-medium text-center truncate w-full px-1 ${
                isEmpty ? 'text-slate-600' : 'text-slate-400'
              }`} 
              title={team.name}
            >
              {team.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}
