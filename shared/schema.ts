import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define metadata schemas for stronger typing
export const detectionMetadataSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
  additionalImages: z.array(z.string()).optional(),
  cameraId: z.string().optional(),
  
  // License plate specific fields
  licensePlate: z.string().optional(),
  licensePlateConfidence: z.number().optional(),
  province: z.string().optional(),
  plateImageHash: z.string().optional(),
  plateDetectedLocations: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    vehicleId: z.string().optional()
  })).optional(),
  
  // Facial recognition specific fields
  faceId: z.string().optional(),
  faceConfidence: z.number().optional(),
  personName: z.string().optional(),
  personCategory: z.enum(['civilian', 'suspect', 'known_criminal', 'security_personnel']).optional(),
  faceImageHash: z.string().optional(),
  faceDetectedLocations: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    vehicleId: z.string().optional()
  })).optional(),
  
  // Voice analysis specific fields
  voiceId: z.string().optional(),
  detectedEmotion: z.enum(['normal', 'stressed', 'panic', 'fear', 'anger', 'calm']).optional(),
  stressLevel: z.number().optional(), // 0-100 scale
  panicProbability: z.number().optional(), // 0-100 scale
  audioHash: z.string().optional(),
  speechToText: z.string().optional(),
  keywordsDetected: z.array(z.string()).optional(),
  
  // Emotion detection specific fields
  primaryEmotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted']).optional(),
  arousalLevel: z.number().optional(), // 0-100 scale
  valenceLevel: z.number().optional(), // 0-100 scale
  faceCount: z.number().optional(),
  anomalyScore: z.number().optional(), // 0-100 scale
  anomalyDetected: z.boolean().optional(),
  personDetails: z.array(z.object({
    position: z.enum(['driver', 'passenger', 'unspecified']).optional(),
    faceBoundingBox: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }).optional()
  })).optional(),
  
  // For all detection types
  objectBoundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }).optional(),
  
  // Proximity data for stationary vehicles and nearby threats
  isStationary: z.boolean().optional(),
  stationaryDuration: z.number().optional(), // in seconds
  nearbyVehicles: z.array(z.object({
    id: z.string(),
    distance: z.number(), // in meters
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    detectedAt: z.string()
  })).optional(),
  
  // Possible route segments for the vehicle
  possibleRoutes: z.array(z.object({
    startCoordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    endCoordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    distance: z.number() // in meters
  })).optional(),
}).passthrough();

export const alertMetadataSchema = z.object({
  detectionId: z.number().optional(),
  evidenceId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  risk: z.number().optional(), // 0-100 risk score
  actionTaken: z.string().optional(),
  
  // For facial recognition alerts
  faceId: z.string().optional(),
  personName: z.string().optional(),
  personCategory: z.enum(['civilian', 'suspect', 'known_criminal', 'security_personnel']).optional(),
  multipleLocations: z.boolean().optional(),
  locations: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    timestamp: z.string(),
    vehicleId: z.string().optional()
  })).optional(),
  
  // For license plate alerts
  licensePlate: z.string().optional(),
  province: z.string().optional(),
  vehicleDescription: z.string().optional(),
  
  // For proximity alerts
  isStationary: z.boolean().optional(),
  stationaryDuration: z.number().optional(), // seconds
  nearbyVehicleCount: z.number().optional(),
  nearbyVehicleIds: z.array(z.string()).optional(),
  proximityRadius: z.number().optional(), // meters
  
  // For voice analysis alerts
  voiceId: z.string().optional(),
  detectedEmotion: z.enum(['normal', 'stressed', 'panic', 'fear', 'anger', 'calm']).optional(),
  stressLevel: z.number().optional(),
  panicProbability: z.number().optional(),
  speechToText: z.string().optional(),
  keywordsDetected: z.array(z.string()).optional(),
  audioTimestamp: z.string().optional(),
  
  // For emotion detection alerts
  primaryEmotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'fearful', 'surprised', 'disgusted']).optional(),
  arousalLevel: z.number().optional(),
  valenceLevel: z.number().optional(),
  anomalyScore: z.number().optional(),
  faceCount: z.number().optional(),
  consecutiveAnomalies: z.number().optional(),
  
  // For possible routes
  possibleRouteCount: z.number().optional(),
  suggestedEvasionRoute: z.object({
    startCoordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    endCoordinates: z.object({
      latitude: z.number(),
      longitude: z.number()
    }),
    distance: z.number(), // meters
    estimatedTime: z.number().optional() // seconds
  }).optional(),
}).passthrough();

export const routeMetadataSchema = z.object({
  waypoints: z.array(z.object({
    latitude: z.number(),
    longitude: z.number(),
    name: z.string().optional()
  })).optional(),
  estimatedTime: z.number().optional(), // in minutes
  alternateRoutes: z.number().optional(), 
  riskScore: z.number().optional(), // 0-100 risk score
}).passthrough();

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  name: text("name").notNull(),
});

