import React, { useState, useEffect, useRef } from 'react';
import { LivePlayer } from '@/types/game';
import { api } from '@/services/mockApi';
import GameCanvas from './GameCanvas';
import { Button } from '@/components/ui/button';
import { Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const SpectatorView: React.FC = () => {
  const [livePlayers, setLivePlayers] = useState<LivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<LivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

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

  // Simulate player movement
  useEffect(() => {
    if (!selectedPlayer) return;

    simulationRef.current = setInterval(() => {
      setSelectedPlayer(prev => {
        if (!prev) return prev;
        return api.livePlayers.simulatePlayerMove(prev);
      });
    }, 150);

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
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
        <div className="text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-display">No live games right now</p>
          <p className="text-xs text-muted-foreground mt-2">Check back later!</p>
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
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-secondary animate-pulse" />
              <span className="text-xs text-muted-foreground">WATCHING</span>
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-lg text-foreground">
                {selectedPlayer.username}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">
                {selectedPlayer.mode === 'walls' ? 'Walls Mode' : 'Wrap Mode'}
              </p>
            </div>
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
