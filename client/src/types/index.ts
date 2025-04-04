export interface User {
  id: number;
  username: string;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt?: string;
}

export interface Vehicle {
  id: number;
  vehicleId: string;
  name: string;
  division: string;
  status: string;
  lastUpdated: string;
}

export interface Detection {
  id: number;
  vehicleId: string;
  type: string;
  confidence: number;
  timestamp: string;
  imageData: string | null;
  metadata: Record<string, any>;
}

export interface Alert {
  id: number;
  vehicleId: string;
  type: string;
  message: string;
  severity: string;
  timestamp: string;
  acknowledged: boolean;
  metadata: Record<string, any>;
}

export interface Telemetry {
  id: number;
  vehicleId: string;
  engineStatus?: string;
  fuelLevel?: number;
  speed?: number;
  doorStatus?: string;
  gpsSignal?: string;
  cellularNetwork?: string;
  vaultStatus?: string;
  obdStatus?: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  // Emotion and stress analysis
  driverEmotion?: string;
  stressLevel?: number;
  panicProbability?: number;
  guardFearLevel?: number;
}

export interface Route {
  id: number;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  riskLevel: string;
  metadata: {
    via?: string;
    [key: string]: any;
  };
}

export interface RiskZone {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  riskLevel: string;
  description?: string;
}
