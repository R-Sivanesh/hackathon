import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  Building,
  RoomSensorData,
  WaterZoneData,
  AnomalyAlert,
  ResourceAllocationItem,
  CampusOverviewKPIs,
  PredictionSummary,
  CampusReport,
  AIAuditResponse,
} from './src/types';

dotenv.config();

// Initialize Google GenAI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// -----------------------------------------------------------------------------
// Campus In-Memory State & IoT Simulation
// -----------------------------------------------------------------------------
const campusBuildings: Building[] = [
  {
    id: 'engineering',
    name: 'Engineering & Technology Complex',
    category: 'Laboratories',
    totalAreaSqFt: 120000,
    currentPowerKw: 142.5,
    baselinePowerKw: 175.0,
    dailyConsumptionKwh: 2450.8,
    solarGenerationKw: 65.4,
    occupancyCount: 420,
    totalCapacity: 850,
    waterFlowLpm: 38.2,
    dailyWaterM3: 45.8,
    status: 'optimal',
    roomCount: 38,
    activeAlerts: 0,
  },
  {
    id: 'science',
    name: 'Science & Research Center',
    category: 'Research',
    totalAreaSqFt: 95000,
    currentPowerKw: 188.4,
    baselinePowerKw: 195.0,
    dailyConsumptionKwh: 3120.4,
    solarGenerationKw: 42.0,
    occupancyCount: 260,
    totalCapacity: 500,
    waterFlowLpm: 52.0,
    dailyWaterM3: 68.2,
    status: 'warning',
    roomCount: 26,
    activeAlerts: 1,
  },
  {
    id: 'academic',
    name: 'Central Academic Block',
    category: 'Classrooms',
    totalAreaSqFt: 145000,
    currentPowerKw: 98.2,
    baselinePowerKw: 155.0,
    dailyConsumptionKwh: 1840.6,
    solarGenerationKw: 78.5,
    occupancyCount: 680,
    totalCapacity: 1400,
    waterFlowLpm: 24.5,
    dailyWaterM3: 31.0,
    status: 'warning',
    roomCount: 52,
    activeAlerts: 1,
  },
  {
    id: 'library',
    name: 'University Library & Commons',
    category: 'Commons',
    totalAreaSqFt: 80000,
    currentPowerKw: 46.8,
    baselinePowerKw: 65.0,
    dailyConsumptionKwh: 890.2,
    solarGenerationKw: 35.2,
    occupancyCount: 310,
    totalCapacity: 600,
    waterFlowLpm: 14.8,
    dailyWaterM3: 16.5,
    status: 'optimal',
    roomCount: 18,
    activeAlerts: 0,
  },
  {
    id: 'hostels',
    name: 'Student Hostels & Dining Complex',
    category: 'Residential',
    totalAreaSqFt: 210000,
    currentPowerKw: 165.3,
    baselinePowerKw: 180.0,
    dailyConsumptionKwh: 3340.5,
    solarGenerationKw: 55.0,
    occupancyCount: 890,
    totalCapacity: 1200,
    waterFlowLpm: 92.4,
    dailyWaterM3: 124.0,
    status: 'critical',
    roomCount: 64,
    activeAlerts: 1,
  },
];

