import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users } from 'lucide-react';

interface VideoPanelProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isVideoOff: boolean;
  isCallActive: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onStartCall: () => void;
  onEndCall: () => void;
  participantCount: number;
}

export const VideoPanel: React.FC<VideoPanelProps> = ({
  localVideoRef,
  localStream,
  remoteStreams,
  isMuted,
  isVideoOff,
  isCallActive,
  onToggleMute,
  onToggleVideo,
  onStartCall,
  onEndCall,
  participantCount
}) => {
  return (
    <Card className="h-full bg-card/50 border-border flex flex-col">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b border-border">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Video className="h-4 w-4" />
          Video Call
        </CardTitle>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          {participantCount}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 flex flex-col gap-4">
        {/* Local video */}
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${!localStream || isVideoOff ? 'hidden' : ''}`}
          />
          {(!localStream || isVideoOff) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <VideoOff className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">
                  {!localStream ? 'Camera off' : 'Video paused'}
                </p>
              </div>
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-1 rounded">
            You
          </div>
        </div>

        {/* Remote videos */}
        <div className="grid grid-cols-2 gap-2">
          {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
            <div key={peerId} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <video
                autoPlay
                playsInline
                ref={(el) => { if (el) el.srcObject = stream; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 text-xs bg-background/80 px-1.5 py-0.5 rounded">
                Participant
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 mt-auto pt-4 border-t border-border">
          {!isCallActive ? (
            <Button onClick={onStartCall} className="gap-2">
              <Phone className="h-4 w-4" />
              Start Call
            </Button>
          ) : (
            <>
              <Button
                variant={isMuted ? 'destructive' : 'secondary'}
                size="icon"
                onClick={onToggleMute}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                variant={isVideoOff ? 'destructive' : 'secondary'}
                size="icon"
                onClick={onToggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
              <Button variant="destructive" size="icon" onClick={onEndCall}>
                <PhoneOff className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
