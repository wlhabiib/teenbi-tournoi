import React, { useEffect, useState } from 'react';
import { useSupabaseSettings } from '@/lib/useSupabase';

interface SponsorInfo {
  sponsor_photo_url: string;
  sponsor_name?: string;
  sponsor_about?: string;
}

interface SponsorSectionProps {
  compact?: boolean;
}

export default function SponsorSection({ compact = false }: SponsorSectionProps) {
  const { settings, loading } = useSupabaseSettings();

  // Image fixe du parrain (non modifiable)
  const FIXED_PARRAIN_IMAGE = '/parrain.jpg';
  
  // Construire l'objet sponsor à partir des settings
  const sponsor: SponsorInfo = {
    sponsor_photo_url: FIXED_PARRAIN_IMAGE,
    sponsor_name: settings?.sponsor_name || 'Franck Daddy Diatta',
    sponsor_about: settings?.sponsor_about || '',
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-secondary">Chargement...</p>
      </div>
    );
  }

  // Version compacte pour la page d'accueil
  if (compact) {
    return (
      <div className="text-center w-full">
        <div>
          <img
            src={sponsor.sponsor_photo_url}
            alt={sponsor.sponsor_name || 'Parrain'}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gold"
          />
          <p className="font-bold text-gold text-sm">{sponsor.sponsor_name || 'Franck Daddy Diatta'}</p>
        </div>
      </div>
    );
  }

  // Version complète pour la page parrain
  return (
    <div className="section-container">
      <h2 className="text-4xl font-bold gradient-text mb-8 text-center">
        Parrain du Tournoi
      </h2>

      <div className="flex justify-center">
        <div className="relative group">
          {/* Image du parrain avec frame élégant */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-accent/30 hover:border-accent/60 transition-all duration-300 max-w-sm">
            <img
              src={sponsor.sponsor_photo_url}
              alt={sponsor.sponsor_name || 'Parrain'}
              className="w-full h-auto object-cover"
            />
            {/* Overlay optionnel au hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
              <p className="text-white text-lg font-bold text-center">
                {sponsor.sponsor_name || 'Parrain du Tournoi'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
