import { useState, useEffect } from 'react';
import { api } from '@/services/api';

export const useLivePlayerCount = () => {
    const [count, setCount] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const players = await api.livePlayers.getLivePlayers();
                setCount(players.length);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch live player count:', error);
                setIsLoading(false);
            }
        };

        // Fetch immediately
        fetchCount();

        // Then poll every 5 seconds
        const intervalId = setInterval(fetchCount, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return { count, isLoading };
};
