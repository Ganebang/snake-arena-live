import { 
  User, 
  LeaderboardEntry, 
  LivePlayer, 
  AuthCredentials, 
  AuthResponse,
  GameMode,
  Position,
  Direction
} from '@/types/game';

// Simulated delay to mimic network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockUsers: User[] = [
  { id: '1', username: 'PixelMaster', email: 'pixel@game.com', createdAt: '2024-01-01' },
  { id: '2', username: 'SnakeKing', email: 'snake@game.com', createdAt: '2024-01-02' },
  { id: '3', username: 'ArcadeHero', email: 'arcade@game.com', createdAt: '2024-01-03' },
];

let mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', userId: '2', username: 'SnakeKing', score: 2450, mode: 'walls', createdAt: '2024-01-15' },
  { id: '2', userId: '1', username: 'PixelMaster', score: 1890, mode: 'pass-through', createdAt: '2024-01-14' },
  { id: '3', userId: '3', username: 'ArcadeHero', score: 1650, mode: 'walls', createdAt: '2024-01-13' },
  { id: '4', userId: '4', username: 'RetroGamer', score: 1420, mode: 'pass-through', createdAt: '2024-01-12' },
  { id: '5', userId: '5', username: 'NeonNinja', score: 1280, mode: 'walls', createdAt: '2024-01-11' },
  { id: '6', userId: '6', username: 'CyberSnake', score: 1150, mode: 'pass-through', createdAt: '2024-01-10' },
  { id: '7', userId: '7', username: 'BitRunner', score: 980, mode: 'walls', createdAt: '2024-01-09' },
  { id: '8', userId: '8', username: 'PixelPunk', score: 850, mode: 'pass-through', createdAt: '2024-01-08' },
  { id: '9', userId: '9', username: 'GlitchWorm', score: 720, mode: 'walls', createdAt: '2024-01-07' },
  { id: '10', userId: '10', username: 'VectorViper', score: 650, mode: 'pass-through', createdAt: '2024-01-06' },
];

let currentUser: User | null = null;
let authToken: string | null = null;

// Auth API
export const authApi = {
  async login(credentials: AuthCredentials): Promise<AuthResponse> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // In real app, we'd verify password here
    currentUser = user;
    authToken = `mock-token-${user.id}-${Date.now()}`;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return { user, token: authToken };
  },

  async signup(credentials: AuthCredentials): Promise<AuthResponse> {
    await delay(500);
    
    if (mockUsers.some(u => u.email === credentials.email)) {
      throw new Error('Email already exists');
    }
    
    if (mockUsers.some(u => u.username === credentials.username)) {
      throw new Error('Username already taken');
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username: credentials.username!,
      email: credentials.email,
      createdAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    currentUser = newUser;
    authToken = `mock-token-${newUser.id}-${Date.now()}`;
    
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { user: newUser, token: authToken };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      currentUser = JSON.parse(storedUser);
      authToken = storedToken;
      return currentUser;
    }
    
    return null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
};

// Leaderboard API
export const leaderboardApi = {
  async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
    await delay(300);
    
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    return entries.sort((a, b) => b.score - a.score);
  },

  async submitScore(score: number, mode: GameMode): Promise<LeaderboardEntry> {
    await delay(300);
    
    if (!currentUser) {
      throw new Error('Must be logged in to submit score');
    }
    
    const entry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      userId: currentUser.id,
      username: currentUser.username,
      score,
      mode,
      createdAt: new Date().toISOString(),
    };
    
    mockLeaderboard.push(entry);
    mockLeaderboard.sort((a, b) => b.score - a.score);
    
    return entry;
  },

  async getUserHighScore(userId: string, mode?: GameMode): Promise<number> {
    await delay(200);
    
    let entries = mockLeaderboard.filter(e => e.userId === userId);
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    
    if (entries.length === 0) return 0;
    return Math.max(...entries.map(e => e.score));
  }
};

// Live Players API (for spectator mode)
const generateMockSnake = (): Position[] => {
  const length = Math.floor(Math.random() * 10) + 3;
  const startX = Math.floor(Math.random() * 15) + 2;
  const startY = Math.floor(Math.random() * 15) + 2;
  
  return Array.from({ length }, (_, i) => ({
    x: startX - i,
    y: startY
  }));
};

const generateMockFood = (): Position => ({
  x: Math.floor(Math.random() * 20),
  y: Math.floor(Math.random() * 20)
});

const mockLivePlayers: LivePlayer[] = [
  {
    id: 'live-1',
    username: 'SnakeKing',
    score: 340,
    mode: 'walls',
    snake: generateMockSnake(),
    food: generateMockFood(),
    direction: 'RIGHT',
    isPlaying: true
  },
  {
    id: 'live-2',
    username: 'NeonNinja',
    score: 180,
    mode: 'pass-through',
    snake: generateMockSnake(),
    food: generateMockFood(),
    direction: 'DOWN',
    isPlaying: true
  },
  {
    id: 'live-3',
    username: 'CyberSnake',
    score: 520,
    mode: 'walls',
    snake: generateMockSnake(),
    food: generateMockFood(),
    direction: 'LEFT',
    isPlaying: true
  },
];

export const livePlayersApi = {
  async getLivePlayers(): Promise<LivePlayer[]> {
    await delay(200);
    return [...mockLivePlayers];
  },

  async getPlayerStream(playerId: string): Promise<LivePlayer | null> {
    await delay(100);
    return mockLivePlayers.find(p => p.id === playerId) || null;
  },

  // Simulate player movement for spectator mode
  simulatePlayerMove(player: LivePlayer): LivePlayer {
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const opposites: Record<Direction, Direction> = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    };

    // Randomly change direction sometimes
    let newDirection = player.direction;
    if (Math.random() < 0.2) {
      const validDirections = directions.filter(d => d !== opposites[player.direction]);
      newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
    }

    const head = player.snake[0];
    let newHead: Position;

    switch (newDirection) {
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

    // Handle wrapping for pass-through mode, or keep in bounds for walls
    if (player.mode === 'pass-through') {
      newHead.x = ((newHead.x % 20) + 20) % 20;
      newHead.y = ((newHead.y % 20) + 20) % 20;
    } else {
      newHead.x = Math.max(0, Math.min(19, newHead.x));
      newHead.y = Math.max(0, Math.min(19, newHead.y));
    }

    const ateFood = newHead.x === player.food.x && newHead.y === player.food.y;
    const newSnake = [newHead, ...player.snake];
    
    if (!ateFood) {
      newSnake.pop();
    }

    return {
      ...player,
      snake: newSnake,
      food: ateFood ? generateMockFood() : player.food,
      direction: newDirection,
      score: ateFood ? player.score + 10 : player.score
    };
  }
};

// Export all APIs as a single object for easy importing
export const api = {
  auth: authApi,
  leaderboard: leaderboardApi,
  livePlayers: livePlayersApi
};