let campusRooms: RoomSensorData[] = [
  {
    id: 'acad-a101',
    buildingId: 'academic',
    name: 'Smart Lecture Hall A101',
    type: 'Classroom',
    capacity: 90,
    currentOccupancy: 64,
    occupancyDetected: true,
    temperatureC: 22.8,
    targetTempC: 23.0,
    humidityPercent: 48,
    luxLevel: 420,
    co2Ppm: 680,
    powerDrawKw: 4.8,
    hvacOn: true,
    hvacMode: 'cool',
    lightingOn: true,
    lightingLevel: 80,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 0,
    ecoSavingsKwh: 38.4,
  },
  {
    id: 'acad-b204',
    buildingId: 'academic',
    name: 'Seminar Hall B204 (Unoccupied)',
    type: 'Classroom',
    capacity: 120,
    currentOccupancy: 0,
    occupancyDetected: false,
    temperatureC: 19.4,
    targetTempC: 24.0,
    humidityPercent: 44,
    luxLevel: 510,
    co2Ppm: 410,
    powerDrawKw: 14.6, // Anomaly: high power when empty
    hvacOn: true,
    hvacMode: 'cool',
    lightingOn: true,
    lightingLevel: 100,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: false, // Turned off manual override causing waste
    lastMotionMinutesAgo: 45,
    ecoSavingsKwh: 0,
  },
  {
    id: 'eng-rob-302',
    buildingId: 'engineering',
    name: 'Robotics & Automation Lab',
    type: 'Lab',
    capacity: 40,
    currentOccupancy: 28,
    occupancyDetected: true,
    temperatureC: 23.2,
    targetTempC: 22.5,
    humidityPercent: 52,
    luxLevel: 560,
    co2Ppm: 720,
    powerDrawKw: 18.2,
    hvacOn: true,
    hvacMode: 'cool',
    lightingOn: true,
    lightingLevel: 90,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 1,
    ecoSavingsKwh: 22.1,
  },
  {
    id: 'eng-hpc-01',
    buildingId: 'engineering',
    name: 'AI & HPC Computing Cluster',
    type: 'Lab',
    capacity: 15,
    currentOccupancy: 6,
    occupancyDetected: true,
    temperatureC: 19.5,
    targetTempC: 19.0,
    humidityPercent: 40,
    luxLevel: 280,
    co2Ppm: 510,
    powerDrawKw: 42.8,
    hvacOn: true,
    hvacMode: 'cool',
    lightingOn: true,
    lightingLevel: 60,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 4,
    ecoSavingsKwh: 64.2,
  },
  {
    id: 'sci-clean-01',
    buildingId: 'science',
    name: 'Nanotech Class 1000 Cleanroom',
    type: 'Lab',
    capacity: 20,
    currentOccupancy: 12,
    occupancyDetected: true,
    temperatureC: 20.1,
    targetTempC: 20.0,
    humidityPercent: 45,
    luxLevel: 600,
    co2Ppm: 490,
    powerDrawKw: 34.5,
    hvacOn: true,
    hvacMode: 'cool',
    lightingOn: true,
    lightingLevel: 95,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 2,
    ecoSavingsKwh: 19.8,
  },
  {
    id: 'sci-chem-202',
    buildingId: 'science',
    name: 'Synthetic Organic Chemistry Lab',
    type: 'Lab',
    capacity: 35,
    currentOccupancy: 19,
    occupancyDetected: true,
    temperatureC: 22.0,
    targetTempC: 22.0,
    humidityPercent: 49,
    luxLevel: 530,
    co2Ppm: 580,
    powerDrawKw: 22.4,
    hvacOn: true,
    hvacMode: 'cool',
    lightingOn: true,
    lightingLevel: 85,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 0,
    ecoSavingsKwh: 16.5,
  },
  {
    id: 'lib-main-hall',
    buildingId: 'library',
    name: 'Grand Reading Commons (Level 2)',
    type: 'Library Hall',
    capacity: 250,
    currentOccupancy: 142,
    occupancyDetected: true,
    temperatureC: 23.5,
    targetTempC: 23.5,
    humidityPercent: 50,
    luxLevel: 440,
    co2Ppm: 630,
    powerDrawKw: 12.6,
    hvacOn: true,
    hvacMode: 'eco',
    lightingOn: true,
    lightingLevel: 70,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 0,
    ecoSavingsKwh: 45.0,
  },
  {
    id: 'lib-pod-east',
    buildingId: 'library',
    name: 'Quiet Collaborative Pods East',
    type: 'Library Hall',
    capacity: 40,
    currentOccupancy: 0,
    occupancyDetected: false,
    temperatureC: 25.1,
    targetTempC: 24.0,
    humidityPercent: 52,
    luxLevel: 120,
    co2Ppm: 430,
    powerDrawKw: 0.9,
    hvacOn: false,
    hvacMode: 'off',
    lightingOn: false,
    lightingLevel: 15, // dim standby
    fansOn: false,
    smartPlugsOn: false,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 28,
    ecoSavingsKwh: 14.2,
  },
  {
    id: 'host-block-a',
    buildingId: 'hostels',
    name: 'North Hostel Residence Wing A',
    type: 'Hostel Wing',
    capacity: 180,
    currentOccupancy: 95,
    occupancyDetected: true,
    temperatureC: 24.8,
    targetTempC: 25.0,
    humidityPercent: 55,
    luxLevel: 310,
    co2Ppm: 610,
    powerDrawKw: 28.5,
    hvacOn: true,
    hvacMode: 'eco',
    lightingOn: true,
    lightingLevel: 65,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 3,
    ecoSavingsKwh: 52.8,
  },
  {
    id: 'host-block-b',
    buildingId: 'hostels',
    name: 'South Hostel Residence Wing B',
    type: 'Hostel Wing',
    capacity: 180,
    currentOccupancy: 110,
    occupancyDetected: true,
    temperatureC: 25.2,
    targetTempC: 25.0,
    humidityPercent: 58,
    luxLevel: 320,
    co2Ppm: 640,
    powerDrawKw: 31.0,
    hvacOn: true,
    hvacMode: 'eco',
    lightingOn: true,
    lightingLevel: 70,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 1,
    ecoSavingsKwh: 48.0,
  },
  {
    id: 'host-dining',
    buildingId: 'hostels',
    name: 'Campus Dining Commons & Kitchen',
    type: 'Auditorium',
    capacity: 400,
    currentOccupancy: 280,
    occupancyDetected: true,
    temperatureC: 24.0,
    targetTempC: 23.5,
    humidityPercent: 62,
    luxLevel: 550,
    co2Ppm: 820,
    powerDrawKw: 48.2,
    hvacOn: true,
    hvacMode: 'cool',
    lightingOn: true,
    lightingLevel: 90,
    fansOn: true,
    smartPlugsOn: true,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 0,
    ecoSavingsKwh: 34.0,
  },
  {
    id: 'acad-auditorium',
    buildingId: 'academic',
    name: 'Main Campus Amphitheater',
    type: 'Auditorium',
    capacity: 450,
    currentOccupancy: 0,
    occupancyDetected: false,
    temperatureC: 26.0,
    targetTempC: 24.0,
    humidityPercent: 50,
    luxLevel: 80,
    co2Ppm: 420,
    powerDrawKw: 1.8,
    hvacOn: false,
    hvacMode: 'off',
    lightingOn: false,
    lightingLevel: 10,
    fansOn: false,
    smartPlugsOn: false,
    autoControlEnabled: true,
    lastMotionMinutesAgo: 120,
    ecoSavingsKwh: 76.5,
  },
];

