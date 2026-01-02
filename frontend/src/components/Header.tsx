import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2, Trophy, Eye, LogIn, LogOut, User, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLivePlayerCount } from '@/hooks/useLivePlayerCount';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const { count: livePlayerCount } = useLivePlayerCount();

  const navItems = [
    { path: '/', label: 'PLAY', icon: Gamepad2 },
    { path: '/leaderboard', label: 'RANKS', icon: Trophy },
    { path: '/spectate', label: 'WATCH', icon: Eye },
  ];

  if (user?.is_superuser) {
    navItems.push({ path: '/admin', label: 'ADMIN', icon: ShieldAlert });
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center arcade-border">
              <span className="text-xl">🐍</span>
            </div>
            <h1 className="text-lg font-game text-glow hidden sm:block">
              SNAKE
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'arcade' : 'ghost'}
                  size="sm"
                  className="text-[10px] gap-1 relative"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {/* Live badge for spectate */}
                  {path === '/spectate' && livePlayerCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[8px] animate-pulse"
                    >
                      {livePlayerCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-xs font-display text-primary">
                    {user?.username}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-[10px]"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="neon" size="sm" className="text-[10px] gap-1">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">LOGIN</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
