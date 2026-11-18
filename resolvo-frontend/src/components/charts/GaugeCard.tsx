import React from 'react';
import { Card } from '../ui/Card';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface GaugeCardProps {
  title?: string;
  value?: number | string;
  subtitle?: string;
  percentageChange?: string;
  className?: string;
}

export const GaugeCard: React.FC<GaugeCardProps> = ({
  title = 'Incidents Resolved',
  value = 65,
  subtitle = 'Auto-mitigated in last 24h',
  percentageChange = '+12%',
  className,
}) => {
  // SVG circular arc calculations
  const radius = 64;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc display ratio ~ 75% sweep
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength * (1 - 0.82);

  return (
    <Card
      variant="pinkGauge"
      className={cn('relative p-6 flex flex-col justify-between min-h-[300px]', className)}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-white/95">{title}</span>
        </div>
        <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
          <ArrowUpRight className="w-3 h-3" />
          {percentageChange}
        </span>
      </div>

      {/* Center Gauge Arc & Number */}
      <div className="relative flex items-center justify-center my-4">
        {/* Outer subtle glow circle */}
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-135 transition-transform duration-500"
        >
          {/* Background track arc */}
          <circle
            stroke="rgba(255, 255, 255, 0.25)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress active arc */}
          <circle
            stroke="#FFFFFF"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center circular value container */}
        <div className="absolute w-24 h-24 rounded-full bg-white shadow-float flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-brand-deep tracking-tight">{value}</span>
          <span className="text-[10px] uppercase font-bold text-brand-pink-deep tracking-wider">Metrics</span>
        </div>
      </div>

      {/* Bottom Subtitle */}
      <div className="text-center">
        <p className="text-xs font-medium text-white/90">{subtitle}</p>
      </div>
    </Card>
  );
};
