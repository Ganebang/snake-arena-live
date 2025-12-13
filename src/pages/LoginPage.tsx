import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login
  const handleDemoLogin = async () => {
    setEmail('pixel@game.com');
    setPassword('demo123');
    setIsLoading(true);
    
    try {
      await login({ email: 'pixel@game.com', password: 'demo123' });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4 arcade-border">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-xl font-game text-glow mb-2">LOGIN</h1>
            <p className="text-sm text-muted-foreground font-display">
              Enter the arcade
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg arcade-border">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-display flex items-center gap-2">
                <Mail className="h-4 w-4" />
                EMAIL
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@arcade.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-display flex items-center gap-2">
                <Lock className="h-4 w-4" />
                PASSWORD
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                variant="arcade"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'ENTERING...' : 'LOGIN'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                TRY DEMO ACCOUNT
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              New player?{' '}
              <Link to="/signup" className="text-secondary hover:underline">
                Create account
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
