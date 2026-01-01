import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, Position, GameMode, GameStatus } from '@/types/game';

const GRID_SIZE = 20;
const INITIAL_SPEED = 200;
const SPEED_INCREMENT = 3;
const MIN_SPEED = 50;

const getInitialSnake = (): Position[] => [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

const getOppositeDirection = (dir: Direction): Direction => {
  const opposites: Record<Direction, Direction> = {
    'UP': 'DOWN',
    'DOWN': 'UP',
    'LEFT': 'RIGHT',
    'RIGHT': 'LEFT'
  };
  return opposites[dir];
};

export const createInitialState = (mode: GameMode = 'pass-through'): GameState => {
  const snake = getInitialSnake();
  return {
    snake,
    food: generateFood(snake),
    direction: 'RIGHT',
    score: 0,
    status: 'idle',
    mode,
    speed: INITIAL_SPEED,
  };
};

export const moveSnake = (state: GameState): GameState => {
  if (state.status !== 'playing') return state;

  const head = state.snake[0];
  let newHead: Position;

  switch (state.direction) {
    case 'UP':
      newHead = { x: head.x, y: head.y - 1 };
      break;
    case 'DOWN':
      newHead = { x: head.x, y: head.y + 1 };
      break;
    case 'LEFT':
      newHead = { x: head.x - 1, y: head.y };
      break;
    case 'RIGHT':
      newHead = { x: head.x + 1, y: head.y };
      break;
  }

  // Handle wall collision based on mode
  if (state.mode === 'walls') {
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      return { ...state, status: 'game-over' };
    }
  } else {
    // Pass-through mode: wrap around
    newHead.x = ((newHead.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
    newHead.y = ((newHead.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE;
  }

  // Check self collision
  if (state.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
    return { ...state, status: 'game-over' };
  }

  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;
  const newSnake = [newHead, ...state.snake];

  if (!ateFood) {
    newSnake.pop();
  }

  const newScore = ateFood ? state.score + 10 : state.score;
  const newSpeed = ateFood
    ? Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT)
    : state.speed;

  return {
    ...state,
    snake: newSnake,
    food: ateFood ? generateFood(newSnake) : state.food,
    score: newScore,
    speed: newSpeed,
  };
};

export const changeDirection = (state: GameState, newDirection: Direction): GameState => {
  if (state.status !== 'playing') return state;

  // Prevent reversing direction
  if (newDirection === getOppositeDirection(state.direction)) {
    return state;
  }

  return { ...state, direction: newDirection };
};

export const useGameLogic = (initialMode: GameMode = 'pass-through') => {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(initialMode));
  const gameLoopRef = useRef<number | null>(null);
  const directionQueueRef = useRef<Direction[]>([]);
  const gameStateRef = useRef<GameState>(gameState);

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const startGame = useCallback(() => {
    const newState = {
      ...createInitialState(gameStateRef.current.mode),
      status: 'playing' as const,
    };
    setGameState(newState);
    gameStateRef.current = newState;
    directionQueueRef.current = [];
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const resetGame = useCallback(() => {
    const newState = createInitialState(gameStateRef.current.mode);
    setGameState(newState);
    gameStateRef.current = newState;
    directionQueueRef.current = [];
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    const newState = createInitialState(mode);
    setGameState(newState);
    gameStateRef.current = newState;
  }, []);

  const handleDirectionChange = useCallback((direction: Direction) => {
    directionQueueRef.current.push(direction);
  }, []);

  // Game loop using setInterval for reliable timing
  useEffect(() => {
    if (gameState.status !== 'playing') {
      return;
    }

    const intervalId = setInterval(() => {
      let currentState = gameStateRef.current;

      // Process direction queue
      if (directionQueueRef.current.length > 0) {
        const nextDirection = directionQueueRef.current.shift()!;
        currentState = changeDirection(currentState, nextDirection);
      }

      const newState = moveSnake(currentState);
      gameStateRef.current = newState;
      setGameState(newState);
    }, gameState.speed);

    return () => {
      clearInterval(intervalId);
    };
  }, [gameState.status, gameState.speed]);

  // Heartbeat to update live player status for spectator mode
  useEffect(() => {
    // Only send heartbeat if user is playing
    if (gameState.status !== 'playing') {
      return;
    }

    // Import api inside effect to avoid circular dependencies
    import('@/services/api').then(({ api }) => {
      import('@/contexts/AuthContext').then(({ useAuth }) => {
        // We can't use hooks here, so we check localStorage directly
        const isAuthenticated = !!localStorage.getItem('authToken');

        if (!isAuthenticated) {
          return;
        }

        // Send initial update immediately
        api.livePlayers.updateLiveStatus({
          score: gameState.score,
          mode: gameState.mode,
          snake: gameState.snake,
          food: gameState.food,
          direction: gameState.direction,
          isPlaying: true,
        }).catch(err => console.error('Failed to update live status:', err));

        // Then send updates every 500ms
        const heartbeatInterval = setInterval(() => {
          const currentState = gameStateRef.current;
          if (currentState.status === 'playing') {
            api.livePlayers.updateLiveStatus({
              score: currentState.score,
              mode: currentState.mode,
              snake: currentState.snake,
              food: currentState.food,
              direction: currentState.direction,
              isPlaying: true,
            }).catch(err => console.error('Failed to update live status:', err));
          }
        }, 500);

        return () => {
          clearInterval(heartbeatInterval);
          // Send final update with isPlaying: false
          const currentState = gameStateRef.current;
          api.livePlayers.updateLiveStatus({
            score: currentState.score,
            mode: currentState.mode,
            snake: currentState.snake,
            food: currentState.food,
            direction: currentState.direction,
            isPlaying: false,
          }).catch(err => console.error('Failed to update live status:', err));
        };
      });
    });
  }, [gameState.status]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleDirectionChange('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleDirectionChange('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleDirectionChange('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          if (gameState.status === 'idle' || gameState.status === 'game-over') {
            startGame();
          } else {
            pauseGame();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, handleDirectionChange, startGame, pauseGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setMode,
    handleDirectionChange,
  };
};
