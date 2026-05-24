import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable, getTeams } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
  players: string[];
  coach: string;
}

export default function Equipes() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  return (
    <div className="section-container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Équipes</h1>
        <p className="text-gray-400">Les 6 équipes engagées dans le tournoi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="card p-6 hover-lift">
            <h2 className="text-2xl font-bold text-gold mb-4">{team.name}</h2>
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Coach</h3>
              <p className="text-white">{team.coach}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Joueurs ({team.players?.length || 0})</h3>
              <ul className="space-y-1">
                {team.players?.map((player, idx) => (
                  <li key={idx} className="text-sm text-gray-300">• {player}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-gray-400">Aucune équipe enregistrée pour le moment.</p>
        </div>
      )}
    </div>
  );
}
