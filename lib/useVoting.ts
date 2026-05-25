import { useState, useEffect } from 'react';
import { 
  getVotes, 
  getUserVote as getUserVoteFromSupabase, 
  addVote as addVoteToSupabase, 
  calculateVoteCounts,
  Vote 
} from './supabase';

export interface VoteData {
  teamId: string;
  userId: string;
  timestamp: string;
}

export function useVoting() {
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState<{ [teamId: string]: number }>({});
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<VoteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load votes from Supabase on mount
  useEffect(() => {
    loadVotes();
  }, []);

  const loadVotes = async () => {
    setIsLoading(true);
    
    // Get current user
    if (typeof window !== 'undefined') {
      const userRaw = localStorage.getItem('currentUser');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          setCurrentUserId(user.id);
          
          // Check if this user has voted (from Supabase)
          const supabaseVote = await getUserVoteFromSupabase(user.id);
          if (supabaseVote) {
            setHasVoted(true);
            setUserVote({
              teamId: supabaseVote.team_id,
              userId: supabaseVote.user_id,
              timestamp: supabaseVote.created_at || new Date().toISOString()
            });
          }
        } catch {
          console.error('Error parsing current user');
        }
      }
    }

    // Load all votes from Supabase
    const allVotes = await getVotes();
    const voteCounts = calculateVoteCounts(allVotes);
    setVotes(voteCounts);
    
    setIsLoading(false);
  };

  const addVote = async (teamId: string): Promise<boolean> => {
    if (hasVoted || !currentUserId) {
      console.log('Cannot vote: hasVoted=', hasVoted, 'currentUserId=', currentUserId);
      return false;
    }
    
    // Add vote to Supabase
    const success = await addVoteToSupabase(teamId, currentUserId);
    
    if (success) {
      // Update local state
      const currentVotes = votes[teamId] || 0;
      setVotes(prev => ({ ...prev, [teamId]: currentVotes + 1 }));
      
      const voteData: VoteData = {
        teamId,
        userId: currentUserId,
        timestamp: new Date().toISOString()
      };
      
      setHasVoted(true);
      setUserVote(voteData);
      
      return true;
    }
    
    return false;
  };

  const refreshVotes = async () => {
    await loadVotes();
  };

  const getTotalVotes = (): number => {
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  };

  return { 
    hasVoted, 
    votes, 
    addVote, 
    currentUserId,
    userVote,
    isLoading,
    refreshVotes,
    getTotalVotes
  };
}