export const vehicleAssignments = pgTable("vehicle_assignments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  vehicleId: text("vehicle_id").notNull(), // References the vehicleId from vehicles table
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull().unique(),
  name: text("name").notNull(),
  division: text("division").notNull(),
  status: text("status").notNull().default("active"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const detections = pgTable("detections", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull(),
  type: text("type").notNull(), // weapon, face, license_plate
  confidence: real("confidence").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  imageData: text("image_data"), // Base64 encoded image data (optional)
  metadata: jsonb("metadata"), // Additional detection metadata
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("info"), // info, warning, critical
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  acknowledged: boolean("acknowledged").notNull().default(false),
  metadata: jsonb("metadata"), // Additional alert metadata
});

export const telemetryData = pgTable("telemetry_data", {
  id: serial("id").primaryKey(),
  vehicleId: text("vehicle_id").notNull(),
  engineStatus: text("engine_status"),
  fuelLevel: integer("fuel_level"),
  speed: integer("speed"),
  doorStatus: text("door_status"),
  gpsSignal: text("gps_signal"),
  cellularNetwork: text("cellular_network"),
  vaultStatus: text("vault_status"),
  obdStatus: text("obd_status"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  // Voice and emotion analysis fields
  driverEmotion: text("driver_emotion"), // neutral, stressed, panic, calm, angry
  stressLevel: integer("stress_level"), // 0-100
  panicProbability: integer("panic_probability"), // 0-100
  guardFearLevel: integer("guard_fear_level"), // 0-100
});

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startLocation: text("start_location").notNull(),
  endLocation: text("end_location").notNull(),
  distance: integer("distance").notNull(), // in kilometers
  riskLevel: text("risk_level").notNull().default("low"), // low, medium, high
  metadata: jsonb("metadata"), // Additional route metadata
});

export const riskZoneMetadataSchema = z.object({
  incidents: z.number().optional(), // Number of incidents in this zone
  lastUpdated: z.string().optional(), // Timestamp when risk level was last updated
  securityForces: z.boolean().optional(), // Whether security forces are present in this zone
  vehicleCount: z.number().optional(), // Number of vehicles currently in zone
  historicalIncidents: z.array(z.object({
    date: z.string(),
    type: z.string(),
    severity: z.string()
  })).optional(),
  relatedAlerts: z.array(z.number()).optional(), // Alert IDs related to this zone
  threatSources: z.array(z.string()).optional(), // Known threat sources in this area
}).passthrough();

export const riskZones = pgTable("risk_zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius").notNull(), // in meters
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  description: text("description"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).pick({
  vehicleId: true,
  name: true,
  division: true,
  status: true,
});

export const insertDetectionSchema = createInsertSchema(detections)
  .pick({
    vehicleId: true,
    type: true,
    confidence: true,
    imageData: true,
    metadata: true,
  })
  .extend({
    metadata: detectionMetadataSchema.optional()
  });

export const insertAlertSchema = createInsertSchema(alerts)
  .pick({
    vehicleId: true,
    type: true,
    message: true,
    severity: true,
    metadata: true,
  })
  .extend({
    metadata: alertMetadataSchema.optional()
  });

export const insertTelemetrySchema = createInsertSchema(telemetryData).pick({
  vehicleId: true,
  engineStatus: true,
  fuelLevel: true,
  speed: true,
  doorStatus: true,
  gpsSignal: true,
  cellularNetwork: true,
  vaultStatus: true,
  obdStatus: true,
  latitude: true,
  longitude: true,
  driverEmotion: true,
  stressLevel: true,
  panicProbability: true,
  guardFearLevel: true,
});

export const insertRouteSchema = createInsertSchema(routes)
  .pick({
    name: true,
    startLocation: true,
    endLocation: true,
    distance: true,
    riskLevel: true,
    metadata: true,
  })
  .extend({
    metadata: routeMetadataSchema.optional()
  });

export const insertRiskZoneSchema = createInsertSchema(riskZones).pick({
  name: true,
  latitude: true,
  longitude: true,
  radius: true,
  riskLevel: true,
  description: true,
  metadata: true,
}).extend({
  metadata: riskZoneMetadataSchema.optional()
});

export const insertVehicleAssignmentSchema = createInsertSchema(vehicleAssignments).pick({
  userId: true,
  vehicleId: true,
  isActive: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertDetection = z.infer<typeof insertDetectionSchema>;
export type Detection = typeof detections.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export type InsertTelemetry = z.infer<typeof insertTelemetrySchema>;
export type Telemetry = typeof telemetryData.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

export type InsertRiskZone = z.infer<typeof insertRiskZoneSchema>;
export type RiskZone = typeof riskZones.$inferSelect;

export type InsertVehicleAssignment = z.infer<typeof insertVehicleAssignmentSchema>;
export type VehicleAssignment = typeof vehicleAssignments.$inferSelect;
