import { useEffect, useState } from 'react';
import { exchangeCodeForTokens, getHostedUiLoginUrl, getIdToken, clearSession } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      window.history.replaceState({}, '', window.location.pathname);
      exchangeCodeForTokens(code)
        .then(() => setStatus('authenticated'))
        .catch((e: unknown) => {
          setError(e instanceof Error ? e.message : String(e));
          setStatus('error');
        });
      return;
    }

    if (getIdToken()) {
      setStatus('authenticated');
    } else {
      setStatus('redirecting');
      window.location.href = getHostedUiLoginUrl();
    }
  }, []);

  if (status === 'error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-destructive font-medium">Authentication failed</p>
        <pre className="text-xs bg-muted p-4 rounded max-w-xl overflow-auto">{error}</pre>
        <button
          className="underline text-sm"
          onClick={() => { clearSession(); window.location.href = getHostedUiLoginUrl(); }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (status === 'loading' || status === 'redirecting') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        {status === 'redirecting' ? 'Redirecting to login…' : 'Loading…'}
      </div>
    );
  }

  return <>{children}</>;
}
