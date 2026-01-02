import React, { useState, useEffect } from 'react';
import { LivePlayer } from '@/types/game';
import { api } from '@/services/api';
import GameCanvas from './GameCanvas';
import { Button } from '@/components/ui/button';
import { Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SpectatorView: React.FC = () => {
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live players
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        const players = await api.livePlayers.getLivePlayers();
        setLivePlayers(players);
        if (players.length > 0 && !selectedPlayer) {
          setSelectedPlayer(players[0]);
        }
      } catch (error) {
        console.error('Failed to fetch live players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Periodically refresh player data from backend
  useEffect(() => {
    if (!selectedPlayer) return;

    // Fetch updates every 500ms
    const intervalId = setInterval(async () => {
      try {
        const updatedPlayer = await api.livePlayers.getPlayerStream(selectedPlayer.id);
        if (updatedPlayer) {
          setSelectedPlayer(updatedPlayer);
        }
      } catch (error) {
        console.error('Failed to fetch player update:', error);
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedPlayer?.id]);

  const handlePrevPlayer = () => {
    const currentIndex = livePlayers.findIndex(p => p.id === selectedPlayer?.id);
    const prevIndex = (currentIndex - 1 + livePlayers.length) % livePlayers.length;
    setSelectedPlayer(livePlayers[prevIndex]);
  };

  const handleNextPlayer = () => {
    const currentIndex = livePlayers.findIndex(p => p.id === selectedPlayer?.id);
    const nextIndex = (currentIndex + 1) % livePlayers.length;
    setSelectedPlayer(livePlayers[nextIndex]);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Eye className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground font-display">Finding live games...</p>
        </div>
      </div>
    );
  }

  if (livePlayers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-game text-glow-secondary mb-3">NO LIVE GAMES</h3>
          <p className="text-sm text-muted-foreground font-display mb-4">
            No one is playing right now. Be the first to start a game!
          </p>
          <p className="text-xs text-muted-foreground/70">
            When players are online, you'll be able to watch their games in real-time here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={handlePrevPlayer}>
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex gap-2 overflow-x-auto py-2 px-4 max-w-md">
          {livePlayers.map((player) => (
            <Button
              key={player.id}
              variant={selectedPlayer?.id === player.id ? 'arcade' : 'ghost'}
              size="sm"
              onClick={() => setSelectedPlayer(player)}
              className="text-[10px] whitespace-nowrap"
            >
              {player.username}
            </Button>
          ))}
        </div>

        <Button variant="ghost" size="icon" onClick={handleNextPlayer}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Game View */}
      {selectedPlayer && (
        <div className="flex flex-col items-center gap-4">
          {/* Player Info */}
          <div className="flex items-center gap-6 px-6 py-3 bg-card rounded-lg arcade-border">
            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </div>
              <span className="text-xs text-red-500 font-bold">LIVE</span>
            </div>

            {/* Player name */}
            <div className="text-center flex-1">
              <p className="font-display font-bold text-lg text-foreground">
                {selectedPlayer.username}
              </p>
              <Badge
                variant={selectedPlayer.mode === 'walls' ? 'default' : 'secondary'}
                className="text-[9px] mt-1"
              >
                {selectedPlayer.mode === 'walls' ? '🧱 WALLS' : '🌀 WRAP'}
              </Badge>
            </div>

            {/* Score */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">SCORE</p>
              <p className="font-game text-xl text-glow">{selectedPlayer.score}</p>
            </div>
          </div>

          {/* Canvas */}
          <GameCanvas
            gameState={{
              snake: selectedPlayer.snake,
              food: selectedPlayer.food,
              direction: selectedPlayer.direction,
              score: selectedPlayer.score,
              status: 'playing',
              mode: selectedPlayer.mode,
              speed: 150,
            }}
            cellSize={18}
            isSpectator={true}
          />

          {/* Live Indicator */}
          <div className="flex items-center gap-2 text-secondary">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="text-xs font-display">LIVE</span>
          </div>
        </div>
      )}

      {/* Other Players List */}
      <div className="space-y-2">
        <h3 className="text-xs font-game text-center text-muted-foreground">
          OTHER LIVE GAMES ({livePlayers.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {livePlayers
            .filter(p => p.id !== selectedPlayer?.id)
            .map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="flex items-center justify-between px-4 py-3 bg-card/50 rounded-lg border border-border hover:border-primary transition-all group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-display text-sm group-hover:text-primary transition-colors">
                    {player.username}
                  </span>
                </div>
                <span className="font-game text-sm text-muted-foreground group-hover:text-primary">
                  {player.score}
                </span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SpectatorView;
