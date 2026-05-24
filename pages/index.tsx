import React, { useState, useEffect } from 'react';
import { getTeams, getMatches } from '@/lib/supabase';
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
      
      // Add votes property (from localStorage or calculated)
      const teamsWithVotes = teamsData.map(team => ({
        ...team,
        votes: parseInt(localStorage.getItem(`votes_${team.id}`) || '0')
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

  const handleVote = async (teamId: string) => {
    if (hasVoted) {
      alert('Vous avez déjà voté');
      return;
    }
    
    const currentVotes = parseInt(localStorage.getItem(`votes_${teamId}`) || '0');
    localStorage.setItem(`votes_${teamId}`, String(currentVotes + 1));
    localStorage.setItem('hasVoted', 'true');
    setHasVoted(true);
    
    const updatedTeams = teams.map(t =>
      t.id === teamId ? { ...t, votes: t.votes + 1 } : t
    );
    setTeams(updatedTeams);
  };

  return (
    <div className="section-container space-y-8">
      {/* Hero Section */}
      <div className="card mb-8 p-8 bg-gradient-to-r from-primary via-primary to-secondary/5 hover-glow">
        <h1 className="text-5xl font-bold gradient-text mb-4">
          Tournoi de Fraternité du Quartier
        </h1>
        <p className="text-gray-400 mb-6 text-lg">
          La plateforme qui réunit les affiches, le tirage automatique, les supporters et les résultats
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-secondary/10 p-4 rounded-lg hover-lift">
            <p className="text-sm text-gray-400">Équipes engagées</p>
            <p className="text-3xl font-bold text-gold mt-2">{teams.length}</p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg hover-lift">
            <p className="text-sm text-gray-400">Lieu</p>
            <p className="text-lg font-bold text-gold mt-2">Quartier Teenbi</p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg hover-lift">
            <p className="text-sm text-gray-400">Terrain</p>
            <p className="text-lg font-bold text-gold mt-2">Terrain Teenbi</p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-lg hover-lift">
            <p className="text-sm text-gray-400">Format</p>
            <p className="text-lg font-bold text-gold mt-2">6 équipes</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Voting Section - Left */}
        <div className="card p-8 hover-glow">
          <h2 className="text-2xl font-bold mb-6 text-gold">🗳️ Votez pour votre équipe</h2>
          <div className="space-y-3">
            <VoteChart teams={teams} />
          </div>
          {!hasVoted && (
            <div className="mt-6 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
              <p className="text-sm text-gray-400">Cliquez sur une équipe pour voter (une seule fois)</p>
            </div>
          )}
          {hasVoted && (
            <div className="mt-6 p-4 bg-green-500/20 rounded-lg border border-green-500/50">
              <p className="text-sm text-green-300">✓ Merci d{"'"}avoir voté!</p>
            </div>
          )}
        </div>

        {/* Top Scorers & Assisters - Right */}
        <div className="space-y-4">
          <div className="card p-6 hover-glow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gold">
                {showScorers ? "🏆 Top 3 Buteurs" : "🎯 Top 3 Passeurs"}
              </h3>
              <button
                onClick={() => setShowScorers(!showScorers)}
                className="text-xs px-3 py-1 bg-secondary/20 hover:bg-secondary/40 rounded-full text-gold transition-all"
              >
                {showScorers ? "Voir Passeurs" : "Voir Buteurs"}
              </button>
            </div>
            {showScorers && topScorers.length > 0 && (
              <TopScorerChart scorers={topScorers} type="scorers" />
            )}
            {!showScorers && topAssisters.length > 0 && (
              <TopScorerChart scorers={topAssisters} type="assisters" />
            )}
            {(showScorers && topScorers.length === 0) || (!showScorers && topAssisters.length === 0) && (
              <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      </div>

      {/* Tournament Info Card */}
      <div className="card p-8 bg-gradient-to-r from-secondary/5 to-secondary/10 hover-glow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold text-gold mb-4">ℹ️ Tournoi de Fraternité</h3>
            <p className="text-gray-400 mb-4">
              Édition annuelle du quartier réunissant 6 équipes dans une ambiance festive et fraternelle.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Organisé par les jeunes du quartier Teenbi pour promouvoir le sport et l'union communautaire.
            </p>
            <div className="flex gap-4">
              <div className="bg-secondary/20 p-4 rounded-lg flex-1 border border-secondary/30">
                <p className="text-xs text-gray-400 mb-1">Dates</p>
                <p className="font-bold text-gold">Annuel</p>
              </div>
              <div className="bg-secondary/20 p-4 rounded-lg flex-1 border border-secondary/30">
                <p className="text-xs text-gray-400 mb-1">Équipes</p>
                <p className="font-bold text-gold">{teams.length || 6}</p>
              </div>
              <div className="bg-secondary/20 p-4 rounded-lg flex-1 border border-secondary/30">
                <p className="text-xs text-gray-400 mb-1">Matchs</p>
                <p className="font-bold text-gold">{matches.length}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-secondary/20 to-secondary/10 rounded-lg p-8 border-2 border-gold/50 hover-lift">
            <SponsorSection compact={true} />
          </div>
        </div>
      </div>

      {/* Latest Matches */}
      {matches.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gold mb-6">📊 Affiches des matchs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.slice(0, 6).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
