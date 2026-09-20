import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Cpu,
  TrendingUp,
  Layers,
  Droplets,
  AlertTriangle,
  Sparkles,
  FileText,
  Sliders,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  CampusOverviewKPIs,
  Building,
  RoomSensorData,
  WaterZoneData,
  AnomalyAlert,
  ResourceAllocationItem,
  PredictionSummary,
  CampusReport,
  AIAuditResponse,
} from './types';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { RoomsControlTab } from './components/RoomsControlTab';
import { PredictionTab } from './components/PredictionTab';
import { ResourceAllocationTab } from './components/ResourceAllocationTab';
import { WaterManagementTab } from './components/WaterManagementTab';
import { AnomalyDetectionTab } from './components/AnomalyDetectionTab';
import { AiAdvisorTab } from './components/AiAdvisorTab';
import { ReportsTab } from './components/ReportsTab';
import { SimulateEventModal } from './components/SimulateEventModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState<boolean>(false);
  const [optimizationNotification, setOptimizationNotification] = useState<string | null>(null);

  // Core Data States
  const [kpis, setKpis] = useState<CampusOverviewKPIs | null>(null);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [rooms, setRooms] = useState<RoomSensorData[]>([]);
  const [waterZones, setWaterZones] = useState<WaterZoneData[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocationItem[]>([]);
  const [prediction, setPrediction] = useState<PredictionSummary | null>(null);
  const [report, setReport] = useState<CampusReport | null>(null);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [auditData, setAuditData] = useState<AIAuditResponse | null>(null);
  const [loadingAudit, setLoadingAudit] = useState<boolean>(false);

  // Selected filter state for rooms
  const [selectedBuildingFilter, setSelectedBuildingFilter] = useState<string>('all');

  // Fetch all initial telemetry
  const fetchTelemetry = useCallback(async () => {
    try {
      setLoading(true);
      const [kpiRes, bldRes, roomRes, waterRes, anomRes, allocRes, predRes] =
        await Promise.all([
          fetch('/api/campus/overview'),
          fetch('/api/campus/buildings'),
          fetch('/api/campus/rooms'),
          fetch('/api/campus/water'),
          fetch('/api/campus/anomalies'),
          fetch('/api/campus/allocations'),
          fetch('/api/campus/prediction'),
        ]);

      if (kpiRes.ok) setKpis(await kpiRes.json());
      if (bldRes.ok) setBuildings(await bldRes.json());
      if (roomRes.ok) setRooms(await roomRes.json());
      if (waterRes.ok) setWaterZones(await waterRes.json());
      if (anomRes.ok) setAnomalies(await anomRes.json());
      if (allocRes.ok) setAllocations(await allocRes.json());
      if (predRes.ok) setPrediction(await predRes.json());
    } catch (err) {
      console.error('Failed to fetch campus telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reports when tab or period changes
  const fetchReport = useCallback(async (period: 'daily' | 'weekly' | 'monthly') => {
    try {
      const res = await fetch(`/api/campus/reports?period=${period}`);
      if (res.ok) {
        setReport(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch report:', err);
    }
  }, []);

  // Fetch AI audit data
  const fetchAudit = useCallback(async () => {
    try {
      setLoadingAudit(true);
      const res = await fetch('/api/ai/audit', { method: 'POST' });
      if (res.ok) {
        setAuditData(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch AI audit:', err);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTelemetry();
    fetchReport('daily');
    fetchAudit();

    // Auto-refresh telemetry every 15 seconds to simulate continuous MQTT broker updates
    const interval = setInterval(() => {
      fetch('/api/campus/overview')
        .then((res) => res.json())
        .then((data) => setKpis(data))
        .catch(() => {});
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchTelemetry, fetchReport, fetchAudit]);

  // Handle Room Appliance Update
  const handleUpdateRoomControl = async (roomId: string, updates: Partial<RoomSensorData>) => {
    // Optimistic UI update
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, ...updates } : r))
    );

    try {
      const res = await fetch(`/api/campus/rooms/${roomId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? data.room : r))
        );
        // Refresh overview KPIs
        const kpiRes = await fetch('/api/campus/overview');
        if (kpiRes.ok) setKpis(await kpiRes.json());
      }
    } catch (err) {
      console.error('Failed to update room control:', err);
    }
  };

  // Handle Automated Campus-Wide Optimization
  const handleAutoOptimize = async () => {
    try {
      setIsOptimizing(true);
      const res = await fetch('/api/campus/auto-optimize', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOptimizationNotification(data.message);
        setTimeout(() => setOptimizationNotification(null), 5000);
        await fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to run campus auto optimization:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Handle Water Valve Control
  const handleToggleValve = async (zoneId: string, currentOpen: boolean) => {
    const newOpen = !currentOpen;
    setWaterZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, valveOpen: newOpen } : z))
    );

    try {
      const res = await fetch('/api/campus/water/valve-control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId, valveOpen: newOpen }),
      });
      if (res.ok) {
        const data = await res.json();
        setWaterZones((prev) =>
          prev.map((z) => (z.id === zoneId ? data.zone : z))
        );
        await fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to toggle valve:', err);
    }
  };

  // Handle Anomaly Mitigation
  const handleMitigateAnomaly = async (id: string) => {
    try {
      const res = await fetch(`/api/campus/anomalies/${id}/mitigate`, { method: 'POST' });
      if (res.ok) {
        setAnomalies((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'mitigated' } : a))
        );
        await fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to mitigate anomaly:', err);
    }
  };

  // Handle Anomaly Diagnostic with Gemini
  const handleRunAiDiagnostic = async (anomalyId: string) => {
    const res = await fetch('/api/ai/explain-anomaly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomalyId }),
    });
    if (!res.ok) throw new Error('Diagnostic failed');
    return await res.json();
  };

  // Handle Copilot Message
  const handleSendCopilotMessage = async (question: string) => {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('Copilot query failed');
    const data = await res.json();
    return data.reply;
  };

  // Handle IoT Simulation Trigger
  const handleTriggerSimulation = async (type: 'water_pipe_leak' | 'hvac_overrun' | 'reset_all') => {
    try {
      const res = await fetch('/api/iot/simulate-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        await fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to trigger simulation event:', err);
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'rooms', label: 'Rooms & Occupancy', icon: Sliders },
    { id: 'prediction', label: 'ML Energy Forecast', icon: TrendingUp },
    { id: 'allocation', label: 'Resource Allocation', icon: Layers },
    { id: 'water', label: 'Water Management', icon: Droplets },
    { id: 'anomalies', label: 'AI Anomaly Detection', icon: AlertTriangle, badge: kpis?.activeAnomaliesCount },
    { id: 'advisor', label: 'AI Sustainability Advisor', icon: Sparkles },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
  ];

  return (
    <div id="smart-campus-app" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        kpis={kpis}
        loading={loading}
        onRefresh={fetchTelemetry}
        onAutoOptimize={handleAutoOptimize}
        onOpenSimulator={() => setIsSimModalOpen(true)}
        isOptimizing={isOptimizing}
      />

      {/* Auto Optimization Floating Toast */}
      {optimizationNotification && (
        <div
          id="toast-optimization"
          className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-xs flex items-center gap-3 animate-fade-in"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold block">Autonomous BMS Action Executed</span>
            <span className="text-slate-300">{optimizationNotification}</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-header (Tabs) */}
      <nav id="campus-nav-tabs" className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {activeTab === 'overview' && kpis && (
          <OverviewTab
            kpis={kpis}
            buildings={buildings}
            anomalies={anomalies}
            onSelectBuilding={(bId) => {
              setSelectedBuildingFilter(bId);
              setActiveTab('rooms');
            }}
            onMitigateAnomaly={handleMitigateAnomaly}
            onNavigateTab={(tId) => setActiveTab(tId)}
            onAutoOptimize={handleAutoOptimize}
            isOptimizing={isOptimizing}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomsControlTab
            rooms={rooms}
            selectedBuildingFilter={selectedBuildingFilter}
            onSelectBuildingFilter={setSelectedBuildingFilter}
            onUpdateRoomControl={handleUpdateRoomControl}
            onAutoOptimize={handleAutoOptimize}
            isOptimizing={isOptimizing}
          />
        )}

        {activeTab === 'prediction' && (
          <PredictionTab prediction={prediction} loading={loading} />
        )}

        {activeTab === 'allocation' && (
          <ResourceAllocationTab
            allocations={allocations}
            onApplyMerge={(allocId) => {
              handleAutoOptimize();
            }}
          />
        )}

        {activeTab === 'water' && (
          <WaterManagementTab zones={waterZones} onToggleValve={handleToggleValve} />
        )}

        {activeTab === 'anomalies' && (
          <AnomalyDetectionTab
            anomalies={anomalies}
            onMitigateAnomaly={handleMitigateAnomaly}
            onRunAiDiagnostic={handleRunAiDiagnostic}
          />
        )}

        {activeTab === 'advisor' && (
          <AiAdvisorTab
            auditData={auditData}
            loadingAudit={loadingAudit}
            onRefreshAudit={fetchAudit}
            onSendMessage={handleSendCopilotMessage}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            report={report}
            loading={loading}
            selectedPeriod={reportPeriod}
            onChangePeriod={(p) => {
              setReportPeriod(p);
              fetchReport(p);
            }}
          />
        )}
      </main>

      {/* Simulation Modal */}
      <SimulateEventModal
        isOpen={isSimModalOpen}
        onClose={() => setIsSimModalOpen(false)}
        onTriggerSimulation={handleTriggerSimulation}
      />
    </div>
  );
}
