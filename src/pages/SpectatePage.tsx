import React from 'react';
import Header from '@/components/Header';
import SpectatorView from '@/components/SpectatorView';
import { Eye } from 'lucide-react';

const SpectatePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Eye className="h-8 w-8 text-secondary" />
            <h1 className="text-2xl font-game text-glow-secondary">SPECTATE</h1>
            <Eye className="h-8 w-8 text-secondary" />
          </div>
          <p className="text-sm text-muted-foreground font-display">
            Watch live games from other players
          </p>
        </div>

        <SpectatorView />
      </main>
    </div>
  );
};

export default SpectatePage;
