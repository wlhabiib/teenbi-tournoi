import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';
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
      if (!isSupabaseAvailable()) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase!
        .from('matches')
        .select('*')
        .eq('status', 'completed');
      if (error) throw error;
      setMatches(data || []);
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

      {!isSupabaseAvailable() && (
        <div className="card p-6 bg-yellow-500/10 border border-yellow-500/50 mb-6">
          <p className="text-yellow-300">
            ⚠️ Veuillez configurer vos variables d{"'"}environnement Supabase pour voir les résultats.
          </p>
        </div>
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
