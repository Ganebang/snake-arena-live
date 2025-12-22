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
    <div className="flex flex-col gap-6">
      {/* Score Display */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">SCORE</p>
        <p className="text-3xl font-game text-glow">{score}</p>
      </div>

      {/* Mode Selection */}
      <div className="flex flex-col gap-2">
        <p className="text-xs text-muted-foreground text-center">MODE</p>
        <div className="flex gap-2">
          <Button
            variant={mode === 'walls' ? 'arcade' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('walls')}
            disabled={status === 'playing'}
            className="flex-1 text-[10px]"
          >
            WALLS
          </Button>
          <Button
            variant={mode === 'pass-through' ? 'arcade' : 'ghost'}
            size="sm"
            onClick={() => onModeChange('pass-through')}
            disabled={status === 'playing'}
            className="flex-1 text-[10px]"
          >
            WRAP
          </Button>
        </div>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2 justify-center">
        {status === 'playing' ? (
          <Button variant="arcade" size="icon" onClick={onPause}>
            <Pause className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="arcade" size="icon" onClick={onStart}>
            <Play className="h-5 w-5" />
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={onReset}>
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>

      {/* D-Pad */}
      <div className="flex flex-col items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDirectionChange('UP')}
          className="border border-border"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDirectionChange('LEFT')}
            className="border border-border"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDirectionChange('DOWN')}
            className="border border-border"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDirectionChange('RIGHT')}
            className="border border-border"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-[8px] text-muted-foreground">
        <p>ARROW KEYS / WASD TO MOVE</p>
        <p>SPACE TO PAUSE</p>
      </div>
    </div>
  );
};

export default GameControls;
