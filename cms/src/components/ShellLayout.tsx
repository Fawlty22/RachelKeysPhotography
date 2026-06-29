import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Images, FolderOpen, FileText, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { clearSession, getHostedUiLogoutUrl } from '@/lib/auth';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/photos', label: 'Photos', icon: Images },
  { to: '/categories', label: 'Categories', icon: FolderOpen },
  { to: '/content', label: 'Content', icon: FileText },
];

export function ShellLayout() {
  function handleLogout() {
    clearSession();
    window.location.href = getHostedUiLogoutUrl();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r bg-muted/40">
        <div className="flex h-14 items-center px-4 font-semibold tracking-tight">
          RK Photography
        </div>
        <Separator />
        <nav className="flex-1 space-y-1 p-2">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <Separator />
        <div className="flex items-center gap-3 p-4">
          <Avatar className="h-8 w-8">
            <AvatarFallback>R</AvatarFallback>
          </Avatar>
          <span className="flex-1 text-sm">Rachel</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut size={16} />
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
