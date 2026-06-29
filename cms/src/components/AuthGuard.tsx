import { useEffect, useState } from 'react';
import { exchangeCodeForTokens, getHostedUiLoginUrl, getIdToken, clearSession } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'redirecting'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Clear the code from the URL without reloading
      window.history.replaceState({}, '', window.location.pathname);
      exchangeCodeForTokens(code)
        .then(() => setStatus('authenticated'))
        .catch(() => {
          clearSession();
          window.location.href = getHostedUiLoginUrl();
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

  if (status === 'loading' || status === 'redirecting') {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        {status === 'redirecting' ? 'Redirecting to login…' : 'Loading…'}
      </div>
    );
  }

  return <>{children}</>;
}
