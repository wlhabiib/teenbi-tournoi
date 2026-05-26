import React, { useState, useEffect, useCallback } from 'react';
import { getMatches } from '@/lib/supabase';
import MatchCard from '@/components/MatchCard';
import ChampionBanner from '@/components/ChampionBanner';

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

export default function Resultats() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const allMatches = await getMatches();
      const matchesWithScores = (allMatches || []).filter((m: any) =>
        m.status === 'completed' || m.score_home !== null || m.score_away !== null
      );
      setMatches(matchesWithScores);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 5000);
    return () => clearInterval(interval);
  }, [loadMatches]);

  // Détecter le champion (vainqueur de la Finale)
  const finaleMatch = matches.find(
    (m) => (m.round || '').toLowerCase() === 'finale' && m.status === 'completed'
  );
  const champion = finaleMatch
    ? (Number(finaleMatch.score_home) >= Number(finaleMatch.score_away)
        ? finaleMatch.team_home
        : finaleMatch.team_away)
    : null;

  // Calculer meilleur buteur & passeur
  const scorersMap: { [k: string]: number } = {};
  const assistsMap: { [k: string]: number } = {};
  matches.forEach((m) => {
    [m.scorers_home, m.scorers_away].forEach((s) =>
      (s || '').split(',').map((x: string) => x.trim()).filter(Boolean).forEach((n: string) => {
        scorersMap[n] = (scorersMap[n] || 0) + 1;
      })
    );
    [m.assists_home, m.assists_away].forEach((a) =>
      (a || '').split(',').map((x: string) => x.trim()).filter(Boolean).forEach((n: string) => {
        assistsMap[n] = (assistsMap[n] || 0) + 1;
      })
    );
  });
  const sortedScorers = Object.entries(scorersMap).sort((a, b) => b[1] - a[1]);
  const sortedAssisters = Object.entries(assistsMap).sort((a, b) => b[1] - a[1]);

  const topScorer = sortedScorers[0] ? { name: sortedScorers[0][0], goals: sortedScorers[0][1] } : null;
  const topAssister = sortedAssisters[0] ? { name: sortedAssisters[0][0], goals: sortedAssisters[0][1] } : null;

  const topScorerTies = topScorer
    ? sortedScorers.filter(([, g]) => g === topScorer.goals).map(([n]) => n)
    : [];
  const topAssisterTies = topAssister
    ? sortedAssisters.filter(([, g]) => g === topAssister.goals).map(([n]) => n)
    : [];

  return (
    <div className="section-container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">📊 Résultats</h1>
        <p className="text-gray-400">Tous les résultats des matchs</p>
      </div>

      {champion && (
        <ChampionBanner
          championName={champion}
          topScorer={topScorer}
          topAssister={topAssister}
          topScorerTies={topScorerTies}
          topAssisterTies={topAssisterTies}
        />
      )}

      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-gray-400">
              {loading ? "Chargement..." : "Aucun résultat pour le moment."}
            </p>
          </div>
        ) : (
          matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))
        )}
      </div>
    </div>
  );
}
