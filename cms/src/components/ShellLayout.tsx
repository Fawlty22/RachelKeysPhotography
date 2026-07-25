import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Images,
  FolderOpen,
  FileText,
  LogOut,
  Rocket,
  Menu,
  X,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { clearSession, getHostedUiLogoutUrl } from '@/lib/auth';
import {
  triggerRebuild,
  getBuildStatus,
  isBuildInProgress,
  isBuildComplete,
  type BuildStatus,
} from '@/lib/publish';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/photos', label: 'Photos', icon: Images },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
  { to: '/content', label: 'Content', icon: FileText },
];

const STATUS_LABEL: Record<BuildStatus, string> = {
  idle: 'Publish Site',
  starting: 'Starting…',
  IN_PROGRESS: 'Building…',
  SUCCEEDED: 'Live ✓',
  FAILED: 'Build failed',
  STOPPED: 'Build stopped',
  TIMED_OUT: 'Build timed out',
  FAULT: 'Build error',
  error: 'Error — retry?',
};

const STATUS_CLASS: Record<BuildStatus, string> = {
  idle: '',
  starting: 'opacity-60 cursor-not-allowed',
  IN_PROGRESS: 'opacity-60 cursor-not-allowed',
  SUCCEEDED: 'text-green-600',
  FAILED: 'text-destructive',
  STOPPED: 'text-destructive',
  TIMED_OUT: 'text-destructive',
  FAULT: 'text-destructive',
  error: 'text-destructive',
};

export function ShellLayout() {
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Close drawer on route change (NavLink click)
  function closeDrawer() {
    setDrawerOpen(false);
  }

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // Reset to idle after a terminal state
  useEffect(() => {
    if (isBuildComplete(buildStatus) && buildStatus !== 'idle') {
      const t = setTimeout(() => setBuildStatus('idle'), 8000);
      return () => clearTimeout(t);
    }
  }, [buildStatus]);

  useEffect(() => () => stopPolling(), []);

  async function handlePublish() {
    if (isBuildInProgress(buildStatus)) return;

    setBuildStatus('starting');
    stopPolling();

    let buildId: string;
    try {
      buildId = await triggerRebuild();
    } catch (err) {
      console.error('Failed to trigger rebuild:', err);
      setBuildStatus('error');
      return;
    }

    pollRef.current = setInterval(async () => {
      const status = await getBuildStatus(buildId);
      setBuildStatus(status);
      if (isBuildComplete(status)) stopPolling();
    }, 5000);
  }

  function handleLogout() {
    clearSession();
    window.location.href = getHostedUiLogoutUrl();
  }

  const isBuilding = isBuildInProgress(buildStatus);

  // Shared sidebar content — rendered both in the desktop aside and mobile drawer
  const sidebarContent = (
    <>
      <div className="flex h-14 items-center px-4 font-semibold tracking-tight">
        RK Photography
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-2" aria-label="Main navigation">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={closeDrawer}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <Separator />

      {/* Publish button */}
      <div className="p-3">
        <button
          onClick={handlePublish}
          disabled={isBuilding}
          aria-label="Publish site"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            isBuilding && 'opacity-60 cursor-not-allowed',
            STATUS_CLASS[buildStatus] !== '' &&
              !isBuilding &&
              'bg-transparent border border-current hover:bg-transparent',
            STATUS_CLASS[buildStatus],
          )}
        >
          <Rocket size={15} className={cn(isBuilding && 'animate-pulse')} />
          {STATUS_LABEL[buildStatus]}
        </button>
      </div>

      <Separator />

      {/* User / logout */}
      <div className="flex items-center gap-3 p-4">
        <Avatar className="h-8 w-8">
          <AvatarFallback>R</AvatarFallback>
        </Avatar>
        <span className="flex-1 text-sm">Rachel</span>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
          <LogOut size={16} />
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 flex-col border-r bg-muted/40 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={closeDrawer}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200 ease-in-out md:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="Navigation drawer"
      >
        {/* Close button inside drawer */}
        <button
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-foreground"
          onClick={closeDrawer}
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* ── Main content area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Mobile top bar */}
        <header className="flex h-14 items-center border-b px-4 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <span className="ml-3 font-semibold tracking-tight">RK Photography</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
