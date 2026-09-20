import React from 'react';
import {
  X,
  Cpu,
  Droplets,
  Zap,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface SimulateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSimulation: (type: 'water_pipe_leak' | 'hvac_overrun' | 'reset_all') => void;
}

export const SimulateEventModal: React.FC<SimulateEventModalProps> = ({
  isOpen,
  onClose,
  onTriggerSimulation,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        id="simulate-modal"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">IoT Edge Sensor Stress Test</h3>
              <p className="text-xs text-slate-500">Inject telemetry faults to test AI anomaly detection</p>
            </div>
          </div>
          <button
            id="btn-close-sim-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          {/* Water Pipe Burst Event */}
          <button
            id="btn-sim-water-leak"
            onClick={() => {
              onTriggerSimulation('water_pipe_leak');
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-50 text-left flex items-start gap-3 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sky-950 block">Simulate Hostel Water Riser Leak</span>
              <p className="text-sky-800 text-[11px] mt-0.5">
                Surges flow meter to 74.5 L/min with sudden pressure drop to 2.7 bar in Hostel Block B.
              </p>
            </div>
          </button>

          {/* HVAC Freeze Overrun */}
          <button
            id="btn-sim-hvac-overrun"
            onClick={() => {
              onTriggerSimulation('hvac_overrun');
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-left flex items-start gap-3 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-950 block">Simulate After-Hours Vacant HVAC Overrun</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Sets Seminar Hall B204 to full AC chill (16.2 kW) while optical sensors verify 0 occupants.
              </p>
            </div>
          </button>

          {/* Reset all */}
          <button
            id="btn-sim-reset-all"
            onClick={() => {
              onTriggerSimulation('reset_all');
              onClose();
            }}
            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left flex items-start gap-3 transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-slate-200 text-slate-700 mt-0.5">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Reset All Systems to Optimal Baselines</span>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Clears all simulated anomalies, isolates leaks, and re-engages Auto-Eco pilots.
              </p>
            </div>
          </button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-400">
            Simulated via MQTT broker & WebSocket telemetry engine
          </p>
        </div>
      </div>
    </div>
  );
};
