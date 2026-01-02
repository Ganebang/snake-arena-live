import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Users, LogOut, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } else if (!user?.is_superuser) {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

    if (!user?.is_superuser) {
        return null;
    }

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-background flex relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
            <div className="absolute inset-0 perspective-grid pointer-events-none opacity-20" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />

            {/* Sidebar */}
            <aside className="w-64 border-r border-primary/20 bg-black/40 backdrop-blur-md hidden md:flex flex-col relative z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
                <div className="p-6 border-b border-primary/20">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30 group-hover:border-primary/60 transition-colors shadow-[0_0_10px_hsl(var(--primary)/0.2)]">
                            <span className="text-xl">🐍</span>
                        </div>
                        <h1 className="text-lg font-game text-glow group-hover:text-primary transition-colors">
                            ADMIN
                        </h1>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link key={path} to={path}>
                            <Button
                                variant={location.pathname === path ? 'secondary' : 'ghost'}
                                className="w-full justify-start gap-2"
                            >
                                <Icon className="h-4 w-4" />
                                {label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border space-y-2">
                    <Link to="/">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            Back to Game
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Mobile Header (visible only on small screens) */}
            {/* For simplicity, we'll keep it simple for now and assume desktop usage for admin or add a simple top bar later if needed */}

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative z-20">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
