import React from 'react';
import {
  Zap,
  Droplets,
  Users,
  AlertTriangle,
  Sun,
  Activity,
  Sliders,
  Sparkles,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { CampusOverviewKPIs } from '../types';

interface HeaderProps {
  kpis: CampusOverviewKPIs | null;
  loading: boolean;
  onRefresh: () => void;
  onAutoOptimize: () => void;
  onOpenSimulator: () => void;
  isOptimizing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  kpis,
  loading,
  onRefresh,
  onAutoOptimize,
  onOpenSimulator,
  isOptimizing,
}) => {
  return (
    <header
      id="campus-header"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Smart Campus Resource & Energy System
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  IoT Live (MQTT)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Real-time multi-building IoT metering, ML demand forecasting & automated control
              </p>
            </div>
          </div>

          {/* Real-time Ticker Metrics */}
          {kpis && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
              {/* Power */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-slate-500">Grid:</span>
                <span className="font-semibold text-slate-800">{kpis.gridDemandKw} kW</span>
              </div>

              {/* Solar */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-900">
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-700">Solar:</span>
                <span className="font-semibold">{kpis.solarGenerationKw} kW</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-amber-200/60 font-medium">
                  {kpis.renewablePercentage}%
                </span>
              </div>

              {/* Water */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-900">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-sky-700">Water:</span>
                <span className="font-semibold">{kpis.waterFlowTotalLpm} L/min</span>
              </div>

              {/* Occupancy */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">{kpis.totalOccupancy}</span>
                <span className="text-slate-500">/ {kpis.campusCapacity}</span>
              </div>

              {/* Alerts */}
              {kpis.activeAnomaliesCount > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
                  <span>{kpis.activeAnomaliesCount} Anomalies</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              id="btn-auto-optimize"
              onClick={onAutoOptimize}
              disabled={isOptimizing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              title="Automate shutdown of idle rooms and set energy-saving setpoints campus-wide"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Optimizing...' : 'Campus Auto-Eco'}</span>
            </button>

            <button
              id="btn-simulate-event"
              onClick={onOpenSimulator}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Inject stress-test IoT events (water leaks, chiller overload)"
            >
              <Cpu className="w-3.5 h-3.5 text-slate-500" />
              <span>IoT Testing</span>
            </button>

            <button
              id="btn-refresh-telemetry"
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh IoT Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
