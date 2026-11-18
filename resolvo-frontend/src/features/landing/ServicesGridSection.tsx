import React from 'react';
import {
  Cloud,
  Database,
  Network,
  KeyRound,
  Layers,
  HardDrive,
  MessageSquare,
  Globe2,
  CheckCircle2,
} from 'lucide-react';

interface ServiceItem {
  icon: React.ReactNode;
  name: string;
  tagline: string;
  metric: string;
}

export const ServicesGridSection: React.FC = () => {
  const services: ServiceItem[] = [
    {
      icon: <Cloud className="w-6 h-6 text-brand-pink" />,
      name: 'Cloud Infrastructure',
      tagline: 'Multi-region compute nodes, serverless containers, and elastic cluster scaling.',
      metric: '99.99% Uptime',
    },
    {
      icon: <Database className="w-6 h-6 text-brand-cyan" />,
      name: 'Production Databases',
      tagline: 'Primary relational clusters, read replicas, and distributed cache memory stores.',
      metric: '< 4ms Latency',
    },
    {
      icon: <Network className="w-6 h-6 text-emerald-400" />,
      name: 'Enterprise Networks',
      tagline: 'Secure SD-WAN edge nodes, VPN mesh gateways, and low-latency DNS resolution.',
      metric: 'Zero Packet Loss',
    },
    {
      icon: <KeyRound className="w-6 h-6 text-amber-400" />,
      name: 'Authentication & IAM',
      tagline: 'Federated SSO proxies, OAuth2 token providers, and directory policy controls.',
      metric: '100% Verified',
    },
    {
      icon: <Layers className="w-6 h-6 text-brand-pink" />,
      name: 'Enterprise Applications',
      tagline: 'Mission-critical ERP, CRM pipelines, and internal microservice backbones.',
      metric: 'All Nodes Active',
    },
    {
      icon: <HardDrive className="w-6 h-6 text-sky-400" />,
      name: 'Storage & Data Volumes',
      tagline: 'Distributed block volumes, snapshot replications, and disaster recovery stores.',
      metric: 'Encrypted at Rest',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-emerald-400" />,
      name: 'Communication Systems',
      tagline: 'Real-time alert webhooks, VoIP routing channels, and email relay services.',
      metric: '< 200ms Dispatch',
    },
    {
      icon: <Globe2 className="w-6 h-6 text-brand-cyan" />,
      name: 'Digital & Payment APIs',
      tagline: 'High-volume checkout services, public REST APIs, and merchant gateways.',
      metric: 'Active Throughput',
    },
  ];

  return (
    <section id="services" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-xs font-semibold mb-3 text-brand-pink">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Unified IT Catalog Coverage</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          Every Service You Depend On,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-pink to-brand-cyan">
            Proactively Monitored
          </span>
        </h2>
        <p className="mt-3 text-slate-300 text-base sm:text-lg">
          When any core component falters, Resolvo instantly correlates telemetry, flags dependencies, and notifies responsible service engineers.
        </p>
      </div>

      {/* 8-Service Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {services.map((service) => (
          <div
            key={service.name}
            className="glass-card-dark rounded-2xl p-5 border border-white/10 hover:border-brand-pink/40 hover:bg-white/[0.08] transition-all duration-300 group flex flex-col justify-between shadow-float"
          >
            <div>
              {/* Icon Container */}
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>

              {/* Title & Tagline */}
              <h3 className="text-base font-bold text-white tracking-tight group-hover:text-brand-pink transition-colors">
                {service.name}
              </h3>
              <p className="mt-1.5 text-xs text-slate-300 leading-relaxed font-normal">
                {service.tagline}
              </p>
            </div>

            {/* Health Indicator Badge */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Status</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {service.metric}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
