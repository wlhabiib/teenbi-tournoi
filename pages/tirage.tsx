import React, { useState, useEffect } from 'react';
import { isSupabaseAvailable, getMatches } from '@/lib/supabase';

interface Match {
  id: string;
  team_home: string;
  team_away: string;
  score_home: number | null;
  score_away: number | null;
  round: string;
  status: 'scheduled' | 'completed';
  scorers_home: string;
  scorers_away: string;
  assists_home: string;
  assists_away: string;
}

export default function Tirage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [showResultForm, setShowResultForm] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const data = await getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const handleDraw = async () => {
    // Implement draw logic
  };

  return (
    <div className="section-container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Tirage au Sort</h1>
        <p className="text-gray-400">Automatique, autonome et transparent</p>
      </div>

      <button 
        onClick={handleDraw}
        className="btn-primary mb-8"
      >
        Lancer le tirage
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Brackets */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">Affiches</h2>
            <div className="space-y-4">
              {matches.map((match) => (
                <div key={match.id} className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold">{match.team_home}</p>
                    </div>
                    <div className="text-center mx-4">
                      <p className="text-2xl font-bold text-gold">
                        {match.score_home !== null ? match.score_home : '-'} - {match.score_away !== null ? match.score_away : '-'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{match.round}</p>
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-semibold">{match.team_away}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gold mb-4">Historique</h2>
          <div className="text-gray-400 text-sm">
            <p>En attente du premier tirage...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
