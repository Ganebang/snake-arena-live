import { describe, it, expect } from 'vitest';
import { createInitialState, moveSnake, changeDirection } from '@/hooks/useGameLogic';
import { GameState, Direction } from '@/types/game';

describe('Game Logic', () => {
  describe('createInitialState', () => {
    it('should create initial state with walls mode', () => {
      const state = createInitialState('walls');
      
      expect(state.mode).toBe('walls');
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.snake.length).toBe(3);
      expect(state.direction).toBe('RIGHT');
    });

    it('should create initial state with pass-through mode', () => {
      const state = createInitialState('pass-through');
      
      expect(state.mode).toBe('pass-through');
    });

    it('should generate food at valid position', () => {
      const state = createInitialState('walls');
      
      expect(state.food.x).toBeGreaterThanOrEqual(0);
      expect(state.food.x).toBeLessThan(20);
      expect(state.food.y).toBeGreaterThanOrEqual(0);
      expect(state.food.y).toBeLessThan(20);
    });
  });

  describe('moveSnake', () => {
    it('should not move if game is not playing', () => {
      const state = createInitialState('walls');
      const newState = moveSnake(state);
      
      expect(newState.snake).toEqual(state.snake);
    });

    it('should move snake right', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'RIGHT',
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
      };
      
      const newState = moveSnake(state);
      
      expect(newState.snake[0]).toEqual({ x: 11, y: 10 });
      expect(newState.snake.length).toBe(3);
    });

    it('should move snake left', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'LEFT',
        snake: [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }],
      };
      
      const newState = moveSnake(state);
      
      expect(newState.snake[0]).toEqual({ x: 9, y: 10 });
    });

    it('should move snake up', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'UP',
        snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      };
      
      const newState = moveSnake(state);
      
      expect(newState.snake[0]).toEqual({ x: 10, y: 9 });
    });

    it('should move snake down', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'DOWN',
        snake: [{ x: 10, y: 10 }, { x: 10, y: 9 }, { x: 10, y: 8 }],
      };
      
      const newState = moveSnake(state);
      
      expect(newState.snake[0]).toEqual({ x: 10, y: 11 });
    });

    it('should end game on wall collision in walls mode', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'RIGHT',
        snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
      };
      
      const newState = moveSnake(state);
      
      expect(newState.status).toBe('game-over');
    });

    it('should wrap around in pass-through mode', () => {
      const state: GameState = {
        ...createInitialState('pass-through'),
        status: 'playing',
        direction: 'RIGHT',
        snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }, { x: 17, y: 10 }],
      };
      
      const newState = moveSnake(state);
      
      expect(newState.status).toBe('playing');
      expect(newState.snake[0].x).toBe(0);
    });

    it('should end game on self collision', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'LEFT',
        snake: [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 11, y: 11 },
          { x: 10, y: 11 },
          { x: 9, y: 11 },
          { x: 9, y: 10 },
        ],
      };
      
      const newState = moveSnake(state);
      
      expect(newState.status).toBe('game-over');
    });

    it('should grow snake and increase score when eating food', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'RIGHT',
        snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
        food: { x: 11, y: 10 },
        score: 0,
      };
      
      const newState = moveSnake(state);
      
      expect(newState.snake.length).toBe(4);
      expect(newState.score).toBe(10);
    });
  });

  describe('changeDirection', () => {
    it('should change direction when valid', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'RIGHT',
      };
      
      const newState = changeDirection(state, 'UP');
      
      expect(newState.direction).toBe('UP');
    });

    it('should not allow reversing direction', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'playing',
        direction: 'RIGHT',
      };
      
      const newState = changeDirection(state, 'LEFT');
      
      expect(newState.direction).toBe('RIGHT');
    });

    it('should not change direction if game is not playing', () => {
      const state: GameState = {
        ...createInitialState('walls'),
        status: 'idle',
        direction: 'RIGHT',
      };
      
      const newState = changeDirection(state, 'UP');
      
      expect(newState.direction).toBe('RIGHT');
    });

    const oppositeDirections: [Direction, Direction][] = [
      ['UP', 'DOWN'],
      ['DOWN', 'UP'],
      ['LEFT', 'RIGHT'],
      ['RIGHT', 'LEFT'],
    ];

    oppositeDirections.forEach(([current, opposite]) => {
      it(`should not allow changing from ${current} to ${opposite}`, () => {
        const state: GameState = {
          ...createInitialState('walls'),
          status: 'playing',
          direction: current,
        };
        
        const newState = changeDirection(state, opposite);
        
        expect(newState.direction).toBe(current);
      });
    });
  });
});
