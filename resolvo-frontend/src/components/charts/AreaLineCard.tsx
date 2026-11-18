import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { cn } from '../../lib/utils';

export interface DataPoint {
  day: string;
  value: number;
}

export interface AreaLineCardProps {
  title?: string;
  className?: string;
}

const SAMPLE_7D: DataPoint[] = [
  { day: 'Mon', value: 88 },
  { day: 'Tue', value: 92 },
  { day: 'Wed', value: 91 },
  { day: 'Thu', value: 96 },
  { day: 'Fri', value: 94 },
  { day: 'Sat', value: 98 },
  { day: 'Sun', value: 99.4 },
];

const SAMPLE_14D: DataPoint[] = [
  { day: 'W1 D1', value: 85 },
  { day: 'W1 D4', value: 89 },
  { day: 'W1 D7', value: 93 },
  { day: 'W2 D3', value: 96 },
  { day: 'W2 D7', value: 99.4 },
];

const SAMPLE_30D: DataPoint[] = [
  { day: 'Week 1', value: 82 },
  { day: 'Week 2', value: 89 },
  { day: 'Week 3', value: 94 },
  { day: 'Week 4', value: 99.4 },
];

export const AreaLineCard: React.FC<AreaLineCardProps> = ({
  title = 'System Health',
  className,
}) => {
  const [range, setRange] = useState<'7d' | '14d' | '30d'>('7d');

  const chartData = range === '7d' ? SAMPLE_7D : range === '14d' ? SAMPLE_14D : SAMPLE_30D;

  return (
    <Card className={cn('p-6 min-h-[300px] flex flex-col justify-between', className)}>
      {/* Header with status dot and tabs */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-sm font-bold text-content-dark">{title}</h4>
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
          {(['7d', '14d', '30d'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setRange(tab)}
              className={cn(
                'px-2 py-0.5 rounded-md transition-all',
                range === tab ? 'bg-white text-brand-deep shadow-xs' : 'text-content-muted hover:text-content-dark'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="text-xs text-content-muted mb-2">
        SLA Uptime index at <span className="font-bold text-brand-deep">99.4%</span>
      </div>

      {/* Chart */}
      <div className="h-36 w-full -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1652D9" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#FD91CC" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              stroke="#94A3B8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-brand-deep text-white px-2.5 py-1 rounded-lg text-xs shadow-float font-medium">
                      {payload[0].value}% Health
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#09318D"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorHealth)"
              dot={{ stroke: '#09318D', strokeWidth: 2, r: 3, fill: '#FFFFFF' }}
              activeDot={{ stroke: '#FD91CC', strokeWidth: 3, r: 5, fill: '#09318D' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-surface-border flex items-center justify-between text-[11px] text-content-muted">
        <span>Zero Critical Outages</span>
        <span className="text-emerald-700 font-semibold">100% Operational</span>
      </div>
    </Card>
  );
};
