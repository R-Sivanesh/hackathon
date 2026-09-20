import React from 'react';
import {
  Zap,
  Sun,
  Droplets,
  Users,
  DollarSign,
  Leaf,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Building as BuildingIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CampusOverviewKPIs, Building, AnomalyAlert } from '../types';

interface OverviewTabProps {
  kpis: CampusOverviewKPIs;
  buildings: Building[];
  anomalies: AnomalyAlert[];
  onSelectBuilding: (buildingId: string) => void;
  onMitigateAnomaly: (id: string) => void;
  onNavigateTab: (tabId: string) => void;
  onAutoOptimize: () => void;
  isOptimizing: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  kpis,
  buildings,
  anomalies,
  onSelectBuilding,
  onMitigateAnomaly,
  onNavigateTab,
  onAutoOptimize,
  isOptimizing,
}) => {
  const activeAnomalies = anomalies.filter((a) => a.status === 'active');

  return (
    <div id="overview-tab-content" className="space-y-6">
      {/* Top Urgent Alert Banner if active critical issues */}
      {activeAnomalies.length > 0 && (
        <div
          id="banner-active-alerts"
          className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-xs"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-rose-900">
                    {activeAnomalies.length} Critical Resource Anomalies Detected
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 font-semibold">
                    Requires Attention
                  </span>
                </div>
                <p className="text-xs text-rose-700 mt-0.5">
                  {activeAnomalies[0].title} — {activeAnomalies[0].description} (Estimated waste: {activeAnomalies[0].wasteRatePerHour})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                id={`btn-mitigate-banner-${activeAnomalies[0].id}`}
                onClick={() => onMitigateAnomaly(activeAnomalies[0].id)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Resolve Anomaly Now
              </button>
              <button
                id="btn-view-all-anomalies"
                onClick={() => onNavigateTab('anomalies')}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-300 text-rose-800 hover:bg-rose-100 text-xs font-medium transition-colors cursor-pointer"
              >
                View All Alerts ({activeAnomalies.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main KPI Grid */}
      <div id="kpi-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Real-time Power */}
        <div id="kpi-card-power" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Current Grid Demand</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis.gridDemandKw}</span>
            <span className="text-xs text-slate-500">kW</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Total Load: {kpis.currentPowerDrawKw} kW</span>
            <span className="text-emerald-600 font-medium">-{kpis.renewablePercentage}% solar</span>
          </div>
        </div>

        {/* Solar Generation */}
        <div id="kpi-card-solar" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Rooftop Solar Output</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis.solarGenerationKw}</span>
            <span className="text-xs text-slate-500">kW active</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-700">
            <span>{kpis.renewablePercentage}% of campus load</span>
            <span className="font-semibold">Zero Carbon</span>
          </div>
        </div>

        {/* Water Flow */}
        <div id="kpi-card-water" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Water Consumption</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{kpis.waterFlowTotalLpm}</span>
            <span className="text-xs text-slate-500">L/min</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>Daily: {kpis.waterDailyM3} m³</span>
            <span className="text-sky-600 font-medium">32% recycled</span>
          </div>
        </div>

        {/* Automated Savings */}
        <div id="kpi-card-savings" className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">AI Eco-Savings Today</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Leaf className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">${kpis.automatedSavingsTodayUsd}</span>
            <span className="text-xs text-slate-500">saved</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-emerald-700">
            <span>{kpis.automatedSavingsTodayKwh} kWh saved</span>
            <span className="font-medium">Auto-Eco Active</span>
          </div>
        </div>
      </div>

      {/* Campus Power Distribution & AI Optimization Bar */}
      <div
        id="campus-power-flow"
        className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campus Energy Balance & Real-time Flow</h2>
            <p className="text-xs text-slate-500">
              Aggregated across 5 campus substations, 24 smart submeters, and 1.2 MW rooftop solar array
            </p>
          </div>
          <button
            id="btn-overview-auto-opt"
            onClick={onAutoOptimize}
            disabled={isOptimizing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Campus-wide Auto-Cutoff</span>
          </button>
        </div>

        {/* Visual Progress Flow */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
              <span>Energy Sourcing: Solar ({kpis.solarGenerationKw} kW) vs Municipal Grid ({kpis.gridDemandKw} kW)</span>
              <span>Total: {kpis.currentPowerDrawKw} kW</span>
            </div>
            <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${kpis.renewablePercentage}%` }}
                className="h-full bg-emerald-500 transition-all duration-500"
                title={`Solar: ${kpis.solarGenerationKw} kW (${kpis.renewablePercentage}%)`}
              />
              <div
                style={{ width: `${100 - kpis.renewablePercentage}%` }}
                className="h-full bg-amber-500 transition-all duration-500"
                title={`Grid: ${kpis.gridDemandKw} kW (${100 - kpis.renewablePercentage}%)`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500">Daily Total Energy:</span>
              <p className="font-bold text-slate-800 text-sm">{kpis.dailyTotalKwh.toLocaleString()} kWh</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500">Daily Energy Cost:</span>
              <p className="font-bold text-slate-800 text-sm">${kpis.dailyCostUsd.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500">Daily Carbon Footprint:</span>
              <p className="font-bold text-slate-800 text-sm">{kpis.dailyCarbonKg.toLocaleString()} kg CO₂</p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs text-emerald-900">
              <span className="text-emerald-700 font-medium">Efficiency Index:</span>
              <p className="font-bold text-emerald-800 text-sm">{kpis.systemEfficiencyScore}/100 (Optimal)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buildings Breakdown Grid */}
      <div id="buildings-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Building Facilities Telemetry</h2>
            <p className="text-xs text-slate-500">
              Electricity consumption, solar feed-in, water usage, and real-time room occupancy
            </p>
          </div>
          <button
            id="btn-nav-rooms"
            onClick={() => onNavigateTab('rooms')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Room Actuators & Controls</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div id="building-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map((b) => {
            const occupancyPct = Math.round((b.occupancyCount / b.totalCapacity) * 100);
            const statusBg =
              b.status === 'optimal'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : b.status === 'warning'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={b.id}
                id={`building-card-${b.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => {
                  onSelectBuilding(b.id);
                  onNavigateTab('rooms');
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {b.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{b.name}</h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border font-semibold capitalize ${statusBg}`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-500">Current Power:</span>
                      <p className="text-sm font-bold text-slate-800">{b.currentPowerKw} kW</p>
                      <span className="text-[10px] text-slate-400">Baseline: {b.baselinePowerKw} kW</span>
                    </div>

                    <div>
                      <span className="text-slate-500">Rooftop Solar:</span>
                      <p className="text-sm font-bold text-emerald-700">+{b.solarGenerationKw} kW</p>
                      <span className="text-[10px] text-slate-400">Clean Generation</span>
                    </div>

                    <div className="mt-1">
                      <span className="text-slate-500">Water Flow:</span>
                      <p className="text-sm font-bold text-sky-700">{b.waterFlowLpm} L/min</p>
                      <span className="text-[10px] text-slate-400">Daily: {b.dailyWaterM3} m³</span>
                    </div>

                    <div className="mt-1">
                      <span className="text-slate-500">Occupancy:</span>
                      <p className="text-sm font-bold text-indigo-700">
                        {b.occupancyCount} / {b.totalCapacity}
                      </p>
                      <span className="text-[10px] text-slate-400">{occupancyPct}% utilized</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{b.roomCount} Monitored Zones</span>
                  <span className="text-emerald-700 font-semibold inline-flex items-center gap-0.5">
                    View Controls &rarr;
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
