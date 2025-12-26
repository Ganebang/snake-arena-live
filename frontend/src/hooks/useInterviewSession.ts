import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInterviewAuth } from '@/contexts/InterviewAuthContext';
import { nanoid } from 'nanoid';

export interface InterviewSession {
  id: string;
  host_id: string;
  title: string;
  code_content: string;
  language: string;
  share_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    display_name: string;
    email: string;
  };
}

export const useInterviewSession = (sessionId?: string) => {
  const { user } = useInterviewAuth();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch session by ID or share code
  const fetchSession = useCallback(async (idOrCode: string) => {
    setLoading(true);
    setError(null);

    try {
      // Try by ID first
      let { data, error: fetchError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', idOrCode)
        .maybeSingle();

      // If not found, try by share code
      if (!data) {
        const result = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('share_code', idOrCode)
          .maybeSingle();
        data = result.data;
        fetchError = result.error;
      }

      if (fetchError) throw fetchError;
      if (!data) throw new Error('Session not found');

      setSession(data as InterviewSession);
      return data as InterviewSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async (title: string = 'Coding Interview') => {
    if (!user) {
      setError('Must be logged in to create a session');
      return null;
    }

    try {
      const shareCode = nanoid(8);
      const { data, error: createError } = await supabase
        .from('interview_sessions')
        .insert({
          host_id: user.id,
          title,
          share_code: shareCode,
          code_content: '// Start coding here...\n',
          language: 'javascript'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add host as participant
      await supabase.from('session_participants').insert({
        session_id: data.id,
        user_id: user.id,
        role: 'host'
      });

      setSession(data as InterviewSession);
      return data as InterviewSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return null;
    }
  }, [user]);

  // Join an existing session
  const joinSession = useCallback(async (shareCode: string) => {
    if (!user) {
      setError('Must be logged in to join a session');
      return null;
    }

    try {
      const sessionData = await fetchSession(shareCode);
      if (!sessionData) return null;

      // Check if already a participant
      const { data: existing } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('session_participants').insert({
          session_id: sessionData.id,
          user_id: user.id,
          role: 'participant'
        });
      }

      return sessionData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join session');
      return null;
    }
  }, [user, fetchSession]);

  // Update code content
  const updateCode = useCallback(async (codeContent: string) => {
    if (!session) return;

    try {
      await supabase
        .from('interview_sessions')
        .update({ code_content: codeContent })
        .eq('id', session.id);
    } catch (err) {
      console.error('Failed to update code:', err);
    }
  }, [session]);

  // Update language
  const updateLanguage = useCallback(async (language: string) => {
    if (!session) return;

    try {
      await supabase
        .from('interview_sessions')
        .update({ language })
        .eq('id', session.id);
      
      setSession(prev => prev ? { ...prev, language } : null);
    } catch (err) {
      console.error('Failed to update language:', err);
    }
  }, [session]);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    if (!session) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('session_participants')
        .select(`
          *,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('session_id', session.id);

      if (fetchError) throw fetchError;
      
      const mapped = (data || []).map(p => ({
        ...p,
        profile: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
      }));
      
      setParticipants(mapped as Participant[]);
    } catch (err) {
      console.error('Failed to fetch participants:', err);
    }
  }, [session]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'interview_sessions',
          filter: `id=eq.${session.id}`
        },
        (payload) => {
          setSession(payload.new as InterviewSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  // Fetch participants on session change
  useEffect(() => {
    if (session) {
      fetchParticipants();
    }
  }, [session, fetchParticipants]);

  // Initial fetch if sessionId provided
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId, fetchSession]);

  return {
    session,
    participants,
    loading,
    error,
    createSession,
    joinSession,
    fetchSession,
    updateCode,
    updateLanguage,
    isHost: user?.id === session?.host_id
  };
};
