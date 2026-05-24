import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary/95">
      <Navigation />
      <main className="pt-20">
        {children}
      </main>
    </div>
  );
}
