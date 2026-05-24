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
    <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-yellow-400/20 p-4 md:p-6 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] hover:border-yellow-400/40 transition-all duration-300 group">
      {/* Lumière dorée en arrière-plan */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-3 md:gap-4 mb-4 relative z-10">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-yellow-200 transition-colors duration-300">{match.team_home}</h3>
        </div>
        <div className="text-center mx-2 md:mx-6">
          <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
            {match.score_home !== null ? match.score_home : '-'} - {match.score_away !== null ? match.score_away : '-'}
          </p>
          {match.round && <p className="text-xs text-yellow-200/60 mt-1">{match.round}</p>}
        </div>
        <div className="flex-1 text-center md:text-right">
          <h3 className="text-sm md:text-lg font-bold text-white group-hover:text-yellow-200 transition-colors duration-300">{match.team_away}</h3>
        </div>
      </div>

      {match.status === 'completed' && (
        <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm border-t border-yellow-400/10 pt-4 relative z-10">
          <div>
            <div className="mb-3">
              <h4 className="font-semibold text-yellow-300 mb-2">Buteurs</h4>
              <div className="space-y-1">
                {renderScorers(match.scorers_home).map((scorer, idx) => (
                  <p key={idx} className="text-slate-300">⚽ {scorer}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-300 mb-2">Passeurs</h4>
              <div className="space-y-1">
                {renderAssisters(match.assists_home).map((assist, idx) => (
                  <p key={idx} className="text-slate-300">👟 {assist}</p>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div className="mb-3">
              <h4 className="font-semibold text-yellow-300 mb-2">Buteurs</h4>
              <div className="space-y-1">
                {renderScorers(match.scorers_away).map((scorer, idx) => (
                  <p key={idx} className="text-slate-300">⚽ {scorer}</p>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-300 mb-2">Passeurs</h4>
              <div className="space-y-1">
                {renderAssisters(match.assists_away).map((assist, idx) => (
                  <p key={idx} className="text-slate-300">👟 {assist}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
