import React, { useState } from 'react';
import {
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Zap,
  TrendingDown,
  Building,
} from 'lucide-react';
import { ResourceAllocationItem } from '../types';

interface ResourceAllocationTabProps {
  allocations: ResourceAllocationItem[];
  onApplyMerge: (allocationId: string) => void;
}

export const ResourceAllocationTab: React.FC<ResourceAllocationTabProps> = ({
  allocations,
  onApplyMerge,
}) => {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const handleApply = (id: string) => {
    setAppliedIds((prev) => [...prev, id]);
    onApplyMerge(id);
  };

  const totalKwPotential = allocations.reduce((acc, a) => acc + a.estimatedPowerSavedKw, 0);

  return (
    <div id="allocation-tab-content" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Classroom, Laboratory & Facility Resource Allocation Optimizer
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                Attendance-Aware
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cross-references campus SIS course enrollment, live optical people-counters, and HVAC zones to eliminate half-empty room cooling
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Identified Chiller Savings</span>
              <span className="text-lg font-bold text-emerald-700">{totalKwPotential} kW load</span>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allocations.map((item) => {
          const isApplied = appliedIds.includes(item.id);
          const typeBadge =
            item.recommendationType === 'merge'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : item.recommendationType === 'power_down'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : item.recommendationType === 'relocate'
              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200';

          return (
            <div
              key={item.id}
              id={`alloc-card-${item.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${typeBadge}`}
                    >
                      {item.recommendationType.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-2">{item.roomName}</h3>
                    <p className="text-xs text-slate-500">{item.currentActivity}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">
                      {item.actualAttendance} / {item.scheduledCapacity}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {item.utilizationRate}% utilization
                    </span>
                  </div>
                </div>

                {/* Utilization Progress bar */}
                <div className="mt-3">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, item.utilizationRate)}%` }}
                      className={`h-full ${
                        item.utilizationRate < 30
                          ? 'bg-amber-500'
                          : item.utilizationRate > 80
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Recommendation Description */}
                <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-1">AI Recommendation:</span>
                  <p>{item.suggestedAction}</p>

                  {item.suggestedTargetRoom && (
                    <div className="mt-2 flex items-center gap-1.5 text-indigo-700 font-semibold">
                      <span>Target Venue:</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>{item.suggestedTargetRoom}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  {item.estimatedPowerSavedKw > 0 ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      Save {item.estimatedPowerSavedKw} kW
                    </span>
                  ) : (
                    <span className="text-slate-400">Optimal Operation</span>
                  )}
                </div>

                {item.recommendationType !== 'optimal' && (
                  <button
                    id={`btn-apply-alloc-${item.id}`}
                    onClick={() => handleApply(item.id)}
                    disabled={isApplied}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      isApplied
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isApplied ? 'Consolidation Applied' : 'Execute Schedule Change'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Equipment Schedule Matrix (Lab & Research Resource Balancing) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Campus Research Equipment Scheduling & Solar Load-Matching
            </h3>
            <p className="text-xs text-slate-500">
              High-power laboratory machinery scheduled during peak rooftop solar generation (11:00 - 14:00)
            </p>
          </div>
          <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            100% Clean Solar Power Match
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-2.5 pr-4">Equipment / Apparatus</th>
                <th className="py-2.5 pr-4">Facility / Lab</th>
                <th className="py-2.5 pr-4">Power Rating</th>
                <th className="py-2.5 pr-4">Scheduled Window</th>
                <th className="py-2.5 pr-4">Solar Alignment</th>
                <th className="py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  name: 'Subsonic Aerodynamics Wind Tunnel',
                  lab: 'Engineering Aero Lab 102',
                  power: '45.0 kW',
                  window: '11:30 - 13:30',
                  match: '100% Solar Peak',
                  status: 'Active Running',
                },
                {
                  name: 'High-Field 600 MHz NMR Spectrometer Cryo-Chiller',
                  lab: 'Science Center Chem Block',
                  power: '18.5 kW',
                  window: 'Continuous 24/7',
                  match: 'Grid + Solar Hybrid',
                  status: 'Nominal Staged',
                },
                {
                  name: 'Industrial Metal SLM 3D Additive Printer',
                  lab: 'Robotics & Prototyping',
                  power: '12.0 kW',
                  window: '12:00 - 16:00',
                  match: '85% Solar Matched',
                  status: 'Scheduled',
                },
                {
                  name: 'Autoclave Sterilization Suite #3',
                  lab: 'Biology & Medical Labs',
                  power: '22.0 kW',
                  window: '13:00 - 14:30',
                  match: '100% Solar Peak',
                  status: 'Pre-heating',
                },
              ].map((eq, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 pr-4 font-bold text-slate-800">{eq.name}</td>
                  <td className="py-3 pr-4 text-slate-600">{eq.lab}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-900">{eq.power}</td>
                  <td className="py-3 pr-4 text-slate-600">{eq.window}</td>
                  <td className="py-3 pr-4 text-emerald-700 font-semibold">{eq.match}</td>
                  <td className="py-3 text-right font-medium text-indigo-700">{eq.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
