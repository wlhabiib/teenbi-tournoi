// Utility functions for formatting and data manipulation

export function parseScorers(input: string): string[] {
  if (!input) return [];
  return input.split(',').map(s => s.trim()).filter(Boolean);
}

export function formatScorers(scorers: string[]): string {
  return scorers.join(', ');
}

export function getTopScorers(matches: any[]): { [name: string]: number } {
  const scorers: { [name: string]: number } = {};
  
  matches.forEach(match => {
    if (match.scorers_home) {
      parseScorers(match.scorers_home).forEach(scorer => {
        scorers[scorer] = (scorers[scorer] || 0) + 1;
      });
    }
    if (match.scorers_away) {
      parseScorers(match.scorers_away).forEach(scorer => {
        scorers[scorer] = (scorers[scorer] || 0) + 1;
      });
    }
  });
  
  return scorers;
}

export function getTopAssisters(matches: any[]): { [name: string]: number } {
  const assists: { [name: string]: number } = {};
  
  matches.forEach(match => {
    if (match.assists_home) {
      parseScorers(match.assists_home).forEach(assist => {
        assists[assist] = (assists[assist] || 0) + 1;
      });
    }
    if (match.assists_away) {
      parseScorers(match.assists_away).forEach(assist => {
        assists[assist] = (assists[assist] || 0) + 1;
      });
    }
  });
  
  return assists;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
