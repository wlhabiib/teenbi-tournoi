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
  const sortedTeams = [...teams].sort((a, b) => b.votes - a.votes);

  // Color palette for teams
  const colors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-yellow-500 to-yellow-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
  ];

  return (
    <div className="space-y-4">
      {sortedTeams.map((team, idx) => (
        <div key={team.id} className="flex items-center gap-4">
          <div className="w-32 text-right">
            <p className="font-semibold text-sm text-white">{team.name}</p>
          </div>
          <div className="flex-1">
            <div className="h-8 bg-secondary/20 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-300`}
                style={{ width: `${(team.votes / maxVotes) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-12 text-right">
            <p className="font-bold text-gold">{team.votes}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
