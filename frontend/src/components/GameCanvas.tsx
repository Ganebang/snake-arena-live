import React, { useRef, useEffect } from 'react';
import { GameState, Position } from '@/types/game';

interface GameCanvasProps {
  gameState: GameState;
  cellSize?: number;
  isSpectator?: boolean;
}

const GRID_SIZE = 20;

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  cellSize = 25,
  isSpectator = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = GRID_SIZE * cellSize;
    const height = GRID_SIZE * cellSize;

    // Clear canvas
    ctx.fillStyle = 'hsl(220, 30%, 8%)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'hsl(220, 30%, 15%)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(width, i * cellSize);
      ctx.stroke();
    }

    // Draw food with glow effect
    const drawFood = (pos: Position) => {
      const x = pos.x * cellSize + cellSize / 2;
      const y = pos.y * cellSize + cellSize / 2;
      const radius = cellSize / 2 - 2;

      // Glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
      gradient.addColorStop(0, 'hsla(330, 100%, 60%, 0.8)');
      gradient.addColorStop(0.5, 'hsla(330, 100%, 60%, 0.3)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(pos.x * cellSize - cellSize, pos.y * cellSize - cellSize, cellSize * 3, cellSize * 3);

      // Food circle
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(330, 100%, 60%)';
      ctx.fill();

      // Inner highlight
      ctx.beginPath();
      ctx.arc(x - radius / 3, y - radius / 3, radius / 3, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(330, 100%, 80%, 0.6)';
      ctx.fill();
    };

    // Draw snake with glow effect
    const drawSnake = (snake: Position[]) => {
      snake.forEach((segment, index) => {
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;
        const size = cellSize - 2;
        const offset = 1;

        // Glow effect for head
        if (index === 0) {
          const gradient = ctx.createRadialGradient(
            x + cellSize / 2, y + cellSize / 2, 0,
            x + cellSize / 2, y + cellSize / 2, cellSize
          );
          gradient.addColorStop(0, 'hsla(120, 100%, 50%, 0.5)');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(x - cellSize / 2, y - cellSize / 2, cellSize * 2, cellSize * 2);
        }

        // Snake segment
        const brightness = 50 - (index * 2);
        ctx.fillStyle = `hsl(120, 100%, ${Math.max(30, brightness)}%)`;
        ctx.fillRect(x + offset, y + offset, size, size);

        // Inner border for depth
        ctx.strokeStyle = `hsl(120, 100%, ${Math.max(40, brightness + 10)}%)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + offset + 1, y + offset + 1, size - 2, size - 2);

        // Eyes for head
        if (index === 0) {
          ctx.fillStyle = 'hsl(220, 20%, 10%)';
          const eyeSize = 3;
          const eyeOffset = cellSize / 3;

          switch (gameState.direction) {
            case 'RIGHT':
              ctx.fillRect(x + cellSize - eyeOffset, y + eyeOffset - eyeSize / 2, eyeSize, eyeSize);
              ctx.fillRect(x + cellSize - eyeOffset, y + cellSize - eyeOffset - eyeSize / 2, eyeSize, eyeSize);
              break;
            case 'LEFT':
              ctx.fillRect(x + eyeOffset - eyeSize, y + eyeOffset - eyeSize / 2, eyeSize, eyeSize);
              ctx.fillRect(x + eyeOffset - eyeSize, y + cellSize - eyeOffset - eyeSize / 2, eyeSize, eyeSize);
              break;
            case 'UP':
              ctx.fillRect(x + eyeOffset - eyeSize / 2, y + eyeOffset - eyeSize, eyeSize, eyeSize);
              ctx.fillRect(x + cellSize - eyeOffset - eyeSize / 2, y + eyeOffset - eyeSize, eyeSize, eyeSize);
              break;
            case 'DOWN':
              ctx.fillRect(x + eyeOffset - eyeSize / 2, y + cellSize - eyeOffset, eyeSize, eyeSize);
              ctx.fillRect(x + cellSize - eyeOffset - eyeSize / 2, y + cellSize - eyeOffset, eyeSize, eyeSize);
              break;
          }
        }
      });
    };

    // Draw border for walls mode
    if (gameState.mode === 'walls') {
      ctx.strokeStyle = 'hsl(0, 80%, 50%)';
      ctx.lineWidth = 3;
      ctx.strokeRect(1, 1, width - 2, height - 2);

      // Corner highlights
      const cornerSize = 10;
      ctx.fillStyle = 'hsl(0, 80%, 50%)';
      ctx.fillRect(0, 0, cornerSize, 3);
      ctx.fillRect(0, 0, 3, cornerSize);
      ctx.fillRect(width - cornerSize, 0, cornerSize, 3);
      ctx.fillRect(width - 3, 0, 3, cornerSize);
      ctx.fillRect(0, height - 3, cornerSize, 3);
      ctx.fillRect(0, height - cornerSize, 3, cornerSize);
      ctx.fillRect(width - cornerSize, height - 3, cornerSize, 3);
      ctx.fillRect(width - 3, height - cornerSize, 3, cornerSize);
    }

    drawFood(gameState.food);
    drawSnake(gameState.snake);

    // Draw game over overlay
    if (gameState.status === 'game-over' && !isSpectator) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '16px "Press Start 2P"';
      ctx.fillStyle = 'hsl(0, 80%, 50%)';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', width / 2, height / 2 - 20);

      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = 'hsl(120, 100%, 50%)';
      ctx.fillText(`SCORE: ${gameState.score}`, width / 2, height / 2 + 10);

      ctx.font = '8px "Press Start 2P"';
      ctx.fillStyle = 'hsl(220, 20%, 60%)';
      ctx.fillText('PRESS SPACE TO RESTART', width / 2, height / 2 + 40);
    }

    // Draw paused overlay
    if (gameState.status === 'paused' && !isSpectator) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '16px "Press Start 2P"';
      ctx.fillStyle = 'hsl(200, 100%, 50%)';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', width / 2, height / 2);
    }

    // Draw idle overlay
    if (gameState.status === 'idle' && !isSpectator) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '10px "Press Start 2P"';
      ctx.fillStyle = 'hsl(120, 100%, 50%)';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE TO START', width / 2, height / 2);
    }

  }, [gameState, cellSize, isSpectator]);

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * cellSize}
      height={GRID_SIZE * cellSize}
      className="rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-primary/20"
    />
  );
};

export default GameCanvas;
