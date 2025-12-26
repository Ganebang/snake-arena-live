import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface ShareLinkProps {
  shareCode: string;
}

export const ShareLink: React.FC<ShareLinkProps> = ({ shareCode }) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/interview/join/${shareCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b border-border">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          Share Interview Link
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="bg-background text-sm font-mono"
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Share this link with candidates to join the interview
        </p>
      </CardContent>
    </Card>
  );
};
