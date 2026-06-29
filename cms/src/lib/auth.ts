const USER_POOL_ID = 'us-east-1_xEoOg1QOx';
const CLIENT_ID = '4v0vdluscbkqjubd1mcoq64bum';
const HOSTED_UI_DOMAIN = 'https://rachelkeys-cms.auth.us-east-1.amazoncognito.com';

function redirectUri() {
  return window.location.origin;
}

export function getHostedUiLoginUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    scope: 'openid email profile',
    redirect_uri: redirectUri(),
  });
  return `${HOSTED_UI_DOMAIN}/login?${params}`;
}

export function getHostedUiLogoutUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    logout_uri: redirectUri(),
  });
  return `${HOSTED_UI_DOMAIN}/logout?${params}`;
}

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const res = await fetch(`${HOSTED_UI_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      code,
      redirect_uri: redirectUri(),
    }),
  });

  if (!res.ok) throw new Error('Token exchange failed');

  const tokens = await res.json() as {
    id_token: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  sessionStorage.setItem('cms_id_token', tokens.id_token);
  sessionStorage.setItem('cms_access_token', tokens.access_token);
  sessionStorage.setItem('cms_refresh_token', tokens.refresh_token);
  sessionStorage.setItem('cms_expires_at', String(Date.now() + tokens.expires_in * 1000));
}

export function getIdToken(): string | null {
  const expiresAt = Number(sessionStorage.getItem('cms_expires_at'));
  if (!expiresAt || Date.now() > expiresAt) return null;
  return sessionStorage.getItem('cms_id_token');
}

export function clearSession(): void {
  ['cms_id_token', 'cms_access_token', 'cms_refresh_token', 'cms_expires_at']
    .forEach(k => sessionStorage.removeItem(k));
}

export { USER_POOL_ID, CLIENT_ID };