let campusWaterZones: WaterZoneData[] = [
  {
    id: 'water-main-inlet',
    zoneName: 'Campus Municipal Main Meter & Pumping Station',
    buildingId: 'academic',
    currentFlowLpm: 222.1,
    normalFlowLpm: 215.0,
    pressureBar: 4.8,
    nominalPressureBar: 4.5,
    tankLevelPercent: 88,
    leakRisk: 'normal',
    valveOpen: true,
    dailyConsumptionLiters: 285000,
    recycledGreywaterPercent: 32,
  },
  {
    id: 'water-hostel-b',
    zoneName: 'Hostel Block B Level 2-4 Domestic Riser',
    buildingId: 'hostels',
    currentFlowLpm: 68.4, // Abnormal continuous flow during lecture hours
    normalFlowLpm: 22.0,
    pressureBar: 2.9, // Pressure drop due to leak
    nominalPressureBar: 3.8,
    tankLevelPercent: 62,
    leakRisk: 'critical_leak',
    valveOpen: true,
    dailyConsumptionLiters: 74200,
    recycledGreywaterPercent: 18,
  },
  {
    id: 'water-science-labs',
    zoneName: 'Science Research DI/RO Purified Water Loop',
    buildingId: 'science',
    currentFlowLpm: 52.0,
    normalFlowLpm: 48.0,
    pressureBar: 4.2,
    nominalPressureBar: 4.2,
    tankLevelPercent: 94,
    leakRisk: 'normal',
    valveOpen: true,
    dailyConsumptionLiters: 68200,
    recycledGreywaterPercent: 45,
  },
  {
    id: 'water-cooling-tower',
    zoneName: 'Central Chiller Plant Evaporative Cooling Tower',
    buildingId: 'engineering',
    currentFlowLpm: 38.2,
    normalFlowLpm: 35.0,
    pressureBar: 3.9,
    nominalPressureBar: 4.0,
    tankLevelPercent: 82,
    leakRisk: 'normal',
    valveOpen: true,
    dailyConsumptionLiters: 45800,
    recycledGreywaterPercent: 65,
  },
  {
    id: 'water-academic-restrooms',
    zoneName: 'Academic Block Greywater Flush Network',
    buildingId: 'academic',
    currentFlowLpm: 24.5,
    normalFlowLpm: 26.0,
    pressureBar: 3.6,
    nominalPressureBar: 3.6,
    tankLevelPercent: 78,
    leakRisk: 'normal',
    valveOpen: true,
    dailyConsumptionLiters: 31000,
    recycledGreywaterPercent: 85,
  },
  {
    id: 'water-library-irrigation',
    zoneName: 'Botanical Courtyard & Commons Drip Irrigation',
    buildingId: 'library',
    currentFlowLpm: 14.8,
    normalFlowLpm: 15.0,
    pressureBar: 3.2,
    nominalPressureBar: 3.2,
    tankLevelPercent: 91,
    leakRisk: 'normal',
    valveOpen: true,
    dailyConsumptionLiters: 16500,
    recycledGreywaterPercent: 100,
  },
];

let campusAnomalies: AnomalyAlert[] = [
  {
    id: 'anom-elec-b204',
    timestamp: '14 mins ago',
    buildingId: 'academic',
    zoneName: 'Seminar Hall B204',
    resourceType: 'electricity',
    severity: 'high',
    title: 'Unoccupied High Load & Active HVAC Overcooling',
    description:
      'Computer vision and PIR sensors report 0 occupants for 45+ minutes, yet central split AC is running full capacity at 19.4°C with 100% lighting active. Manual override was toggled.',
    measuredValue: '14.6 kW draw (19.4°C)',
    expectedValue: '< 0.8 kW idle standby',
    wasteRatePerHour: '$2.48 / hr (13.8 kWh/hr)',
    status: 'active',
    aiRootCause:
      'Automated occupancy shutdown was disabled via physical wall panel toggle after an 11:00 AM presentation. Room vacated without resetting back to Auto-Eco.',
    recommendedAction:
      'Re-enable Auto-Eco Pilot mode remotely to cut 13.8 kW load immediately and enforce 10-minute idle sleep rule.',
    autoMitigationAvailable: true,
  },
  {
    id: 'anom-water-hostel-b',
    timestamp: '28 mins ago',
    buildingId: 'hostels',
    zoneName: 'Hostel Block B Domestic Riser',
    resourceType: 'water',
    severity: 'critical',
    title: 'Severe Nocturnal/Off-Peak Water Flow Spike',
    description:
      'Flow meter registered continuous 68.4 L/min (3.1x baseline) with an accompanied 0.9 bar line pressure drop, indicating a burst feeder pipe or malfunctioning high-pressure flush valve.',
    measuredValue: '68.4 L/min (2.9 bar)',
    expectedValue: '20.0 - 24.0 L/min (3.8 bar)',
    wasteRatePerHour: '2,660 Liters / hr ($18.60/hr)',
    status: 'active',
    aiRootCause:
      'Abrupt pressure drop coinciding with sustained high flow without corresponding occupancy presence suggests plumbing fixture failure in Level 3 restroom bank.',
    recommendedAction:
      'Activate Motorized Solenoid Valve #HB-03 to isolate Sector B Riser and dispatch emergency facilities plumber.',
    autoMitigationAvailable: true,
  },
  {
    id: 'anom-hpc-cooling',
    timestamp: '1 hour ago',
    buildingId: 'engineering',
    zoneName: 'AI & HPC Computing Cluster',
    resourceType: 'hvac',
    severity: 'medium',
    title: 'Chilled Water Return Temp Delta Deviation',
    description:
      'In-rack CRAH chiller is consuming 8.4 kW above thermal model prediction given current GPU compute utilization (62%).',
    measuredValue: '42.8 kW (ΔT = 3.2°C)',
    expectedValue: '34.4 kW (ΔT = 5.5°C)',
    wasteRatePerHour: '$1.51 / hr (8.4 kWh/hr)',
    status: 'investigating',
    aiRootCause:
      'Airflow bypass due to open blanking panel in Server Rack Row 4, causing hot-aisle containment recirculation.',
    recommendedAction:
      'Increase chilled water supply temperature by 1.5°C and seal server bay rack seals.',
    autoMitigationAvailable: false,
  },
];

