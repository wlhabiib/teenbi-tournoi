import React, { useState, useEffect } from 'react';
import { supabase, getTeams, getMatches } from '@/lib/supabase';
import VoteChart from '@/components/VoteChart';
import TopScorerChart from '@/components/TopScorerChart';
import MatchCard from '@/components/MatchCard';
import SponsorSection from '@/components/SponsorSection';
import { useVoting, VoteData } from '@/lib/useVoting';
import { getCurrentUser } from '@/lib/authSupabase';

/* eslint-disable react/no-unescaped-entities */

interface Team {
  id: string;
  name: string;
  votes: number;
}

interface TopScorer {
  name: string;
  goals: number;
}

export default function Home() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [topAssisters, setTopAssisters] = useState<TopScorer[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [showScorers, setShowScorers] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  
  // Use the Supabase-based voting hook
  const { 
    hasVoted: userHasVoted, 
    votes: voteCounts, 
    addVote, 
    isLoading: isVotingLoading,
    userVote: userVoteData 
  } = useVoting();

  useEffect(() => {
    // Get current user
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    
    loadData();
  }, []);

  // Update teams when vote counts change (from Supabase)
  useEffect(() => {
    if (teams.length > 0 && Object.keys(voteCounts).length > 0) {
      setTeams(prevTeams => prevTeams.map(t => ({
        ...t,
        votes: voteCounts[t.id] || 0
      })));
    }
  }, [voteCounts]);

  const loadData = async () => {
    try {
      const teamsData = await getTeams();
      const matchesData = await getMatches();
      
      // Map teams with votes from Supabase (via useVoting hook)
      const teamsWithVotes = (teamsData || []).map((t: any) => ({ 
        ...t, 
        votes: voteCounts[t.id] || 0 
      }));
      setTeams(teamsWithVotes);
      setMatches(matchesData || []);

      // Calculate top scorers from matches
      const scorers: { [key: string]: number } = {};
      const assists: { [key: string]: number } = {};
      
      matchesData?.forEach((match: any) => {
        if (match.scorers_home) {
          match.scorers_home.split(',').forEach((scorer: string) => {
            scorer = scorer.trim();
            if (scorer) scorers[scorer] = (scorers[scorer] || 0) + 1;
          });
        }
        if (match.scorers_away) {
          match.scorers_away.split(',').forEach((scorer: string) => {
            scorer = scorer.trim();
            if (scorer) scorers[scorer] = (scorers[scorer] || 0) + 1;
          });
        }
        if (match.assists_home) {
          match.assists_home.split(',').forEach((assist: string) => {
            assist = assist.trim();
            if (assist) assists[assist] = (assists[assist] || 0) + 1;
          });
        }
        if (match.assists_away) {
          match.assists_away.split(',').forEach((assist: string) => {
            assist = assist.trim();
            if (assist) assists[assist] = (assists[assist] || 0) + 1;
          });
        }
      });

      const scorersArray = Object.entries(scorers)
        .map(([name, goals]) => ({ name, goals }))
        .sort((a, b) => b.goals - a.goals);
      
      const assistsArray = Object.entries(assists)
        .map(([name, goals]) => ({ name, goals }))
        .sort((a, b) => b.goals - a.goals);

      setTopScorers(scorersArray);
      setTopAssisters(assistsArray);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleVote = async () => {
    if (userHasVoted) {
      alert('Vous avez déjà voté');
      return;
    }
    if (!selectedTeam) {
      alert('Veuillez sélectionner une équipe');
      return;
    }
    if (!currentUser) {
      alert('Veuillez vous connecter pour voter');
      return;
    }
    
    // Use the Supabase-based addVote function from useVoting hook
    const success = await addVote(selectedTeam);
    
    if (success) {
      alert('Vote enregistré avec succès !');
    } else {
      alert('Erreur lors du vote. Vous avez peut-être déjà voté.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-6 md:p-8 lg:p-10 shadow-lg hover:shadow-[0_0_40px_rgba(250,204,21,0.15)] transition-all duration-500 group overflow-hidden">
        {/* Lumière dorée en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              TOURNOI TEENBI
            </span>
          </h1>
          <p className="text-slate-300 mb-4 md:mb-6 text-base md:text-lg">
            Plateforme de gestion - 5ème Édition de la Fraternité
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-6">
            {[
              { label: 'Équipes', value: teams.length || 6 },
              { label: 'Lieu', value: 'Teenbi' },
              { label: 'Terrain', value: 'Teenbi' },
              { label: 'Matchs', value: matches.length }
            ].map((stat, idx) => (
              <div key={idx} className="bg-slate-700/30 hover:bg-slate-700/50 border border-yellow-400/20 hover:border-yellow-400/40 p-3 md:p-4 rounded-lg transition-all duration-300 group/stat">
                <p className="text-xs md:text-sm text-yellow-200/70 mb-1">{stat.label}</p>
                <p className="text-lg md:text-2xl font-bold text-yellow-300 group-hover/stat:text-yellow-200">{stat.value}</p>
                {/* Lumière */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-yellow-300/5 to-yellow-400/0 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Voting Section - Left */}
        <div className="lg:col-span-1 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-6 md:p-8 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] transition-all duration-500 group">
          {/* Lumière */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
          
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-yellow-300 relative z-10">🗳️ Votez pour votre équipe</h2>
          
          {/* Team Selection */}
          {!userHasVoted ? (
            <div className="mb-4 relative z-10">
              <p className="text-sm text-yellow-200/80 mb-2">
                {currentUser ? `Connecté: ${currentUser.username}` : 'Connectez-vous pour voter'}
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team.id)}
                    className={`p-2 text-xs rounded-lg border transition-all ${
                      selectedTeam === team.id
                        ? 'bg-yellow-400/30 border-yellow-400 text-yellow-200'
                        : 'bg-slate-700/50 border-yellow-400/20 text-slate-300 hover:bg-slate-700/70'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
              <button
                onClick={handleVote}
                disabled={!selectedTeam || !currentUser}
                className="w-full mt-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-slate-900 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Voter ✓
              </button>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-300 text-center">✓ Vous avez déjà voté!</p>
              {userVoteData && (
                <p className="text-xs text-green-300/70 text-center mt-1">
                  Pour: {teams.find(t => t.id === userVoteData.teamId)?.name || 'Équipe inconnue'}
                </p>
              )}
            </div>
          )}
          
          {/* Vote Results Chart */}
          <div className="space-y-3 relative z-10">
            <p className="text-sm text-yellow-200/80 mb-2">Résultats des votes :</p>
            <VoteChart teams={teams} />
          </div>
        </div>

        {/* Top Scorers & Right Section */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Top Scorers */}
          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-6 md:p-8 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] transition-all duration-500 group">
            {/* Lumière */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl md:text-2xl font-bold text-yellow-300">
                {showScorers ? "🏆 Top Buteurs" : "🎯 Top Passeurs"}
              </h3>
              <button
                onClick={() => setShowScorers(!showScorers)}
                className="text-xs px-3 py-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 border border-yellow-400/20 rounded-full text-yellow-300 font-semibold transition-all duration-300 transform hover:scale-105"
              >
                {showScorers ? "Passeurs" : "Buteurs"}
              </button>
            </div>
            <div className="relative z-10">
              {showScorers ? (
                <TopScorerChart scorers={topScorers} type="scorers" />
              ) : (
                <TopScorerChart scorers={topAssisters} type="assisters" />
              )}
            </div>
          </div>

          {/* Sponsor */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-yellow-400/20 p-6 md:p-8 shadow-lg hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] transition-all duration-500 group flex items-center justify-center min-h-[200px]">
            {/* Lumière */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <SponsorSection compact={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Latest Matches */}
      {matches.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-yellow-300 mb-6">📊 Affiches des matchs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {matches.slice(0, 6).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
