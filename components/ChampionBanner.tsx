import React from 'react';

interface ChampionBannerProps {
  championName: string;
}

export default function ChampionBanner({ championName }: ChampionBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-8 p-1 shadow-[0_0_40px_rgba(74,222,128,0.35)]"
      style={{
        background: 'linear-gradient(135deg, #16a34a, #4ade80, #86efac, #4ade80, #16a34a)',
      }}
    >
      {/* Fond intérieur dégradé vert */}
      <div
        className="relative rounded-xl px-6 py-8 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #052e16 0%, #14532d 30%, #166534 60%, #052e16 100%)',
        }}
      >
        {/* Halos verts décoratifs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #4ade80, transparent)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #86efac, transparent)' }} />

        {/* Étoiles décoratives */}
        <div className="absolute top-3 left-6 text-yellow-300 text-lg opacity-70 animate-pulse">★</div>
        <div className="absolute top-3 right-6 text-yellow-300 text-lg opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}>★</div>
        <div className="absolute bottom-3 left-12 text-yellow-300 text-sm opacity-50 animate-pulse" style={{ animationDelay: '1s' }}>★</div>
        <div className="absolute bottom-3 right-12 text-yellow-300 text-sm opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}>★</div>

        {/* Coupe */}
        <div className="text-6xl mb-3 animate-bounce" style={{ animationDuration: '2s' }}>🏆</div>

        {/* CHAMPION */}
        <p className="text-green-300/80 text-xs font-bold tracking-[0.3em] uppercase mb-1">
          Champion du Tournoi Teenbi
        </p>

        {/* Nom de l'équipe */}
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

        {/* Message */}
        <p className="text-green-200/90 text-base md:text-lg font-semibold">
          🎉 Félicitations aux joueurs et au staff de <span className="text-white font-bold">{championName}</span> !
        </p>
        <p className="text-green-300/60 text-sm mt-2">
          Vainqueur de la 5ème Édition du Tournoi de Fraternité du Quartier Teenbi
        </p>

        {/* Barre décorative en bas */}
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
  );
}
