import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Get current user
    if (typeof window !== 'undefined') {
      const userRaw = localStorage.getItem('currentUser');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          setCurrentUserId(user.id);
          
          // Check if this specific user has voted
          const userVoteKey = `userVote_${user.id}`;
          const userVoteData = localStorage.getItem(userVoteKey);
          if (userVoteData) {
            setHasVoted(true);
            setUserVote(JSON.parse(userVoteData));
          }
        } catch {
          console.error('Error parsing current user');
        }
      }
    }

    // Load all votes for display
    const allVotes: { [teamId: string]: number } = {};
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('votes_')) {
          const teamId = key.replace('votes_', '');
          allVotes[teamId] = parseInt(localStorage.getItem(key) || '0');
        }
      }
    }
    setVotes(allVotes);
  }, []);

  const addVote = (teamId: string) => {
    if (hasVoted || !currentUserId) return;
    
    // Update vote counts
    const currentVotes = votes[teamId] || 0;
    const newVotes = { ...votes, [teamId]: currentVotes + 1 };
    setVotes(newVotes);
    
    // Store vote count for team
    localStorage.setItem(`votes_${teamId}`, String(currentVotes + 1));
    
    // Store user's vote (linked to user ID)
    const voteData: VoteData = {
      teamId,
      userId: currentUserId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(`userVote_${currentUserId}`, JSON.stringify(voteData));
    localStorage.setItem('hasVoted', 'true'); // Keep for backward compatibility
    
    setHasVoted(true);
    setUserVote(voteData);
  };

  const getUserVote = (userId: string): VoteData | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(`userVote_${userId}`);
    return data ? JSON.parse(data) : null;
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
    getUserVote,
    getTotalVotes
  };
}
