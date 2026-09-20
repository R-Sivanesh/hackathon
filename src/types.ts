export type BuildingId = 'engineering' | 'science' | 'academic' | 'library' | 'hostels';

export interface Building {
  id: BuildingId;
  name: string;
  category: 'Laboratories' | 'Research' | 'Classrooms' | 'Commons' | 'Residential';
  totalAreaSqFt: number;
  currentPowerKw: number;
  baselinePowerKw: number;
  dailyConsumptionKwh: number;
  solarGenerationKw: number;
  occupancyCount: number;
  totalCapacity: number;
  waterFlowLpm: number;
  dailyWaterM3: number;
  status: 'optimal' | 'warning' | 'critical';
  roomCount: number;
  activeAlerts: number;
}

export interface RoomSensorData {
  id: string;
  buildingId: BuildingId;
  name: string;
  type: 'Classroom' | 'Lab' | 'Auditorium' | 'Library Hall' | 'Hostel Wing';
  capacity: number;
  currentOccupancy: number;
  occupancyDetected: boolean;
  temperatureC: number;
  targetTempC: number;
  humidityPercent: number;
  luxLevel: number;
  co2Ppm: number;
  powerDrawKw: number;
  // Automated appliance controls
  hvacOn: boolean;
  hvacMode: 'cool' | 'heat' | 'eco' | 'off';
  lightingOn: boolean;
  lightingLevel: number; // 0-100%
  fansOn: boolean;
  smartPlugsOn: boolean;
  autoControlEnabled: boolean;
  lastMotionMinutesAgo: number;
  ecoSavingsKwh: number;
}

export interface EnergyPredictionPoint {
  timeLabel: string; // e.g. "08:00"
  timestamp: string;
  actualKw: number | null;
  predictedKw: number;
  optimizedKw: number; // with AI auto-controls enabled
  upperBoundKw: number;
  lowerBoundKw: number;
  solarKw: number;
  outdoorTempC: number;
  expectedOccupancyPercent: number;
}

export interface PredictionSummary {
  modelName: string;
  modelAccuracyPercent: number;
  maeKw: number;
  rmseKw: number;
  peakDemandForecastKw: number;
  peakHour: string;
  forecastedTotalDailyKwh: number;
  baselineDailyKwh: number;
  estimatedDailySavingsKwh: number;
  estimatedCostSavingsUsd: number;
  series: EnergyPredictionPoint[];
}

export interface WaterZoneData {
  id: string;
  zoneName: string;
  buildingId: BuildingId;
  currentFlowLpm: number;
  normalFlowLpm: number;
  pressureBar: number;
  nominalPressureBar: number;
  tankLevelPercent: number;
  leakRisk: 'normal' | 'suspected' | 'critical_leak';
  valveOpen: boolean;
  dailyConsumptionLiters: number;
  recycledGreywaterPercent: number;
}

export interface AnomalyAlert {
  id: string;
  timestamp: string;
  buildingId: BuildingId;
  zoneName: string;
  resourceType: 'electricity' | 'water' | 'hvac' | 'occupancy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  measuredValue: string;
  expectedValue: string;
  wasteRatePerHour: string;
  status: 'active' | 'investigating' | 'mitigated';
  aiRootCause?: string;
  recommendedAction: string;
  autoMitigationAvailable: boolean;
}

export interface ResourceAllocationItem {
  id: string;
  roomName: string;
  buildingId: BuildingId;
  currentActivity: string;
  scheduledCapacity: number;
  actualAttendance: number;
  utilizationRate: number; // 0-100%
  recommendationType: 'merge' | 'relocate' | 'power_down' | 'optimal';
  suggestedAction: string;
  estimatedPowerSavedKw: number;
  suggestedTargetRoom?: string;
}

export interface CampusOverviewKPIs {
  currentPowerDrawKw: number;
  gridDemandKw: number;
  solarGenerationKw: number;
  renewablePercentage: number;
  dailyTotalKwh: number;
  dailyCostUsd: number;
  dailyCarbonKg: number;
  totalOccupancy: number;
  campusCapacity: number;
  waterFlowTotalLpm: number;
  waterDailyM3: number;
  activeAnomaliesCount: number;
  automatedSavingsTodayKwh: number;
  automatedSavingsTodayUsd: number;
  systemEfficiencyScore: number; // 0-100
}

export interface CampusReport {
  period: 'daily' | 'weekly' | 'monthly';
  generatedAt: string;
  totalEnergyKwh: number;
  totalEnergyCostUsd: number;
  solarGeneratedKwh: number;
  solarSelfConsumptionPercent: number;
  carbonOffsetKg: number;
  waterConsumedM3: number;
  waterSavedM3: number;
  averageRoomUtilization: number;
  anomaliesDetectedCount: number;
  anomaliesResolvedCount: number;
  sustainabilityGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
  keyInsights: string[];
  topConsumingBuildings: { buildingName: string; kwh: number; sharePercent: number }[];
}

export interface AIAuditResponse {
  summary: string;
  sustainabilityScore: number;
  projectedMonthlySavingsUsd: number;
  recommendations: Array<{
    id: string;
    priority: 'Immediate' | 'High' | 'Medium';
    title: string;
    description: string;
    targetZone: string;
    annualKwhSavings: number;
    annualCostSavingsUsd: number;
    paybackMonths: number;
    implementationComplexity: 'Automated' | 'Low' | 'Medium' | 'High';
  }>;
  aiCommentary: string;
}
