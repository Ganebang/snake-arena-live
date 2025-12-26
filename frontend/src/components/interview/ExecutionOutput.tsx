import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, X, Clock } from 'lucide-react';

interface ExecutionOutputProps {
  result: {
    output: string;
    error: string | null;
    executionTime: number;
  } | null;
  onClear: () => void;
}

export const ExecutionOutput: React.FC<ExecutionOutputProps> = ({ result, onClear }) => {
  if (!result) {
    return (
      <Card className="h-full bg-card/50 border-border">
        <CardHeader className="py-3 px-4 flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Output
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Run your code to see output here
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full border ${result.error ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card/50'}`}>
      <CardHeader className="py-3 px-4 flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          Output
          <span className="text-xs text-muted-foreground flex items-center gap-1 ml-2">
            <Clock className="h-3 w-3" />
            {result.executionTime.toFixed(2)}ms
          </span>
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClear}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <pre className={`text-sm font-mono whitespace-pre-wrap overflow-auto max-h-48 p-3 rounded-md bg-background/50 ${
          result.error ? 'text-destructive' : 'text-foreground'
        }`}>
          {result.error || result.output}
        </pre>
      </CardContent>
    </Card>
  );
};
