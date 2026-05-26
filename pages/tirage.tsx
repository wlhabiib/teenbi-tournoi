import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/* eslint-disable react/no-unescaped-entities */

interface Match {
  id: string;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  round: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
}

export default function Tirage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      if (data) setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  }, []);

  const loadTeams = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');
      if (error) throw error;
      if (data) setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadMatches(), loadTeams()]);
      setLoading(false);
    };
    init();
    // Auto-refresh toutes les 5 secondes
    const interval = setInterval(() => {
      loadMatches();
      loadTeams();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadMatches, loadTeams]);

  // Grouper les matchs par round
  const rounds = matches.reduce((acc: { [key: string]: Match[] }, match) => {
    const round = match.round || 'Phase initiale';
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {});

  const roundOrder = ['Phase initiale', 'Demi-finale', 'Finale'];
  const sortedRounds = Object.keys(rounds).sort(
    (a, b) => (roundOrder.indexOf(a) === -1 ? 99 : roundOrder.indexOf(a)) - (roundOrder.indexOf(b) === -1 ? 99 : roundOrder.indexOf(b))
  );

  return (
    <div className="section-container py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">🎲 Tirage au Sort</h1>
        <p className="text-yellow-200/70 text-lg">Résultats officiels — Mise à jour en temps réel</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-yellow-400 animate-pulse text-xl">
          🔄 Chargement du tirage...
        </div>
      ) : matches.length === 0 ? (
        /* Pas encore de tirage */
        <div className="card p-12 text-center max-w-lg mx-auto">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-yellow-300 mb-2">Tirage non encore effectué</h2>
          <p className="text-yellow-200/60">Le tirage au sort sera réalisé par l'administrateur. Les résultats apparaîtront ici automatiquement.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Résultats du tirage - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {sortedRounds.map((round) => (
              <div key={round}>
                {/* Titre du round */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-400/40"></div>
                  <h2 className="text-xl font-bold text-yellow-400 px-4 py-1 border border-yellow-400/30 rounded-full bg-yellow-400/10">
                    {round === 'Phase initiale' ? '🏟️ Phase Initiale' : round === 'Demi-finale' ? '⚔️ Demi-Finales' : round === 'Finale' ? '🏆 Finale' : `🎯 ${round}`}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-400/40"></div>
                </div>

                {/* Matchs du round */}
                <div className="space-y-3">
                  {rounds[round].map((match, idx) => (
                    <div
                      key={match.id}
                      className="bg-gradient-to-r from-slate-800/80 to-slate-700/50 border border-yellow-400/20 hover:border-yellow-400/50 rounded-xl p-4 md:p-5 transition-all duration-300 shadow-lg"
                    >
                      {/* Numéro de match */}
                      <p className="text-xs text-yellow-400/60 mb-3 font-semibold uppercase tracking-wider">Match {idx + 1}</p>

                      <div className="flex items-center justify-between gap-3">
                        {/* Équipe domicile */}
                        <div className="flex-1 text-center">
                          <div className="bg-slate-700/50 rounded-lg px-3 py-3 border border-yellow-400/10">
                            <p className="font-bold text-white text-sm md:text-base">{match.team_home}</p>
                          </div>
                        </div>

                        {/* Score / VS */}
                        <div className="text-center min-w-[70px]">
                          {match.status === 'completed' && match.score_home !== null && match.score_away !== null ? (
                            <div>
                              <p className="text-2xl md:text-3xl font-bold text-yellow-400">
                                {match.score_home} <span className="text-yellow-400/50">-</span> {match.score_away}
                              </p>
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Terminé</span>
                            </div>
                          ) : (
                            <div>
                              <p className="text-xl md:text-2xl font-bold text-yellow-400/70">VS</p>
                              <span className="text-xs bg-yellow-500/10 text-yellow-400/70 px-2 py-0.5 rounded-full border border-yellow-400/20">À jouer</span>
                            </div>
                          )}
                        </div>

                        {/* Équipe extérieur */}
                        <div className="flex-1 text-center">
                          <div className="bg-slate-700/50 rounded-lg px-3 py-3 border border-yellow-400/10">
                            <p className="font-bold text-white text-sm md:text-base">{match.team_away}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Équipes participantes - 1/3 */}
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <span>⚽</span> Équipes ({teams.length})
              </h2>
              <div className="space-y-2">
                {teams.map((team, idx) => (
                  <div key={team.id} className="flex items-center gap-3 p-2.5 bg-slate-700/40 rounded-lg border border-yellow-400/10 hover:border-yellow-400/30 transition-colors">
                    <span className="text-yellow-400/60 text-xs font-bold w-5 text-center">{idx + 1}</span>
                    <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]"></div>
                    <span className="text-sm font-medium text-white">{team.name}</span>
                  </div>
                ))}
                {teams.length === 0 && (
                  <p className="text-yellow-200/40 text-sm italic">Aucune équipe enregistrée.</p>
                )}
              </div>
            </div>

            {/* Stats du tirage */}
            <div className="card p-5">
              <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <span>📊</span> Résumé
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Total matchs', value: matches.length },
                  { label: 'Matchs joués', value: matches.filter(m => m.status === 'completed').length },
                  { label: 'Matchs restants', value: matches.filter(m => m.status !== 'completed').length },
                  { label: 'Équipes', value: teams.length },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center py-1.5 border-b border-yellow-400/10 last:border-0">
                    <span className="text-yellow-200/60 text-sm">{stat.label}</span>
                    <span className="font-bold text-yellow-300">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
