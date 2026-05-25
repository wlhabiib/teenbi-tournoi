import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      // Load all matches first to debug
      const allMatches = await getMatches();
      console.log('[Resultats] All matches:', allMatches);
      
      // Use getMatches which has localStorage fallback
      const data = await getMatches({ status: 'completed' });
      console.log('[Resultats] Completed matches:', data);
      
      // Also include matches that have scores (score_home is not null)
      const matchesWithScores = (allMatches || []).filter((m: any) => 
        m.status === 'completed' || m.score_home !== null || m.score_away !== null
      );
      console.log('[Resultats] Matches with scores:', matchesWithScores);
      
      setMatches(matchesWithScores.length > 0 ? matchesWithScores : (data || []));
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

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
