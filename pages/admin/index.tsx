import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase, addTeam, deleteTeam, getTeams, getMatches, getSettings } from '@/lib/supabase';
import { getCurrentUser, isUserAdmin } from '@/lib/authSupabase';
import type { User } from '@/lib/authSupabase';

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
  id?: string;
  tournament_name: string;
  venue: string;
  pitch: string;
  sponsor_photo_url: string;
  background_photo_url?: string;
  sponsor_name?: string;
  sponsor_about?: string;
}

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [settings, setSettings] = useState<Settings>({
    tournament_name: 'Tournoi de Fraternité du Quartier',
    venue: 'Quartier Teenbi',
    pitch: 'Terrain Teenbi',
    sponsor_photo_url: '',
    sponsor_name: 'Parrain du Tournoi',
    sponsor_about: '',
  });

  const [activeTab, setActiveTab] = useState('teams');
  const [newTeam, setNewTeam] = useState({ name: '', coach: '', players: '' });
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [drawTeams, setDrawTeams] = useState<Team[]>([]);
  const [drawResult, setDrawResult] = useState<{ team1: Team; team2: Team }[]>([]);

  // Vérification d'authentification au chargement
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isUserAdmin()) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les équipes (avec fallback localStorage)
      const teamsData = await getTeams();
      setTeams(teamsData);

      // Charger les matchs (avec fallback localStorage si disponible)
      const matchesData = await getMatches();
      setMatches(matchesData || []);

      // Charger les paramètres (avec fallback localStorage)
      const settingsData = await getSettings();
      if (settingsData) {
        setSettings({
          id: settingsData.id,
          tournament_name: settingsData.tournament_name || 'Tournoi de Fraternité du Quartier',
          venue: settingsData.venue || 'Quartier Teenbi',
          pitch: settingsData.pitch || 'Terrain Teenbi',
          sponsor_photo_url: settingsData.sponsor_photo_url || '',
          background_photo_url: settingsData.background_photo_url || '',
          sponsor_name: settingsData.sponsor_name || 'Parrain du Tournoi',
          sponsor_about: settingsData.sponsor_about || '',
        });
      }

      showMessage('success', 'Données chargées avec succès');
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', message: string) => {
    setSaveStatus({ type, message });
    setTimeout(() => setSaveStatus(null), 4000);
  };

  // ============== EQUIPES ==============
  const handleAddTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.coach.trim()) {
      showMessage('error', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const playersArray = newTeam.players
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      await addTeam({
        name: newTeam.name.trim(),
        coach: newTeam.coach.trim(),
        players: playersArray,
      });

      showMessage('success', 'Équipe ajoutée avec succès');
      setNewTeam({ name: '', coach: '', players: '' });
      loadData();
    } catch (error) {
      console.error('Error adding team:', error);
      showMessage('error', 'Erreur lors de l\'ajout de l\'équipe');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;

    try {
      await deleteTeam(teamId);
      showMessage('success', 'Équipe supprimée avec succès');
      loadData();
    } catch (error) {
      console.error('Error deleting team:', error);
      showMessage('error', 'Erreur lors de la suppression de l\'équipe');
    }
  };

  // ============== MATCHS ==============
  const handleUpdateMatch = async () => {
    if (!editingMatch) return;

    // Auto-set status to completed if scores are entered
    const updatedMatch = { ...editingMatch };
    if (updatedMatch.score_home !== null && updatedMatch.score_away !== null) {
      updatedMatch.status = 'completed';
    }

    try {
      if (supabase) {
        const { error } = await supabase
          .from('matches')
          .update(updatedMatch)
          .eq('id', updatedMatch.id);

        if (!error) {
          showMessage('success', 'Match mis à jour avec succès');
          setEditingMatch(null);
          loadData();
          return;
        }
        console.error('Supabase update match error:', error);
      }
      
      // Fallback localStorage
      const matches = JSON.parse(localStorage.getItem('localMatches') || '[]');
      const updated = matches.map((m: any) => m.id === updatedMatch.id ? updatedMatch : m);
      localStorage.setItem('localMatches', JSON.stringify(updated));
      showMessage('success', 'Match mis à jour (local)');
      setEditingMatch(null);
      loadData();
    } catch (error) {
      console.error('Error updating match:', error);
      showMessage('error', 'Erreur lors de la mise à jour du match');
    }
  };

  // ============== PARAMETRES ==============
  const handleSaveSettings = async () => {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('settings')
          .upsert({
            id: '1',
            ...settings,
            updated_at: new Date().toISOString(),
          });

        if (!error) {
          showMessage('success', 'Paramètres sauvegardés avec succès');
          return;
        }
        console.error('Supabase settings error:', error);
      }
      
      // Fallback localStorage
      localStorage.setItem('localSettings', JSON.stringify({ ...settings, id: '1' }));
      showMessage('success', 'Paramètres sauvegardés (local)');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleSaveDraw = async () => {
    if (drawResult.length === 0) return;
    setIsLoading(true);
    try {
      const matchesToInsert = drawResult.map((pair, idx) => ({
        id: 'match-' + Date.now() + '-' + idx,
        team_home: pair.team1.name,
        team_away: pair.team2.name,
        round: 'Tirage au sort',
        status: 'scheduled',
        created_at: new Date().toISOString(),
      }));

      if (supabase) {
        const { error } = await supabase.from('matches').insert(matchesToInsert);
        if (!error) {
          showMessage('success', 'Tirage enregistré et publié avec succès');
          setDrawResult([]);
          loadData();
          return;
        }
        console.error('Supabase draw error:', error);
      }
      
      // Fallback localStorage
      const existing = JSON.parse(localStorage.getItem('localMatches') || '[]');
      localStorage.setItem('localMatches', JSON.stringify([...existing, ...matchesToInsert]));
      showMessage('success', 'Tirage enregistré (local)');
      setDrawResult([]);
      loadData();
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'enregistrement du tirage');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !isUserAdmin()) {
    return (
      <div className="section-container text-center py-20">
        <p className="text-secondary text-lg">Vérification des droits d'accès...</p>
      </div>
    );
  }

  // ============== TIRAGE ==============
  const handleDraw = (numberOfTeams: number) => {
    if (teams.length < numberOfTeams) {
      showMessage('error', `Vous devez avoir au moins ${numberOfTeams} équipes pour faire un tirage`);
      return;
    }

    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const pairs: { team1: Team; team2: Team }[] = [];
    
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        pairs.push({ team1: shuffled[i], team2: shuffled[i + 1] });
      }
    }

    setDrawTeams(shuffled);
    setDrawResult(pairs);
    setActiveTab('draws');
    showMessage('success', `Tirage de ${numberOfTeams} équipes effectué !`);
  };

  return (
<div className="section-container overflow-x-hidden">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Panel Administrateur</h1>
        <p className="text-secondary">Gestion complète de la plateforme Tournoi Teenbi</p>
      </div>

      {/* Message de statut */}
      {saveStatus && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            saveStatus.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {saveStatus.type === 'success' ? '✓' : '✕'} {saveStatus.message}
        </div>
      )}

      {/* Loading state */}
      {isLoading && <div className="text-center py-8 text-secondary">Chargement...</div>}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-secondary/30 overflow-x-auto">
        {[
          { id: 'teams', label: '👥 Équipes' },
          { id: 'draws', label: '🎲 Tirage' },
          { id: 'matches', label: '⚽ Matchs' },
          { id: 'settings', label: '⚙️ Paramètres' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-gold border-b-2 border-gold'
                : 'text-secondary hover:text-gold'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============== EQUIPES TAB ============== */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          {/* Add Team Form */}
          <div className="card p-6 border-2 border-accent/30 bg-gradient-to-r from-secondary/10 to-primary/5">
            <h2 className="text-2xl font-bold text-gold mb-4">➕ Ajouter une équipe</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nom de l'équipe"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
              <input
                type="text"
                placeholder="Nom du coach"
                value={newTeam.coach}
                onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
              <textarea
                placeholder="Joueurs (séparés par des virgules, ex: nom1, nom2, nom3)"
                value={newTeam.players}
                onChange={(e) => setNewTeam({ ...newTeam, players: e.target.value })}
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white placeholder-slate-400 focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all h-24 resize-none"
              />
              <button
                onClick={handleAddTeam}
                className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105"
              >
                ✓ Ajouter l'équipe
              </button>
            </div>
          </div>

          {/* Teams List */}
          {teams.length > 0 ? (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gold mb-6">Équipes ({teams.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 hover:border-gold/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gold">{team.name}</p>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-secondary">Coach: {team.coach}</p>
                    <div className="text-xs text-secondary/70 mt-3 bg-secondary/5 rounded p-2">
                      <p className="font-semibold mb-1">Joueurs:</p>
                      {team.players?.length > 0 ? (
                        <p>{team.players.join(', ')}</p>
                      ) : (
                        <p className="text-secondary/50">Aucun joueur enregistré</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-secondary text-lg">Aucune équipe créée</p>
              <p className="text-secondary/70">Commencez par ajouter une équipe ci-dessus</p>
            </div>
          )}
        </div>
      )}

      {/* ============== TIRAGE TAB ============== */}
      {activeTab === 'draws' && (
        <div className="space-y-6">
          {/* Actions de tirage */}
          <div className="card p-6 bg-gradient-to-r from-secondary/10 to-primary/5">
            <h2 className="text-2xl font-bold text-gold mb-4">🎲 Tirage au Sort</h2>
            <p className="text-secondary mb-6">Sélectionnez le nombre d'équipes pour le tirage</p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => handleDraw(6)}
                disabled={teams.length < 6}
                className={`px-6 py-3 font-bold rounded-lg transition-all transform ${
                  teams.length < 6
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-600 hover:scale-105 text-slate-900'
                }`}
              >
                🏆 Tirage 6 Équipes
              </button>
              <button
                onClick={() => handleDraw(3)}
                disabled={teams.length < 3}
                className={`px-6 py-3 font-bold rounded-lg transition-all transform ${
                  teams.length < 3
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-600 hover:scale-105 text-slate-900'
                }`}
              >
                ⚽ Tirage 3 Équipes
              </button>
            </div>
          </div>

          {/* Résultats du tirage */}
          {drawResult.length > 0 && (
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gold">📋 Résultats du Tirage</h3>
                <button
                  onClick={handleSaveDraw}
                  className="btn-primary py-2 px-6"
                >
                  💾 Enregistrer et Publier
                </button>
              </div>
              <div className="space-y-4">
                {drawResult.map((match, idx) => (
                  <div key={idx} className="bg-secondary/10 border-2 border-yellow-400/30 rounded-lg p-6 hover:border-yellow-400/60 transition-all">
                    <div className="flex justify-center items-center gap-4">
                      <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-yellow-400/20">
                        <p className="text-gold font-bold text-center text-lg">{match.team1.name}</p>
                        <p className="text-secondary text-sm text-center">Coach: {match.team1.coach}</p>
                      </div>
                      <div className="text-yellow-400 font-bold text-2xl">VS</div>
                      <div className="flex-1 bg-slate-800/50 p-4 rounded-lg border border-yellow-400/20">
                        <p className="text-gold font-bold text-center text-lg">{match.team2.name}</p>
                        <p className="text-secondary text-sm text-center">Coach: {match.team2.coach}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {drawResult.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-secondary text-lg">Aucun tirage effectué</p>
              <p className="text-secondary/70">Cliquez sur un bouton ci-dessus pour faire un tirage</p>
            </div>
          )}
        </div>
      )}

      {/* ============== MATCHS TAB ============== */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.id} className="card p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gold">
                    {match.team_home} vs {match.team_away}
                  </h3>
                  <p className="text-sm text-secondary">Round: {match.round || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  {/* Équipe 1 */}
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-3">{match.team_home}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-secondary font-semibold">Score</label>
                        <input
                          type="number"
                          value={editingMatch?.id === match.id ? editingMatch.score_home || 0 : match.score_home || 0}
                          onChange={(e) =>
                            editingMatch?.id === match.id &&
                            setEditingMatch({
                              ...editingMatch,
                              score_home: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-primary/50 border border-secondary/30 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-secondary font-semibold">Buteurs (séparés par ,)</label>
                        <input
                          type="text"
                          value={editingMatch?.id === match.id ? editingMatch.scorers_home : match.scorers_home}
                          onChange={(e) =>
                            editingMatch?.id === match.id &&
                            setEditingMatch({ ...editingMatch, scorers_home: e.target.value })
                          }
                          className="w-full bg-primary/50 border border-secondary/30 rounded p-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-secondary font-semibold">Passeurs (séparés par ,)</label>
                        <input
                          type="text"
                          value={editingMatch?.id === match.id ? editingMatch.assists_home : match.assists_home}
                          onChange={(e) =>
                            editingMatch?.id === match.id &&
                            setEditingMatch({ ...editingMatch, assists_home: e.target.value })
                          }
                          className="w-full bg-primary/50 border border-secondary/30 rounded p-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Équipe 2 */}
                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <h4 className="font-bold text-accent mb-3">{match.team_away}</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-secondary font-semibold">Score</label>
                        <input
                          type="number"
                          value={editingMatch?.id === match.id ? editingMatch.score_away || 0 : match.score_away || 0}
                          onChange={(e) =>
                            editingMatch?.id === match.id &&
                            setEditingMatch({
                              ...editingMatch,
                              score_away: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full bg-primary/50 border border-secondary/30 rounded p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-secondary font-semibold">Buteurs (séparés par ,)</label>
                        <input
                          type="text"
                          value={editingMatch?.id === match.id ? editingMatch.scorers_away : match.scorers_away}
                          onChange={(e) =>
                            editingMatch?.id === match.id &&
                            setEditingMatch({ ...editingMatch, scorers_away: e.target.value })
                          }
                          className="w-full bg-primary/50 border border-secondary/30 rounded p-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-secondary font-semibold">Passeurs (séparés par ,)</label>
                        <input
                          type="text"
                          value={editingMatch?.id === match.id ? editingMatch.assists_away : match.assists_away}
                          onChange={(e) =>
                            editingMatch?.id === match.id &&
                            setEditingMatch({ ...editingMatch, assists_away: e.target.value })
                          }
                          className="w-full bg-primary/50 border border-secondary/30 rounded p-2 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingMatch?.id === match.id ? (
                    <>
                      <button
                        onClick={handleUpdateMatch}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-all"
                      >
                        ✓ Sauvegarder
                      </button>
                      <button
                        onClick={() => setEditingMatch(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-all"
                      >
                        ✕ Annuler
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingMatch(match)}
                      className="w-full bg-accent hover:bg-accent/80 text-white font-bold py-2 rounded-lg transition-all"
                    >
                      ✏️ Éditer
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card p-12 text-center">
              <p className="text-secondary text-lg">Aucun match créé</p>
              <p className="text-secondary/70">Les matchs seront affichés ici une fois créés</p>
            </div>
          )}
        </div>
      )}

      {/* ============== PARAMETRES TAB ============== */}
      {activeTab === 'settings' && (
        <div className="card p-6 max-w-3xl">
          <h2 className="text-2xl font-bold text-gold mb-6">⚙️ Paramètres Généraux</h2>

          <div className="space-y-6">
            {/* Nom du tournoi */}
            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Nom du tournoi</label>
              <input
                type="text"
                value={settings.tournament_name}
                onChange={(e) => setSettings({ ...settings, tournament_name: e.target.value })}
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Lieu</label>
              <input
                type="text"
                value={settings.venue}
                onChange={(e) => setSettings({ ...settings, venue: e.target.value })}
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            {/* Terrain */}
            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Terrain</label>
              <input
                type="text"
                value={settings.pitch}
                onChange={(e) => setSettings({ ...settings, pitch: e.target.value })}
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            {/* Nom du parrain */}
            <div>
              <label className="block text-sm font-semibold text-gold mb-2">Nom du parrain</label>
              <input
                type="text"
                value={settings.sponsor_name || ''}
                onChange={(e) => setSettings({ ...settings, sponsor_name: e.target.value })}
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all"
              />
            </div>

            {/* À propos du parrain */}
            <div>
              <label className="block text-sm font-semibold text-gold mb-2">À propos du parrain</label>
              <textarea
                value={settings.sponsor_about || ''}
                onChange={(e) => setSettings({ ...settings, sponsor_about: e.target.value })}
                placeholder="Texte de présentation du parrain..."
                className="w-full bg-slate-800/80 border-2 border-yellow-400/30 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400/80 focus:ring-2 focus:ring-yellow-400/30 transition-all h-32 resize-none"
              />
            </div>

            {/* Bouton de sauvegarde */}
            <button
              onClick={handleSaveSettings}
              className="w-full bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent text-white font-bold py-3 rounded-lg transition-all transform hover:scale-105 mt-8"
            >
              ✓ Sauvegarder tous les paramètres
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
