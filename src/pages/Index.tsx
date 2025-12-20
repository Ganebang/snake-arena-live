import React from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/mockApi';
import GameCanvas from '@/components/GameCanvas';
import GameControls from '@/components/GameControls';
import Leaderboard from '@/components/Leaderboard';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const { gameState, startGame, pauseGame, resetGame, setMode, handleDirectionChange } = useGameLogic();
  const { isAuthenticated } = useAuth();
  const prevStatusRef = React.useRef(gameState.status);

  // Submit score when game ends
  React.useEffect(() => {
    if (prevStatusRef.current === 'playing' && gameState.status === 'game-over') {
      if (isAuthenticated && gameState.score > 0) {
        api.leaderboard
          .submitScore(gameState.score, gameState.mode)
          .then(() => {
            toast({
              title: "Score Submitted!",
              description: `Your score of ${gameState.score} has been recorded.`,
            });
          })
          .catch((error) => {
            console.error('Failed to submit score:', error);
          });
      }
    }
    prevStatusRef.current = gameState.status;
  }, [gameState.status, gameState.score, gameState.mode, isAuthenticated]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Game Area */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-game text-glow mb-2">SNAKE</h2>
              <p className="text-xs text-muted-foreground font-display">
                {gameState.mode === 'walls' ? 'WALLS MODE - Hit a wall and die!' : 'WRAP MODE - Pass through walls!'}
              </p>
            </div>
            
            <GameCanvas gameState={gameState} cellSize={18} />
            
            {!isAuthenticated && gameState.status === 'game-over' && (
              <p className="text-xs text-secondary font-display animate-pulse">
                Log in to save your scores!
              </p>
            )}
          </div>

          {/* Controls & Info */}
          <div className="flex flex-col gap-6 w-full max-w-xs">
            <div className="bg-card p-6 rounded-lg arcade-border">
              <GameControls
                status={gameState.status}
                mode={gameState.mode}
                score={gameState.score}
                onStart={startGame}
                onPause={pauseGame}
                onReset={resetGame}
                onModeChange={setMode}
                onDirectionChange={handleDirectionChange}
              />
            </div>

            <div className="bg-card p-4 rounded-lg border border-border">
              <Leaderboard compact limit={5} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
