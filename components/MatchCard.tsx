import React from 'react';

interface Match {
  id: string;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  scorers_home: string;
  scorers_away: string;
  assists_home: string;
  assists_away: string;
  round?: string;
  status: 'scheduled' | 'completed';
}

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const renderScorers = (scorers: string) => {
    if (!scorers) return [];
    return scorers.split(',').map(s => s.trim()).filter(Boolean);
  };

  const renderAssisters = (assists: string) => {
    if (!assists) return [];
    return assists.split(',').map(a => a.trim()).filter(Boolean);
  };

  return (
    <div className="card p-6 hover-lift">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{match.team_home}</h3>
        </div>
        <div className="text-center mx-6">
          <p className="text-3xl font-bold text-gold">
            {match.score_home !== null ? match.score_home : '-'} - {match.score_away !== null ? match.score_away : '-'}
          </p>
          {match.round && <p className="text-xs text-gray-400 mt-1">{match.round}</p>}
        </div>
        <div className="flex-1 text-right">
          <h3 className="text-lg font-bold text-white">{match.team_away}</h3>
        </div>
      </div>

      {match.status === 'completed' && (
        <div className="grid grid-cols-2 gap-4 text-xs border-t border-secondary/20 pt-4">
          <div>
            <div className="mb-3">
              <h4 className="font-semibold text-gold mb-2">Buteurs</h4>
              <div className="space-y-1">
                {renderScorers(match.scorers_home).map((scorer, idx) => (
                  <p key={idx} className="text-gray-300">⚽ {scorer}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gold mb-2">Passeurs</h4>
              <div className="space-y-1">
                {renderAssisters(match.assists_home).map((assist, idx) => (
                  <p key={idx} className="text-gray-300">👟 {assist}</p>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-3">
              <h4 className="font-semibold text-gold mb-2">Buteurs</h4>
              <div className="space-y-1">
                {renderScorers(match.scorers_away).map((scorer, idx) => (
                  <p key={idx} className="text-gray-300">⚽ {scorer}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gold mb-2">Passeurs</h4>
              <div className="space-y-1">
                {renderAssisters(match.assists_away).map((assist, idx) => (
                  <p key={idx} className="text-gray-300">👟 {assist}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
