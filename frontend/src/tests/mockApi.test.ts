import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '@/services/mockApi';

describe('Mock API', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset internal mock state
    api.auth.reset();
  });

  describe('Auth API', () => {
    it('should login with valid credentials', async () => {
      const response = await api.auth.login({
        email: 'pixel@game.com',
        password: 'any',
      });

      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('pixel@game.com');
      expect(response.token).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      await expect(
        api.auth.login({
          email: 'invalid@email.com',
          password: 'any',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should signup new user', async () => {
      const response = await api.auth.signup({
        email: 'newuser@test.com',
        password: 'password123',
        username: 'NewPlayer',
      });

      expect(response.user).toBeDefined();
      expect(response.user.email).toBe('newuser@test.com');
      expect(response.user.username).toBe('NewPlayer');
    });

    it('should throw error for duplicate email', async () => {
      await expect(
        api.auth.signup({
          email: 'pixel@game.com',
          password: 'password',
          username: 'AnotherName',
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should logout user', async () => {
      await api.auth.login({
        email: 'pixel@game.com',
        password: 'any',
      });

      await api.auth.logout();

      expect(api.auth.isAuthenticated()).toBe(false);
    });

    it('should persist user in localStorage', async () => {
      await api.auth.login({
        email: 'pixel@game.com',
        password: 'any',
      });

      expect(localStorage.getItem('authToken')).toBeDefined();
      expect(localStorage.getItem('currentUser')).toBeDefined();
    });

    it('should restore user from localStorage', async () => {
      await api.auth.login({
        email: 'pixel@game.com',
        password: 'any',
      });

      const user = await api.auth.getCurrentUser();

      expect(user).toBeDefined();
      expect(user?.email).toBe('pixel@game.com');
    });
  });

  describe('Leaderboard API', () => {
    it('should return leaderboard entries', async () => {
      const entries = await api.leaderboard.getLeaderboard();

      expect(entries.length).toBeGreaterThan(0);
      expect(entries[0].score).toBeGreaterThanOrEqual(entries[1].score);
    });

    it('should filter by game mode', async () => {
      const wallsEntries = await api.leaderboard.getLeaderboard('walls');

      wallsEntries.forEach(entry => {
        expect(entry.mode).toBe('walls');
      });
    });

    it('should submit score when authenticated', async () => {
      await api.auth.login({
        email: 'pixel@game.com',
        password: 'any',
      });

      const entry = await api.leaderboard.submitScore(500, 'walls');

      expect(entry.score).toBe(500);
      expect(entry.mode).toBe('walls');
    });

    it('should throw error when submitting score unauthenticated', async () => {
      await expect(
        api.leaderboard.submitScore(500, 'walls')
      ).rejects.toThrow('Must be logged in to submit score');
    });
  });

  describe('Live Players API', () => {
    it('should return live players', async () => {
      const players = await api.livePlayers.getLivePlayers();

      expect(players.length).toBeGreaterThan(0);
      players.forEach(player => {
        expect(player.snake.length).toBeGreaterThan(0);
        expect(player.isPlaying).toBe(true);
      });
    });

    it('should return specific player stream', async () => {
      const players = await api.livePlayers.getLivePlayers();
      const player = await api.livePlayers.getPlayerStream(players[0].id);

      expect(player).toBeDefined();
      expect(player?.id).toBe(players[0].id);
    });

    it('should return null for non-existent player', async () => {
      const player = await api.livePlayers.getPlayerStream('non-existent');

      expect(player).toBeNull();
    });

    it('should simulate player movement', async () => {
      const players = await api.livePlayers.getLivePlayers();
      const initialPlayer = players[0];

      const movedPlayer = api.livePlayers.simulatePlayerMove(initialPlayer);

      expect(movedPlayer.snake[0]).not.toEqual(initialPlayer.snake[0]);
    });

    it('should wrap position in pass-through mode', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 0,
        mode: 'pass-through' as const,
        snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }],
        food: { x: 5, y: 5 },
        direction: 'RIGHT' as const,
        isPlaying: true,
      };

      const movedPlayer = api.livePlayers.simulatePlayerMove(player);

      expect(movedPlayer.snake[0].x).toBeGreaterThanOrEqual(0);
      expect(movedPlayer.snake[0].x).toBeLessThan(20);
    });

    it('should increase score when eating food', async () => {
      const player = {
        id: 'test',
        username: 'Test',
        score: 50,
        mode: 'walls' as const,
        snake: [{ x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 5, y: 5 },
        direction: 'RIGHT' as const,
        isPlaying: true,
      };

      // Prevent random direction change
      const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      const movedPlayer = api.livePlayers.simulatePlayerMove(player);

      randomSpy.mockRestore();

      expect(movedPlayer.score).toBe(60);
      expect(movedPlayer.snake.length).toBe(3);
    });
  });
});
