import { 
  users, type User, type InsertUser,
  vehicles, type Vehicle, type InsertVehicle,
  detections, type Detection, type InsertDetection,
  alerts, type Alert, type InsertAlert,
  telemetryData, type Telemetry, type InsertTelemetry,
  routes, type Route, type InsertRoute,
  riskZones, type RiskZone, type InsertRiskZone,
  vehicleAssignments, type VehicleAssignment, type InsertVehicleAssignment
} from "@shared/schema";
import bcrypt from 'bcryptjs';

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  getVehicleByVehicleId(vehicleId: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicleStatus(id: number, status: string): Promise<Vehicle | undefined>;
  
  // Detections
  getDetections(limit?: number): Promise<Detection[]>;
  getDetectionsByVehicleId(vehicleId: string, limit?: number): Promise<Detection[]>;
  createDetection(detection: InsertDetection): Promise<Detection>;
  
  // Alerts
  getAlerts(limit?: number): Promise<Alert[]>;
  getAlertsByVehicleId(vehicleId: string, limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number): Promise<Alert | undefined>;
  
  // Telemetry
  getTelemetryData(limit?: number): Promise<Telemetry[]>;
  getTelemetryByVehicleId(vehicleId: string): Promise<Telemetry | undefined>;
  createTelemetryData(telemetry: InsertTelemetry): Promise<Telemetry>;
  updateTelemetryData(vehicleId: string, telemetry: Partial<InsertTelemetry>): Promise<Telemetry | undefined>;
  
  // Routes
  getRoutes(): Promise<Route[]>;
  getRoute(id: number): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  
  // Risk Zones
  getRiskZones(): Promise<RiskZone[]>;
  getRiskZone(id: number): Promise<RiskZone | undefined>;
  createRiskZone(riskZone: InsertRiskZone): Promise<RiskZone>;
  
  // Vehicle Assignments
  getVehicleAssignments(): Promise<VehicleAssignment[]>;
  getVehicleAssignmentsByUserId(userId: number): Promise<VehicleAssignment[]>;
  getVehicleAssignmentsByVehicleId(vehicleId: string): Promise<VehicleAssignment[]>;
  createVehicleAssignment(assignment: InsertVehicleAssignment): Promise<VehicleAssignment>;
  updateVehicleAssignment(id: number, isActive: boolean): Promise<VehicleAssignment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private vehicles: Map<number, Vehicle>;
  private detectionsList: Map<number, Detection>;
  private alertsList: Map<number, Alert>;
  private telemetryDataList: Map<number, Telemetry>;
  private routesList: Map<number, Route>;
  private riskZonesList: Map<number, RiskZone>;
  private vehicleAssignmentsList: Map<number, VehicleAssignment>;
  
  private userId: number;
  private vehicleId: number;
  private detectionId: number;
  private alertId: number;
  private telemetryId: number;
  private routeId: number;
  private riskZoneId: number;
  private vehicleAssignmentId: number;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.detectionsList = new Map();
    this.alertsList = new Map();
    this.telemetryDataList = new Map();
    this.routesList = new Map();
    this.riskZonesList = new Map();
    this.vehicleAssignmentsList = new Map();
    
    this.userId = 1;
    this.vehicleId = 1;
    this.detectionId = 1;
    this.alertId = 1;
    this.telemetryId = 1;
    this.routeId = 1;
    this.riskZoneId = 1;
    this.vehicleAssignmentId = 1;
    
    // We don't initialize here anymore since we moved to async initialization
    // The initialization will be explicitly called from server/index.ts
  }

  // Make this public so it can be reinitialized if needed
  async initializeData() {
    // Clear existing data to prevent duplicates
    this.users.clear();
    
    // Create sample users with properly hashed passwords
    const salt = await bcrypt.genSalt(10);
    
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('user123', salt);
    
    // Admin user
    const adminUser: User = {
      id: this.userId++,
      username: "admin",
      password: adminPassword,
      role: "admin",
      name: "John Doe"
    };
    this.users.set(adminUser.id, adminUser);
    
    // Regular user
    const regularUser: User = {
      id: this.userId++,
      username: "user1",
      password: userPassword,
      role: "user",
      name: "Jane Smith"
    };
    this.users.set(regularUser.id, regularUser);
    
    // Create sample vehicles
    const vehicleIds = ["CIT-0118", "CIT-0231", "CIT-0342", "CIT-0105"];
    const divisions = ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape"];
    
    for (let i = 0; i < vehicleIds.length; i++) {
      this.createVehicle({
        vehicleId: vehicleIds[i],
        name: `Cash Transport ${i + 1}`,
        division: divisions[i % divisions.length],
        status: "active"
      });
      
      // Create sample telemetry data for each vehicle
      this.createTelemetryData({
        vehicleId: vehicleIds[i],
        engineStatus: "Running",
        fuelLevel: 70 + Math.floor(Math.random() * 20),
        speed: 30 + Math.floor(Math.random() * 30),
        doorStatus: "Secured",
        gpsSignal: "Strong",
        cellularNetwork: i % 2 === 0 ? "Strong" : "Limited",
        vaultStatus: "Secured",
        obdStatus: "Connected",
        latitude: -26.2041 + (Math.random() - 0.5) * 0.1,
        longitude: 28.0473 + (Math.random() - 0.5) * 0.1
      });
    }
    
    // Create sample routes
    this.createRoute({
      name: "Sandton to Pretoria",
      startLocation: "Sandton",
      endLocation: "Pretoria",
      distance: 47,
      riskLevel: "low",
      metadata: {}
    });
    
    this.createRoute({
      name: "Johannesburg CBD to Soweto",
      startLocation: "Johannesburg CBD",
      endLocation: "Soweto",
      distance: 23,
      riskLevel: "medium",
      metadata: {}
    });
    
    this.createRoute({
      name: "Durban Central to Phoenix",
      startLocation: "Durban Central",
      endLocation: "Phoenix",
      distance: 25,
      riskLevel: "high",
      metadata: {}
    });
    
    // Create sample risk zones
    this.createRiskZone({
      name: "Johannesburg CBD Hotspot",
      latitude: -26.2041,
      longitude: 28.0473,
      radius: 1000,
      riskLevel: "high",
      description: "High crime area with recent incidents",
      metadata: {
        incidents: 17,
        lastUpdated: new Date().toISOString(),
        securityForces: true,
        vehicleCount: 3,
        historicalIncidents: [
          { date: "2024-02-20T08:30:00Z", type: "armed_robbery", severity: "high" },
          { date: "2024-01-15T14:20:00Z", type: "hijacking", severity: "high" }
        ],
        threatSources: ["organized crime groups", "opportunistic theft"]
      }
    });
    
    this.createRiskZone({
      name: "N1 Highway Risk Zone",
      latitude: -25.7461,
      longitude: 28.1881,
      radius: 2000,
      riskLevel: "medium",
      description: "Medium risk area on N1 highway",
      metadata: {
        incidents: 8,
        lastUpdated: new Date().toISOString(),
        securityForces: false,
        vehicleCount: 2,
        historicalIncidents: [
          { date: "2024-03-10T11:45:00Z", type: "attempted_hijacking", severity: "medium" }
        ]
      }
    });
    
    this.createRiskZone({
      name: "Soweto Urban Area",
      latitude: -26.2485,
      longitude: 27.8546,
      radius: 3000,
      riskLevel: "medium",
      description: "Urban area with moderate risk",
      metadata: {
        incidents: 5,
        lastUpdated: new Date().toISOString(),
        vehicleCount: 1
      }
    });
    
    this.createRiskZone({
      name: "Pretoria East Suburbs",
      latitude: -25.7700,
      longitude: 28.3000,
      radius: 1500,
      riskLevel: "low",
      description: "Low risk suburban area",
      metadata: {
        incidents: 2,
        lastUpdated: new Date().toISOString(),
        securityForces: true
      }
    });
    
    this.createRiskZone({
      name: "Alexandra Township Critical Zone",
      latitude: -26.1068,
      longitude: 28.1083,
      radius: 800,
      riskLevel: "critical",
      description: "High-density area with critical risk level",
      metadata: {
        incidents: 25,
        lastUpdated: new Date().toISOString(),
        securityForces: true,
        vehicleCount: 0,
        historicalIncidents: [
          { date: "2024-03-22T09:15:00Z", type: "armed_robbery", severity: "critical" },
          { date: "2024-03-15T16:30:00Z", type: "vehicle_attack", severity: "critical" },
          { date: "2024-02-28T14:20:00Z", type: "explosive_device", severity: "critical" }
        ],
        threatSources: ["organized crime groups", "local gangs", "insider threats"]
      }
    });
    
    // Create sample detections
    this.createDetection({
      vehicleId: "CIT-0118",
      type: "weapon",
      confidence: 0.982,
      imageData: null,
      metadata: {}
    });
    
    this.createDetection({
      vehicleId: "CIT-0118",
      type: "face",
      confidence: 0.895,
      imageData: null,
      metadata: {}
    });
    
    this.createDetection({
      vehicleId: "CIT-0342",
      type: "license_plate",
      confidence: 0.957,
      imageData: null,
      metadata: {}
    });
    
    // Create sample alerts
    this.createAlert({
      vehicleId: "CIT-0118",
      type: "weapon_detected",
      message: "Potential weapon detected",
      severity: "critical",
      metadata: { location: "N1 Highway" }
    });
    
    this.createAlert({
      vehicleId: "CIT-0342",
      type: "entering_risk_zone",
      message: "Entering high risk area",
      severity: "warning",
      metadata: { zone: "Johannesburg CBD Hotspot" }
    });
    
    // Create sample vehicle assignments
    this.createVehicleAssignment({
      userId: 1, // Admin user
      vehicleId: "CIT-0118",
      isActive: true
    });
    
    this.createVehicleAssignment({
      userId: 2, // Regular user
      vehicleId: "CIT-0231",
      isActive: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'user', // Default to 'user' if role is not provided
      name: insertUser.name || '' // Default to empty string if name is not provided 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }
  
  async getVehicle(id: number): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }
  
  async getVehicleByVehicleId(vehicleId: string): Promise<Vehicle | undefined> {
    return Array.from(this.vehicles.values()).find(
      (vehicle) => vehicle.vehicleId === vehicleId
    );
  }
  
  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = this.vehicleId++;
    const now = new Date();
    const vehicle: Vehicle = { 
      ...insertVehicle, 
      id, 
      lastUpdated: now,
      status: insertVehicle.status || 'unknown' // Default status if not provided
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }
  
  async updateVehicleStatus(id: number, status: string): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;
    
    const now = new Date();
    const updatedVehicle = { 
      ...vehicle, 
      status,
      lastUpdated: now
    };
    
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }
  
  // Detection methods
  async getDetections(limit: number = 10): Promise<Detection[]> {
    const detections = Array.from(this.detectionsList.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return detections;
  }
  
  async getDetectionsByVehicleId(vehicleId: string, limit: number = 10): Promise<Detection[]> {
    const detections = Array.from(this.detectionsList.values())
      .filter(detection => detection.vehicleId === vehicleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return detections;
  }
  
  async createDetection(insertDetection: InsertDetection): Promise<Detection> {
    const id = this.detectionId++;
    const now = new Date();
    const detection: Detection = {
      ...insertDetection,
      id,
      timestamp: now,
      imageData: insertDetection.imageData || null,
      metadata: insertDetection.metadata || {}
    };
    
    this.detectionsList.set(id, detection);
    return detection;
  }
  
  // Alert methods
  async getAlerts(limit: number = 10): Promise<Alert[]> {
    const alerts = Array.from(this.alertsList.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return alerts;
  }
  
  async getAlertsByVehicleId(vehicleId: string, limit: number = 10): Promise<Alert[]> {
    const alerts = Array.from(this.alertsList.values())
      .filter(alert => alert.vehicleId === vehicleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return alerts;
  }
  
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const now = new Date();
    const alert: Alert = {
      ...insertAlert,
      id,
      timestamp: now,
      acknowledged: false,
      severity: insertAlert.severity || 'info', // Default severity
      metadata: insertAlert.metadata || {}
    };
    
    this.alertsList.set(id, alert);
    return alert;
  }
  
  async acknowledgeAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alertsList.get(id);
    if (!alert) return undefined;
    
    const acknowledgedAlert = {
      ...alert,
      acknowledged: true
    };
    
    this.alertsList.set(id, acknowledgedAlert);
    return acknowledgedAlert;
  }
  
  // Telemetry methods
  async getTelemetryData(limit: number = 10): Promise<Telemetry[]> {
    const telemetryData = Array.from(this.telemetryDataList.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
    
    return telemetryData;
  }
  
  async getTelemetryByVehicleId(vehicleId: string): Promise<Telemetry | undefined> {
    return Array.from(this.telemetryDataList.values())
      .filter(telemetry => telemetry.vehicleId === vehicleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  }
  
  async createTelemetryData(insertTelemetry: InsertTelemetry): Promise<Telemetry> {
    const id = this.telemetryId++;
    const now = new Date();
    const telemetry: Telemetry = {
      ...insertTelemetry,
      id,
      timestamp: now,
      // Set defaults for optional fields
      engineStatus: insertTelemetry.engineStatus || null,
      fuelLevel: insertTelemetry.fuelLevel || null,
      speed: insertTelemetry.speed || null,
      doorStatus: insertTelemetry.doorStatus || null,
      gpsSignal: insertTelemetry.gpsSignal || null,
      cellularNetwork: insertTelemetry.cellularNetwork || null,
      vaultStatus: insertTelemetry.vaultStatus || null,
      obdStatus: insertTelemetry.obdStatus || null
    };
    
    this.telemetryDataList.set(id, telemetry);
    return telemetry;
  }
  
  async updateTelemetryData(vehicleId: string, telemetryUpdate: Partial<InsertTelemetry>): Promise<Telemetry | undefined> {
    const telemetry = await this.getTelemetryByVehicleId(vehicleId);
    if (!telemetry) return undefined;
    
    const now = new Date();
    const updatedTelemetry: Telemetry = {
      ...telemetry,
      ...telemetryUpdate,
      vehicleId,
      timestamp: now
    };
    
    this.telemetryDataList.set(telemetry.id, updatedTelemetry);
    return updatedTelemetry;
  }
  
  // Route methods
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routesList.values());
  }
  
  async getRoute(id: number): Promise<Route | undefined> {
    return this.routesList.get(id);
  }
  
  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = this.routeId++;
    const route: Route = {
      ...insertRoute,
      id,
      riskLevel: insertRoute.riskLevel || 'low', // Default risk level
      metadata: insertRoute.metadata || {}
    };
    
    this.routesList.set(id, route);
    return route;
  }
  
  // Risk Zone methods
  async getRiskZones(): Promise<RiskZone[]> {
    return Array.from(this.riskZonesList.values());
  }
  
  async getRiskZone(id: number): Promise<RiskZone | undefined> {
    return this.riskZonesList.get(id);
  }
  
  async createRiskZone(insertRiskZone: InsertRiskZone): Promise<RiskZone> {
    const id = this.riskZoneId++;
    const now = new Date();
    const riskZone: RiskZone = {
      ...insertRiskZone,
      id,
      description: insertRiskZone.description || null, // Default to null if description not provided
      metadata: insertRiskZone.metadata || {},
      createdAt: now,
      updatedAt: now
    };
    
    this.riskZonesList.set(id, riskZone);
    return riskZone;
  }

  // Vehicle Assignment methods
  async getVehicleAssignments(): Promise<VehicleAssignment[]> {
    return Array.from(this.vehicleAssignmentsList.values());
  }
  
  async getVehicleAssignmentsByUserId(userId: number): Promise<VehicleAssignment[]> {
    return Array.from(this.vehicleAssignmentsList.values())
      .filter(assignment => assignment.userId === userId && assignment.isActive);
  }
  
  async getVehicleAssignmentsByVehicleId(vehicleId: string): Promise<VehicleAssignment[]> {
    return Array.from(this.vehicleAssignmentsList.values())
      .filter(assignment => assignment.vehicleId === vehicleId && assignment.isActive);
  }
  
  async createVehicleAssignment(insertAssignment: InsertVehicleAssignment): Promise<VehicleAssignment> {
    const id = this.vehicleAssignmentId++;
    const now = new Date();
    const assignment: VehicleAssignment = {
      ...insertAssignment,
      id,
      assignedAt: now,
      isActive: insertAssignment.isActive !== undefined ? insertAssignment.isActive : true
    };
    
    this.vehicleAssignmentsList.set(id, assignment);
    return assignment;
  }
  
  async updateVehicleAssignment(id: number, isActive: boolean): Promise<VehicleAssignment | undefined> {
    const assignment = this.vehicleAssignmentsList.get(id);
    if (!assignment) return undefined;
    
    const updatedAssignment: VehicleAssignment = {
      ...assignment,
      isActive
    };
    
    this.vehicleAssignmentsList.set(id, updatedAssignment);
    return updatedAssignment;
  }
}

export const storage = new MemStorage();
