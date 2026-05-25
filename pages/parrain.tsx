import React from 'react';
import SponsorSection from '@/components/SponsorSection';
import { useSupabaseSettings } from '@/lib/useSupabase';

/* eslint-disable react/no-unescaped-entities */

export default function ParrainPage() {
  const { settings } = useSupabaseSettings();

  return (
    <div className="space-y-12 pt-8 pb-16">
      {/* Hero Section */}
      <section className="section-container">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">
            Le Parrain du Tournoi
          </h1>
          <p className="text-secondary text-xl">
            Rencontre la personne à l'honneur de cette 5ème édition
          </p>
        </div>
      </section>

      {/* Sponsor Section */}
      <section>
        <SponsorSection />
      </section>

      {/* About Section */}
      <section className="section-container">
        <div className="card p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gold mb-6">À propos du parrain</h2>
          {settings?.sponsor_about ? (
            <p className="text-secondary text-lg leading-relaxed whitespace-pre-wrap">
              {settings.sponsor_about}
            </p>
          ) : (
            <p className="text-secondary italic">Aucune description disponible pour le moment.</p>
          )}
        </div>
      </section>

      {/* Info Cards */}
      <section className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-bold text-gold mb-2">Honneur</h3>
            <p className="text-secondary text-sm">
              Reconnaissance de l'importance de cette personnalité
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-xl font-bold text-gold mb-2">Fraternité</h3>
            <p className="text-secondary text-sm">
              Symbole d'union et de solidarité entre les joueurs
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">⚽</div>
            <h3 className="text-xl font-bold text-gold mb-2">Passion</h3>
            <p className="text-secondary text-sm">
              Amour du football et de la compétition saine
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
