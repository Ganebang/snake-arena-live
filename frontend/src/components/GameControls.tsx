import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode, GameStatus } from '@/types/game';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  status: GameStatus;
  mode: GameMode;
  score: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: GameMode) => void;
  onDirectionChange: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  status,
  mode,
  score,
  onStart,
  onPause,
  onReset,
  onModeChange,
  onDirectionChange,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Score Display - Now integrated into the controls panel */}
      <div className="relative overflow-hidden rounded-lg bg-black/40 border border-primary/30 p-4 text-center">
        <div className="absolute inset-0 bg-primary/5 animate-pulse-glow" />
        <p className="relative z-10 text-[10px] text-primary/80 mb-1 tracking-widest">SCORE</p>
        <p className="relative z-10 text-4xl font-game text-glow animate-float">{score}</p>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] text-muted-foreground text-center tracking-widest">SYSTEM MODE</p>
        <div className="flex gap-2">
          <Button
            variant={mode === 'walls' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('walls')}
            disabled={status === 'playing'}
            className={`flex-1 text-[10px] h-10 ${mode === 'walls' ? 'bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.5)]' : 'border-primary/50 text-primary hover:bg-primary/10'}`}
          >
            WALLS
          </Button>
          <Button
            variant={mode === 'pass-through' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange('pass-through')}
            disabled={status === 'playing'}
            className={`flex-1 text-[10px] h-10 ${mode === 'pass-through' ? 'bg-secondary text-secondary-foreground shadow-[0_0_15px_hsl(var(--secondary)/0.5)]' : 'border-secondary/50 text-secondary hover:bg-secondary/10'}`}
          >
            WRAP
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-4 justify-center py-2">
        {status === 'playing' ? (
          <Button
            variant="destructive"
            size="icon"
            onClick={onPause}
            className="w-14 h-14 rounded-full shadow-[0_0_15px_hsl(var(--destructive)/0.5)] hover:shadow-[0_0_25px_hsl(var(--destructive)/0.7)] transition-all"
          >
            <Pause className="h-6 w-6" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={onStart}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.5)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.7)] transition-all"
          >
            <Play className="h-6 w-6 ml-1" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="w-14 h-14 rounded-full border-2 border-muted-foreground/50 hover:border-foreground hover:bg-muted/50"
        >
          <RotateCcw className="h-6 w-6" />
        </Button>
      </div>

      {/* D-Pad */}
      <div className="flex flex-col items-center gap-2 mt-2 p-4 bg-black/20 rounded-xl border border-white/5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDirectionChange('UP')}
          className="border border-primary/20 hover:bg-primary/20 hover:border-primary/50 w-12 h-12"
        >
          <ArrowUp className="h-6 w-6 text-primary" />
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDirectionChange('LEFT')}
            className="border border-primary/20 hover:bg-primary/20 hover:border-primary/50 w-12 h-12"
          >
            <ArrowLeft className="h-6 w-6 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDirectionChange('DOWN')}
            className="border border-primary/20 hover:bg-primary/20 hover:border-primary/50 w-12 h-12"
          >
            <ArrowDown className="h-6 w-6 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDirectionChange('RIGHT')}
            className="border border-primary/20 hover:bg-primary/20 hover:border-primary/50 w-12 h-12"
          >
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-[10px] text-muted-foreground/70 font-display tracking-wider">
        <p>ARROW KEYS / WASD • SPACE TO PAUSE</p>
      </div>
    </div>
  );
};

export default GameControls;
