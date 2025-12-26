import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewAuth } from '@/contexts/InterviewAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Code2, Plus, LogOut, Video, Users, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInterviewSession, InterviewSession } from '@/hooks/useInterviewSession';

const InterviewDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useInterviewAuth();
  const { createSession, joinSession } = useInterviewSession();
  
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('Coding Interview');

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/interview/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMySessions();
    }
  }, [user]);

  const fetchMySessions = async () => {
    if (!user) return;
    
    setLoadingSessions(true);
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []) as InterviewSession[]);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleCreateSession = async () => {
    setIsCreating(true);
    const session = await createSession(newSessionTitle);
    setIsCreating(false);
    
    if (session) {
      toast.success('Session created!');
      navigate(`/interview/session/${session.id}`);
    }
  };

  const handleJoinSession = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a session code');
      return;
    }
    
    setIsJoining(true);
    const session = await joinSession(joinCode.trim());
    setIsJoining(false);
    
    if (session) {
      toast.success('Joined session!');
      navigate(`/interview/session/${session.id}`);
    } else {
      toast.error('Session not found');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/interview/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-display font-semibold">CodeInterview</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Create Session */}
            <Card className="border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Interview
                </CardTitle>
                <CardDescription>
                  Start a new coding interview session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-title">Session Title</Label>
                  <Input
                    id="session-title"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    placeholder="e.g., Frontend Developer Interview"
                  />
                </div>
                <Button onClick={handleCreateSession} className="w-full" disabled={isCreating}>
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Start Interview
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Join Session */}
            <Card className="border-border bg-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Join Interview
                </CardTitle>
                <CardDescription>
                  Enter a session code to join
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code">Session Code</Label>
                  <Input
                    id="join-code"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter code..."
                  />
                </div>
                <Button onClick={handleJoinSession} variant="secondary" className="w-full" disabled={isJoining}>
                  {isJoining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Join Session
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right column - My Sessions */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card/80">
              <CardHeader>
                <CardTitle>My Sessions</CardTitle>
                <CardDescription>
                  Interview sessions you've created
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sessions yet</p>
                    <p className="text-sm">Create your first interview session to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/interview/session/${session.id}`)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{session.title}</h3>
                            <Badge variant={session.is_active ? 'default' : 'secondary'}>
                              {session.is_active ? 'Active' : 'Ended'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(session.created_at).toLocaleDateString()}
                            </span>
                            <span className="font-mono text-xs">
                              Code: {session.share_code}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button variant="link" onClick={() => navigate('/')}>
            Back to Snake Arena
          </Button>
        </div>
      </main>
    </div>
  );
};

export default InterviewDashboard;
