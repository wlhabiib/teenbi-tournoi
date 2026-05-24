import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import { useSupabaseSettings } from '@/lib/useSupabase';

interface LayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

export default function Layout({ children, showBackground = true }: LayoutProps) {
  const { settings } = useSupabaseSettings();
  const [backgroundImage, setBackgroundImage] = useState<string>('');

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
              background: 'linear-gradient(to bottom right, #0a0a0a, #1a1a2e, #16213e)',
            }
      }
    >
      <Navigation />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
