import {
    User,
    LeaderboardEntry,
    LivePlayer,
    AuthCredentials,
    AuthResponse,
    GameMode,
} from '@/types/game';

// API Configuration
// Use relative path for Docker nginx proxy, or fall back to environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// Helper function to handle API errors
const handleApiError = async (response: Response): Promise<never> => {
    let errorMessage = 'An error occurred';

    try {
        const data = await response.json();
        errorMessage = data.detail || data.message || errorMessage;
    } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    throw new Error(errorMessage);
};

// Generic fetch wrapper with auth headers
const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        await handleApiError(response);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
};

// Auth API
export const authApi = {
    async login(credentials: AuthCredentials): Promise<AuthResponse> {
        const response = await apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Store token and user in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));

        return response;
    },

    async signup(credentials: AuthCredentials): Promise<AuthResponse> {
        const response = await apiFetch<AuthResponse>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Store token and user in localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));

        return response;
    },

    async logout(): Promise<void> {
        await apiFetch<void>('/auth/logout', {
            method: 'POST',
        });

        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
    },

    async getCurrentUser(): Promise<User | null> {
        const storedUser = localStorage.getItem('currentUser');
        const storedToken = localStorage.getItem('authToken');

        if (!storedUser || !storedToken) {
            return null;
        }

        try {
            // Verify token is still valid by fetching current user from backend
            const user = await apiFetch<User>('/auth/me');

            // Update stored user in case data changed
            localStorage.setItem('currentUser', JSON.stringify(user));

            return user;
        } catch (error) {
            // Token is invalid, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            return null;
        }
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    },
};

// Leaderboard API
export const leaderboardApi = {
    async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
        const queryParam = mode ? `?mode=${mode}` : '';
        return apiFetch<LeaderboardEntry[]>(`/leaderboard${queryParam}`);
    },

    async submitScore(score: number, mode: GameMode): Promise<LeaderboardEntry> {
        return apiFetch<LeaderboardEntry>('/leaderboard', {
            method: 'POST',
            body: JSON.stringify({ score, mode }),
        });
    },

    async getUserHighScore(userId: string, mode?: GameMode): Promise<number> {
        const params = new URLSearchParams({ userId });
        if (mode) {
            params.append('mode', mode);
        }

        const response = await apiFetch<{ score: number }>(
            `/leaderboard/high-score?${params.toString()}`
        );

        return response.score;
    },
};

// Live Players API (for spectator mode)
export const livePlayersApi = {
    async getLivePlayers(): Promise<LivePlayer[]> {
        return apiFetch<LivePlayer[]>('/live-players');
    },

    async getPlayerStream(playerId: string): Promise<LivePlayer | null> {
        try {
            return await apiFetch<LivePlayer>(`/live-players/${playerId}`);
        } catch (error) {
            // Return null if player not found (404)
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    },
};

// Export all APIs as a single object for easy importing
export const api = {
    auth: authApi,
    leaderboard: leaderboardApi,
    livePlayers: livePlayersApi,
};
