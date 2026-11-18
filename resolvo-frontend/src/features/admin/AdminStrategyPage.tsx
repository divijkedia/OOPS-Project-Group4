import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import {
  Sliders,
  CheckCircle2,
  Cpu,
  Scale,
  RefreshCw,
  Zap,
  Info,
} from 'lucide-react';

export const AdminStrategyPage: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: strategyConfig,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin-strategy-config'],
    queryFn: () => adminApi.getAssignmentStrategy(),
  });

  const switchMutation = useMutation({
    mutationFn: (strategyName: string) => adminApi.switchAssignmentStrategy(strategyName),
    onSuccess: (_, strategyName) => {
      showToast({
        title: 'Strategy Switched',
        message: `Active incident assignment strategy changed to ${strategyName}.`,
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-strategy-config'] });
    },
    onError: (err: Error) => {
      showToast({
        title: 'Strategy Update Failed',
        message: err.message,
        type: 'error',
      });
    },
  });

  const getStrategyIcon = (name: string) => {
    switch (name) {
      case 'SKILL_BASED':
        return <Cpu className="w-6 h-6 text-pink" />;
      case 'LOAD_BASED':
        return <Scale className="w-6 h-6 text-emerald-400" />;
      case 'ROUND_ROBIN':
        return <RefreshCw className="w-6 h-6 text-sky-400" />;
      default:
        return <Sliders className="w-6 h-6 text-pink" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-pink" />
            Assignment Strategy Engine
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Dynamically adjust the automated routing algorithm used to assign incoming ITIL incidents to technicians.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={() => refetch()}
        >
          Refresh Engine
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Active Banner */}
          <div className="relative overflow-hidden rounded-xl border border-pink/30 bg-gradient-to-r from-royal-800 to-royal-900 p-6 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-pink">
                    Currently Operating Algorithm
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {strategyConfig?.activeStrategy || 'SKILL_BASED'}
                </h2>
                <p className="text-sm text-white/80 max-w-2xl">
                  {strategyConfig?.activeDescription ||
                    'Matches incident category and required competencies with technician specializations.'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-lg border border-white/10">
                <Zap className="w-5 h-5 text-pink" />
                <div className="text-xs">
                  <div className="text-white/60 font-medium">Dispatch Mode</div>
                  <div className="text-white font-semibold">Zero Downtime Hot-Swap</div>
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Selection Cards */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Available Routing Algorithms</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategyConfig?.availableStrategies.map((strat) => {
                const isActive = strat.name === strategyConfig.activeStrategy;
                return (
                  <Card
                    key={strat.name}
                    className={`p-6 flex flex-col justify-between transition-all duration-200 ${
                      isActive ? 'ring-2 ring-pink shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 rounded-xl bg-royal-50 border border-royal-100">
                          {getStrategyIcon(strat.name)}
                        </div>
                        {isActive ? (
                          <Badge variant="success" className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="default">Available</Badge>
                        )}
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-royal-900">{strat.name}</h4>
                        <p className="text-xs text-royal-600 mt-2 leading-relaxed">
                          {strat.description}
                        </p>
                      </div>

                      <div className="border-t border-royal-100 pt-3 text-xs text-royal-500 space-y-1">
                        {strat.name === 'SKILL_BASED' && (
                          <p>Best for: Complex multi-tier outages requiring specialized domain experts.</p>
                        )}
                        {strat.name === 'LOAD_BASED' && (
                          <p>Best for: High-velocity ticket volumes to prevent team burnout and backlog.</p>
                        )}
                        {strat.name === 'ROUND_ROBIN' && (
                          <p>Best for: Fair, cyclic distribution across uniform support teams.</p>
                        )}
                      </div>
                    </div>

                    <div className="pt-6">
                      {isActive ? (
                        <Button variant="secondary" size="sm" className="w-full" disabled>
                          Currently Active
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full"
                          isLoading={switchMutation.isPending && switchMutation.variables === strat.name}
                          onClick={() => switchMutation.mutate(strat.name)}
                        >
                          Switch to {strat.name}
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ITIL Best Practice Info Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-lg bg-royal-100 text-royal-900">
                <Info className="w-5 h-5 text-royal-700" />
              </div>
              <div className="space-y-1.5 text-xs text-royal-700 leading-relaxed">
                <h4 className="text-sm font-bold text-royal-900">
                  Architectural Guide: Strategy Pattern Implementation
                </h4>
                <p>
                  The Resolvo backend employs the <strong>Strategy Pattern</strong> (`AssignmentStrategyManager`)
                  to decouple ticket triage and technician dispatching. When an incident is logged without a
                  manually specified assignee, the active strategy evaluates technician metrics (skills, active workload,
                  on-duty availability) and binds the most optimal engineer immediately.
                </p>
                <p>
                  Switching strategies takes effect instantly for all future ticket dispatches without terminating running
                  investigations.
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
