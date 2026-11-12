import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Users,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Avatar } from './Avatar';

export interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const studentNav: NavItem[] = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/modules', label: 'Modul', icon: BookOpen },
  { to: '/student/quizzes', label: 'Kuis', icon: ClipboardList },
  { to: '/student/projects', label: 'Proyek', icon: FolderKanban },
  { to: '/student/forum', label: 'Forum', icon: MessagesSquare },
  { to: '/student/attendance', label: 'Absensi', icon: CalendarCheck },
];

const lecturerNav: NavItem[] = [
  { to: '/lecturer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/lecturer/students', label: 'Mahasiswa', icon: Users },
  { to: '/lecturer/modules', label: 'Modul', icon: BookOpen },
  { to: '/lecturer/quizzes', label: 'Kuis', icon: ClipboardList },
  { to: '/lecturer/projects', label: 'Proyek', icon: FolderKanban },
  { to: '/lecturer/attendance', label: 'Absensi', icon: CalendarCheck },
  { to: '/lecturer/results', label: 'Hasil', icon: FileBarChart },
];

function getNavItems(role: string | undefined): NavItem[] {
  return role === 'lecturer' ? lecturerNav : studentNav;
}

function BrandMark() {
  return (
    <Link
      to="/"
      className="group flex shrink-0 items-center gap-2.5 transition-transform duration-200 hover:scale-[1.03] active:scale-95"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm transition-transform duration-300 group-hover:-rotate-6">
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

function TopNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      className="flex items-center gap-1 overflow-x-auto px-4 pb-1 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Navigasi utama"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `top-nav-link group relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'top-nav-link-active bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-cream-50 hover:text-slate-900'
              }`
            }
          >
            <Icon
              className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children?: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = getNavItems(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const roleLabel = user?.role === 'lecturer' ? 'Dosen' : 'Mahasiswa';

  return (
    <div className="flex min-h-svh flex-col bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <BrandMark />

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <div className="hidden items-center gap-2.5 rounded-full bg-cream-50 py-1 pl-1 pr-3 ring-1 ring-slate-200/70 sm:flex">
                <Avatar
                  name={user.full_name}
                  size="sm"
                  tone={user.role === 'lecturer' ? 'blue' : 'brand'}
                />
                <div className="min-w-0 leading-tight">
                  <p className="max-w-[160px] truncate text-xs font-semibold text-slate-900">
                    {user.full_name}
                  </p>
                  <p className="text-[11px] text-slate-500">{roleLabel}</p>
                </div>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-cream-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              aria-label="Keluar"
              title="Keluar"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <TopNav items={navItems} />
      </header>

      <main className="mx-auto w-full max-w-[1500px] flex-1 p-4 sm:p-5 lg:p-6">
        <div key={location.pathname} className="page-enter">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}
