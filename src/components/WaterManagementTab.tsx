import React from 'react';
import {
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Power,
  RotateCw,
  TrendingDown,
  Gauge,
  Percent,
} from 'lucide-react';
import { WaterZoneData } from '../types';

interface WaterManagementTabProps {
  zones: WaterZoneData[];
  onToggleValve: (zoneId: string, currentOpen: boolean) => void;
}

export const WaterManagementTab: React.FC<WaterManagementTabProps> = ({
  zones,
  onToggleValve,
}) => {
  const totalFlowLpm = zones.reduce((acc, z) => acc + z.currentFlowLpm, 0);
  const leakZones = zones.filter((z) => z.leakRisk === 'critical_leak');
  const avgRecycled = Math.round(
    zones.reduce((acc, z) => acc + z.recycledGreywaterPercent, 0) / zones.length
  );

  return (
    <div id="water-tab-content" className="space-y-6">
      {/* Top Banner with Alert if any leak detected */}
      {leakZones.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900">
                  Critical Water Leakage / Rupture Detected in {leakZones[0].zoneName}
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Flow rate at {leakZones[0].currentFlowLpm} L/min (3.1x baseline) with an accompanied pressure drop to {leakZones[0].pressureBar} bar. Immediate valve shutoff recommended.
                </p>
              </div>
            </div>

            <button
              id="btn-isolate-leak-valve"
              onClick={() => onToggleValve(leakZones[0].id, leakZones[0].valveOpen)}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              Isolate Sector Valve Now
            </button>
          </div>
        </div>
      )}

      {/* Water KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Instantaneous Flow</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{Math.round(totalFlowLpm * 10) / 10}</span>
            <span className="text-xs text-slate-500">L/min</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">6 Monitored Sub-meters</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Greywater Recycled</span>
            <RotateCw className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700">{avgRecycled}%</span>
            <span className="text-xs text-slate-500">recovery</span>
          </div>
          <p className="mt-1 text-xs text-emerald-700">Treated for flushes & lawns</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Average Line Pressure</span>
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">3.8</span>
            <span className="text-xs text-slate-500">bar</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Nominal 3.5 - 4.5 bar</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Storage Tank Reserves</span>
            <Percent className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-sky-700">82%</span>
            <span className="text-xs text-slate-500">full</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Campus Cistern (500,000 L)</p>
        </div>
      </div>

      {/* Water Zones Distribution List */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Campus Sub-Metering Zones & Motorized Solenoid Valves
          </h2>
          <p className="text-xs text-slate-500">
            Real-time acoustic leak detection, pressure drop correlation, and remote isolation actuators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((zone) => {
            const isLeak = zone.leakRisk === 'critical_leak';
            const flowDelta = zone.currentFlowLpm - zone.normalFlowLpm;

            return (
              <div
                key={zone.id}
                id={`water-card-${zone.id}`}
                className={`rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                  isLeak
                    ? 'border-rose-300 bg-rose-50/30 ring-2 ring-rose-100'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {zone.buildingId}
                        </span>
                        {isLeak && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold border border-rose-300">
                            LEAK DETECTED
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{zone.zoneName}</h3>
                    </div>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        zone.valveOpen
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      Valve {zone.valveOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </div>

                  {/* Flow and Pressure Gauges */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Flow Rate</span>
                      <span
                        className={`font-bold text-sm ${
                          isLeak ? 'text-rose-700 animate-pulse' : 'text-slate-800'
                        }`}
                      >
                        {zone.currentFlowLpm} L/min
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Base: {zone.normalFlowLpm} L/min
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Pressure</span>
                      <span
                        className={`font-bold text-sm ${
                          zone.pressureBar < 3.0 ? 'text-amber-700' : 'text-slate-800'
                        }`}
                      >
                        {zone.pressureBar} bar
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Nom: {zone.nominalPressureBar} bar
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Tank Level</span>
                      <span className="font-bold text-sm text-sky-700">
                        {zone.tankLevelPercent}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Reserves</span>
                    </div>
                  </div>

                  {/* Recycled greywater badge */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span>Recycled Greywater Usage:</span>
                    <span className="font-semibold text-emerald-700">{zone.recycledGreywaterPercent}%</span>
                  </div>
                </div>

                {/* Valve Remote Control Switch */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Daily Volume: </span>
                    <span className="font-semibold text-slate-800">
                      {zone.dailyConsumptionLiters.toLocaleString()} L
                    </span>
                  </div>

                  <button
                    id={`btn-toggle-valve-${zone.id}`}
                    onClick={() => onToggleValve(zone.id, zone.valveOpen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      zone.valveOpen
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {zone.valveOpen ? 'Close Valve (Isolate)' : 'Re-open Valve'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
