import React from 'react';
import { Card } from '../ui/Card';
import { BarChart2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BarCategoryItem {
  name: string;
  percentage: number;
  secondaryPercentage?: number;
  color?: string;
}

export interface StackedBarCardProps {
  title?: string;
  items?: BarCategoryItem[];
  className?: string;
}

const DEFAULT_ITEMS: BarCategoryItem[] = [
  { name: 'Database', percentage: 35, secondaryPercentage: 15, color: '#09318D' },
  { name: 'Network', percentage: 27, secondaryPercentage: 12, color: '#FD91CC' },
  { name: 'Authentication', percentage: 19, secondaryPercentage: 8, color: '#4CC9F0' },
  { name: 'Cloud Services', percentage: 16, secondaryPercentage: 6, color: '#1652D9' },
];

export const StackedBarCard: React.FC<StackedBarCardProps> = ({
  title = 'Incidents By Service Type',
  items = DEFAULT_ITEMS,
  className,
}) => {
  return (
    <Card className={cn('p-6 min-h-[300px] flex flex-col justify-between', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-brand-deep/10 text-brand-deep flex items-center justify-center">
          <BarChart2 className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-content-dark">{title}</h4>
      </div>

      {/* Bar rows matching the mockup visual */}
      <div className="space-y-4 my-auto">
        {items.map((item) => (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-content-dark flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color || '#09318D' }}
                />
                {item.name}
              </span>
              <span className="font-bold text-brand-deep">{item.percentage}%</span>
            </div>

            {/* Horizontal dual-tone progress track */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="h-full rounded-l-full transition-all duration-500"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color || '#09318D',
                }}
              />
              {item.secondaryPercentage && (
                <div
                  className="h-full rounded-r-full opacity-60 transition-all duration-500"
                  style={{
                    width: `${item.secondaryPercentage}%`,
                    backgroundColor: '#FD91CC',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom legend note */}
      <div className="pt-3 border-t border-surface-border flex items-center justify-between text-[11px] text-content-muted">
        <span>Active Incidents</span>
        <span className="text-brand-deep font-semibold">Real-time sync</span>
      </div>
    </Card>
  );
};
