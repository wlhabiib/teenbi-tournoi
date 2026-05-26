import React from 'react';

interface ChampionBannerProps {
  championName: string;
  topScorer?: { name: string; goals: number } | null;
  topAssister?: { name: string; goals: number } | null;
  topScorerTies?: string[];
  topAssisterTies?: string[];
}

export default function ChampionBanner({ championName, topScorer, topAssister, topScorerTies = [], topAssisterTies = [] }: ChampionBannerProps) {
  const scorerNames = topScorerTies.length > 0 ? topScorerTies : (topScorer ? [topScorer.name] : []);
  const assisterNames = topAssisterTies.length > 0 ? topAssisterTies : (topAssister ? [topAssister.name] : []);

  return (
    <div className="mb-8 space-y-3">
      {/* Bannière principale championne */}
      <div
        className="relative overflow-hidden rounded-2xl p-1 shadow-[0_0_40px_rgba(74,222,128,0.35)]"
        style={{ background: 'linear-gradient(135deg, #16a34a, #4ade80, #86efac, #4ade80, #16a34a)' }}
      >
        <div
          className="relative rounded-xl px-6 py-8 text-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #052e16 0%, #14532d 30%, #166534 60%, #052e16 100%)' }}
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #86efac, transparent)' }} />
          <div className="absolute top-3 left-6 text-yellow-300 text-lg opacity-70 animate-pulse">★</div>
          <div className="absolute top-3 right-6 text-yellow-300 text-lg opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}>★</div>
          <div className="absolute bottom-3 left-12 text-yellow-300 text-sm opacity-50 animate-pulse" style={{ animationDelay: '1s' }}>★</div>
          <div className="absolute bottom-3 right-12 text-yellow-300 text-sm opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}>★</div>

          <div className="text-6xl mb-3 animate-bounce" style={{ animationDuration: '2s' }}>🏆</div>
          <p className="text-green-300/80 text-xs font-bold tracking-[0.3em] uppercase mb-1">
            Champion du Tournoi Teenbi
          </p>
          <h2
            className="text-3xl md:text-4xl font-black tracking-wide mb-3"
            style={{
              background: 'linear-gradient(135deg, #4ade80, #86efac, #ffffff, #86efac, #4ade80)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {championName}
          </h2>
          <p className="text-green-200/90 text-base md:text-lg font-semibold">
            🎉 Félicitations aux joueurs et au staff de <span className="text-white font-bold">{championName}</span> !
          </p>
          <p className="text-green-300/60 text-sm mt-2">
            Vainqueur de la 5ème Édition du Tournoi de Fraternité du Quartier Teenbi
          </p>
          <div className="mt-5 flex justify-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full"
                style={{
                  width: i === 3 ? '2.5rem' : i === 2 || i === 4 ? '1.5rem' : '0.75rem',
                  background: 'linear-gradient(90deg, #4ade80, #86efac)',
                  opacity: i === 3 ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Badges meilleur buteur & passeur */}
      {(scorerNames.length > 0 || assisterNames.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Meilleur buteur */}
          {scorerNames.length > 0 && topScorer && (
            <div
              className="relative overflow-hidden rounded-xl p-0.5 shadow-[0_0_20px_rgba(250,204,21,0.25)]"
              style={{ background: 'linear-gradient(135deg, #b45309, #fbbf24, #fde68a, #fbbf24, #b45309)' }}
            >
              <div
                className="flex items-center gap-4 px-5 py-4 rounded-[10px]"
                style={{ background: 'linear-gradient(135deg, #1c1002 0%, #2d1f05 60%, #1c1002 100%)' }}
              >
                <div className="text-4xl flex-shrink-0">⚽</div>
                <div className="flex-1 min-w-0">
                  <p className="text-yellow-400/70 text-xs font-bold tracking-widest uppercase mb-0.5">
                    🥇 Meilleur{scorerNames.length > 1 ? 's Buteurs' : ' Buteur'} du Tournoi
                  </p>
                  <p className="text-white font-black text-base leading-snug">
                    {scorerNames.join(' & ')}
                  </p>
                  <p className="text-yellow-300 text-sm font-semibold mt-0.5">
                    {topScorer.goals} but{topScorer.goals > 1 ? 's' : ''} {scorerNames.length > 1 ? 'chacun' : ''}
                  </p>
                </div>
                <div className="text-3xl flex-shrink-0 opacity-80">🏅</div>
              </div>
            </div>
          )}

          {/* Meilleur passeur */}
          {assisterNames.length > 0 && topAssister && (
            <div
              className="relative overflow-hidden rounded-xl p-0.5 shadow-[0_0_20px_rgba(96,165,250,0.25)]"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #60a5fa, #bfdbfe, #60a5fa, #1d4ed8)' }}
            >
              <div
                className="flex items-center gap-4 px-5 py-4 rounded-[10px]"
                style={{ background: 'linear-gradient(135deg, #020617 0%, #0c1a35 60%, #020617 100%)' }}
              >
                <div className="text-4xl flex-shrink-0">👟</div>
                <div className="flex-1 min-w-0">
                  <p className="text-blue-400/70 text-xs font-bold tracking-widest uppercase mb-0.5">
                    🥇 Meilleur{assisterNames.length > 1 ? 's Passeurs' : ' Passeur'} du Tournoi
                  </p>
                  <p className="text-white font-black text-base leading-snug">
                    {assisterNames.join(' & ')}
                  </p>
                  <p className="text-blue-300 text-sm font-semibold mt-0.5">
                    {topAssister.goals} passe{topAssister.goals > 1 ? 's' : ''} décisive{topAssister.goals > 1 ? 's' : ''} {assisterNames.length > 1 ? 'chacun' : ''}
                  </p>
                </div>
                <div className="text-3xl flex-shrink-0 opacity-80">🏅</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