const campusAllocations: ResourceAllocationItem[] = [
  {
    id: 'alloc-1',
    roomName: 'Seminar Hall B204',
    buildingId: 'academic',
    currentActivity: 'ENV-201 Intro to Climatology (Section B)',
    scheduledCapacity: 120,
    actualAttendance: 18,
    utilizationRate: 15,
    recommendationType: 'merge',
    suggestedAction:
      'Consolidate with Section A in Smart Lecture Hall A101 (utilization would rise to 88%). Enables turning off Central Chiller Circuit 4.',
    estimatedPowerSavedKw: 13.8,
    suggestedTargetRoom: 'Smart Lecture Hall A101',
  },
  {
    id: 'alloc-2',
    roomName: 'Robotics & Automation Lab',
    buildingId: 'engineering',
    currentActivity: 'Mechatronics Capstone Practicum',
    scheduledCapacity: 40,
    actualAttendance: 28,
    utilizationRate: 70,
    recommendationType: 'optimal',
    suggestedAction:
      'Room operating within ideal thermal and spatial capacity. Solar peak alignment matched with heavy motor drives.',
    estimatedPowerSavedKw: 0,
  },
  {
    id: 'alloc-3',
    roomName: 'Main Campus Amphitheater',
    buildingId: 'academic',
    currentActivity: 'Unscheduled / Empty',
    scheduledCapacity: 450,
    actualAttendance: 0,
    utilizationRate: 0,
    recommendationType: 'power_down',
    suggestedAction:
      'Deep sleep mode active. Air handling units throttled to minimum ventilation air exchange.',
    estimatedPowerSavedKw: 38.0,
  },
  {
    id: 'alloc-4',
    roomName: 'Synthetic Organic Chemistry Lab',
    buildingId: 'science',
    currentActivity: 'Graduate Synthesis Research',
    scheduledCapacity: 35,
    actualAttendance: 19,
    utilizationRate: 54,
    recommendationType: 'relocate',
    suggestedAction:
      'Shift secondary fume hood operations into Bio-Lab 104 to shut down 2x 7.5 kW exhaust scrubbers for the afternoon.',
    estimatedPowerSavedKw: 15.0,
    suggestedTargetRoom: 'Bio-Lab 104',
  },
];

// -----------------------------------------------------------------------------
// Helper Generators & Simulation Loop
// -----------------------------------------------------------------------------
function generate24HourPrediction(): PredictionSummary {
  const hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const currentHourIndex = 14; // Current simulated time: 14:00 (2 PM)

  const series = hours.map((hour, idx) => {
    // Base campus load profile (night ~280 kW, day peak ~680 kW)
    const diurnalFactor = Math.sin(((idx - 6) / 18) * Math.PI);
    const dayCurve = idx >= 6 && idx <= 22 ? Math.max(0, diurnalFactor) : 0;
    
    // Solar generation (peaks at 12:30 PM up to 280 kW)
    let solarKw = 0;
    if (idx >= 6 && idx <= 18) {
      solarKw = Math.round(276 * Math.sin(((idx - 6) / 12) * Math.PI));
    }

    const baselineKw = Math.round(260 + dayCurve * 420);
    const outdoorTempC = Math.round((21 + dayCurve * 11) * 10) / 10;
    const expectedOccupancyPercent = idx >= 8 && idx <= 17 ? Math.round(65 + Math.sin(idx) * 20) : idx >= 18 && idx <= 22 ? 35 : 8;

    // Predicted demand from ML (multivariate regression with weather & occupancy)
    const predictedKw = Math.round(baselineKw * 0.94 + (outdoorTempC > 28 ? (outdoorTempC - 28) * 18 : 0));
    
    // Optimized with AI automated controls (smart occupancy cutoffs, precooling, peak shaving)
    const optimizedKw = Math.round(predictedKw * 0.82 - (solarKw > 150 ? 15 : 0));

    // Actual load for past hours, null for future hours
    const actualKw = idx <= currentHourIndex ? Math.round(predictedKw * (1 + (Math.sin(idx * 2) * 0.04))) : null;

    return {
      timeLabel: hour,
      timestamp: `2026-09-20T${hour}:00Z`,
      actualKw,
      predictedKw,
      optimizedKw,
      upperBoundKw: Math.round(predictedKw * 1.06),
      lowerBoundKw: Math.round(predictedKw * 0.94),
      solarKw,
      outdoorTempC,
      expectedOccupancyPercent,
    };
  });

  return {
    modelName: 'CampusLightGBM + Random Forest Regressor v3.4',
    modelAccuracyPercent: 96.8,
    maeKw: 12.4,
    rmseKw: 16.8,
    peakDemandForecastKw: 642.0,
    peakHour: '14:30',
    forecastedTotalDailyKwh: 11640,
    baselineDailyKwh: 13950,
    estimatedDailySavingsKwh: 2310,
    estimatedCostSavingsUsd: 415.8,
    series,
  };
}

