import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export interface NavItem {
  to: string;
  label: string;
}

const studentNav: NavItem[] = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/modules', label: 'Modul' },
  { to: '/student/forum', label: 'Forum' },
];

const lecturerNav: NavItem[] = [
  { to: '/lecturer/dashboard', label: 'Dashboard' },
  { to: '/lecturer/quizzes', label: 'Kuis' },
  { to: '/lecturer/results', label: 'Hasil' },
];

function getNavItems(role: string): NavItem[] {
  if (role === 'lecturer') {
    return lecturerNav;
  }
  return studentNav;
}

function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8 6L3 12L8 18M16 6L21 12L16 18"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-900">WebCode Lab</span>
    </Link>
  );
}

function SidebarFooter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return null;
  }

  const initials = user.fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="border-t border-slate-200 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
          <p className="truncate text-xs capitalize text-slate-500">{user.role}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          aria-label="Keluar"
        >
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function SidebarNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="space-y-1" aria-label="Navigasi utama">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role ?? 'student');

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-svh bg-slate-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <BrandMark />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav items={navItems} />
        </div>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {user ? (
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
            <BrandMark />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              aria-label="Keluar"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
        ) : null}
        {user ? (
          <nav className="border-b border-slate-200 bg-white lg:hidden" aria-label="Navigasi utama mobile">
            <div className="flex gap-2 overflow-x-auto px-4 py-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium ${
                      isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        ) : null}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
