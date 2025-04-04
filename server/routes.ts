import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer, WebSocket } from "ws";
import { 
  insertUserSchema, 
  insertVehicleSchema, 
  insertDetectionSchema, 
  insertAlertSchema,
  insertTelemetrySchema,
  insertRouteSchema,
  insertRiskZoneSchema,
  insertVehicleAssignmentSchema
} from "@shared/schema";
import { z } from "zod";
import { authenticateToken, requireAdmin, AuthRequest } from "./middleware/auth";
import { authService } from "./services/auth.service";
import { voiceAnalysisService } from "./services/voice.service";
import { emotionDetectionService } from "./services/emotion.service";
import { alertService } from "./services/alert.service";
import jwt from 'jsonwebtoken';

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'secure_transport_secret_key';

// Enhanced WebSocket with authentication
interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  isAuthenticated?: boolean;
}

// Websocket clients
const clients = new Set<AuthenticatedWebSocket>();

// Broadcast to all authenticated clients
function broadcast(message: any) {
  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN && client.isAuthenticated) {
      client.send(messageStr);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: AuthenticatedWebSocket) => {
    clients.add(ws);
    ws.isAuthenticated = false;
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication messages
        if (data.type === 'authenticate') {
          try {
            const token = data.token;
            if (!token) {
              ws.send(JSON.stringify({
                type: 'auth_error',
                message: 'No token provided'
              }));
              return;
            }
            
            // Verify the token
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
            const user = await storage.getUser(decoded.userId);
            
            if (!user) {
              ws.send(JSON.stringify({
                type: 'auth_error',
                message: 'Invalid token'
              }));
              return;
            }
            
            // Mark the socket as authenticated
            ws.isAuthenticated = true;
            ws.userId = user.id;
            
            // Send success message
            ws.send(JSON.stringify({
              type: 'auth_success',
              user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
              }
            }));
            
            // Send initial data now that the user is authenticated
            sendInitialData(ws);
            
            console.log(`WebSocket authenticated for user ${user.username}`);
          } catch (error) {
            console.error('WebSocket authentication error:', error);
            ws.send(JSON.stringify({
              type: 'auth_error',
              message: 'Invalid or expired token'
            }));
          }
          return;
        }
        
        // Ensure the socket is authenticated for data operations
        if (!ws.isAuthenticated) {
          ws.send(JSON.stringify({
            type: 'auth_required',
            message: 'Authentication required'
          }));
          return;
        }
        
        // Handle different message types (for authenticated users)
        if (data.type === 'update_telemetry') {
          const telemetry = await storage.updateTelemetryData(
            data.vehicleId,
            data.telemetry
          );
          
          if (telemetry) {
            broadcast({
              type: 'telemetry_updated',
              telemetry
            });
          }
        }
        
        if (data.type === 'new_detection') {
          try {
            const validData = insertDetectionSchema.parse(data.detection);
            const detection = await storage.createDetection(validData);
            
            broadcast({
              type: 'detection_created',
              detection
            });
            
            // Create an alert if weapon is detected with high confidence
            if (detection.type === 'weapon' && detection.confidence > 0.9) {
              const alert = await storage.createAlert({
                vehicleId: detection.vehicleId,
                type: 'weapon_detected',
                message: `Potential weapon detected in ${detection.vehicleId}`,
                severity: 'critical',
                metadata: { detectionId: detection.id }
              });
              
              broadcast({
                type: 'alert_created',
                alert
              });
            }
          } catch (error) {
            console.error('Invalid detection data:', error);
          }
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
    });
    
    // Inform the client that authentication is required
    ws.send(JSON.stringify({
      type: 'auth_required',
      message: 'Please authenticate using your token'
    }));
  });
  
  // Function to send initial data to an authenticated client
  function sendInitialData(ws: AuthenticatedWebSocket) {
    if (!ws.isAuthenticated || ws.readyState !== WebSocket.OPEN) {
      return;
    }
    
    storage.getVehicles().then(vehicles => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_vehicles',
          vehicles
        }));
      }
    });
    
    storage.getTelemetryData().then(telemetryData => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_telemetry',
          telemetryData
        }));
      }
    });
    
    storage.getRiskZones().then(riskZones => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_risk_zones',
          riskZones
        }));
      }
    });
    
    storage.getAlerts().then(alerts => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_alerts',
          alerts
        }));
      }
    });
    
    storage.getRoutes().then(routes => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'initial_routes',
          routes
        }));
      }
    });
    
    // If user is admin, send vehicle assignments
    if (ws.userId) {
      const user = storage.getUser(ws.userId);
      
      user.then(userData => {
        if (userData?.role === 'admin') {
          storage.getVehicleAssignments().then(assignments => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'initial_vehicle_assignments',
                assignments
              }));
            }
          });
        } else {
          // Regular users only get their own assignments
          storage.getVehicleAssignmentsByUserId(ws.userId).then(assignments => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'initial_vehicle_assignments',
                assignments
              }));
            }
          });
        }
      });
    }
  }
  
  // Auth Routes
  // Register a new user
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { username, password, name, role } = req.body;
      
      if (!username || !password || !name) {
        return res.status(400).json({ message: 'Username, password, and name are required' });
      }
      
      const result = await authService.register({ username, password, name, role });
      
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Registration failed' });
    }
  });
  
  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      const result = await authService.login({ username, password });
      
      res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'Login failed' });
    }
  });
  
  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const user = await authService.verifyToken(req.user.id);
      res.json({ user });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({ message: error.message });
      }
      res.status(500).json({ message: 'Failed to get user data' });
    }
  });

  // API Routes
  // Get all vehicles
  app.get('/api/vehicles', authenticateToken, async (req: Request, res: Response) => {
    const vehicles = await storage.getVehicles();
    res.json(vehicles);
  });
  
  // Get vehicle by ID
  app.get('/api/vehicles/:vehicleId', async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
    const vehicle = await storage.getVehicleByVehicleId(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  });
  
  // Create a new vehicle
  app.post('/api/vehicles', async (req: Request, res: Response) => {
    try {
      const validData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validData);
      
      broadcast({
        type: 'vehicle_created',
        vehicle
      });
      
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid vehicle data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to create vehicle' });
    }
  });
  
  // Update vehicle status
  app.patch('/api/vehicles/:id/status', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const vehicle = await storage.updateVehicleStatus(id, status);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    broadcast({
      type: 'vehicle_updated',
      vehicle
    });
    
    res.json(vehicle);
  });
  
  // Get all telemetry data
  app.get('/api/telemetry', async (req: Request, res: Response) => {
    const telemetryData = await storage.getTelemetryData();
    res.json(telemetryData);
  });
  
  // Get telemetry for a specific vehicle
  app.get('/api/telemetry/:vehicleId', async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
    const telemetry = await storage.getTelemetryByVehicleId(vehicleId);
    
    if (!telemetry) {
      return res.status(404).json({ message: 'Telemetry data not found' });
    }
    
    res.json(telemetry);
  });
  
  // Update telemetry for a vehicle
  app.patch('/api/telemetry/:vehicleId', async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
    
    try {
      const telemetry = await storage.updateTelemetryData(vehicleId, req.body);
      
      if (!telemetry) {
        return res.status(404).json({ message: 'Telemetry data not found' });
      }
      
      broadcast({
        type: 'telemetry_updated',
        telemetry
      });
      
      res.json(telemetry);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update telemetry data' });
    }
  });
  
  // Get all detections
  app.get('/api/detections', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const detections = await storage.getDetections(limit);
    res.json(detections);
  });
  
  // Get detections for a specific vehicle
  app.get('/api/detections/:vehicleId', async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const detections = await storage.getDetectionsByVehicleId(vehicleId, limit);
    res.json(detections);
  });
  
  // Create a new detection
  app.post('/api/detections', async (req: Request, res: Response) => {
    try {
      const validData = insertDetectionSchema.parse(req.body);
      const detection = await storage.createDetection(validData);
      
      broadcast({
        type: 'detection_created',
        detection
      });
      
      // Import required services if they exist
      let evidencePackage = null;
      let alertResponse = null;
      
      try {
        // Process license plate if this is a vehicle detection
        if (detection.type === 'vehicle' && detection.imageData) {
          const { lprService } = await import('./services/lpr.service');
          if (lprService) {
            const coordinates = {
              latitude: detection.metadata.latitude || 0,
              longitude: detection.metadata.longitude || 0
            };
            
            const plateAnalysis = await lprService.analyzePlate(detection.imageData, coordinates);
            
            if (plateAnalysis) {
              console.log(`License plate detected: ${plateAnalysis.licensePlate} (${plateAnalysis.province}) with ${Math.round(plateAnalysis.confidence * 100)}% confidence`);
              
              // Update the detection with license plate data
              detection.metadata.licensePlate = plateAnalysis.licensePlate;
              detection.metadata.licensePlateConfidence = plateAnalysis.confidence;
              detection.metadata.province = plateAnalysis.province;
              detection.metadata.plateImageHash = plateAnalysis.imageHash;
            }
          }
        }
        
        // Generate evidence package for all detections
        const { evidenceService } = await import('./services/evidence.service');
        if (evidenceService) {
          evidencePackage = await evidenceService.generateEvidencePackage(detection);
          console.log(`Evidence package generated: ${evidencePackage.evidenceId}`);
        }
      } catch (serviceError) {
        console.error('Error in advanced detection processing:', serviceError);
      }
      
      // Create an alert if weapon is detected with high confidence
      if (detection.type === 'weapon' && detection.confidence > 0.9) {
        const alert = await storage.createAlert({
          vehicleId: detection.vehicleId,
          type: 'weapon_detected',
          message: `Potential weapon detected in ${detection.vehicleId}`,
          severity: 'critical',
          metadata: { 
            detectionId: detection.id,
            evidenceId: evidencePackage?.evidenceId || null,
            ...detection.metadata
          }
        });
        
        // Distribute alert through multiple channels
        try {
          const { alertService } = await import('./services/alert.service');
          if (alertService) {
            alertResponse = await alertService.distributeAlert(alert, true);
            console.log('Alert distributed through multiple channels:', alertResponse.channels);
          }
        } catch (alertError) {
          console.error('Error distributing alert:', alertError);
        }
        
        broadcast({
          type: 'alert_created',
          alert
        });
      }
      
      res.status(201).json({
        detection,
        evidence: evidencePackage ? {
          evidenceId: evidencePackage.evidenceId,
          creationTimestamp: evidencePackage.creationTimestamp,
          chainOfCustodyVerified: evidencePackage.chainOfCustodyVerified
        } : null,
        alertDistribution: alertResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid detection data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to create detection' });
    }
  });
  
  // Get all alerts
  app.get('/api/alerts', async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const alerts = await storage.getAlerts(limit);
    res.json(alerts);
  });
  
  // Get alerts for a specific vehicle
  app.get('/api/alerts/:vehicleId', async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const alerts = await storage.getAlertsByVehicleId(vehicleId, limit);
    res.json(alerts);
  });
  
  // Create a new alert
  app.post('/api/alerts', async (req: Request, res: Response) => {
    try {
      const validData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validData);
      
      broadcast({
        type: 'alert_created',
        alert
      });
      
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid alert data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to create alert' });
    }
  });
  
  // Acknowledge an alert
  app.patch('/api/alerts/:id/acknowledge', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const alert = await storage.acknowledgeAlert(id);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    broadcast({
      type: 'alert_updated',
      alert
    });
    
    res.json(alert);
  });
  
  // Escalate an alert
  app.post('/api/alerts/escalate', async (req: Request, res: Response) => {
    try {
      const escalationData = req.body;
      console.log('Escalating alert:', escalationData);
      
      // In a production environment, this would:
      // 1. Update the alert in the database with escalation information
      // 2. Notify appropriate personnel via specified channels
      // 3. Log the escalation for audit purposes
      // 4. Perhaps trigger automated responses based on escalation level
      
      // For now, we'll simulate a successful escalation
      setTimeout(() => {
        broadcast({ 
          type: 'alert_escalated', 
          data: {
            alertId: escalationData.alertId,
            escalationLevel: escalationData.escalationLevel,
            timestamp: new Date().toISOString()
          }
        });
      }, 500);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Alert escalated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error escalating alert:', error);
      return res.status(500).json({ message: 'Error escalating alert' });
    }
  });
  
  // Get all routes
  app.get('/api/routes', async (req: Request, res: Response) => {
    const routes = await storage.getRoutes();
    res.json(routes);
  });
  
  // Create a new route
  app.post('/api/routes', async (req: Request, res: Response) => {
    try {
      const validData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(validData);
      
      broadcast({
        type: 'route_created',
        route
      });
      
      res.status(201).json(route);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid route data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to create route' });
    }
  });
  
  // Get all risk zones
  app.get('/api/risk-zones', async (req: Request, res: Response) => {
    const riskZones = await storage.getRiskZones();
    res.json(riskZones);
  });
  
  // Create a new risk zone
  app.post('/api/risk-zones', async (req: Request, res: Response) => {
    try {
      const validData = insertRiskZoneSchema.parse(req.body);
      const riskZone = await storage.createRiskZone(validData);
      
      broadcast({
        type: 'risk_zone_created',
        riskZone
      });
      
      res.status(201).json(riskZone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid risk zone data', errors: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to create risk zone' });
    }
  });

  // Vehicle Assignment endpoints
  app.get('/api/vehicle-assignments', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      // Only admins can view all assignments
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const assignments = await storage.getVehicleAssignments();
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve vehicle assignments" });
    }
  });
  
  app.get('/api/vehicle-assignments/user/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Users can only view their own assignments unless they're admin
      if (req.user?.role !== 'admin' && req.user?.id !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const assignments = await storage.getVehicleAssignmentsByUserId(userId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user's vehicle assignments" });
    }
  });
  
  app.get('/api/vehicle-assignments/vehicle/:vehicleId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
      const vehicleId = req.params.vehicleId;
      
      const assignments = await storage.getVehicleAssignmentsByVehicleId(vehicleId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve vehicle's assignments" });
    }
  });
  
  app.post('/api/vehicle-assignments', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Only admin users can create assignments
      if ((req as AuthRequest).user?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const validationResult = insertVehicleAssignmentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid assignment data" });
      }
      
      // Verify that the user and vehicle exist
      const user = await storage.getUser(validationResult.data.userId);
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
      
      const vehicle = await storage.getVehicleByVehicleId(validationResult.data.vehicleId);
      if (!vehicle) {
        return res.status(400).json({ error: "Vehicle not found" });
      }
      
      const newAssignment = await storage.createVehicleAssignment(validationResult.data);
      broadcast({ type: 'new_vehicle_assignment', data: newAssignment });
      res.status(201).json(newAssignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create vehicle assignment" });
    }
  });
  
  app.patch('/api/vehicle-assignments/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Only admin users can update assignments
      if ((req as AuthRequest).user?.role !== 'admin') {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const id = parseInt(req.params.id);
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: "Invalid data, isActive must be a boolean" });
      }
      
      const updatedAssignment = await storage.updateVehicleAssignment(id, isActive);
      if (!updatedAssignment) {
        return res.status(404).json({ error: "Assignment not found" });
      }
      
      broadcast({ type: 'updated_vehicle_assignment', data: updatedAssignment });
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle assignment" });
    }
  });

  // Voice analysis endpoints
  app.post('/api/voice/analyze', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { audioData, vehicleId } = req.body;
      
      if (!audioData || !vehicleId) {
        return res.status(400).json({ message: 'Audio data and vehicle ID are required' });
      }
      
      const analysis = await voiceAnalysisService.analyzeVoiceSample(audioData, vehicleId);
      
      // Create a detection based on the voice analysis
      if (analysis.panicProbability > 60 || analysis.stressLevel > 70) {
        const detectionType = analysis.panicProbability > 80 ? 'panic' : 'stress';
        
        const detection = await storage.createDetection({
          vehicleId,
          type: 'voice_anomaly',
          confidence: analysis.panicProbability / 100,
          metadata: {
            voiceId: analysis.voiceId,
            detectedEmotion: analysis.detectedEmotion === 'neutral' ? 'normal' : 
                           analysis.detectedEmotion === 'angry' ? 'anger' : 
                           analysis.detectedEmotion === 'fearful' ? 'fear' : 
                           analysis.detectedEmotion,
            stressLevel: analysis.stressLevel,
            panicProbability: analysis.panicProbability,
            audioHash: analysis.audioHash,
            speechToText: analysis.speechToText,
            keywordsDetected: analysis.keywordsDetected
          }
        });
        
        // Create an alert for high panic probability
        if (analysis.panicProbability > 80) {
          const alert = await storage.createAlert({
            vehicleId,
            type: 'panic_detected',
            message: `Panic detected in ${vehicleId} cabin audio`,
            severity: 'critical',
            metadata: {
              voiceId: analysis.voiceId,
              detectedEmotion: analysis.detectedEmotion,
              stressLevel: analysis.stressLevel,
              panicProbability: analysis.panicProbability,
              speechToText: analysis.speechToText,
              keywordsDetected: analysis.keywordsDetected,
              audioTimestamp: analysis.timestamp
            }
          });
          
          // Distribute alert through multiple channels if it's a panic alert
          await alertService.distributeAlert(alert, true);
          
          broadcast({
            type: 'alert_created',
            alert
          });
        } 
        // Create a warning for high stress
        else if (analysis.stressLevel > 70) {
          const alert = await storage.createAlert({
            vehicleId,
            type: 'stress_detected',
            message: `High stress levels detected in ${vehicleId} cabin audio`,
            severity: 'warning',
            metadata: {
              voiceId: analysis.voiceId,
              detectedEmotion: analysis.detectedEmotion,
              stressLevel: analysis.stressLevel,
              panicProbability: analysis.panicProbability,
              speechToText: analysis.speechToText,
              keywordsDetected: analysis.keywordsDetected,
              audioTimestamp: analysis.timestamp
            }
          });
          
          broadcast({
            type: 'alert_created',
            alert
          });
        }
        
        broadcast({
          type: 'detection_created',
          detection
        });
      }
      
      // Return the analysis results
      res.json(analysis);
    } catch (error) {
      console.error('Voice analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze voice sample' });
    }
  });
  
  // Update voice analysis thresholds
  app.patch('/api/voice/thresholds', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { panicThreshold, stressThreshold, consecutiveSamplesRequired } = req.body;
      
      voiceAnalysisService.updateAlertThresholds({
        panicThreshold: panicThreshold !== undefined ? panicThreshold : 75,
        stressThreshold: stressThreshold !== undefined ? stressThreshold : 60,
        consecutiveSamplesRequired: consecutiveSamplesRequired !== undefined ? consecutiveSamplesRequired : 2
      });
      
      res.json({ 
        message: 'Voice analysis thresholds updated successfully',
        thresholds: {
          panicThreshold,
          stressThreshold,
          consecutiveSamplesRequired
        }
      });
    } catch (error) {
      console.error('Error updating voice thresholds:', error);
      res.status(500).json({ message: 'Failed to update voice analysis thresholds' });
    }
  });
  
  // Emotion detection endpoints
  app.post('/api/emotion/analyze', authenticateToken, async (req: Request, res: Response) => {
    try {
      const { imageData, vehicleId } = req.body;
      
      if (!imageData || !vehicleId) {
        return res.status(400).json({ message: 'Image data and vehicle ID are required' });
      }
      
      const analysis = await emotionDetectionService.analyzeFrame(imageData, vehicleId);
      
      // Create a detection based on the emotion analysis
      if (analysis.anomalyScore > 70 || 
          (analysis.primaryEmotion === 'fearful' && analysis.arousalLevel > 75) || 
          (analysis.primaryEmotion === 'angry' && analysis.arousalLevel > 80)) {
        
        const detection = await storage.createDetection({
          vehicleId,
          type: 'emotion_anomaly',
          confidence: analysis.anomalyScore / 100,
          imageData, // Store the image data for evidence
          metadata: {
            detectionId: analysis.detectionId,
            primaryEmotion: analysis.primaryEmotion,
            arousalLevel: analysis.arousalLevel,
            valenceLevel: analysis.valenceLevel,
            faceCount: analysis.faceCount,
            anomalyScore: analysis.anomalyScore,
            anomalyDetected: analysis.anomalyDetected,
            frameHash: analysis.frameHash,
            personDetails: analysis.personDetails
          }
        });
        
        // Create an alert for high anomaly score or fearful/angry emotions
        if (analysis.anomalyScore > 80 || 
            (analysis.primaryEmotion === 'fearful' && analysis.arousalLevel > 85) || 
            (analysis.primaryEmotion === 'angry' && analysis.arousalLevel > 90)) {
          
          const alertType = analysis.primaryEmotion === 'fearful' ? 'fear_detected' : 
                           analysis.primaryEmotion === 'angry' ? 'anger_detected' : 'emotion_anomaly';
          
          const alert = await storage.createAlert({
            vehicleId,
            type: alertType,
            message: `Emotional anomaly detected in ${vehicleId} cabin`,
            severity: 'critical',
            metadata: {
              detectionId: analysis.detectionId,
              primaryEmotion: analysis.primaryEmotion,
              arousalLevel: analysis.arousalLevel,
              valenceLevel: analysis.valenceLevel,
              anomalyScore: analysis.anomalyScore,
              faceCount: analysis.faceCount
            }
          });
          
          broadcast({
            type: 'alert_created',
            alert
          });
        }
        
        broadcast({
          type: 'detection_created',
          detection
        });
      }
      
      // Return the analysis results
      res.json(analysis);
    } catch (error) {
      console.error('Emotion analysis error:', error);
      res.status(500).json({ message: 'Failed to analyze emotion' });
    }
  });
  
  // Update emotion detection thresholds
  app.patch('/api/emotion/thresholds', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { anomalyThreshold, fearThreshold, angerThreshold, consecutiveFramesRequired } = req.body;
      
      emotionDetectionService.updateAlertThresholds({
        anomalyThreshold: anomalyThreshold !== undefined ? anomalyThreshold : 70,
        fearThreshold: fearThreshold !== undefined ? fearThreshold : 75,
        angerThreshold: angerThreshold !== undefined ? angerThreshold : 80,
        consecutiveFramesRequired: consecutiveFramesRequired !== undefined ? consecutiveFramesRequired : 3
      });
      
      res.json({ 
        message: 'Emotion detection thresholds updated successfully',
        thresholds: {
          anomalyThreshold,
          fearThreshold,
          angerThreshold,
          consecutiveFramesRequired
        }
      });
    } catch (error) {
      console.error('Error updating emotion thresholds:', error);
      res.status(500).json({ message: 'Failed to update emotion detection thresholds' });
    }
  });
  
  // User invitation endpoints
  app.post('/api/auth/invite', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { email, name, role } = req.body;
      
      if (!email || !name || !role) {
        return res.status(400).json({ message: 'Email, name, and role are required' });
      }
      
      // Get the inviter's information
      const invitedBy = await storage.getUser(req.userId);
      if (!invitedBy) {
        return res.status(404).json({ message: 'Inviter not found' });
      }
      
      // Send the invitation
      const inviteResult = await authService.inviteUser({
        email,
        name,
        role,
        invitedBy: {
          id: invitedBy.id,
          name: invitedBy.name
        }
      });
      
      if (!inviteResult.success) {
        return res.status(500).json({ 
          message: inviteResult.message || 'Failed to send invitation'
        });
      }
      
      res.json({
        message: 'Invitation sent successfully',
        email,
        name,
        role,
        expiresAt: inviteResult.expiresAt
      });
    } catch (error) {
      console.error('Error sending invitation:', error);
      res.status(500).json({ message: 'Failed to send invitation' });
    }
  });
  
  // Verify invitation token
  app.get('/api/auth/verify-invitation', async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Invitation token is required' });
      }
      
      const verification = await authService.verifyInvitationToken(token);
      
      if (!verification.valid) {
        return res.status(400).json({ 
          message: verification.error || 'Invalid invitation token'
        });
      }
      
      res.json({
        valid: true,
        email: verification.email,
        name: verification.name,
        role: verification.role
      });
    } catch (error) {
      console.error('Error verifying invitation token:', error);
      res.status(500).json({ message: 'Failed to verify invitation token' });
    }
  });
  
  // Register from invitation
  app.post('/api/auth/register-from-invitation', async (req: Request, res: Response) => {
    try {
      const { token, username, password } = req.body;
      
      if (!token || !username || !password) {
        return res.status(400).json({ message: 'Token, username, and password are required' });
      }
      
      const result = await authService.registerFromInvitation(token, {
        username,
        password
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error registering from invitation:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to register from invitation'
      });
    }
  });

  return httpServer;
}
