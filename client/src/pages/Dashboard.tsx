import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWebSocket } from '@/lib/websocket';
import { useAuth } from '@/lib/auth';
import { Vehicle, Telemetry, Detection, Alert, Route, RiskZone } from '@/types';
import { apiRequest } from '@/lib/api';

// Layout components
import Header from '@/components/layout/Header';

// Dashboard components
import StatusCard from '@/components/status/StatusCard';
import FleetMap from '@/components/map/FleetMap';
import CameraFeed from '@/components/detection/CameraFeed';
import DetectionItem from '@/components/detection/DetectionItem';
import TelemetryCard from '@/components/telematics/TelemetryCard';
import RouteItem from '@/components/routes/RouteItem';
import AlertBanner from '@/components/alerts/AlertBanner';
import AlertReview from '@/components/alerts/AlertReview';
import VoiceAnalysisPanel from '@/components/telematics/VoiceAnalysisPanel';
import EmotionIntensityMeter from '@/components/telematics/EmotionIntensityMeter';

// Icons
import { 
  Car, 
  Bell, 
  ShieldAlert, 
  Check, 
  RefreshCw,
  MapPin,
  LayoutDashboard 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  // Get user from auth context
  const { user } = useAuth();
  
  // State for selected vehicle
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTelemetry, setSelectedTelemetry] = useState<Telemetry | null>(null);
  
  // State for active alerts
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  
  // WebSocket connection for realtime updates
  const { 
    vehicles,
    telemetryData,
    alerts,
    detections,
    routes,
    riskZones,
    connected
  } = useWebSocket();
  
  // Fetch initial data
  const { data: vehiclesData } = useQuery({ 
    queryKey: ['/api/vehicles'],
    enabled: !connected
  });
  
  const { data: telemetryDataList } = useQuery({ 
    queryKey: ['/api/telemetry'],
    enabled: !connected
  });
  
  const { data: alertsList } = useQuery({ 
    queryKey: ['/api/alerts'],
    enabled: !connected
  });
  
  const { data: detectionsList } = useQuery({ 
    queryKey: ['/api/detections'],
    enabled: !connected
  });
  
  const { data: routesList } = useQuery({ 
    queryKey: ['/api/routes'],
    enabled: !connected
  });
  
  const { data: riskZonesList } = useQuery({ 
    queryKey: ['/api/risk-zones'],
    enabled: !connected
  });
  
  // Set the most recent critical alert as active
  useEffect(() => {
    const criticalAlerts = alerts
      .filter(alert => alert.severity === 'critical' && !alert.acknowledged)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    if (criticalAlerts.length > 0) {
      setActiveAlert(criticalAlerts[0]);
    } else if (activeAlert && alerts.findIndex(a => a.id === activeAlert.id && !a.acknowledged) === -1) {
      setActiveAlert(null);
    }
  }, [alerts, activeAlert]);
  
  // State for selected risk zone
  const [selectedRiskZone, setSelectedRiskZone] = useState<RiskZone | null>(null);

  // Handle vehicle selection
  const handleSelectVehicle = (vehicle: Vehicle, telemetry: Telemetry) => {
    setSelectedVehicle(vehicle);
    setSelectedTelemetry(telemetry);
    setSelectedRiskZone(null); // Clear risk zone selection
  };
  
  // Handle risk zone selection
  const handleSelectRiskZone = (riskZone: RiskZone) => {
    setSelectedRiskZone(riskZone);
    setSelectedVehicle(null); // Clear vehicle selection
    setSelectedTelemetry(null);
  };
  
  // Handle alert dismissal (acknowledge)
  const handleDismissAlert = async () => {
    if (!activeAlert) return;
    
    try {
      await apiRequest('PATCH', `/api/alerts/${activeAlert.id}/acknowledge`, {});
      setActiveAlert(null);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };
  
  // Get vehicle-specific detections
  const vehicleDetections = selectedVehicle 
    ? detections
        .filter(d => d.vehicleId === selectedVehicle.vehicleId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3)
    : [];
  
  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <Header 
          title="Dashboard" 
          subtitle="Real-time security monitoring" 
          icon={<LayoutDashboard className="h-6 w-6" />}
        />
        
        <div className="p-6">
          {/* Alert Banner */}
          {activeAlert && (
            <AlertBanner 
              alert={activeAlert} 
              onDismiss={handleDismissAlert}
            />
          )}
          
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatusCard 
              title="Active Vehicles" 
              value={vehicles.filter(v => v.status === 'active').length}
              icon={<Car className="text-blue-500" size={20} />}
              iconBgColor="bg-blue-500"
              change={{
                value: "+2 since yesterday",
                type: "increase",
                color: "text-green-500"
              }}
            />
            
            <StatusCard 
              title="Security Alerts" 
              value={alerts.filter(a => !a.acknowledged).length}
              icon={<Bell className="text-red-500" size={20} />}
              iconBgColor="bg-red-500"
              change={{
                value: "+1 in last hour",
                type: "increase",
                color: "text-red-500"
              }}
            />
            
            <StatusCard 
              title="Identified Threats" 
              value={detections.filter(d => d.type === 'weapon' && d.confidence > 0.7).length}
              icon={<ShieldAlert className="text-amber-500" size={20} />}
              iconBgColor="bg-amber-500"
              change={{
                value: "-2 from yesterday",
                type: "decrease",
                color: "text-amber-500"
              }}
            />
            
            <StatusCard 
              title="System Status" 
              value="99.95%"
              icon={<Check className="text-green-500" size={20} />}
              iconBgColor="bg-green-500"
              change={{
                value: "Updated 5m ago",
                type: "time",
                color: "text-green-500"
              }}
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2 bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold">Live Fleet Monitoring</h3>
                <div className="flex space-x-2">
                  <div className="flex items-center text-xs">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                    <span>Safe</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="w-3 h-3 bg-amber-500 rounded-full mr-1"></span>
                    <span>Caution</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                    <span>High Risk</span>
                  </div>
                </div>
              </div>
              
              <div className="h-[500px]">
                <FleetMap 
                  vehicles={vehicles}
                  telemetryData={telemetryData}
                  riskZones={riskZones}
                  detections={detections}
                  onSelectVehicle={handleSelectVehicle}
                  onSelectRiskZone={handleSelectRiskZone}
                />
              </div>
              
              <div className="p-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedVehicle ? (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">Selected Vehicle</h4>
                      <p className="font-semibold">
                        {`${selectedVehicle.vehicleId} - ${selectedVehicle.division} Division`}
                      </p>
                      {selectedTelemetry && (
                        <div className="mt-1 flex space-x-4 text-sm">
                          <p className="text-gray-400">
                            Speed: <span className="text-white">{selectedTelemetry.speed} km/h</span>
                          </p>
                          <p className="text-gray-400">
                            Status: <span className={`font-semibold ${
                              selectedVehicle?.status === 'alert' ? 'text-red-500' : 'text-white'
                            }`}>
                              {selectedVehicle?.status === 'alert' ? 'Alert' : 'Normal'}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex sm:justify-end">
                      <Button
                        variant="default"
                        className="mr-2"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                      >
                        Dispatch Support
                      </Button>
                    </div>
                  </>
                ) : selectedRiskZone ? (
                  <>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-400">Selected Risk Zone</h4>
                        <Badge 
                          className={`
                            ${selectedRiskZone.riskLevel === 'critical' ? 'bg-purple-700 hover:bg-purple-800' : 
                              selectedRiskZone.riskLevel === 'high' ? 'bg-red-700 hover:bg-red-800' : 
                              selectedRiskZone.riskLevel === 'medium' ? 'bg-amber-700 hover:bg-amber-800' : 
                              'bg-green-700 hover:bg-green-800'}
                          `}
                        >
                          {selectedRiskZone.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="font-semibold">
                        {selectedRiskZone.name}
                      </p>
                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <p className="text-gray-400">
                          Radius: <span className="text-white">{selectedRiskZone.radius}m</span>
                        </p>
                        {selectedRiskZone.metadata?.incidents && (
                          <p className="text-gray-400">
                            Incidents: <span className="text-white">{selectedRiskZone.metadata.incidents}</span>
                          </p>
                        )}
                        {selectedRiskZone.metadata?.securityForces && (
                          <p className="text-gray-400">
                            Security: <span className="text-green-500">Present</span>
                          </p>
                        )}
                        {selectedRiskZone.metadata?.vehicleCount !== undefined && (
                          <p className="text-gray-400">
                            Vehicles: <span className="text-white">{selectedRiskZone.metadata.vehicleCount}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end">
                      <div className="text-xs text-gray-400 mb-2">
                        {selectedRiskZone.description}
                      </div>
                      <div className="flex space-x-2 mt-auto">
                        <Button
                          variant="default"
                          size="sm"
                          className="mr-2"
                        >
                          View Details
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                        >
                          Alert Vehicles
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 text-center py-2 text-gray-400">
                    No vehicle or risk zone selected. Click on a vehicle or risk zone in the map to view details.
                  </div>
                )}
              </div>
            </div>
            
            {/* Live Detection Feed */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="font-semibold">Live Detection Feed</h3>
                <div className="flex items-center text-xs">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                  <span>Live</span>
                </div>
              </div>
              
              <CameraFeed 
                vehicleId={selectedVehicle?.vehicleId || 'CIT-0118'}
                detections={vehicleDetections.length > 0 ? vehicleDetections : detections.slice(0, 2)}
              />
              
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Detections</h4>
                
                <div className="space-y-3">
                  {detections.slice(0, 3).map((detection) => (
                    <DetectionItem 
                      key={detection.id} 
                      detection={detection} 
                    />
                  ))}
                </div>
                
                <Button className="w-full mt-4" variant="secondary">
                  View All Detections
                </Button>
              </div>
            </div>
          </div>
          
          {/* Vehicle Telematics */}
          <div className="mt-6 bg-zinc-900 rounded-lg border border-zinc-800">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-semibold">Vehicle Telematics & Diagnostics</h3>
              <select className="bg-zinc-800 border border-zinc-700 rounded px-3 py-1 text-sm">
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.vehicleId}>
                    {vehicle.vehicleId}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 p-4 gap-4">
              {selectedTelemetry && (
                <>
                  <TelemetryCard
                    title="Engine Status"
                    value={selectedTelemetry.engineStatus || 'Unknown'}
                    subtext="Operating normally"
                    status="success"
                  />
                  
                  <TelemetryCard
                    title="Fuel Level"
                    value={`${selectedTelemetry.fuelLevel || 0}%`}
                    subtext={`~${selectedTelemetry.fuelLevel ? Math.round(selectedTelemetry.fuelLevel * 5) : 0} km remaining`}
                    status="success"
                  />
                  
                  <TelemetryCard
                    title="Speed"
                    value={`${selectedTelemetry.speed || 0} km/h`}
                    subtext={selectedTelemetry.speed && selectedTelemetry.speed > 40 
                      ? "Above recommended (35 km/h)"
                      : "Within safe limits"}
                    status={selectedTelemetry.speed && selectedTelemetry.speed > 40 ? "warning" : "success"}
                  />
                  
                  <TelemetryCard
                    title="OBD Status"
                    value={selectedTelemetry.obdStatus || 'Unknown'}
                    subtext="All systems operational"
                    status="success"
                  />
                  
                  <TelemetryCard
                    title="Door Status"
                    value={selectedTelemetry.doorStatus || 'Unknown'}
                    subtext="Last opened 1h 23m ago"
                    status={selectedTelemetry.doorStatus === 'Open' ? "warning" : "success"}
                  />
                  
                  <TelemetryCard
                    title="GPS Signal"
                    value={selectedTelemetry.gpsSignal || 'Unknown'}
                    subtext="9 satellites connected"
                    status={selectedTelemetry.gpsSignal === 'Weak' ? "warning" : "success"}
                  />
                  
                  <TelemetryCard
                    title="Cellular Network"
                    value={selectedTelemetry.cellularNetwork || 'Unknown'}
                    subtext={selectedTelemetry.cellularNetwork === 'Limited' 
                      ? "Limited connectivity area" 
                      : "Strong signal"}
                    status={selectedTelemetry.cellularNetwork === 'Limited' ? "warning" : "success"}
                  />
                  
                  <TelemetryCard
                    title="Vault Status"
                    value={selectedTelemetry.vaultStatus || 'Unknown'}
                    subtext="Biometric authentication active"
                    status={selectedTelemetry.vaultStatus === 'Unsecured' ? "danger" : "success"}
                  />
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-zinc-800 flex justify-between">
              <span className="text-sm text-gray-400">
                Last updated: <span className="text-white">2 mins ago</span>
              </span>
              <button className="text-blue-500 flex items-center text-sm">
                <RefreshCw size={16} className="mr-1" />
                Refresh Data
              </button>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Review Component */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800">
              <AlertReview />
            </div>
            
            {/* Route Planning */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800">
              <div className="p-4 border-b border-zinc-800">
                <h3 className="font-semibold">Predictive Route Planning</h3>
                <p className="text-sm text-gray-400 mt-1">Using GeoPandas and OSMnx for risk analysis</p>
              </div>
            
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Recommended Routes</h4>
                  
                  <div className="space-y-3">
                    {routes.map((route) => (
                      <RouteItem 
                        key={route.id} 
                        route={route} 
                        onSelect={() => {}}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Risk Analysis Factors</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <h5 className="text-xs text-gray-400">Historical Incidents</h5>
                      <p className="text-xl font-bold mt-1">32</p>
                      <p className="text-xs text-gray-400 mt-1">In selected area (past 30 days)</p>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <h5 className="text-xs text-gray-400">Police Response Time</h5>
                      <p className="text-xl font-bold mt-1">8-12 min</p>
                      <p className="text-xs text-gray-400 mt-1">Average in current location</p>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <h5 className="text-xs text-gray-400">Traffic Density</h5>
                      <p className="text-xl font-bold mt-1">Medium</p>
                      <p className="text-xs text-gray-400 mt-1">Based on current time</p>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-3">
                      <h5 className="text-xs text-gray-400">Cell Tower Coverage</h5>
                      <p className="text-xl font-bold mt-1">93%</p>
                      <p className="text-xs text-gray-400 mt-1">Reliable communication areas</p>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-4">
                    <MapPin className="mr-2" size={16} />
                    Generate New Route Plan
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Voice Analysis Panel */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VoiceAnalysisPanel
              voiceData={selectedTelemetry ? {
                id: `voice-${selectedTelemetry.vehicleId}`,
                vehicleId: selectedTelemetry.vehicleId,
                timestamp: new Date().toISOString(),
                detectedEmotion: selectedTelemetry.driverEmotion || 'neutral',
                stressLevel: selectedTelemetry.stressLevel || 25,
                panicProbability: selectedTelemetry.panicProbability || 15,
                keywordsDetected: ['location', 'scheduled', 'delivery'],
                speechToText: "Approaching the scheduled delivery location. ETA 5 minutes. Traffic is clear."
              } : null}
              vehicleId={selectedVehicle?.vehicleId || ''}
              isRecording={true}
              className=""
            />
            
            {/* Additional panel can be added here in the future */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
              <h3 className="font-semibold mb-3">Cabin Monitoring Stats</h3>
              <p className="text-sm text-gray-400 mb-4">Real-time monitoring of cabin conditions and behavior</p>
              
              <div className="grid grid-cols-2 gap-4">
                <EmotionIntensityMeter 
                  emotionType="stress"
                  value={selectedTelemetry?.stressLevel || 35}
                  title="Driver Stress"
                  size="md"
                />
                
                <EmotionIntensityMeter 
                  emotionType="fear"
                  value={selectedTelemetry?.guardFearLevel || 20}
                  title="Guard Alertness" 
                  size="md"
                />
              </div>
              
              <div className="mt-4 p-3 border border-zinc-800 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Abnormal Behavior Detection</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Unusual head movements</span>
                    <Badge variant="outline">Low</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Eye tracking deviation</span>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Gesture patterns</span>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;