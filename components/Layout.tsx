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
    if (settings?.background_image_url) {
      setBackgroundImage(settings.background_image_url);
    }
  }, [settings?.background_image_url]);

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
    </div>
  );
}
