import React, { useEffect, useState } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardProps {
  compact?: boolean;
  limit?: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ compact = false, limit = 10 }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [selectedMode, setSelectedMode] = useState<GameMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await api.leaderboard.getLeaderboard(
          selectedMode === 'all' ? undefined : selectedMode
        );
        setEntries(data.slice(0, limit));
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedMode, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 2:
        return 'bg-gray-400/10 border-gray-400/30';
      case 3:
        return 'bg-amber-600/10 border-amber-600/30';
      default:
        return 'bg-muted/30 border-border';
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <h3 className="text-xs font-game text-muted-foreground text-center">TOP PLAYERS</h3>
        {isLoading ? (
          <div className="text-center text-muted-foreground text-xs">Loading...</div>
        ) : (
          <div className="space-y-1">
            {entries.slice(0, 5).map((entry, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between px-2 py-1 rounded border ${getRankClass(index + 1)}`}
              >
                <div className="flex items-center gap-2">
                  {getRankIcon(index + 1)}
                  <span className="text-[10px] font-display truncate max-w-[80px]">
                    {entry.username}
                  </span>
                </div>
                <span className="text-[10px] font-game text-primary">{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode Filter */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={selectedMode === 'all' ? 'arcade' : 'ghost'}
          size="sm"
          onClick={() => setSelectedMode('all')}
          className="text-[10px]"
        >
          ALL
        </Button>
        <Button
          variant={selectedMode === 'walls' ? 'arcade' : 'ghost'}
          size="sm"
          onClick={() => setSelectedMode('walls')}
          className="text-[10px]"
        >
          WALLS
        </Button>
        <Button
          variant={selectedMode === 'pass-through' ? 'arcade' : 'ghost'}
          size="sm"
          onClick={() => setSelectedMode('pass-through')}
          className="text-[10px]"
        >
          WRAP
        </Button>
      </div>

      {/* Leaderboard List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-8">
          <div className="animate-pulse">Loading rankings...</div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No scores yet. Be the first!
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all hover:scale-[1.02] ${getRankClass(index + 1)}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">
                    {entry.username}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {entry.mode === 'walls' ? 'Walls Mode' : 'Wrap Mode'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-game text-xl text-glow">{entry.score}</p>
                <p className="text-[8px] text-muted-foreground">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
