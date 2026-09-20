import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Droplets,
  Thermometer,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  DollarSign,
  Cpu,
} from 'lucide-react';
import { AnomalyAlert } from '../types';

interface AnomalyDetectionTabProps {
  anomalies: AnomalyAlert[];
  onMitigateAnomaly: (id: string) => void;
  onRunAiDiagnostic: (anomalyId: string) => Promise<any>;
}

export const AnomalyDetectionTab: React.FC<AnomalyDetectionTabProps> = ({
  anomalies,
  onMitigateAnomaly,
  onRunAiDiagnostic,
}) => {
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<{
    alertId: string;
    loading: boolean;
    data: any | null;
  } | null>(null);

  const filtered = anomalies.filter((a) => {
    if (resourceFilter !== 'all' && a.resourceType !== resourceFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  });

  const activeCount = anomalies.filter((a) => a.status === 'active').length;

  const handleDiagnosticClick = async (alert: AnomalyAlert) => {
    setSelectedDiagnostic({ alertId: alert.id, loading: true, data: null });
    try {
      const result = await onRunAiDiagnostic(alert.id);
      setSelectedDiagnostic({ alertId: alert.id, loading: false, data: result });
    } catch (e) {
      setSelectedDiagnostic({ alertId: alert.id, loading: false, data: null });
    }
  };

  return (
    <div id="anomaly-tab-content" className="space-y-6">
      {/* Header & Status Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                AI Automated Fault Detection & Anomaly Diagnostics
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                Statistical Z-Score + Isolation Forest
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Continuously monitors submeter readings against multivariate predictive baselines to detect leakages, equipment faults, and human over-rides
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Active Anomalies:</span>
            <span
              className={`text-sm px-2.5 py-1 rounded-lg font-bold ${
                activeCount > 0
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeCount} Active Issues
            </span>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Resource:
          </span>
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'electricity', label: 'Electricity' },
            { id: 'water', label: 'Water' },
            { id: 'hvac', label: 'HVAC / Cooling' },
          ].map((f) => (
            <button
              key={f.id}
              id={`filter-res-${f.id}`}
              onClick={() => setResourceFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                resourceFilter === f.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          <span className="text-slate-500 font-medium">Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active Only' },
            { id: 'mitigated', label: 'Resolved / Mitigated' },
          ].map((s) => (
            <button
              key={s.id}
              id={`filter-stat-${s.id}`}
              onClick={() => setStatusFilter(s.id)}
              className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer transition-colors ${
                statusFilter === s.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filtered.map((alert) => {
          const isCritical = alert.severity === 'critical';
          const isMitigated = alert.status === 'mitigated';

          const resourceIcon =
            alert.resourceType === 'electricity' ? (
              <Zap className="w-4 h-4 text-amber-600" />
            ) : alert.resourceType === 'water' ? (
              <Droplets className="w-4 h-4 text-sky-600" />
            ) : (
              <Thermometer className="w-4 h-4 text-indigo-600" />
            );

          const severityBadge =
            alert.severity === 'critical'
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : alert.severity === 'high'
              ? 'bg-amber-100 text-amber-800 border-amber-200'
              : 'bg-slate-100 text-slate-700 border-slate-200';

          const diagnosticOpen = selectedDiagnostic?.alertId === alert.id;

          return (
            <div
              key={alert.id}
              id={`anomaly-card-${alert.id}`}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                isMitigated
                  ? 'border-slate-200 opacity-75'
                  : isCritical
                  ? 'border-rose-300 ring-2 ring-rose-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border uppercase ${severityBadge}`}
                    >
                      {alert.severity}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      {resourceIcon}
                      <span className="capitalize">{alert.resourceType}</span>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-700">{alert.zoneName}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{alert.title}</h3>
                  <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">{alert.description}</p>

                  {/* Measured vs Expected */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Measured Metric</span>
                      <span className="font-bold text-slate-900 text-xs">{alert.measuredValue}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Expected Baseline</span>
                      <span className="font-semibold text-emerald-700 text-xs">{alert.expectedValue}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                      <span className="text-[10px] text-rose-500 block">Waste / Run-rate</span>
                      <span className="font-bold text-rose-800 text-xs">{alert.wasteRatePerHour}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-start md:self-auto">
                  <span
                    className={`text-center text-xs px-3 py-1 rounded-full font-semibold border ${
                      isMitigated
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {isMitigated ? 'RESOLVED' : 'ACTIVE ALERT'}
                  </span>

                  {!isMitigated && (
                    <button
                      id={`btn-mitigate-${alert.id}`}
                      onClick={() => onMitigateAnomaly(alert.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Mitigate Now
                    </button>
                  )}

                  <button
                    id={`btn-ai-diagnose-${alert.id}`}
                    onClick={() => handleDiagnosticClick(alert)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span>AI Root-Cause</span>
                  </button>
                </div>
              </div>

                {/* AI Diagnostic Panel Expandable */}
                {diagnosticOpen && (
                  <div
                    id={`diagnostic-box-${alert.id}`}
                    className="mt-4 p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-900 flex items-center gap-1.5 text-sm">
                        <Cpu className="w-4 h-4 text-indigo-600" />
                        Gemini AI Technical Fault Diagnosis
                      </span>
                      {selectedDiagnostic?.data && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900 font-semibold">
                          Confidence: {selectedDiagnostic.data.confidenceScore || 94}%
                        </span>
                      )}
                    </div>

                    {selectedDiagnostic?.loading ? (
                      <div className="py-4 text-center text-indigo-600 font-medium">
                        Running deep thermodynamic & IoT telemetry model analysis...
                      </div>
                    ) : selectedDiagnostic?.data ? (
                      <div className="space-y-2 text-indigo-950">
                        <div>
                          <span className="font-bold block mb-0.5">Root Cause Attribution:</span>
                          <p className="text-indigo-900 leading-relaxed">
                            {selectedDiagnostic.data.rootCause}
                          </p>
                        </div>

                        <div>
                          <span className="font-bold block mb-0.5">Automated BMS Remediation Steps:</span>
                          <ul className="list-disc list-inside space-y-1 text-indigo-900">
                            {selectedDiagnostic.data.mitigationSteps?.map((step: string, i: number) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-indigo-200/60 text-[11px] text-indigo-800">
                          <span>
                            Recommended BMS action: {alert.recommendedAction}
                          </span>
                          {!isMitigated && (
                            <button
                              id={`btn-diag-mitigate-${alert.id}`}
                              onClick={() => onMitigateAnomaly(alert.id)}
                              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                            >
                              Execute Recommended Fix
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-indigo-800">No diagnostic data returned.</p>
                    )}
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
