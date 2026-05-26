import React, { useState, useEffect, useCallback } from 'react';
import { getMatches } from '@/lib/supabase';
import MatchCard from '@/components/MatchCard';

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

  return (
    <div className="section-container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">📊 Résultats</h1>
        <p className="text-gray-400">Tous les résultats des matchs</p>
      </div>


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
