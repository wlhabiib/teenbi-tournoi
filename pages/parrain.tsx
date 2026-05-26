import React from 'react';
import { useSupabaseSettings } from '@/lib/useSupabase';

/* eslint-disable react/no-unescaped-entities */

export default function ParrainPage() {
  const { settings, loading } = useSupabaseSettings();

  // Image fixe du parrain
  const PARRAIN_POSTER = '/parrain.jpeg';
  const PARRAIN_NAME = settings?.sponsor_name || 'Franck Daddy Diatta';
  const PARRAIN_ABOUT = settings?.sponsor_about || '';

  return (
    <div className="section-container py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
          🏆 Le Parrain du Tournoi
        </h1>
        <p className="text-secondary text-lg md:text-xl">
          {PARRAIN_NAME} - 5ème Édition
        </p>
      </div>

      {/* Main Content: 2/3 Poster + 1/3 About */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* 2/3 - Parrain Poster */}
        <div className="lg:col-span-2">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-gold/30">
            <img
              src={PARRAIN_POSTER}
              alt={`Affiche ${PARRAIN_NAME}`}
              className="w-full h-auto object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-parrain.jpeg';
              }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          </div>
          
          {/* Nom du parrain sous l'affiche */}
          <div className="mt-4 text-center">
            <p className="text-2xl md:text-3xl font-bold text-gold">{PARRAIN_NAME}</p>
            <p className="text-secondary mt-1">Parrain du Tournoi Teenbi 2025</p>
          </div>
        </div>

        {/* 1/3 - À propos du parrain */}
        <div className="lg:col-span-1">
          <div className="card h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">👤</span>
              <h2 className="text-2xl font-bold text-gold">À propos du parrain</h2>
            </div>
            
            <div className="flex-1">
              {loading ? (
                <p className="text-secondary italic">Chargement...</p>
              ) : PARRAIN_ABOUT ? (
                <p className="text-secondary text-base leading-relaxed whitespace-pre-wrap">
                  {PARRAIN_ABOUT}
                </p>
              ) : (
                <div className="space-y-4">
                  <p className="text-secondary italic">
                    Aucune description disponible pour le moment.
                  </p>
                  <p className="text-secondary/70 text-sm">
                    Le parrain de cette 5ème édition est {PARRAIN_NAME}. 
                    Une personnalité emblématique qui incarne les valeurs de fraternité 
                    et de passion du football au sein du quartier Teenbi.
                  </p>
                </div>
              )}
            </div>

            {/* Info badges */}
            <div className="mt-6 pt-6 border-t border-secondary/20 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gold">🏆</span>
                <span className="text-secondary">Parrain de la 5ème Édition</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gold">📍</span>
                <span className="text-secondary">Terrain Teenbi</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gold">🗓️</span>
                <span className="text-secondary">Sur lendemain Tabaski</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
