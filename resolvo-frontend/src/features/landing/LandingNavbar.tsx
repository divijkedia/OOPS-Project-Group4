import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Shield, Sparkles, Menu, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LandingNavbarProps {
  onSignInClick?: () => void;
  onReportClick?: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  onSignInClick,
  onReportClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'hero', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'lifecycle', label: 'Lifecycle' },
    { id: 'features', label: 'Features' },
    { id: 'roles', label: 'Roles' },
  ];

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 max-w-7xl mx-auto">
      <nav className="glass-pill rounded-full px-5 py-2.5 sm:px-7 sm:py-3 flex items-center justify-between shadow-float transition-all">
        {/* Brand Logo & Mark */}
        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer focus:outline-none">
          <div className="w-8 h-8 rounded-xl bg-brand-pink flex items-center justify-center shadow-pink group-hover:scale-105 transition-transform">
            <Shield className="w-4 h-4 text-brand-deep fill-brand-deep" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
              Resolvo
            </span>
            <span className="hidden lg:inline-block text-[10px] font-bold uppercase tracking-wider text-brand-pink bg-brand-pink-soft px-2 py-0.5 rounded-full border border-brand-pink/30">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Center Pill Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-white/10 p-1 rounded-full border border-white/10">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/25 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Right Action CTAs */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Link
            to="/_styleguide"
            className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            UI Kit
          </Link>
          <Button
            variant="primary"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onSignInClick || onReportClick}
          >
            Sign In
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="text-xs px-3 py-1"
            onClick={onSignInClick}
          >
            Sign In
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-white/90 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-2xl glass-card-dark border border-white/15 shadow-float animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-left px-3 py-2 rounded-xl text-sm font-semibold text-white/90 hover:bg-white/15 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <Link
                to="/_styleguide"
                className="text-xs font-medium text-brand-pink flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                View UI Style Guide
              </Link>
              <Button variant="primary" size="sm" onClick={onReportClick}>
                Report Incident
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
