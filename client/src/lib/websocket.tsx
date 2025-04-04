import { useState, useEffect, createContext, useContext } from 'react';
import { Vehicle, Telemetry, Detection, Alert, Route, RiskZone } from '@/types';
import { useAuth } from '@/lib/auth';

interface WebSocketContextType {
  connected: boolean;
  vehicles: Vehicle[];
  telemetryData: Telemetry[];
  detections: Detection[];
  alerts: Alert[];
  routes: Route[];
  riskZones: RiskZone[];
}

const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  vehicles: [],
  telemetryData: [],
  detections: [],
  alerts: [],
  routes: [],
  riskZones: []
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const { token, isAuthenticated } = useAuth();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [telemetryData, setTelemetryData] = useState<Telemetry[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  
  useEffect(() => {
    // Only create a WebSocket connection if the user is authenticated
    if (!isAuthenticated) {
      return;
    }
    
    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    // Connection opened
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established');
      setConnected(true);
      
      // Send authentication token to the WebSocket server
      if (token) {
        ws.send(JSON.stringify({ type: 'authenticate', token }));
      }
    });
    
    // Listen for messages
    ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'auth_required':
            console.log('WebSocket authentication required');
            // The server will require us to authenticate, which we handle on socket open
            break;
            
          case 'auth_success':
            console.log('WebSocket authentication successful');
            break;
            
          case 'auth_error':
            console.error('WebSocket authentication error:', data.message);
            break;
            
          case 'initial_vehicles':
            setVehicles(data.vehicles);
            break;
            
          case 'initial_telemetry':
            setTelemetryData(data.telemetryData);
            break;
            
          case 'initial_detections':
            setDetections(data.detections);
            break;
            
          case 'initial_alerts':
            setAlerts(data.alerts);
            break;
            
          case 'initial_routes':
            setRoutes(data.routes);
            break;
            
          case 'initial_risk_zones':
            setRiskZones(data.riskZones);
            break;
            
          case 'vehicle_created':
          case 'vehicle_updated':
            setVehicles(prevVehicles => {
              const index = prevVehicles.findIndex(v => v.id === data.vehicle.id);
              if (index !== -1) {
                return [
                  ...prevVehicles.slice(0, index),
                  data.vehicle,
                  ...prevVehicles.slice(index + 1)
                ];
              } else {
                return [...prevVehicles, data.vehicle];
              }
            });
            break;
            
          case 'telemetry_updated':
            setTelemetryData(prevTelemetry => {
              const index = prevTelemetry.findIndex(t => t.id === data.telemetry.id);
              if (index !== -1) {
                return [
                  ...prevTelemetry.slice(0, index),
                  data.telemetry,
                  ...prevTelemetry.slice(index + 1)
                ];
              } else {
                return [...prevTelemetry, data.telemetry];
              }
            });
            break;
            
          case 'detection_created':
            setDetections(prevDetections => [data.detection, ...prevDetections]);
            break;
            
          case 'alert_created':
            setAlerts(prevAlerts => [data.alert, ...prevAlerts]);
            break;
            
          case 'alert_updated':
            setAlerts(prevAlerts => {
              const index = prevAlerts.findIndex(a => a.id === data.alert.id);
              if (index !== -1) {
                return [
                  ...prevAlerts.slice(0, index),
                  data.alert,
                  ...prevAlerts.slice(index + 1)
                ];
              } else {
                return prevAlerts;
              }
            });
            break;
            
          case 'route_created':
            setRoutes(prevRoutes => [...prevRoutes, data.route]);
            break;
            
          case 'risk_zone_created':
            setRiskZones(prevZones => [...prevZones, data.riskZone]);
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Connection closed
    ws.addEventListener('close', () => {
      console.log('WebSocket connection closed');
      setConnected(false);
      
      // Try to reconnect after a delay
      setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        setSocket(null);
      }, 5000);
    });
    
    // Connection error
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
    });
    
    setSocket(ws);
    
    // Clean up on unmount
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isAuthenticated, token]);
  
  // Update vehicle positions randomly (for simulation)
  useEffect(() => {
    if (!telemetryData.length) return;
    
    const interval = setInterval(() => {
      setTelemetryData(prevTelemetry => 
        prevTelemetry.map(telemetry => ({
          ...telemetry,
          latitude: telemetry.latitude + (Math.random() - 0.5) * 0.001,
          longitude: telemetry.longitude + (Math.random() - 0.5) * 0.001,
        }))
      );
    }, 5000);
    
    return () => clearInterval(interval);
  }, [telemetryData.length]);
  
  return (
    <WebSocketContext.Provider value={{
      connected,
      vehicles,
      telemetryData,
      detections,
      alerts,
      routes,
      riskZones
    }}>
      {children}
    </WebSocketContext.Provider>
  );
};
