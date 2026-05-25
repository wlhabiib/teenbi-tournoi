import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

interface Team {
  id: string;
  name: string;
}

export default function Tirage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadMatches(), loadTeams()]);
    setLoading(false);
  };

  const loadMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setMatches(data);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const loadTeams = async () => {
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
  };

  const handleDraw = async () => {
    if (teams.length < 2) {
      alert("Il faut au moins 2 équipes enregistrées pour effectuer un tirage.");
      return;
    }
    
    // Le tirage est maintenant synchronisé avec les équipes réelles de la base
    alert(`Prêt pour le tirage avec ${teams.length} équipes : ${teams.map(t => t.name).join(', ')}`);
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

      {loading ? (
        <div className="text-center py-12 text-gold animate-pulse">Synchronisation avec Supabase...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Brackets */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-2xl font-bold text-gold mb-4">Affiches</h2>
              {matches.length === 0 ? (
                <p className="text-gray-400">Aucun match n'a encore été tiré au sort.</p>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="bg-secondary/10 p-4 rounded-lg border border-gold/10 hover:border-gold/30 transition-colors">
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
              )}
            </div>
          </div>

          {/* Équipes en lice (Synchronisées) */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gold mb-4">Équipes Qualifiées</h2>
            <div className="space-y-2">
              {teams.map(team => (
                <div key={team.id} className="flex items-center gap-3 p-2 bg-secondary/20 rounded border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_5px_rgba(251,191,36,0.5)]"></div>
                  <span className="text-sm font-medium">{team.name}</span>
                </div>
              ))}
              {teams.length === 0 && (
                <p className="text-gray-400 text-sm">Veuillez ajouter des équipes dans le volet Admin.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
