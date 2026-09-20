import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Leaf,
  Droplets,
  Zap,
  TrendingDown,
  Building,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { CampusReport } from '../types';

interface ReportsTabProps {
  report: CampusReport | null;
  loading: boolean;
  selectedPeriod: 'daily' | 'weekly' | 'monthly';
  onChangePeriod: (period: 'daily' | 'weekly' | 'monthly') => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  report,
  loading,
  selectedPeriod,
  onChangePeriod,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExport = () => {
    if (!report) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `Metric,Value\n` +
      `Report Period,${report.period}\n` +
      `Generated At,${report.generatedAt}\n` +
      `Total Energy (kWh),${report.totalEnergyKwh}\n` +
      `Total Cost ($),${report.totalEnergyCostUsd}\n` +
      `Solar Generated (kWh),${report.solarGeneratedKwh}\n` +
      `Carbon Offset (kg CO2),${report.carbonOffsetKg}\n` +
      `Water Consumed (m3),${report.waterConsumedM3}\n` +
      `Water Saved (m3),${report.waterSavedM3}\n` +
      `Average Room Utilization (%),${report.averageRoomUtilization}\n` +
      `Sustainability Grade,${report.sustainabilityGrade}\n\n` +
      `Building,Consumption (kWh),Share (%)\n` +
      report.topConsumingBuildings
        .map((b) => `${b.buildingName},${b.kwh},${b.sharePercent}%`)
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_campus_energy_report_${report.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (loading || !report) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
        <FileText className="w-8 h-8 text-emerald-600 animate-pulse mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-medium">Aggregating campus sustainability report data...</p>
      </div>
    );
  }

  return (
    <div id="reports-tab-content" className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Campus Sustainability, ESG & Resource Consumption Reports
          </h2>
          <p className="text-xs text-slate-500">
            Automated compliance reporting, carbon emissions audit, and financial savings summaries
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
            {(['daily', 'weekly', 'monthly'] as const).map((period) => (
              <button
                key={period}
                id={`btn-period-${period}`}
                onClick={() => onChangePeriod(period)}
                className={`px-3 py-1 rounded-md font-semibold capitalize cursor-pointer transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            id="btn-export-csv"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloadSuccess ? 'Exported!' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Sustainability Grade */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Campus ESG Grade</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-700">{report.sustainabilityGrade}</span>
              <span className="text-xs text-emerald-600 font-semibold">Exemplary</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Top 5% Eco-Campus Standard</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Total Energy & Cost */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Net Electrical Usage</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">{report.totalEnergyKwh.toLocaleString()}</span>
            <span className="text-xs text-slate-500">kWh</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 font-medium">
            Cost: ${report.totalEnergyCostUsd.toLocaleString()}
          </p>
        </div>

        {/* Solar Generated & Carbon Offset */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Solar Generated</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-700">{report.solarGeneratedKwh.toLocaleString()}</span>
            <span className="text-xs text-slate-500">kWh</span>
          </div>
          <p className="mt-1 text-xs text-emerald-700 font-medium">
            -{report.carbonOffsetKg.toLocaleString()} kg CO₂ offset
          </p>
        </div>

        {/* Water Usage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Water Consumption</span>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-sky-700">{report.waterConsumedM3.toLocaleString()}</span>
            <span className="text-xs text-slate-500">m³</span>
          </div>
          <p className="mt-1 text-xs text-emerald-700 font-medium">
            +{report.waterSavedM3} m³ recycled greywater
          </p>
        </div>
      </div>

      {/* Building Energy Breakdown Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Building-Wise Electricity Distribution ({report.period.toUpperCase()})
        </h3>

        <div className="space-y-3 pt-1 text-xs">
          {report.topConsumingBuildings.map((b, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-center text-slate-700 font-medium">
                <span className="font-semibold text-slate-800">{b.buildingName}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500">{b.kwh.toLocaleString()} kWh</span>
                  <span className="font-bold text-slate-900 w-10 text-right">{b.sharePercent}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${b.sharePercent}%` }}
                  className="h-full bg-emerald-600 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Sustainability Insights */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Executive Sustainability Findings</h3>
        <ul className="space-y-2 text-xs text-slate-700">
          {report.keyInsights.map((insight, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
