import React from 'react';

interface VoteChartProps {
  teams: Array<{
    id: string;
    name: string;
    votes: number;
  }>;
}

export default function VoteChart({ teams }: VoteChartProps) {
  // Handle empty teams
  if (!teams || teams.length === 0) {
    return (
      <div className="h-56 sm:h-64 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Aucune équipe disponible</p>
      </div>
    );
  }

  const maxVotes = Math.max(...teams.map(t => t.votes || 0), 1);

  // Sort teams by votes descending
  const sortedTeams = [...teams].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 6);

  // Color palette for teams - 6 different colors
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
    <div className="flex items-end justify-between gap-1 sm:gap-2 h-56 sm:h-64 px-1 sm:px-2 pb-2">
      {displayTeams.map((team, idx) => {
        const voteCount = team.votes || 0;
        const height = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 5;
        const isEmpty = team.id.startsWith('empty');
        const minHeight = voteCount > 0 ? 15 : 5; // Minimum height for visibility
        
        return (
          <div key={team.id} className="flex flex-col items-center flex-1 min-w-0 h-full justify-end">
            <div className="relative w-full flex flex-col items-center justify-end h-full">
              {/* Vote count label on top */}
              <span 
                className={`text-[10px] sm:text-xs font-bold mb-1 ${isEmpty ? 'text-slate-600' : 'text-white'}`}
              >
                {voteCount > 0 ? voteCount : ''}
              </span>
              {/* Bar */}
              <div 
                className={`w-4 sm:w-6 md:w-8 lg:w-10 rounded-t-lg transition-all duration-500 ${
                  isEmpty ? 'bg-slate-700/30' : colors[idx % colors.length]
                }`}
                style={{ height: `${Math.max(height, minHeight)}%` }}
              />
            </div>
            {/* Team name */}
            <p 
              className={`mt-2 text-[8px] sm:text-[10px] md:text-xs font-medium text-center truncate w-full px-1 ${
                isEmpty ? 'text-slate-600' : 'text-slate-300'
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
