import React, { useState, useEffect } from 'react';
import { supabase, getTeams, getMatches } from '@/lib/supabase';
import VoteChart from '@/components/VoteChart';
import TopScorerChart from '@/components/TopScorerChart';
import MatchCard from '@/components/MatchCard';
import SponsorSection from '@/components/SponsorSection';
import { useVoting } from '@/lib/useVoting';

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
  const [hasVoted, setHasVoted] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [showScorers, setShowScorers] = useState(true);

  useEffect(() => {
    loadData();
    // Check if user has voted
    const voted = localStorage.getItem('hasVoted');
    setHasVoted(!!voted);
  }, []);

  const loadData = async () => {
    try {
      const teamsData = await getTeams();
      const matchesData = await getMatches();
      
      // Map teams with default votes of 0 for VoteChart compatibility
      const teamsWithVotes = (teamsData || []).map(t => ({ ...t, votes: 0 }));
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

  const handleVote = async (teamId: string) => {
    if (hasVoted) {
      alert('Vous avez déjà voté');
      return;
    }
    
    try {
      const { error } = await supabase!.rpc('increment_vote', { team_id: teamId });
      if (error) throw error;

      localStorage.setItem('hasVoted', 'true');
      setHasVoted(true);
      loadData();
    } catch (error) {
      console.error('Error voting:', error);
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
          
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-yellow-300 relative z-10">🗳️ Votez</h2>
          <div className="space-y-3 relative z-10">
            <VoteChart teams={teams} />
          </div>
          {!hasVoted && (
            <div className="mt-6 p-3 md:p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
              <p className="text-xs md:text-sm text-yellow-200">Une seule fois</p>
            </div>
          )}
          {hasVoted && (
            <div className="mt-6 p-3 md:p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <p className="text-xs md:text-sm text-green-300">✓ Merci!</p>
            </div>
          )}
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
              {showScorers && topScorers.length > 0 && (
                <TopScorerChart scorers={topScorers} type="scorers" />
              )}
              {!showScorers && topAssisters.length > 0 && (
                <TopScorerChart scorers={topAssisters} type="assisters" />
              )}
              {(showScorers && topScorers.length === 0) || (!showScorers && topAssisters.length === 0) && (
                <p className="text-slate-400 text-center py-8">Aucune donnée</p>
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
