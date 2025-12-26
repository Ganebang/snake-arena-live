import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInterviewAuth } from '@/contexts/InterviewAuthContext';
import { useInterviewSession } from '@/hooks/useInterviewSession';
import { useCodeExecution } from '@/hooks/useCodeExecution';
import { useVideoCall } from '@/hooks/useVideoCall';
import { CodeEditor } from '@/components/interview/CodeEditor';
import { ExecutionOutput } from '@/components/interview/ExecutionOutput';
import { VideoPanel } from '@/components/interview/VideoPanel';
import { ParticipantsList } from '@/components/interview/ParticipantsList';
import { ShareLink } from '@/components/interview/ShareLink';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Code2, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const InterviewSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useInterviewAuth();
  
  const {
    session,
    participants,
    loading: sessionLoading,
    error: sessionError,
    fetchSession,
    updateCode,
    updateLanguage,
    isHost
  } = useInterviewSession(sessionId);
  
  const { executeCode, isExecuting, result, clearResult } = useCodeExecution();
  
  const {
    localVideoRef,
    localStream,
    remoteStreams,
    isMuted,
    isVideoOff,
    isCallActive,
    startLocalStream,
    stopLocalStream,
    toggleMute,
    toggleVideo
  } = useVideoCall(sessionId);

  const [localCode, setLocalCode] = useState('');
  const [localLanguage, setLocalLanguage] = useState('javascript');

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/interview/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (session) {
      setLocalCode(session.code_content);
      setLocalLanguage(session.language);
    }
  }, [session]);

  useEffect(() => {
    if (sessionError) {
      toast.error(sessionError);
      navigate('/interview');
    }
  }, [sessionError, navigate]);

  const handleCodeChange = useCallback((code: string) => {
    setLocalCode(code);
    updateCode(code);
  }, [updateCode]);

  const handleLanguageChange = useCallback((language: string) => {
    setLocalLanguage(language);
    updateLanguage(language);
  }, [updateLanguage]);

  const handleExecute = useCallback(async () => {
    await executeCode(localCode, localLanguage);
  }, [executeCode, localCode, localLanguage]);

  if (authLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Session not found</p>
          <Button onClick={() => navigate('/interview')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/interview')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Code2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">{session.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {isHost ? 'You are the host' : 'Participant'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Session: <span className="font-mono">{session.share_code}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <ResizablePanelGroup direction="horizontal">
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col p-4 gap-4">
              <div className="flex-1 min-h-0">
                <CodeEditor
                  code={localCode}
                  language={localLanguage}
                  onCodeChange={handleCodeChange}
                  onLanguageChange={handleLanguageChange}
                  onExecute={handleExecute}
                  isExecuting={isExecuting}
                />
              </div>
              
              <div className="h-48 shrink-0">
                <ExecutionOutput result={result} onClear={clearResult} />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Video & Participants */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
              {/* Share Link (Host only) */}
              {isHost && <ShareLink shareCode={session.share_code} />}
              
              {/* Video Panel */}
              <div className="flex-1 min-h-[300px]">
                <VideoPanel
                  localVideoRef={localVideoRef}
                  localStream={localStream}
                  remoteStreams={remoteStreams}
                  isMuted={isMuted}
                  isVideoOff={isVideoOff}
                  isCallActive={isCallActive}
                  onToggleMute={toggleMute}
                  onToggleVideo={toggleVideo}
                  onStartCall={startLocalStream}
                  onEndCall={stopLocalStream}
                  participantCount={participants.length}
                />
              </div>
              
              {/* Participants List */}
              <ParticipantsList
                participants={participants}
                currentUserId={user?.id}
              />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default InterviewSession;
