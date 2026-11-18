import React from 'react';
import { Shield, ExternalLink, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 pt-14 pb-10 px-4 sm:px-6 max-w-6xl mx-auto text-xs text-slate-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand Column */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-brand-pink flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-brand-deep fill-brand-deep" />
            </div>
            <span className="font-extrabold text-base text-white tracking-tight">Resolvo</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            Intelligent IT Service Management & Incident Resolution System. Engineered for enterprise resilience.
          </p>
          <div className="mt-3 text-[11px] text-brand-pink font-semibold">
            CS F213 / MAC F212 OOP Project
          </div>
        </div>

        {/* Product Capabilities */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Platform</h4>
          <ul className="space-y-2 text-slate-400">
            <li><a href="#services" className="hover:text-white transition-colors">Catalog Services</a></li>
            <li><a href="#lifecycle" className="hover:text-white transition-colors">8-Step Lifecycle</a></li>
            <li><a href="#features" className="hover:text-white transition-colors">Smart Heuristics</a></li>
            <li><a href="#roles" className="hover:text-white transition-colors">Role Management</a></li>
          </ul>
        </div>

        {/* Roles & Portals */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Roles</h4>
          <ul className="space-y-2 text-slate-400">
            <li><Link to="/login?user=emp_john" className="hover:text-white transition-colors">Employee Self-Service</Link></li>
            <li><Link to="/login?user=tech_alice" className="hover:text-white transition-colors">Technician Console</Link></li>
            <li><Link to="/login?user=admin" className="hover:text-white transition-colors">Administrator Control</Link></li>
            <li><Link to="/_styleguide" className="hover:text-white text-brand-pink transition-colors">UI Design System</Link></li>
          </ul>
        </div>

        {/* Architecture & Engineering */}
        <div>
          <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Architecture</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-1.5">
              <span>Java 21 Spring Boot</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/20">Backend</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>React 18 + Vite + TS</span>
              <span className="text-[10px] text-sky-400 font-bold bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-500/20">Frontend</span>
            </li>
            <li className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <a href="http://localhost:8080/swagger-ui.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Swagger UI: <code>:8080</code>
              </a>
            </li>
            <li className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <a href="http://localhost:8080/h2-console" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                H2 Web Console
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
        <div>
          (c) {new Date().getFullYear()} Resolvo Project. Designed with strict OOP Principles & Design Patterns.
        </div>
        <div className="flex items-center gap-4">
          <Link to="/_styleguide" className="text-brand-pink hover:underline">
            Component Showcase
          </Link>
          <span className="text-white/20">|</span>
          <span className="text-slate-400">WCAG AA Compliant</span>
        </div>
      </div>
    </footer>
  );
};
