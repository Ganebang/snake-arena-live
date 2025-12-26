import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, User } from 'lucide-react';

interface Participant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    display_name: string;
    email: string;
  };
}

interface ParticipantsListProps {
  participants: Participant[];
  currentUserId?: string;
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  currentUserId
}) => {
  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b border-border">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Participants ({participants.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2">
        <div className="space-y-1">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                  {participant.role === 'host' ? (
                    <Crown className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {participant.profile?.display_name || 'Anonymous'}
                    {participant.user_id === currentUserId && (
                      <span className="text-muted-foreground ml-1">(you)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participant.profile?.email}
                  </p>
                </div>
              </div>
              
              <Badge variant={participant.role === 'host' ? 'default' : 'secondary'} className="text-xs">
                {participant.role}
              </Badge>
            </div>
          ))}
          
          {participants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No participants yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
