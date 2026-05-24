import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

/* eslint-disable react/no-unescaped-entities */

interface Team {
  id: string;
  name: string;
  players: string[];
  coach: string;
}

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
  round: string;
  status: 'scheduled' | 'completed';
}

interface Settings {
  tournament_name: string;
  venue: string;
  pitch: string;
  sponsor_photo_url: string;
}

export default function Admin() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<Settings>({
    tournament_name: 'Tournoi de Fraternité du Quartier',
    venue: 'Quartier Teenbi',
    pitch: 'Terrain Teenbi',
    sponsor_photo_url: '',
  });

  const [activeTab, setActiveTab] = useState('teams');
  const [newTeam, setNewTeam] = useState({ name: '', coach: '', players: '' });
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!isSupabaseAvailable()) {
      console.warn('Supabase not configured');
      return;
    }

    try {
      const [teamsRes, matchesRes] = await Promise.all([
        supabase!.from('teams').select('*'),
        supabase!.from('matches').select('*'),
      ]);
      setTeams(teamsRes.data || []);
      setMatches(matchesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeam.name || !newTeam.coach) return;
    if (!isSupabaseAvailable()) {
      alert('Supabase not configured');
      return;
    }

    try {
      const { error } = await supabase!.from('teams').insert([
        {
          name: newTeam.name,
          coach: newTeam.coach,
          players: newTeam.players.split(',').map(p => p.trim()),
        },
      ]);
      if (error) throw error;
      setNewTeam({ name: '', coach: '', players: '' });
      loadData();
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  const handleUpdateMatch = async () => {
    if (!editingMatch) return;
    if (!isSupabaseAvailable()) {
      alert('Supabase not configured');
      return;
    }

    try {
      const { error } = await supabase!
        .from('matches')
        .update(editingMatch)
        .eq('id', editingMatch.id);
      if (error) throw error;
      setEditingMatch(null);
      loadData();
    } catch (error) {
      console.error('Error updating match:', error);
    }
  };

  const handleUploadSponsorPhoto = async (file: File) => {
    if (!isSupabaseAvailable()) {
      alert('Supabase not configured');
      return;
    }

    try {
      const fileName = `sponsor_${Date.now()}`;
      const { data, error } = await supabase!.storage
        .from('photos')
        .upload(fileName, file);
      if (error) throw error;
      
      const { data: publicUrl } = supabase!.storage
        .from('photos')
        .getPublicUrl(fileName);
      
      setSettings({ ...settings, sponsor_photo_url: publicUrl.publicUrl });
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  return (
    <div className="section-container">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Panel Administrateur</h1>
        <p className="text-gray-400">Gestion complète de la plateforme</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-secondary/30">
        {['teams', 'matches', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === tab
                ? 'text-gold border-b-2 border-gold'
                : 'text-gray-400 hover:text-gold'
            }`}
          >
            {tab === 'teams' && 'Équipes'}
            {tab === 'matches' && 'Matchs'}
            {tab === 'settings' && 'Paramètres'}
          </button>
        ))}
      </div>

      {/* Teams Tab */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Add Team Form */}
          <div className="card p-6 border-2 border-secondary/40 bg-gradient-to-r from-secondary/10 to-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">👥</span>
              <h2 className="text-2xl font-bold text-gold">Ajouter une équipe</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nom de l'équipe"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
              />
              <input
                type="text"
                placeholder="Coach"
                value={newTeam.coach}
                onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
                className="bg-secondary/10 border border-secondary/30 rounded-lg p-3 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
              />
              <textarea
                placeholder="Joueurs (séparés par des virgules)"
                value={newTeam.players}
                onChange={(e) => setNewTeam({ ...newTeam, players: e.target.value })}
                className="md:col-span-3 bg-secondary/10 border border-secondary/30 rounded-lg p-3 text-white placeholder-gray-500 h-20 focus:border-gold focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={handleAddTeam}
              className="w-full btn-primary font-semibold py-3"
            >
              ✓ Ajouter l{"'"}équipe
            </button>
          </div>

          {/* Teams List */}
          {teams.length > 0 && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gold mb-4">📋 Équipes ({teams.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 hover:border-gold/50 transition-colors">
                    <p className="font-bold text-gold">{team.name}</p>
                    <p className="text-sm text-gray-400 mt-1">Coach: {team.coach}</p>
                    <div className="text-xs text-gray-500 mt-2 max-h-12 overflow-y-auto">
                      {team.players?.join(", ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="card p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gold mb-3">{match.team_home} vs {match.team_away}</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-400">Score {match.team_home}</label>
                      <input
                        type="number"
                        value={editingMatch?.id === match.id ? editingMatch.score_home || 0 : match.score_home || 0}
                        onChange={(e) => editingMatch?.id === match.id && setEditingMatch({
                          ...editingMatch,
                          score_home: parseInt(e.target.value)
                        })}
                        className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Buteurs {match.team_home} (ex: nom1,nom2)</label>
                      <input
                        type="text"
                        value={editingMatch?.id === match.id ? editingMatch.scorers_home : match.scorers_home}
                        onChange={(e) => editingMatch?.id === match.id && setEditingMatch({
                          ...editingMatch,
                          scorers_home: e.target.value
                        })}
                        className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Passeurs {match.team_home}</label>
                      <input
                        type="text"
                        value={editingMatch?.id === match.id ? editingMatch.assists_home : match.assists_home}
                        onChange={(e) => editingMatch?.id === match.id && setEditingMatch({
                          ...editingMatch,
                          assists_home: e.target.value
                        })}
                        className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gold mb-3">&nbsp;</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-gray-400">Score {match.team_away}</label>
                      <input
                        type="number"
                        value={editingMatch?.id === match.id ? editingMatch.score_away || 0 : match.score_away || 0}
                        onChange={(e) => editingMatch?.id === match.id && setEditingMatch({
                          ...editingMatch,
                          score_away: parseInt(e.target.value)
                        })}
                        className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Buteurs {match.team_away}</label>
                      <input
                        type="text"
                        value={editingMatch?.id === match.id ? editingMatch.scorers_away : match.scorers_away}
                        onChange={(e) => editingMatch?.id === match.id && setEditingMatch({
                          ...editingMatch,
                          scorers_away: e.target.value
                        })}
                        className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Passeurs {match.team_away}</label>
                      <input
                        type="text"
                        value={editingMatch?.id === match.id ? editingMatch.assists_away : match.assists_away}
                        onChange={(e) => editingMatch?.id === match.id && setEditingMatch({
                          ...editingMatch,
                          assists_away: e.target.value
                        })}
                        className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {editingMatch?.id === match.id ? (
                  <>
                    <button
                      onClick={handleUpdateMatch}
                      className="btn-primary flex-1"
                    >
                      Sauvegarder
                    </button>
                    <button
                      onClick={() => setEditingMatch(null)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingMatch(match)}
                    className="btn-primary w-full"
                  >
                    Éditer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card p-6 max-w-2xl">
          <h2 className="text-2xl font-bold text-gold mb-6">Paramètres généraux</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Nom du tournoi</label>
              <input
                type="text"
                value={settings.tournament_name}
                onChange={(e) => setSettings({ ...settings, tournament_name: e.target.value })}
                className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Lieu</label>
              <input
                type="text"
                value={settings.venue}
                onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Terrain</label>
              <input
                type="text"
                value={settings.pitch}
                onChange={(e) => setSettings({ ...settings, pitch: e.target.value })}
                className="w-full bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Photo du parrain</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleUploadSponsorPhoto(e.target.files[0])}
                  className="flex-1 bg-secondary/10 border border-secondary/30 rounded-lg p-2 text-white"
                />
              </div>
              {settings.sponsor_photo_url && (
                <img src={settings.sponsor_photo_url} alt="Sponsor" className="mt-4 max-h-40 rounded-lg" />
              )}
            </div>

            <button
              onClick={() => console.log('Save settings')}
              className="w-full btn-primary mt-6"
            >
              Sauvegarder les paramètres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
