import React, { useState } from 'react';
import {
  Users,
  Thermometer,
  Sun,
  Wind,
  Power,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Leaf,
  Filter,
} from 'lucide-react';
import { RoomSensorData, BuildingId } from '../types';

interface RoomsControlTabProps {
  rooms: RoomSensorData[];
  selectedBuildingFilter: string;
  onSelectBuildingFilter: (id: string) => void;
  onUpdateRoomControl: (roomId: string, updates: Partial<RoomSensorData>) => void;
  onAutoOptimize: () => void;
  isOptimizing: boolean;
}

export const RoomsControlTab: React.FC<RoomsControlTabProps> = ({
  rooms,
  selectedBuildingFilter,
  onSelectBuildingFilter,
  onUpdateRoomControl,
  onAutoOptimize,
  isOptimizing,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [occupancyFilter, setOccupancyFilter] = useState<string>('all');

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedBuildingFilter !== 'all' && r.buildingId !== selectedBuildingFilter) {
      return false;
    }
    if (typeFilter !== 'all' && r.type !== typeFilter) {
      return false;
    }
    if (occupancyFilter === 'occupied' && !r.occupancyDetected) {
      return false;
    }
    if (occupancyFilter === 'vacant' && r.occupancyDetected) {
      return false;
    }
    return true;
  });

  const vacantWasteCount = rooms.filter(
    (r) => !r.occupancyDetected && (r.hvacOn || r.lightingOn) && !r.autoControlEnabled
  ).length;

  return (
    <div id="rooms-control-tab-content" className="space-y-6">
      {/* Top Controls & Filtering Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Occupancy Sensing & Automated Room Appliance Control
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                PIR + Optical Vision Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live IoT telemetry feeds from classrooms, research laboratories, library pods, and residential wings
            </p>
          </div>

          <div className="flex items-center gap-2">
            {vacantWasteCount > 0 && (
              <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg font-medium">
                {vacantWasteCount} vacant space(s) drawing power
              </span>
            )}

            <button
              id="btn-room-auto-optimize"
              onClick={onAutoOptimize}
              disabled={isOptimizing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isOptimizing ? 'Optimizing...' : 'Shed Vacant Loads'}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Building:
          </span>
          {[
            { id: 'all', label: 'All Buildings' },
            { id: 'academic', label: 'Academic Block' },
            { id: 'engineering', label: 'Engineering Labs' },
            { id: 'science', label: 'Science Center' },
            { id: 'library', label: 'Library & Commons' },
            { id: 'hostels', label: 'Hostel Wings' },
          ].map((b) => (
            <button
              key={b.id}
              id={`filter-bldg-${b.id}`}
              onClick={() => onSelectBuildingFilter(b.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedBuildingFilter === b.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {b.label}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>

          <span className="text-slate-500 font-medium">Occupancy:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'occupied', label: 'Occupied' },
            { id: 'vacant', label: 'Vacant' },
          ].map((o) => (
            <button
              key={o.id}
              id={`filter-occ-${o.id}`}
              onClick={() => setOccupancyFilter(o.id)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                occupancyFilter === o.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div id="rooms-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const isWasting =
            !room.occupancyDetected && (room.hvacOn || room.lightingOn) && !room.autoControlEnabled;

          return (
            <div
              key={room.id}
              id={`room-card-${room.id}`}
              className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between transition-all ${
                isWasting
                  ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {room.type}
                      </span>
                      {room.autoControlEnabled && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                          Auto-Eco ON
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{room.name}</h3>
                  </div>

                  {/* Occupancy Badge */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${
                        room.occupancyDetected
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      {room.occupancyDetected ? (
                        <span>{room.currentOccupancy} / {room.capacity}</span>
                      ) : (
                        <span>Vacant</span>
                      )}
                    </span>
                    {!room.occupancyDetected && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Idle {room.lastMotionMinutesAgo}m
                      </p>
                    )}
                  </div>
                </div>

                {/* Warning callout if unoccupied with full power */}
                {isWasting && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                    <span className="flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      Unoccupied power waste ({room.powerDrawKw} kW)
                    </span>
                    <button
                      id={`btn-fix-waste-${room.id}`}
                      onClick={() =>
                        onUpdateRoomControl(room.id, {
                          autoControlEnabled: true,
                          hvacOn: false,
                          lightingOn: false,
                          lightingLevel: 0,
                          powerDrawKw: 0.4,
                        })
                      }
                      className="px-2 py-0.5 rounded bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[10px] cursor-pointer"
                    >
                      Power Down
                    </button>
                  </div>
                )}

                {/* Sensor Readings Bar */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Indoor Temp</span>
                    <span className="font-bold text-slate-800">{room.temperatureC}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Target Set</span>
                    <span className="font-semibold text-indigo-700">{room.targetTempC}°C</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Lux</span>
                    <span className="font-medium text-slate-700">{room.luxLevel} lx</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">CO₂</span>
                    <span
                      className={`font-medium ${
                        room.co2Ppm > 800 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {room.co2Ppm} ppm
                    </span>
                  </div>
                </div>

                {/* Appliance Actuators & Controls */}
                <div className="mt-3 space-y-2 text-xs">
                  {/* HVAC Control */}
                  <div className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-1.5 rounded-md ${
                          room.hvacOn ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Thermometer className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">HVAC Air Conditioning</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {(['cool', 'eco', 'off'] as const).map((mode) => (
                            <button
                              key={mode}
                              id={`btn-${room.id}-hvac-${mode}`}
                              onClick={() => {
                                onUpdateRoomControl(room.id, {
                                  hvacMode: mode,
                                  hvacOn: mode !== 'off',
                                });
                              }}
                              className={`px-1.5 py-0.2 rounded text-[10px] font-medium uppercase cursor-pointer ${
                                room.hvacMode === mode && room.hvacOn
                                  ? 'bg-indigo-600 text-white'
                                  : !room.hvacOn && mode === 'off'
                                  ? 'bg-slate-700 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      id={`toggle-${room.id}-hvac`}
                      onClick={() =>
                        onUpdateRoomControl(room.id, {
                          hvacOn: !room.hvacOn,
                          hvacMode: !room.hvacOn ? 'cool' : 'off',
                        })
                      }
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                        room.hvacOn
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {room.hvacOn ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Lighting Dimmer & Bank */}
                  <div className="p-2 rounded-lg border border-slate-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-1.5 rounded-md ${
                            room.lightingOn ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Sun className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">Smart Lighting</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium text-[11px]">
                          {room.lightingOn ? `${room.lightingLevel}%` : 'Off'}
                        </span>
                        <button
                          id={`toggle-${room.id}-lighting`}
                          onClick={() =>
                            onUpdateRoomControl(room.id, {
                              lightingOn: !room.lightingOn,
                              lightingLevel: !room.lightingOn ? 80 : 0,
                            })
                          }
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                            room.lightingOn
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {room.lightingOn ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>

                    {room.lightingOn && (
                      <div className="mt-2 pt-1 flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Dim:</span>
                        <input
                          id={`slider-${room.id}-dimmer`}
                          type="range"
                          min="10"
                          max="100"
                          step="5"
                          value={room.lightingLevel}
                          onChange={(e) =>
                            onUpdateRoomControl(room.id, {
                              lightingLevel: Number(e.target.value),
                            })
                          }
                          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* Secondary Appliances: Fans & Smart Plugs */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id={`toggle-${room.id}-fans`}
                      onClick={() =>
                        onUpdateRoomControl(room.id, {
                          fansOn: !room.fansOn,
                        })
                      }
                      className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-colors ${
                        room.fansOn
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-[11px]">
                        <Wind className="w-3.5 h-3.5" /> Air Fans
                      </span>
                      <span className="font-bold text-[10px]">{room.fansOn ? 'ON' : 'OFF'}</span>
                    </button>

                    <button
                      id={`toggle-${room.id}-plugs`}
                      onClick={() =>
                        onUpdateRoomControl(room.id, {
                          smartPlugsOn: !room.smartPlugsOn,
                        })
                      }
                      className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition-colors ${
                        room.smartPlugsOn
                          ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                          : 'border-slate-200 bg-slate-50 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-medium text-[11px]">
                        <Zap className="w-3.5 h-3.5" /> Smart Plugs
                      </span>
                      <span className="font-bold text-[10px]">{room.smartPlugsOn ? 'ON' : 'OFF'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer with Instant Power & Auto-Eco Toggle */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Instant Draw</span>
                  <span className="font-bold text-slate-800">{room.powerDrawKw} kW</span>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`switch-auto-${room.id}`}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 cursor-pointer"
                  >
                    <input
                      id={`switch-auto-${room.id}`}
                      type="checkbox"
                      checked={room.autoControlEnabled}
                      onChange={(e) =>
                        onUpdateRoomControl(room.id, {
                          autoControlEnabled: e.target.checked,
                        })
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Auto-Pilot</span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
