import React, { useEffect } from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import GameCanvas from '@/components/GameCanvas';
import GameControls from '@/components/GameControls';
import Leaderboard from '@/components/Leaderboard';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';
import LiveIndicator from '@/components/LiveIndicator';
import CyberCard from '@/components/ui/CyberCard';

const Index: React.FC = () => {
  const { gameState, startGame, pauseGame, resetGame, setMode, handleDirectionChange } = useGameLogic();
  const { isAuthenticated } = useAuth();
  const prevStatusRef = React.useRef(gameState.status);

  // Submit score when game ends
  useEffect(() => {
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
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 perspective-grid pointer-events-none opacity-20" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent z-10" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />

      <div className="relative z-20">
        <Header />
      </div>

      <main className="container relative z-20 mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl items-start">

          {/* Left Column: Game Area */}
          <div className="lg:col-span-8 flex flex-col items-center gap-6">
            <CyberCard
              className="w-full flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-xl border-primary/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
              variant="primary"
            >
              <div className="flex justify-between w-full mb-6 items-center px-4">
                <div>
                  <h2 className="text-2xl font-game text-glow flex items-center gap-3">
                    <span className="text-4xl">🐍</span>
                    SNAKE ARENA
                  </h2>
                  <p className="text-[10px] text-primary/60 font-display tracking-[0.2em] mt-1 pl-1">
                    SYSTEM STATUS: {gameState.status.toUpperCase()}
                  </p>
                </div>

                {/* Mode Indicator */}
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground font-display tracking-widest mb-1">CURRENT MODE</p>
                  <div className={`inline-block px-3 py-1 rounded border ${gameState.mode === 'walls'
                    ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_hsl(var(--primary)/0.3)]'
                    : 'border-secondary/50 bg-secondary/10 text-secondary shadow-[0_0_10px_hsl(var(--secondary)/0.3)]'
                    }`}>
                    <span className="text-xs font-bold uppercase tracking-wider">{gameState.mode === 'walls' ? 'WALLS' : 'WRAP'}</span>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 animate-pulse-glow"></div>
                <div className="relative">
                  <GameCanvas gameState={gameState} cellSize={25} />

                  {/* Live indicator overlay */}
                  {isAuthenticated && gameState.status === 'playing' && (
                    <div className="absolute top-4 left-4">
                      <LiveIndicator />
                    </div>
                  )}
                </div>
              </div>

              {!isAuthenticated && gameState.status === 'game-over' && (
                <div className="mt-6 p-3 border border-dashed border-primary/30 rounded bg-primary/5 text-center w-full max-w-md animate-pulse">
                  <p className="text-xs text-primary font-display">
                    SESSION NOT SAVED • LOG IN TO ARCHIVE SCORE
                  </p>
                </div>
              )}
            </CyberCard>
          </div>

          {/* Right Column: Controls & Stats */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <CyberCard variant="secondary" className="bg-black/40">
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
            </CyberCard>

            <CyberCard variant="accent" className="flex-1 min-h-[300px] bg-black/40">
              <div className="flex items-center justify-between mb-4 border-b border-accent/20 pb-2">
                <h3 className="text-sm font-display text-accent tracking-widest">GLOBAL RANKINGS</h3>
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
              </div>
              <div className="h-[250px] overflow-hidden relative">
                <Leaderboard compact limit={5} />
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </div>
            </CyberCard>
          </div>
        </div>
      </main>

      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-30 mix-blend-overlay" />
    </div>
  );
};

export default Index;
