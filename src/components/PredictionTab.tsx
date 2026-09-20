import React, { useState } from 'react';
import {
  TrendingUp,
  Cpu,
  Sun,
  Zap,
  BarChart2,
  Calendar,
  Thermometer,
  Percent,
  CheckCircle2,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { PredictionSummary } from '../types';

interface PredictionTabProps {
  prediction: PredictionSummary | null;
  loading: boolean;
}

export const PredictionTab: React.FC<PredictionTabProps> = ({ prediction, loading }) => {
  const [showActual, setShowActual] = useState(true);
  const [showPredicted, setShowPredicted] = useState(true);
  const [showOptimized, setShowOptimized] = useState(true);
  const [showSolar, setShowSolar] = useState(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  if (loading || !prediction) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
        <Cpu className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-600 font-medium">Running campus ML energy forecasting models...</p>
      </div>
    );
  }

  // Chart SVG calculations
  const maxKw = 750;
  const chartHeight = 240;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 25;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  const points = prediction.series;
  const getX = (index: number) => paddingX + (index / (points.length - 1)) * innerWidth;
  const getY = (val: number) => paddingY + innerHeight - (val / maxKw) * innerHeight;

  // Build SVG path strings
  const buildPath = (getValue: (p: (typeof points)[0]) => number | null) => {
    let d = '';
    points.forEach((p, idx) => {
      const val = getValue(p);
      if (val === null) return;
      const x = getX(idx);
      const y = getY(val);
      if (d === '') d += `M ${x} ${y}`;
      else d += ` L ${x} ${y}`;
    });
    return d;
  };

  const actualPath = buildPath((p) => p.actualKw);
  const predictedPath = buildPath((p) => p.predictedKw);
  const optimizedPath = buildPath((p) => p.optimizedKw);
  const solarPath = buildPath((p) => p.solarKw);

  // Confidence area polygon
  const confidenceArea = () => {
    let top = '';
    let bottom = '';
    points.forEach((p, idx) => {
      const x = getX(idx);
      const yTop = getY(p.upperBoundKw);
      const yBottom = getY(p.lowerBoundKw);
      if (idx === 0) {
        top += `M ${x} ${yTop}`;
        bottom = `L ${x} ${yBottom}`;
      } else {
        top += ` L ${x} ${yTop}`;
        bottom = ` L ${x} ${yBottom}` + bottom;
      }
    });
    return top + bottom + ' Z';
  };

  const hoveredPoint = hoveredPointIndex !== null ? points[hoveredPointIndex] : null;

  return (
    <div id="prediction-tab-content" className="space-y-6">
      {/* Model Overview & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Forecast Model</span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-slate-800 mt-1.5 line-clamp-1">{prediction.modelName}</p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{prediction.modelAccuracyPercent}% R² Accuracy</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Forecast Error</span>
            <BarChart2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{prediction.maeKw}</span>
            <span className="text-xs text-slate-500">kW MAE</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">RMSE: {prediction.rmseKw} kW</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Peak Demand Forecast</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-700">{prediction.peakDemandForecastKw}</span>
            <span className="text-xs text-slate-500">kW</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Expected at {prediction.peakHour} PM</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>AI Automated Savings</span>
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-700">-${prediction.estimatedCostSavingsUsd}</span>
            <span className="text-xs text-slate-500">/day</span>
          </div>
          <p className="mt-1 text-xs text-emerald-700 font-medium">
            {prediction.estimatedDailySavingsKwh.toLocaleString()} kWh avoided
          </p>
        </div>
      </div>

      {/* Main Interactive Forecast Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              24-Hour Campus Energy Demand Curve: Actual vs ML Predicted vs AI Optimized
            </h2>
            <p className="text-xs text-slate-500">
              Multivariate time-series forecasting grounded in campus schedule, outdoor temperature, and historical smart meters
            </p>
          </div>

          {/* Series Toggle Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              id="toggle-series-actual"
              onClick={() => setShowActual(!showActual)}
              className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                showActual
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              ● Actual Load
            </button>

            <button
              id="toggle-series-predicted"
              onClick={() => setShowPredicted(!showPredicted)}
              className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                showPredicted
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              -- ML Predicted
            </button>

            <button
              id="toggle-series-optimized"
              onClick={() => setShowOptimized(!showOptimized)}
              className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                showOptimized
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              — AI Optimized
            </button>

            <button
              id="toggle-series-solar"
              onClick={() => setShowSolar(!showSolar)}
              className={`px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                showSolar
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-50 text-slate-400 border-slate-200'
              }`}
            >
              ··· Rooftop Solar
            </button>
          </div>
        </div>

        {/* Responsive Chart Container */}
        <div className="relative w-full overflow-x-auto">
          <div className="min-w-[680px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              {/* Y Axis Grid Lines */}
              {[0, 150, 300, 450, 600, 750].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                    >
                      {val} kW
                    </text>
                  </g>
                );
              })}

              {/* Confidence interval area */}
              {showPredicted && (
                <path d={confidenceArea()} fill="#fef3c7" opacity="0.45" />
              )}

              {/* Solar Curve */}
              {showSolar && (
                <path
                  d={solarPath}
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              )}

              {/* AI Optimized Curve */}
              {showOptimized && (
                <path
                  d={optimizedPath}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />
              )}

              {/* Predicted Curve */}
              {showPredicted && (
                <path
                  d={predictedPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                />
              )}

              {/* Actual Curve */}
              {showActual && (
                <path
                  d={actualPath}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="3"
                />
              )}

              {/* Interactive Hover Columns */}
              {points.map((p, idx) => {
                const x = getX(idx);
                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                  >
                    <rect
                      x={x - 12}
                      y={paddingY}
                      width={24}
                      height={innerHeight}
                      fill="transparent"
                      className="hover:fill-slate-200/30 transition-colors"
                    />
                    {/* Time labels (every 3 hours) */}
                    {idx % 3 === 0 && (
                      <text
                        x={x}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748b"
                      >
                        {p.timeLabel}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Hover Indicator Line & Dot */}
              {hoveredPointIndex !== null && (
                <g>
                  <line
                    x1={getX(hoveredPointIndex)}
                    y1={paddingY}
                    x2={getX(hoveredPointIndex)}
                    y2={paddingY + innerHeight}
                    stroke="#64748b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {showActual && points[hoveredPointIndex].actualKw !== null && (
                    <circle
                      cx={getX(hoveredPointIndex)}
                      cy={getY(points[hoveredPointIndex].actualKw!)}
                      r="4"
                      fill="#0f172a"
                    />
                  )}
                  {showPredicted && (
                    <circle
                      cx={getX(hoveredPointIndex)}
                      cy={getY(points[hoveredPointIndex].predictedKw)}
                      r="3.5"
                      fill="#f59e0b"
                    />
                  )}
                  {showOptimized && (
                    <circle
                      cx={getX(hoveredPointIndex)}
                      cy={getY(points[hoveredPointIndex].optimizedKw)}
                      r="3.5"
                      fill="#10b981"
                    />
                  )}
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Hovered Point Details Bar */}
        {hoveredPoint && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">Time: {hoveredPoint.timeLabel}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">Outdoor: {hoveredPoint.outdoorTempC}°C</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">Campus Occupancy: {hoveredPoint.expectedOccupancyPercent}%</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {hoveredPoint.actualKw !== null && (
                <span className="font-semibold text-slate-900">
                  Actual: <span className="text-slate-800">{hoveredPoint.actualKw} kW</span>
                </span>
              )}
              <span className="font-semibold text-amber-700">
                Predicted: <span>{hoveredPoint.predictedKw} kW</span>
              </span>
              <span className="font-semibold text-emerald-700">
                Optimized: <span>{hoveredPoint.optimizedKw} kW</span>
              </span>
              <span className="font-semibold text-sky-700">
                Solar: <span>{hoveredPoint.solarKw} kW</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Feature Attribution & Model Explainability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ML Feature Weights */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">ML Model Feature Importance (SHAP Values)</h3>
            <span className="text-[11px] font-medium text-slate-500">Scikit-learn / LightGBM</span>
          </div>
          <p className="text-xs text-slate-500">
            Relative weight of dynamic campus features influencing electricity demand prediction
          </p>

          <div className="space-y-2.5 pt-2 text-xs">
            {[
              { label: 'Ambient Outdoor Temperature & Heat Index', pct: 36, color: 'bg-rose-500' },
              { label: 'University Timetable & Classroom Bookings', pct: 28, color: 'bg-indigo-500' },
              { label: 'Hour-of-Day & Diurnal Solar Radiation', pct: 20, color: 'bg-amber-500' },
              { label: 'Hostel Resident Flow & Dining Peak Timing', pct: 10, color: 'bg-sky-500' },
              { label: 'Historical 14-day Rolling Baseline', pct: 6, color: 'bg-emerald-500' },
            ].map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>{f.label}</span>
                  <span>{f.pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div style={{ width: `${f.pct}%` }} className={`h-full ${f.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Shaving & Demand Response Recommendations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">AI Demand-Response & Peak Shaving Strategies</h3>
          <p className="text-xs text-slate-500">
            Algorithmic interventions scheduled ahead of the 14:30 peak demand window
          </p>

          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-950">
              <span className="font-bold block mb-0.5">1. Solar Pre-Cooling Buffer (11:00 - 13:30)</span>
              <p className="text-emerald-800">
                Utilize 276 kW solar peak to pre-chill Science Research Block and Library thermal mass down to 21.5°C, letting setpoints drift to 24.5°C during high tariff peak at 14:30.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-950">
              <span className="font-bold block mb-0.5">2. HPC Supercomputing Batch Load Shifting</span>
              <p className="text-indigo-800">
                Queue non-urgent GPU deep learning training runs for 22:00 onwards, cutting 24 kW from daytime peak demand.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
              <span className="font-bold block mb-0.5">3. Central Chiller Variable Frequency Drive (VFD) Staging</span>
              <p className="text-slate-600">
                Stagger chiller ramp rates across buildings to prevent concurrent inrush currents from tripping peak contract demand thresholds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