function calculateOverviewKPIs(): CampusOverviewKPIs {
  const currentPowerDrawKw = campusRooms.reduce((acc, r) => acc + r.powerDrawKw, 0) + 480; // include baseline chillers/substations
  const solarGenerationKw = campusBuildings.reduce((acc, b) => acc + b.solarGenerationKw, 0);
  const gridDemandKw = Math.max(0, currentPowerDrawKw - solarGenerationKw);
  const renewablePercentage = Math.round((solarGenerationKw / currentPowerDrawKw) * 100);
  const dailyTotalKwh = campusBuildings.reduce((acc, b) => acc + b.dailyConsumptionKwh, 0);
  const dailyCostUsd = Math.round(dailyTotalKwh * 0.18 * 100) / 100;
  const dailyCarbonKg = Math.round(dailyTotalKwh * 0.42); // 0.42 kg CO2 per kWh grid mix
  const totalOccupancy = campusBuildings.reduce((acc, b) => acc + b.occupancyCount, 0);
  const campusCapacity = campusBuildings.reduce((acc, b) => acc + b.totalCapacity, 0);
  const waterFlowTotalLpm = campusWaterZones.reduce((acc, z) => acc + z.currentFlowLpm, 0);
  const waterDailyM3 = campusBuildings.reduce((acc, b) => acc + b.dailyWaterM3, 0);
  const activeAnomaliesCount = campusAnomalies.filter((a) => a.status === 'active').length;
  const automatedSavingsTodayKwh = campusRooms.reduce((acc, r) => acc + r.ecoSavingsKwh, 0) + 380;
  const automatedSavingsTodayUsd = Math.round(automatedSavingsTodayKwh * 0.18 * 100) / 100;
  const systemEfficiencyScore = 92;

  return {
    currentPowerDrawKw: Math.round(currentPowerDrawKw * 10) / 10,
    gridDemandKw: Math.round(gridDemandKw * 10) / 10,
    solarGenerationKw: Math.round(solarGenerationKw * 10) / 10,
    renewablePercentage,
    dailyTotalKwh: Math.round(dailyTotalKwh),
    dailyCostUsd,
    dailyCarbonKg,
    totalOccupancy,
    campusCapacity,
    waterFlowTotalLpm: Math.round(waterFlowTotalLpm * 10) / 10,
    waterDailyM3: Math.round(waterDailyM3 * 10) / 10,
    activeAnomaliesCount,
    automatedSavingsTodayKwh: Math.round(automatedSavingsTodayKwh),
    automatedSavingsTodayUsd,
    systemEfficiencyScore,
  };
}

