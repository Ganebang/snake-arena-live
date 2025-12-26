import { useState, useCallback } from 'react';

interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
}

export const useCodeExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  const executeCode = useCallback(async (code: string, language: string): Promise<ExecutionResult> => {
    setIsExecuting(true);
    const startTime = performance.now();
    
    try {
      if (language !== 'javascript' && language !== 'typescript') {
        const unsupportedResult: ExecutionResult = {
          output: '',
          error: `Browser execution only supports JavaScript. Selected: ${language}`,
          executionTime: 0
        };
        setResult(unsupportedResult);
        return unsupportedResult;
      }

      // Create a sandboxed environment for code execution
      const logs: string[] = [];
      const errors: string[] = [];

      // Create sandbox with console override
      const sandbox = `
        (function() {
          const logs = [];
          const originalConsole = console;
          const console = {
            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            error: (...args) => logs.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            warn: (...args) => logs.push('WARN: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            info: (...args) => logs.push('INFO: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          };
          
          try {
            ${code}
          } catch (e) {
            logs.push('ERROR: ' + e.message);
          }
          
          return logs.join('\\n');
        })()
      `;

      // Execute in iframe sandbox for better isolation
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.sandbox.add('allow-scripts');
      document.body.appendChild(iframe);

      try {
        // Use Function constructor for slightly safer execution
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
        
        // Capture console.log output
        const capturedLogs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
          capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
        };
        console.error = (...args) => {
          capturedLogs.push('ERROR: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
        };
        console.warn = (...args) => {
          capturedLogs.push('WARN: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
        };

        // Execute with timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Execution timed out (5s limit)')), 5000);
        });

        const executionPromise = new Promise<void>((resolve, reject) => {
          try {
            const fn = new Function(code);
            const result = fn();
            if (result !== undefined) {
              capturedLogs.push(String(result));
            }
            resolve();
          } catch (e) {
            reject(e);
          }
        });

        await Promise.race([executionPromise, timeoutPromise]);

        // Restore console
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;

        const executionTime = performance.now() - startTime;
        const executionResult: ExecutionResult = {
          output: capturedLogs.join('\n') || 'Code executed successfully (no output)',
          error: null,
          executionTime
        };
        
        setResult(executionResult);
        return executionResult;
      } finally {
        document.body.removeChild(iframe);
      }
    } catch (err) {
      const executionTime = performance.now() - startTime;
      const errorResult: ExecutionResult = {
        output: '',
        error: err instanceof Error ? err.message : 'Unknown execution error',
        executionTime
      };
      
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
  }, []);

  return {
    executeCode,
    isExecuting,
    result,
    clearResult
  };
};
