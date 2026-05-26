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
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawHistory, setDrawHistory] = useState<Team[]>([]);
  const [drawTimestamp, setDrawTimestamp] = useState<string | null>(null);
  const [showDrawAnimation, setShowDrawAnimation] = useState(false);
  
  // Visual draw animation states
  const [drawStep, setDrawStep] = useState(0);
  const [currentDrawingTeam, setCurrentDrawingTeam] = useState<Team | null>(null);
  const [remainingTeams, setRemainingTeams] = useState<Team[]>([]);
  const [drawnTeams, setDrawnTeams] = useState<Team[]>([]);
  const [drawMode, setDrawMode] = useState<'initial' | 'semifinal' | null>(null);
  const [semifinalResult, setSemifinalResult] = useState<{ team1: Team; team2: Team; byeTeam: Team } | null>(null);

  // Vérification d'authentification au chargement
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || !isUserAdmin()) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const teamsData = await getTeams();
      setTeams(teamsData);

      const matchesData = await getMatches();
      setMatches(matchesData || []);

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
      if (!supabase) {
        showMessage('error', 'Supabase non disponible. Veuillez réessayer.');
        return;
      }

      const { error } = await supabase
        .from('matches')
        .update(updatedMatch)
        .eq('id', updatedMatch.id);

      if (error) {
        console.error('Supabase update match error:', error);
        showMessage('error', `Erreur: ${error.message}`);
        return;
      }

      showMessage('success', 'Match mis à jour avec succès dans Supabase');
      setEditingMatch(null);

      // ---- Création automatique de la Finale ----
      const roundLower = (updatedMatch.round || '').toLowerCase().trim();
      const isDemiFinal =
        roundLower === 'demi-finale' ||
        roundLower === 'demi finale' ||
        roundLower === 'semifinal' ||
        roundLower === 'semi-final';

      if (updatedMatch.status === 'completed' && isDemiFinal) {
        // Déterminer le vainqueur de la demi-finale
        const scoreHome = Number(updatedMatch.score_home ?? 0);
        const scoreAway = Number(updatedMatch.score_away ?? 0);
        const winner = scoreHome >= scoreAway ? updatedMatch.team_home : updatedMatch.team_away;

        const allMatchesNow = await getMatches();
        const semifinalTeams = [updatedMatch.team_home, updatedMatch.team_away];

        // Vérifier si finale existe déjà (insensible à la casse)
        const finaleExists = allMatchesNow.some(
          (m: any) => (m.round || '').toLowerCase().includes('finale') && !['demi', 'semi'].some(k => (m.round || '').toLowerCase().includes(k))
        );

        if (!finaleExists) {
          // Chercher l'équipe exemptée parmi TOUS les vainqueurs de Phase initiale
          const allTeamsInMatches = new Set<string>();
          allMatchesNow.forEach((m: any) => {
            allTeamsInMatches.add(m.team_home);
            allTeamsInMatches.add(m.team_away);
          });

          const initialWinners = allMatchesNow
            .filter((m: any) => {
              const r = (m.round || '').toLowerCase();
              return r.includes('initial') || r.includes('phase') || r.includes('groupe');
            })
            .map((m: any) =>
              Number(m.score_home ?? 0) >= Number(m.score_away ?? 0) ? m.team_home : m.team_away
            );

          // L'équipe exemptée = gagnante de phase initiale qui n'est PAS dans la demi
          let byeTeam = initialWinners.find(
            (t: string) => !semifinalTeams.includes(t)
          ) || '';

          // Fallback : chercher dans toutes les équipes enregistrées
          if (!byeTeam) {
            byeTeam = [...allTeamsInMatches].find(
              (t: string) => !semifinalTeams.includes(t)
            ) || 'À déterminer';
          }

          const { error: finaleError } = await supabase.from('matches').insert([{
            team_home: winner,
            team_away: byeTeam,
            round: 'Finale',
            status: 'pending',
            score_home: null,
            score_away: null,
            scorers_home: '',
            scorers_away: '',
            assists_home: '',
            assists_away: '',
          }]);

          if (finaleError) {
            showMessage('error', `Finale non créée: ${finaleError.message}`);
          } else {
            showMessage('success', `🏆 Finale créée : ${winner} vs ${byeTeam}`);
          }
        }
      }
      // -------------------------------------------

      loadData();
    } catch (error) {
      console.error('Error updating match:', error);
      showMessage('error', 'Erreur lors de la mise à jour du match');
    }
  };

  // ============== PARAMETRES ==============
  const handleSaveSettings = async () => {
    try {
      if (!supabase) {
        showMessage('error', 'Supabase non disponible. Veuillez réessayer.');
        return;
      }

      // Extract only the fields that exist in Supabase settings table
      const settingsToSave: Record<string, any> = {
        tournament_name: settings.tournament_name,
        sponsor_photo_url: settings.sponsor_photo_url,
        sponsor_name: settings.sponsor_name,
        sponsor_about: settings.sponsor_about,
      };
      if (settings.venue !== undefined) settingsToSave.venue = settings.venue;
      if (settings.pitch !== undefined) settingsToSave.pitch = settings.pitch;

      const { error } = await supabase
        .from('settings')
        .upsert({
          id: '1',
          ...settingsToSave,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Supabase settings error:', error);
        showMessage('error', `Erreur Supabase: ${error.message}`);
        return;
      }

      showMessage('success', 'Paramètres sauvegardés avec succès dans Supabase');
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleSaveDraw = async () => {
    if (drawResult.length === 0) return;
    setIsLoading(true);
    try {
      if (!supabase) {
        showMessage('error', 'Supabase non disponible. Veuillez réessayer.');
        return;
      }

      const matchesToInsert = drawResult.map((pair, idx) => ({
        team_home: pair.team1.name,
        team_away: pair.team2.name,
        round: drawMode === 'semifinal' ? 'Demi-finale' : 'Phase initiale',
        status: 'pending',
      }));

      const { error } = await supabase.from('matches').insert(matchesToInsert);
      
      if (error) {
        console.error('Supabase draw error:', error);
        showMessage('error', `Erreur lors de l'enregistrement: ${error.message}`);
        return;
      }
      
      showMessage('success', 'Tirage enregistré et publié avec succès dans Supabase');
      setDrawResult([]);
      resetDraw();
      loadData();
    } catch (error) {
      console.error('Error saving draw:', error);
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
  // Fisher-Yates shuffle algorithm for true randomness
  const fisherYatesShuffle = (array: Team[]): Team[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initial draw with visual animation (6 teams -> 3 pairs)
  const startInitialDraw = async (numberOfTeams: number) => {
    if (teams.length < numberOfTeams) {
      showMessage('error', `Vous devez avoir au moins ${numberOfTeams} équipes pour faire un tirage`);
      return;
    }

    // Reset previous draw
    resetDraw();
    
    // Select teams for the draw
    const selectedTeams = teams.slice(0, numberOfTeams);
    
    // Initialize visual draw states
    setDrawMode('initial');
    setIsDrawing(true);
    setRemainingTeams(selectedTeams);
    setDrawnTeams([]);
    setDrawStep(0);
    setCurrentDrawingTeam(null);
    setDrawResult([]);
    
    showMessage('success', '🎲 Début du tirage... Les équipes sont dans le bocal !');
    
    // Shuffle teams for true randomness
    let shuffled = fisherYatesShuffle(selectedTeams);
    
    // Draw teams one by one with animation
    const pairs: { team1: Team; team2: Team }[] = [];
    const drawn: Team[] = [];
    
    for (let i = 0; i < shuffled.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s between each draw
      
      const team = shuffled[i];
      drawn.push(team);
      
      setCurrentDrawingTeam(team);
      setDrawnTeams([...drawn]);
      setRemainingTeams(shuffled.slice(i + 1));
      setDrawStep(i + 1);
      
      // Check if we have a pair (every 2 teams)
      if (drawn.length % 2 === 0 && drawn.length >= 2) {
        const team1 = drawn[drawn.length - 2];
        const team2 = drawn[drawn.length - 1];
        pairs.push({ team1, team2 });
        setDrawResult([...pairs]);
        showMessage('success', `🏆 Match ${pairs.length}: ${team1.name} vs ${team2.name} !`);
      }
      
      // Wait a bit to show the drawn team
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Final state
    setDrawHistory(shuffled);
    setDrawTeams(shuffled);
    setCurrentDrawingTeam(null);
    setIsDrawing(false);
    setDrawTimestamp(new Date().toLocaleString('fr-FR'));
    showMessage('success', `✅ Tirage terminé le ${new Date().toLocaleString('fr-FR')}`);
  };

  // Semi-final draw (3 qualified teams -> 2 play semi, 1 goes to final)
  const startSemifinalDraw = async () => {
    // Get qualified teams from completed matches
    const qualified = await getQualifiedTeams();
    
    if (qualified.length < 3) {
      showMessage('error', `Il faut 3 équipes qualifiées pour le tirage de demi-finale. Actuellement: ${qualified.length}`);
      return;
    }

    // Reset previous draw
    resetDraw();
    
    // Initialize visual draw states
    setDrawMode('semifinal');
    setIsDrawing(true);
    setRemainingTeams(qualified);
    setDrawnTeams([]);
    setDrawStep(0);
    setCurrentDrawingTeam(null);
    setDrawResult([]);
    setSemifinalResult(null);
    
    showMessage('success', '🎲 Tirage de la demi-finale... Les 3 qualifiés sont dans le bocal !');
    
    // Shuffle for randomness
    let shuffled = fisherYatesShuffle(qualified);
    
    // Draw first 2 teams for semi-final
    const drawn: Team[] = [];
    
    // Draw first team
    await new Promise(resolve => setTimeout(resolve, 2000));
    const team1 = shuffled[0];
    drawn.push(team1);
    setCurrentDrawingTeam(team1);
    setDrawnTeams([team1]);
    setRemainingTeams(shuffled.slice(1));
    setDrawStep(1);
    showMessage('success', `🥇 1ère équipe tirée: ${team1.name} !`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Draw second team
    await new Promise(resolve => setTimeout(resolve, 2000));
    const team2 = shuffled[1];
    drawn.push(team2);
    setCurrentDrawingTeam(team2);
    setDrawnTeams([team1, team2]);
    setRemainingTeams(shuffled.slice(2));
    setDrawStep(2);
    
    // These 2 will play the semi-final
    setDrawResult([{ team1, team2 }]);
    showMessage('success', `🥈 2ème équipe tirée: ${team2.name} !\n🏆 Demi-finale: ${team1.name} vs ${team2.name}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Third team goes directly to final
    await new Promise(resolve => setTimeout(resolve, 2000));
    const byeTeam = shuffled[2];
    drawn.push(byeTeam);
    setCurrentDrawingTeam(byeTeam);
    setDrawnTeams([team1, team2, byeTeam]);
    setRemainingTeams([]);
    setDrawStep(3);
    
    setSemifinalResult({ team1, team2, byeTeam });
    showMessage('success', `🥉 ${byeTeam.name} qualifiée directement pour la FINALE !`);
    
    // Final state
    setDrawHistory(shuffled);
    setDrawTeams(shuffled);
    setCurrentDrawingTeam(null);
    setIsDrawing(false);
    setDrawTimestamp(new Date().toLocaleString('fr-FR'));
    showMessage('success', `✅ Tirage demi-finale terminé !`);
  };

  // Get qualified teams from completed matches (winners of each match)
  const getQualifiedTeams = async (): Promise<Team[]> => {
    const allMatches = await getMatches();
    const completedMatches = allMatches.filter(m => m.status === 'completed');
    
    const qualified: Team[] = [];
    
    for (const match of completedMatches) {
      if (match.score_home !== null && match.score_away !== null) {
        // Winner qualifies
        if (match.score_home > match.score_away) {
          const winner = teams.find(t => t.name === match.team_home);
          if (winner && !qualified.find(q => q.id === winner.id)) {
            qualified.push(winner);
          }
        } else if (match.score_away > match.score_home) {
          const winner = teams.find(t => t.name === match.team_away);
          if (winner && !qualified.find(q => q.id === winner.id)) {
            qualified.push(winner);
          }
        }
        // In case of draw, both could qualify or use other criteria
      }
    }
    
    return qualified;
  };

  const resetDraw = () => {
    setDrawTeams([]);
    setDrawResult([]);
    setDrawHistory([]);
    setDrawTimestamp(null);
    setDrawStep(0);
    setCurrentDrawingTeam(null);
    setRemainingTeams([]);
    setDrawnTeams([]);
    setDrawMode(null);
    setSemifinalResult(null);
    showMessage('success', 'Tirage réinitialisé');
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
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gold mb-2">🎲 Tirage au Sort</h2>
                <p className="text-secondary">Système transparent avec animation du bocal</p>
              </div>
              {drawTimestamp && (
                <button
                  onClick={resetDraw}
                  className="text-sm text-red-400 hover:text-red-300 underline"
                >
                  🔄 Réinitialiser
                </button>
              )}
            </div>
            
            <div className="flex gap-4 flex-wrap mb-4">
              <button
                onClick={() => startInitialDraw(6)}
                disabled={teams.length < 6 || isDrawing}
                className={`px-6 py-3 font-bold rounded-lg transition-all transform ${
                  teams.length < 6 || isDrawing
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-600 hover:scale-105 text-slate-900'
                }`}
              >
                {isDrawing && drawMode === 'initial' ? '🎲 Tirage...' : '🏆 Tirage Initial (6 Équipes)'}
              </button>
              <button
                onClick={startSemifinalDraw}
                disabled={isDrawing}
                className={`px-6 py-3 font-bold rounded-lg transition-all transform ${
                  isDrawing
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-300 hover:to-orange-600 hover:scale-105 text-slate-900'
                }`}
              >
                {isDrawing && drawMode === 'semifinal' ? '🎲 Tirage...' : '🏅 Tirage Demi-Finale (3 Équipes)'}
              </button>
            </div>

            {/* Timestamp du tirage */}
            {drawTimestamp && (
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-green-300 text-sm">
                  ✅ Tirage effectué le <strong>{drawTimestamp}</strong>
                </p>
                <p className="text-green-300/70 text-xs mt-1">
                  Algorithme: Fisher-Yates | Mode: {drawMode === 'semifinal' ? 'Demi-finale' : 'Initial'}
                </p>
              </div>
            )}
          </div>

          {/* VISUAL BOWL - Bocal avec les équipes */}
          {(isDrawing || remainingTeams.length > 0 || drawnTeams.length > 0) && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-gold mb-6 text-center">
                🥣 Le Bocal du Tirage
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Remaining teams in bowl */}
                <div className="bg-slate-800/50 rounded-xl p-4 border-2 border-yellow-400/30">
                  <h4 className="text-yellow-400 font-bold mb-3 text-center">
                    🥣 Dans le bocal ({remainingTeams.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {remainingTeams.map((team) => (
                      <div 
                        key={team.id} 
                        className="bg-slate-700/50 rounded-lg p-2 text-center animate-pulse"
                      >
                        <p className="text-white text-sm font-semibold">{team.name}</p>
                      </div>
                    ))}
                    {remainingTeams.length === 0 && (
                      <p className="text-slate-500 text-center text-sm italic">Bocal vide</p>
                    )}
                  </div>
                </div>

                {/* Currently drawing animation */}
                <div className="flex items-center justify-center">
                  {currentDrawingTeam ? (
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-bounce">🎲</div>
                      <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-xl p-4 animate-pulse">
                        <p className="text-yellow-300 text-sm mb-1">Équipe tirée:</p>
                        <p className="text-white text-xl font-bold">{currentDrawingTeam.name}</p>
                        <p className="text-yellow-400/70 text-xs mt-1">Coach: {currentDrawingTeam.coach}</p>
                      </div>
                    </div>
                  ) : isDrawing ? (
                    <div className="text-center">
                      <div className="text-6xl animate-spin">🎲</div>
                      <p className="text-yellow-300 mt-4">Mélange en cours...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-5xl">✅</div>
                      <p className="text-green-400 mt-2">Tirage terminé</p>
                    </div>
                  )}
                </div>

                {/* Drawn teams */}
                <div className="bg-green-900/20 rounded-xl p-4 border-2 border-green-500/30">
                  <h4 className="text-green-400 font-bold mb-3 text-center">
                    ✨ Tirées ({drawnTeams.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {drawnTeams.map((team, idx) => (
                      <div 
                        key={team.id} 
                        className="bg-green-800/30 rounded-lg p-2 text-center border border-green-500/20"
                      >
                        <span className="text-green-400 text-xs">#{idx + 1}</span>
                        <p className="text-white text-sm font-semibold">{team.name}</p>
                        {drawMode === 'semifinal' && idx === 2 && (
                          <span className="text-yellow-400 text-xs">⭐ Finale directe</span>
                        )}
                      </div>
                    ))}
                    {drawnTeams.length === 0 && (
                      <p className="text-slate-500 text-center text-sm italic">Aucune équipe tirée</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MATCH PAIRS - Results */}
          {drawResult.length > 0 && drawMode === 'initial' && (
            <div className="card p-6">
              <h3 className="text-2xl font-bold text-gold mb-6 text-center">
                🏆 Matchs du Tournoi
              </h3>
              <div className="space-y-4">
                {drawResult.map((match, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 border-yellow-400/30 rounded-xl p-6">
                    <div className="text-center mb-4">
                      <span className="text-yellow-400 font-bold text-lg">Match {idx + 1}</span>
                      <p className="text-slate-400 text-sm">{match.team1.name} vs {match.team2.name}</p>
                    </div>
                    <div className="flex justify-center items-center gap-6">
                      <div className="flex-1 bg-slate-800/70 p-4 rounded-lg border border-yellow-400/20 text-center">
                        <p className="text-gold font-bold text-lg">{match.team1.name}</p>
                        <p className="text-secondary text-sm">Coach: {match.team1.coach}</p>
                      </div>
                      <div className="text-yellow-400 font-bold text-3xl">VS</div>
                      <div className="flex-1 bg-slate-800/70 p-4 rounded-lg border border-yellow-400/20 text-center">
                        <p className="text-gold font-bold text-lg">{match.team2.name}</p>
                        <p className="text-secondary text-sm">Coach: {match.team2.coach}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={handleSaveDraw}
                  disabled={isLoading}
                  className="btn-primary py-3 px-8 text-lg"
                >
                  💾 Enregistrer le Tirage
                </button>
              </div>
            </div>
          )}

          {/* SEMIFINAL RESULT */}
          {semifinalResult && drawMode === 'semifinal' && (
            <div className="card p-6">
              <h3 className="text-2xl font-bold text-gold mb-6 text-center">
                🏅 Résultat du Tirage Demi-Finale
              </h3>
              
              {/* Semi-final match */}
              <div className="mb-6">
                <h4 className="text-orange-400 font-bold mb-4 text-center">🏆 Demi-Finale</h4>
                <div className="bg-gradient-to-r from-orange-900/30 to-slate-800/50 border-2 border-orange-400/30 rounded-xl p-6">
                  <div className="flex justify-center items-center gap-6">
                    <div className="flex-1 bg-slate-800/70 p-4 rounded-lg border border-orange-400/20 text-center">
                      <p className="text-gold font-bold text-lg">{semifinalResult.team1.name}</p>
                      <p className="text-secondary text-sm">Coach: {semifinalResult.team1.coach}</p>
                    </div>
                    <div className="text-orange-400 font-bold text-2xl">VS</div>
                    <div className="flex-1 bg-slate-800/70 p-4 rounded-lg border border-orange-400/20 text-center">
                      <p className="text-gold font-bold text-lg">{semifinalResult.team2.name}</p>
                      <p className="text-secondary text-sm">Coach: {semifinalResult.team2.coach}</p>
                    </div>
                  </div>
                  <p className="text-center text-orange-300/70 text-sm mt-3">
                    Le vainqueur affrontera {semifinalResult.byeTeam.name} en Finale
                  </p>
                </div>
              </div>

              {/* Team qualified directly to final */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-slate-800/50 border-2 border-yellow-400/50 rounded-xl p-6">
                <h4 className="text-yellow-400 font-bold mb-4 text-center">⭐ Qualifiée directement pour la Finale</h4>
                <div className="text-center">
                  <p className="text-4xl mb-2">🏆</p>
                  <p className="text-gold font-bold text-2xl">{semifinalResult.byeTeam.name}</p>
                  <p className="text-secondary text-sm">Coach: {semifinalResult.byeTeam.coach}</p>
                  <p className="text-yellow-400/70 text-xs mt-2">
                    Attend le vainqueur de la demi-finale
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={handleSaveDraw}
                  disabled={isLoading}
                  className="btn-primary py-3 px-8 text-lg"
                >
                  💾 Enregistrer le Tirage
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {drawResult.length === 0 && !isDrawing && (
            <div className="card p-12 text-center">
              <p className="text-6xl mb-4">🥣</p>
              <p className="text-secondary text-lg">Aucun tirage effectué</p>
              <p className="text-secondary/70 mt-2">Cliquez sur un bouton ci-dessus pour lancer le tirage avec animation du bocal</p>
            </div>
          )}
        </div>
      )}

      {/* ============== MATCHS TAB ============== */}
      {activeTab === 'matches' && (
        <div className="space-y-4">

          {/* Bouton création manuelle Finale */}
          {(() => {
            const demiCompleted = matches.find(
              (m) => (m.round || '').toLowerCase().includes('demi') && m.status === 'completed'
            );
            const finaleExists = matches.some(
              (m) => (m.round || '').toLowerCase() === 'finale'
            );
            if (demiCompleted && !finaleExists) {
              const scoreHome = Number(demiCompleted.score_home ?? 0);
              const scoreAway = Number(demiCompleted.score_away ?? 0);
              const winner = scoreHome >= scoreAway ? demiCompleted.team_home : demiCompleted.team_away;
              const semifinalTeams = [demiCompleted.team_home, demiCompleted.team_away];
              const allNames = [...new Set(matches.flatMap((m) => [m.team_home, m.team_away]))];
              const byeTeam = allNames.find((t) => !semifinalTeams.includes(t)) || 'À déterminer';
              return (
                <div className="bg-yellow-500/10 border-2 border-yellow-400/50 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-yellow-300 font-bold text-lg">🏆 Finale non créée</p>
                    <p className="text-yellow-200/70 text-sm mt-1">
                      Demi-finale terminée → <strong>{winner}</strong> vs <strong>{byeTeam}</strong>
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!supabase) return;
                      const { error } = await supabase.from('matches').insert([{
                        team_home: winner,
                        team_away: byeTeam,
                        round: 'Finale',
                        status: 'pending',
                        score_home: null,
                        score_away: null,
                        scorers_home: '',
                        scorers_away: '',
                        assists_home: '',
                        assists_away: '',
                      }]);
                      if (error) {
                        showMessage('error', `Erreur: ${error.message}`);
                      } else {
                        showMessage('success', `🏆 Finale créée : ${winner} vs ${byeTeam}`);
                        loadData();
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-lg hover:scale-105 transition-all shadow-lg whitespace-nowrap"
                  >
                    ➕ Créer la Finale
                  </button>
                </div>
              );
            }
            return null;
          })()}

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
