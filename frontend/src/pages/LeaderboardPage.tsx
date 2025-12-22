import React from 'react';
import Header from '@/components/Header';
import Leaderboard from '@/components/Leaderboard';
import { Trophy } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-2xl font-game text-glow">LEADERBOARD</h1>
            <Trophy className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-sm text-muted-foreground font-display">
            Top snake masters from around the world
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg arcade-border">
          <Leaderboard limit={20} />
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
