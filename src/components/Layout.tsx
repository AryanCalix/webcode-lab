import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileBarChart,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Sparkles,
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
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-sm">
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

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="border-t border-slate-200/80 p-4">
      <div className="flex items-center gap-3 rounded-xl bg-cream-50 p-2.5">
        <Avatar name={user.full_name} tone={user.role === 'lecturer' ? 'blue' : 'brand'} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{user.full_name}</p>
          <p className="truncate text-xs text-slate-500">
            {user.role === 'lecturer' ? 'Dosen' : 'Mahasiswa'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
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
    <nav className="space-y-1 px-3" aria-label="Navigasi utama">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100'
                  : 'text-slate-600 hover:bg-cream-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
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
  const navItems = getNavItems(user?.role);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-svh bg-cream-100">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200/80 bg-white/90 backdrop-blur lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-200/80 px-5">
          <BrandMark />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav items={navItems} />
          <div className="mx-4 mt-6 rounded-xl bg-gradient-to-br from-brand-50 to-blue-50 p-3.5 ring-1 ring-brand-100">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-700">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {user?.role === 'lecturer' ? 'Tips mengajar' : 'Tips belajar'}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              {user?.role === 'lecturer'
                ? 'Cek progres mahasiswa dan tandai pengecualian absensi setiap selesai sesi.'
                : 'Selesaikan satu tahap setiap hari agar streak dan progresmu tetap terjaga.'}
            </p>
          </div>
        </div>
        <SidebarFooter />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur lg:hidden">
          <BrandMark />
          <div className="flex items-center gap-2">
            {user ? <Avatar name={user.full_name} size="sm" /> : null}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-cream-100 hover:text-slate-900"
              aria-label="Keluar"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>
        <nav
          className="border-b border-slate-200/80 bg-white/90 backdrop-blur lg:hidden"
          aria-label="Navigasi utama mobile"
        >
          <div className="flex gap-2 overflow-x-auto px-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                      isActive ? 'bg-brand-600 text-white' : 'bg-cream-100 text-slate-600'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}
