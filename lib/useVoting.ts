import { useState, useEffect } from 'react';

export function useVoting() {
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState<{ [teamId: string]: number }>({});

  useEffect(() => {
    // Load voting data from localStorage
    const voted = localStorage.getItem('hasVoted');
    setHasVoted(!!voted);

    // Load individual votes
    const allVotes: { [teamId: string]: number } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('votes_')) {
        const teamId = key.replace('votes_', '');
        allVotes[teamId] = parseInt(localStorage.getItem(key) || '0');
      }
    }
    setVotes(allVotes);
  }, []);

  const addVote = (teamId: string) => {
    if (hasVoted) return;
    
    const currentVotes = votes[teamId] || 0;
    const newVotes = { ...votes, [teamId]: currentVotes + 1 };
    setVotes(newVotes);
    
    localStorage.setItem(`votes_${teamId}`, String(currentVotes + 1));
    localStorage.setItem('hasVoted', 'true');
    setHasVoted(true);
  };

  return { hasVoted, votes, addVote };
}
