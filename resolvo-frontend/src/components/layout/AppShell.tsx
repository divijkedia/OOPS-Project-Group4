import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { NotificationBell } from './NotificationBell';
import { UserMenu } from './UserMenu';
import {
  Shield,
  LayoutDashboard,
  PlusCircle,
  ListOrdered,
  Users,
  Sliders,
  FileCheck2,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  WifiOff,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const AppShell: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  // Role-based navigation links
  const employeeNav: NavItem[] = [
    { label: 'My Dashboard', path: '/employee', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Report Incident', path: '/employee/report', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'My Incidents', path: '/employee/incidents', icon: <ListOrdered className="w-4 h-4" /> },
  ];

  const technicianNav: NavItem[] = [
    { label: 'Technician Console', path: '/technician', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Assigned Incidents', path: '/technician/incidents', icon: <ListOrdered className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { label: 'Overview Analytics', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'All Incidents', path: '/admin/incidents', icon: <ListOrdered className="w-4 h-4" /> },
    { label: 'Users & Technicians', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
    { label: 'IT Services & SLA', path: '/admin/services', icon: <Layers className="w-4 h-4" /> },
    { label: 'Assignment Strategy', path: '/admin/strategy', icon: <Sliders className="w-4 h-4" /> },
    { label: 'Audit Trail', path: '/admin/audit', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  const navItems = {
    EMPLOYEE: employeeNav,
    TECHNICIAN: technicianNav,
    ADMIN: adminNav,
  }[user.role] || [];

  const renderBreadcrumb = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length === 0) return <span>Dashboard</span>;

    const roleName = segments[0] ? segments[0].charAt(0).toUpperCase() + segments[0].slice(1) : 'Portal';
    const subPage = segments[1];
    const ticketId = segments[2];

    const getSubPageLabel = (sub?: string) => {
      switch (sub) {
        case 'incidents':
          return user.role === 'TECHNICIAN'
            ? 'Assigned Incidents'
            : user.role === 'ADMIN'
            ? 'All Incidents'
            : 'My Incidents';
        case 'report':
          return 'Report Incident';
        case 'users':
          return 'Users & Technicians';
        case 'services':
          return 'IT Services & SLA';
        case 'strategy':
          return 'Assignment Strategy';
        case 'audit':
          return 'Audit Trail';
        case 'styleguide':
          return 'Design Style Guide';
        default:
          return sub ? sub.charAt(0).toUpperCase() + sub.slice(1) : 'Overview';
      }
    };

    return (
      <div className="flex items-center gap-1.5 font-medium">
        <span className="text-slate-400">{roleName} Portal</span>
        <span className="text-white/30">/</span>
        <span className={ticketId ? 'text-slate-300' : 'font-semibold text-white'}>
          {getSubPageLabel(subPage)}
        </span>
        {ticketId && (
          <>
            <span className="text-white/30">/</span>
            <span className="font-bold text-brand-pink">
              INC-{ticketId}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen app-royal-bg flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside
        className={`hidden md:flex flex-col justify-between app-royal-bg text-white border-r border-white/10 transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-brand-pink flex items-center justify-center shrink-0 shadow-pink">
                <Shield className="w-4 h-4 text-brand-deep fill-brand-deep" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex items-baseline gap-1.5 truncate">
                  <span className="font-extrabold text-base text-white tracking-tight">Resolvo</span>
                  <span className="text-[10px] uppercase font-bold text-brand-pink bg-brand-pink-soft px-1.5 py-0.2 rounded">
                    {user.role}
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-white p-1 rounded-lg focus:outline-none"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/employee' || item.path === '/technician' || item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-pink text-brand-deep font-bold shadow-pink'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-4 border-t border-white/10">
          <Link
            to="/_styleguide"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-brand-pink hover:bg-white/10 transition-colors"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Design Style Guide</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Offline Network Resilience Banner */}
        {!isOnline && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-amber-400 text-royal-950 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 text-center sticky top-0 z-40 shadow-sm"
          >
            <WifiOff className="w-4 h-4 text-royal-950 shrink-0" />
            <span>
              Network connection offline. Operating in cached mode. Actions will sync upon reconnecting.
            </span>
          </div>
        )}

        {/* Top Header Bar */}
        <header className="h-16 app-royal-bg text-white border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Left: Mobile Toggle & Page Context */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-300 hover:text-white focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-xs text-slate-300 hidden sm:block">
              {renderBreadcrumb()}
            </div>
          </div>

          {/* Right: Actions, Notification Bell & User Menu */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-6 w-px bg-white/15" />
            <UserMenu />
          </div>
        </header>

        {/* Mobile Dropdown Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden app-royal-bg p-4 border-b border-white/10 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                    isActive ? 'bg-brand-pink text-brand-deep font-bold' : 'text-slate-300'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {/* Nested Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