// -----------------------------------------------------------------------------
// Express Server Setup
// -----------------------------------------------------------------------------
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // 1. Campus Overview KPIs
  app.get('/api/campus/overview', (req: Request, res: Response) => {
    const kpis = calculateOverviewKPIs();
    res.json(kpis);
  });

  // 2. Buildings List
  app.get('/api/campus/buildings', (req: Request, res: Response) => {
    res.json(campusBuildings);
  });

  // 3. Rooms Telemetry
  app.get('/api/campus/rooms', (req: Request, res: Response) => {
    res.json(campusRooms);
  });

  // 4. Room Appliance & Auto-Control Update
  app.post('/api/campus/rooms/:id/control', (req: Request, res: Response) => {
    const { id } = req.params;
    const room = campusRooms.find((r) => r.id === id);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const {
      hvacOn,
      hvacMode,
      targetTempC,
      lightingOn,
      lightingLevel,
      fansOn,
      smartPlugsOn,
      autoControlEnabled,
    } = req.body;

    if (hvacOn !== undefined) room.hvacOn = Boolean(hvacOn);
    if (hvacMode !== undefined) room.hvacMode = hvacMode;
    if (targetTempC !== undefined) room.targetTempC = Number(targetTempC);
    if (lightingOn !== undefined) room.lightingOn = Boolean(lightingOn);
    if (lightingLevel !== undefined) room.lightingLevel = Number(lightingLevel);
    if (fansOn !== undefined) room.fansOn = Boolean(fansOn);
    if (smartPlugsOn !== undefined) room.smartPlugsOn = Boolean(smartPlugsOn);
    if (autoControlEnabled !== undefined) room.autoControlEnabled = Boolean(autoControlEnabled);

    // Recalculate estimated power draw based on actual controls
    let base = 0.5; // sensors & standby
    if (room.hvacOn) base += (room.hvacMode === 'eco' ? 2.5 : 4.2) * (room.capacity / 40);
    if (room.lightingOn) base += (room.lightingLevel / 100) * 1.5 * (room.capacity / 40);
    if (room.fansOn) base += 0.4 * (room.capacity / 40);
    if (room.smartPlugsOn) base += 0.8 * (room.capacity / 40);
    
    room.powerDrawKw = Math.round(base * 10) / 10;

    // Check if this resolved the B204 anomaly
    if (room.id === 'acad-b204' && (!room.hvacOn || room.autoControlEnabled)) {
      const anom = campusAnomalies.find((a) => a.id === 'anom-elec-b204');
      if (anom) {
        anom.status = 'mitigated';
      }
    }

    res.json({ success: true, room });
  });

  // 5. Trigger Automated Campus-Wide Optimization
  app.post('/api/campus/auto-optimize', (req: Request, res: Response) => {
    let affectedRooms = 0;
    let totalKwSaved = 0;

    campusRooms.forEach((room) => {
      if (room.currentOccupancy === 0) {
        const prevDraw = room.powerDrawKw;
        room.autoControlEnabled = true;
        room.hvacOn = false;
        room.lightingOn = false;
        room.lightingLevel = 0;
        room.fansOn = false;
        room.smartPlugsOn = false;
        room.powerDrawKw = 0.4;
        room.ecoSavingsKwh += (prevDraw - 0.4) * 2;
        totalKwSaved += prevDraw - 0.4;
        affectedRooms++;
      } else {
        // Enforce Eco temperature setpoint 24.5°C
        if (room.targetTempC < 24) {
          room.targetTempC = 24.5;
          room.hvacMode = 'eco';
        }
      }
    });

    // Mitigate electricity anomaly if active
    const anom = campusAnomalies.find((a) => a.id === 'anom-elec-b204');
    if (anom) anom.status = 'mitigated';

    res.json({
      success: true,
      affectedRooms,
      totalKwSaved: Math.round(totalKwSaved * 10) / 10,
      message: `AI Auto-Optimization applied across ${affectedRooms} unoccupied spaces. Shed ${Math.round(totalKwSaved)} kW instantaneous load.`,
    });
  });

  // 6. Energy Prediction & Forecast
  app.get('/api/campus/prediction', (req: Request, res: Response) => {
    const prediction = generate24HourPrediction();
    res.json(prediction);
  });

  // 7. Water Management Telemetry
  app.get('/api/campus/water', (req: Request, res: Response) => {
    res.json(campusWaterZones);
  });

  // 8. Water Valve Control (e.g. isolate pipe leak)
  app.post('/api/campus/water/valve-control', (req: Request, res: Response) => {
    const { zoneId, valveOpen } = req.body;
    const zone = campusWaterZones.find((z) => z.id === zoneId);

    if (!zone) {
      res.status(404).json({ error: 'Water zone not found' });
      return;
    }

    zone.valveOpen = Boolean(valveOpen);
    if (!zone.valveOpen) {
      zone.currentFlowLpm = 0;
      zone.leakRisk = 'normal';
      // Mark water anomaly resolved if hostel-b
      if (zone.id === 'water-hostel-b') {
        const anom = campusAnomalies.find((a) => a.id === 'anom-water-hostel-b');
        if (anom) anom.status = 'mitigated';
      }
    } else {
      zone.currentFlowLpm = zone.normalFlowLpm;
    }

    res.json({ success: true, zone });
  });

  // 9. Anomalies List & Actions
  app.get('/api/campus/anomalies', (req: Request, res: Response) => {
    res.json(campusAnomalies);
  });

  app.post('/api/campus/anomalies/:id/mitigate', (req: Request, res: Response) => {
    const { id } = req.params;
    const alert = campusAnomalies.find((a) => a.id === id);

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    alert.status = 'mitigated';

    // Execute corresponding IoT action
    if (id === 'anom-elec-b204') {
      const room = campusRooms.find((r) => r.id === 'acad-b204');
      if (room) {
        room.autoControlEnabled = true;
        room.hvacOn = false;
        room.lightingOn = false;
        room.lightingLevel = 0;
        room.fansOn = false;
        room.powerDrawKw = 0.4;
      }
    } else if (id === 'anom-water-hostel-b') {
      const zone = campusWaterZones.find((z) => z.id === 'water-hostel-b');
      if (zone) {
        zone.valveOpen = false;
        zone.currentFlowLpm = 0;
        zone.leakRisk = 'normal';
      }
    }

    res.json({ success: true, alert });
  });

  // 10. Inject Simulated Anomaly / Stress-Test
  app.post('/api/iot/simulate-event', (req: Request, res: Response) => {
    const { type } = req.body; // 'water_pipe_leak' | 'hvac_overrun' | 'reset_all'

    if (type === 'reset_all') {
      campusAnomalies.forEach((a) => (a.status = 'mitigated'));
      res.json({ success: true, message: 'All anomalies reset to nominal.' });
      return;
    }

    if (type === 'water_pipe_leak') {
      const zone = campusWaterZones.find((z) => z.id === 'water-hostel-b');
      if (zone) {
        zone.valveOpen = true;
        zone.currentFlowLpm = 74.5;
        zone.pressureBar = 2.7;
        zone.leakRisk = 'critical_leak';
      }
      const anom = campusAnomalies.find((a) => a.id === 'anom-water-hostel-b');
      if (anom) anom.status = 'active';
      res.json({ success: true, message: 'Simulated high-flow pipe rupture in Hostel Block B.' });
      return;
    }

    if (type === 'hvac_overrun') {
      const room = campusRooms.find((r) => r.id === 'acad-b204');
      if (room) {
        room.autoControlEnabled = false;
        room.hvacOn = true;
        room.hvacMode = 'cool';
        room.targetTempC = 18.5;
        room.lightingOn = true;
        room.lightingLevel = 100;
        room.powerDrawKw = 16.2;
      }
      const anom = campusAnomalies.find((a) => a.id === 'anom-elec-b204');
      if (anom) anom.status = 'active';
      res.json({ success: true, message: 'Simulated after-hours HVAC freeze run in Seminar Hall B204.' });
      return;
    }

    res.status(400).json({ error: 'Invalid event type' });
  });

  // 11. Resource Allocations
  app.get('/api/campus/allocations', (req: Request, res: Response) => {
    res.json(campusAllocations);
  });

  // 12. Reports & Sustainability Analytics
  app.get('/api/campus/reports', (req: Request, res: Response) => {
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';

    const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 7 : 30;

    const report: CampusReport = {
      period,
      generatedAt: new Date().toISOString(),
      totalEnergyKwh: Math.round(11642 * multiplier),
      totalEnergyCostUsd: Math.round(11642 * 0.18 * multiplier),
      solarGeneratedKwh: Math.round(2760 * multiplier),
      solarSelfConsumptionPercent: 94,
      carbonOffsetKg: Math.round(2760 * 0.42 * multiplier),
      waterConsumedM3: Math.round(285.5 * multiplier),
      waterSavedM3: Math.round(48.2 * multiplier),
      averageRoomUtilization: 68.4,
      anomaliesDetectedCount: 3 * (period === 'daily' ? 1 : period === 'weekly' ? 5 : 18),
      anomaliesResolvedCount: 2 * (period === 'daily' ? 1 : period === 'weekly' ? 5 : 17),
      sustainabilityGrade: 'A',
      keyInsights: [
        'Campus rooftop solar arrays supplied 23.7% of daytime electrical demand.',
        'Occupancy-driven Auto-Eco controls prevented 2,310 kWh of idle room cooling.',
        'Nocturnal flow anomaly detection prevented an estimated 18,500 Liters of water loss.',
        'Consolidating 4 low-occupancy lecture classes into centralized hubs saved 42.6 kW peak chiller load.',
      ],
      topConsumingBuildings: [
        { buildingName: 'Student Hostels & Dining', kwh: Math.round(3340 * multiplier), sharePercent: 28.7 },
        { buildingName: 'Science & Research Center', kwh: Math.round(3120 * multiplier), sharePercent: 26.8 },
        { buildingName: 'Engineering & Technology', kwh: Math.round(2450 * multiplier), sharePercent: 21.0 },
        { buildingName: 'Central Academic Block', kwh: Math.round(1840 * multiplier), sharePercent: 15.8 },
        { buildingName: 'University Library', kwh: Math.round(890 * multiplier), sharePercent: 7.7 },
      ],
    };

    res.json(report);
  });

  // 13. Server-Side Gemini AI Campus Audit & Recommendations
  app.post('/api/ai/audit', async (req: Request, res: Response) => {
    const ai = getAIClient();
    const kpis = calculateOverviewKPIs();

    if (!ai) {
      // Fallback deterministic AI audit if API key is not yet present
      const fallbackAudit: AIAuditResponse = {
        summary:
          'Campus energy profile exhibits strong rooftop solar utilization (23.7% generation offset) with high potential in automated occupancy shutdown and water leak containment.',
        sustainabilityScore: 89,
        projectedMonthlySavingsUsd: 14850,
        recommendations: [
          {
            id: 'rec-1',
            priority: 'Immediate',
            title: 'Enforce Automatic Smart Plug & HVAC Sleep in Unoccupied Classrooms',
            description:
              'Data shows Seminar Hall B204 drew 14.6 kW for 45 minutes with 0 occupants. Mandatory 10-minute timeout will curb 13.8 kWh per unoccupied hour.',
            targetZone: 'Central Academic Block',
            annualKwhSavings: 42000,
            annualCostSavingsUsd: 7560,
            paybackMonths: 1,
            implementationComplexity: 'Automated',
          },
          {
            id: 'rec-2',
            priority: 'Immediate',
            title: 'Automated Solenoid Isolation for Hostel Water Risers',
            description:
              'Nocturnal flow algorithms detect 68 L/min off-peak spikes. Automated cutoff valves isolate damaged fixtures without shutting main campus feeds.',
            targetZone: 'Student Hostels & Residential',
            annualKwhSavings: 4800,
            annualCostSavingsUsd: 4920,
            paybackMonths: 3,
            implementationComplexity: 'Low',
          },
          {
            id: 'rec-3',
            priority: 'High',
            title: 'Dynamic Timetable Class Consolidation (Low-Attendance Merger)',
            description:
              'Classrooms running below 20% seating capacity should be grouped into common wings to shutdown auxiliary AHU chillers in vacant building wings.',
            targetZone: 'Campus-wide Classrooms',
            annualKwhSavings: 68000,
            annualCostSavingsUsd: 12240,
            paybackMonths: 0,
            implementationComplexity: 'Automated',
          },
          {
            id: 'rec-4',
            priority: 'Medium',
            title: 'Solar Pre-Cooling Peak Shaving Protocol',
            description:
              'Pre-cool heavy thermal masses (Science lecture halls and Library) between 11:00 AM and 1:30 PM when solar produces a 276 kW surplus, reducing 2:30 PM peak grid demand charges.',
            targetZone: 'Science Center & Library',
            annualKwhSavings: 36000,
            annualCostSavingsUsd: 8600,
            paybackMonths: 2,
            implementationComplexity: 'Medium',
          },
        ],
        aiCommentary:
          'By executing occupancy-linked automated HVAC setbacks and timetable space consolidation, the university can reduce grid demand charges by 18.5% while safeguarding thermal comfort.',
      };
      res.json(fallbackAudit);
      return;
    }

    try {
      const prompt = `You are the Lead Energy & Resource Efficiency AI Architect for a smart university campus.
Analyze the following real-time telemetry snapshot:
- Campus Power Draw: ${kpis.currentPowerDrawKw} kW (Grid: ${kpis.gridDemandKw} kW, Solar: ${kpis.solarGenerationKw} kW)
- Renewable Share: ${kpis.renewablePercentage}%
- Daily Consumption: ${kpis.dailyTotalKwh} kWh ($${kpis.dailyCostUsd})
- Campus Occupancy: ${kpis.totalOccupancy} students/staff
- Water Flow: ${kpis.waterFlowTotalLpm} L/min
- Active Anomalies: ${campusAnomalies.filter((a) => a.status === 'active').map((a) => a.title).join('; ')}

Generate a detailed, actionable campus resource audit. Return strictly a valid JSON object matching this structure:
{
  "summary": "string (2-3 sentences)",
  "sustainabilityScore": number (0-100),
  "projectedMonthlySavingsUsd": number,
  "recommendations": [
    {
      "id": "rec-1",
      "priority": "Immediate" | "High" | "Medium",
      "title": "string",
      "description": "string",
      "targetZone": "string",
      "annualKwhSavings": number,
      "annualCostSavingsUsd": number,
      "paybackMonths": number,
      "implementationComplexity": "Automated" | "Low" | "Medium" | "High"
    }
  ],
  "aiCommentary": "string (actionable executive advice)"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed: AIAuditResponse = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini Audit live call issue, falling back to heuristic audit model:', err.message);
      // Graceful fallback audit
      res.json({
        summary:
          'Campus energy telemetry indicates peak demand is well-buffered by 276 kW solar array, but off-peak classroom HVAC and nocturnal hostel water leakage represent $14,850/month in recoverable waste.',
        sustainabilityScore: 89,
        projectedMonthlySavingsUsd: 14850,
        recommendations: [
          {
            id: 'rec-1',
            priority: 'Immediate',
            title: 'Enforce Automatic Smart Plug & HVAC Sleep in Unoccupied Classrooms',
            description:
              'Data shows Seminar Hall B204 drew 14.6 kW for 45 minutes with 0 occupants. Mandatory 10-minute timeout will curb 13.8 kWh per unoccupied hour.',
            targetZone: 'Central Academic Block',
            annualKwhSavings: 42000,
            annualCostSavingsUsd: 7560,
            paybackMonths: 1,
            implementationComplexity: 'Automated',
          },
          {
            id: 'rec-2',
            priority: 'Immediate',
            title: 'Automated Solenoid Isolation for Hostel Water Risers',
            description:
              'Nocturnal flow algorithms detect 68 L/min off-peak spikes. Automated cutoff valves isolate damaged fixtures without shutting main campus feeds.',
            targetZone: 'Student Hostels & Residential',
            annualKwhSavings: 4800,
            annualCostSavingsUsd: 4920,
            paybackMonths: 3,
            implementationComplexity: 'Low',
          },
          {
            id: 'rec-3',
            priority: 'High',
            title: 'Dynamic Timetable Class Consolidation (Low-Attendance Merger)',
            description:
              'Classrooms running below 20% seating capacity should be grouped into common wings to shutdown auxiliary AHU chillers in vacant building wings.',
            targetZone: 'Campus-wide Classrooms',
            annualKwhSavings: 68000,
            annualCostSavingsUsd: 12240,
            paybackMonths: 0,
            implementationComplexity: 'Automated',
          },
          {
            id: 'rec-4',
            priority: 'Medium',
            title: 'Solar Pre-Cooling Peak Shaving Protocol',
            description:
              'Pre-cool heavy thermal masses (Science lecture halls and Library) between 11:00 AM and 1:30 PM when solar produces a 276 kW surplus, reducing 2:30 PM peak grid demand charges.',
            targetZone: 'Science Center & Library',
            annualKwhSavings: 36000,
            annualCostSavingsUsd: 8600,
            paybackMonths: 2,
            implementationComplexity: 'Medium',
          },
        ],
        aiCommentary:
          'By executing occupancy-linked automated HVAC setbacks and timetable space consolidation, the university can reduce grid demand charges by 18.5% while safeguarding student thermal comfort.',
      });
    }
  });

  // 14. Server-Side Gemini Anomaly Diagnostic & Root Cause Explanation
  app.post('/api/ai/explain-anomaly', async (req: Request, res: Response) => {
    const { anomalyId } = req.body;
    const alert = campusAnomalies.find((a) => a.id === anomalyId);

    if (!alert) {
      res.status(404).json({ error: 'Anomaly not found' });
      return;
    }

    const ai = getAIClient();
    if (!ai) {
      res.json({
        rootCause: alert.aiRootCause || 'Manual override switch bypassed sensor timeouts.',
        mitigationSteps: [
          'Verify PIR sensor and CCTV optical count accuracy.',
          'Execute remote command to reset BACnet actuator to Eco-Mode.',
          'Alert building technician to check physical bypass relay.',
        ],
        estimatedWasteCostUsd: 58.4,
        confidenceScore: 94,
      });
      return;
    }

    try {
      const prompt = `You are a Building Management Systems (BMS) and IoT fault diagnosis AI.
Diagnose this anomaly:
- Title: ${alert.title}
- Zone: ${alert.zoneName} (${alert.buildingId})
- Measured Value: ${alert.measuredValue}
- Expected Value: ${alert.expectedValue}
- Resource: ${alert.resourceType}
- Severity: ${alert.severity}
- Details: ${alert.description}

Provide a deep technical diagnosis. Return strictly a JSON object:
{
  "rootCause": "string (technical explanation of fault)",
  "mitigationSteps": ["step 1", "step 2", "step 3"],
  "estimatedWasteCostUsd": number,
  "confidenceScore": number (0-100)
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini Anomaly Diagnosis live call issue, falling back:', err.message);
      res.json({
        rootCause: alert.aiRootCause || 'Manual override switch bypassed sensor timeouts.',
        mitigationSteps: [
          'Verify PIR sensor and CCTV optical occupancy count accuracy.',
          'Execute remote command to reset BACnet actuator to Eco-Mode.',
          'Alert building maintenance technician to inspect physical bypass relay.',
        ],
        estimatedWasteCostUsd: 58.4,
        confidenceScore: 92,
      });
    }
  });

  // 15. Server-Side Gemini Interactive Campus Facility Copilot
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { question } = req.body;
    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const ai = getAIClient();
    const kpis = calculateOverviewKPIs();

    if (!ai) {
      res.json({
        reply: `Campus System Status: Current grid power draw is ${kpis.currentPowerDrawKw} kW with ${kpis.solarGenerationKw} kW active solar generation (${kpis.renewablePercentage}% renewable). Active anomalies: ${kpis.activeAnomaliesCount}. Tip: Enabling Automated Eco-Mode on all unoccupied rooms saves ~380 kWh daily.`,
      });
      return;
    }

    try {
      const prompt = `You are the AI Campus Facility & Energy Copilot.
Current Telemetry:
- Instantaneous Power: ${kpis.currentPowerDrawKw} kW (Solar: ${kpis.solarGenerationKw} kW, Grid: ${kpis.gridDemandKw} kW)
- Water Flow: ${kpis.waterFlowTotalLpm} L/min (Daily: ${kpis.waterDailyM3} m³)
- Campus Occupancy: ${kpis.totalOccupancy} / ${kpis.campusCapacity}
- Active Alerts: ${campusAnomalies.filter((a) => a.status === 'active').length}
- Buildings: Engineering (142 kW), Science (188 kW), Academic (98 kW), Library (46 kW), Hostels (165 kW).

User Query: "${question}"

Provide a concise, professional, data-backed response with actionable advice.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      res.json({ reply: response.text });
    } catch (err: any) {
      console.warn('Gemini Copilot live call issue, falling back:', err.message);
      res.json({
        reply: `Regarding "${question}": Campus telemetry shows electricity demand is at ${kpis.currentPowerDrawKw} kW (37% solar offset) and water consumption at ${kpis.waterFlowTotalLpm} L/min. To optimize performance, we recommend: 1) Executing dynamic class consolidation for rooms with under 25% attendance, 2) Ensuring Hostel Block B sector valves remain isolated until plumbing repairs finish, and 3) Utilizing pre-cooling in the Science Center between 11:00 AM and 1:30 PM to minimize 14:30 peak tariff charges.`,
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Vite Middleware Setup
  // ---------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Campus Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
