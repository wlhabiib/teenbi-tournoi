import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from './Navigation';
import { useSupabaseSettings } from '@/lib/useSupabase';

interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

// Pages sans navigation
const NO_NAV_PAGES = ['/login', '/signup'];

export default function Layout({ children, showBackground = true }: LayoutProps) {
  const router = useRouter();
  const { settings } = useSupabaseSettings();
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const showNavigation = !NO_NAV_PAGES.includes(router.pathname);

  useEffect(() => {
    if (settings?.background_photo_url) {
      setBackgroundImage(settings.background_photo_url);
    }
  }, [settings?.background_photo_url]);

  return (
    <div
      className="min-h-screen"
      style={
        showBackground && backgroundImage
          ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${backgroundImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : {
              background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
            }
      }
    >
      {showNavigation && <Navigation />}
      <main className={showNavigation ? 'pt-20' : ''}>
        {children}
      </main>

      {/* Widget Fixe du Parrain - Visible partout sauf sur login/signup */}
      {showNavigation && settings?.sponsor_photo_url && (
        <div className="fixed bottom-4 right-4 z-50 group pointer-events-none sm:pointer-events-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur group-hover:blur-md transition-all opacity-20"></div>
            <img 
              src={settings.sponsor_photo_url} 
              alt="Parrain" 
              className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-yellow-400 object-cover shadow-lg relative z-10"
            />
            <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full z-20">PARRAIN</div>
          </div>
        </div>
      )}
    </div>
  );
}
