import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Users, Gamepad2, Trophy } from 'lucide-react';
import CyberCard from '@/components/ui/CyberCard';

interface Stats {
    users: number;
    games: number;
    games_by_mode: Record<string, number>;
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.admin.getStats();
                setStats(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="text-center p-8">Loading stats...</div>;
    }

    if (!stats) {
        return <div className="text-center p-8 text-destructive">Failed to load stats</div>;
    }

    // ... (keep interface and imports)

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-glow mb-8">Dashboard Overview</h2>

            <div className="grid gap-6 md:grid-cols-3">
                <CyberCard variant="primary" className="bg-black/40">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Users</span>
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-glow font-display">{stats.users}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered pilots</p>
                    </div>
                </CyberCard>
                <CyberCard variant="secondary" className="bg-black/40">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Total Games</span>
                        <Gamepad2 className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-glow-secondary font-display">{stats.games}</div>
                        <p className="text-xs text-muted-foreground mt-1">Simulations run</p>
                    </div>
                </CyberCard>
                <CyberCard variant="accent" className="bg-black/40">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Top Mode</span>
                        <Trophy className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-glow-accent font-display capitalize">
                            {Object.entries(stats.games_by_mode).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Most popular protocol</p>
                    </div>
                </CyberCard>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <CyberCard className="col-span-4 bg-black/40" variant="primary">
                    <div className="mb-6 border-b border-primary/20 pb-4">
                        <h3 className="text-xl font-display font-bold text-primary tracking-wider">GAME PROTOCOLS</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(stats.games_by_mode).map(([mode, count]) => (
                            <div key={mode} className="flex items-center">
                                <div className="w-full flex justify-between items-center p-3 rounded bg-primary/5 border border-primary/10">
                                    <div className="capitalize font-medium text-primary/80 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${mode === 'walls' ? 'bg-primary' : 'bg-secondary'}`} />
                                        {mode}
                                    </div>
                                    <div className="font-display font-bold text-xl">{count} <span className="text-xs font-sans font-normal text-muted-foreground opacity-50">games</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CyberCard>
            </div>
        </div>
    );
};

export default AdminDashboard;
