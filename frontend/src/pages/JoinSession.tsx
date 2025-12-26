import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewAuth } from '@/contexts/InterviewAuthContext';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const JoinSession: React.FC = () => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useInterviewAuth();
  const { joinSession, error } = useInterviewSession();

  useEffect(() => {
    if (!authLoading && !user) {
      // Store the share code and redirect to auth
      sessionStorage.setItem('pendingJoinCode', shareCode || '');
      navigate('/interview/auth');
      return;
    }

    if (user && shareCode) {
      handleJoin();
    }
  }, [user, authLoading, shareCode]);

  const handleJoin = async () => {
    if (!shareCode) {
      toast.error('Invalid session code');
      navigate('/interview');
      return;
    }

    const session = await joinSession(shareCode);
    
    if (session) {
      toast.success('Joined session!');
      navigate(`/interview/session/${session.id}`);
    } else {
      toast.error('Session not found or unable to join');
      navigate('/interview');
    }
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      navigate('/interview');
    }
  }, [error, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Joining session...</p>
      </div>
    </div>
  );
};

export default JoinSession;
