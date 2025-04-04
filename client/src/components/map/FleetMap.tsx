import { useState, useEffect, useCallback } from 'react';
import { Vehicle, Telemetry, RiskZone, Detection } from '@/types';
import VehicleMarker from './VehicleMarker';
import RiskZoneComponent from './RiskZone';
import { 
  Plus, 
  Minus, 
  Locate, 
  Layers, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  Truck, 
  Bell, 
  Fingerprint, 
  CreditCard,
  UserCog
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FleetMapProps {
  vehicles: Vehicle[];
  telemetryData: Telemetry[];
  riskZones: RiskZone[];
  detections?: Detection[];
  onSelectVehicle: (vehicle: Vehicle, telemetry: Telemetry) => void;
  onSelectRiskZone?: (riskZone: RiskZone) => void;
}

const FleetMap = ({ 
  vehicles, 
  telemetryData, 
  riskZones, 
  detections = [],
  onSelectVehicle,
  onSelectRiskZone 
}: FleetMapProps) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedRiskZoneId, setSelectedRiskZoneId] = useState<number | null>(null);
  const [mapMode, setMapMode] = useState<'standard' | 'threat' | 'detection'>('standard');
  const [zoom, setZoom] = useState(1);
  const [showLayers, setShowLayers] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    vehicles: true,
    riskZones: true,
    faceDetections: false,
    licensePlateDetections: false,
    proximityWarnings: true,
    routes: false
  });
  
  // Find selected vehicle and its telemetry
  const selectedVehicle = vehicles.find(v => v.vehicleId === selectedVehicleId);
  const selectedTelemetry = telemetryData.find(t => t.vehicleId === selectedVehicleId);
  const selectedRiskZone = riskZones.find(z => z.id === selectedRiskZoneId);
  
  // Map zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.6));
  const resetZoom = () => setZoom(1);
  
  // Layer toggle
  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };
  
  // Color high-risk vehicles
  const isVehicleInDanger = useCallback((telemetry: Telemetry) => {
    // Check if vehicle is in a high or critical risk zone
    if (riskZones.some(zone => 
      (zone.riskLevel === 'high' || zone.riskLevel === 'critical') && 
      isPointInCircle(
        telemetry.latitude, 
        telemetry.longitude, 
        zone.latitude, 
        zone.longitude, 
        zone.radius
      )
    )) {
      return true;
    }
    
    // Check for high stress or panic probability
    if (telemetry.stressLevel && telemetry.stressLevel > 70) return true;
    if (telemetry.panicProbability && telemetry.panicProbability > 50) return true;
    
    return false;
  }, [riskZones]);
  
  // Utility function to check if a point is within a circle
  const isPointInCircle = (
    lat1: number, lon1: number, 
    lat2: number, lon2: number, 
    radius: number
  ): boolean => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // in meters
    
    return distance <= radius;
  }
  
  // When selection changes, call the parent handler
  useEffect(() => {
    if (selectedVehicle && selectedTelemetry) {
      onSelectVehicle(selectedVehicle, selectedTelemetry);
    }
  }, [selectedVehicleId, selectedVehicle, selectedTelemetry, onSelectVehicle]);
  
  useEffect(() => {
    if (selectedRiskZone && onSelectRiskZone) {
      onSelectRiskZone(selectedRiskZone);
    }
  }, [selectedRiskZoneId, selectedRiskZone, onSelectRiskZone]);
  
  // Handle vehicle selection
  const handleSelectVehicle = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    // Deselect risk zone when a vehicle is selected
    setSelectedRiskZoneId(null);
  };
  
  // Handle risk zone selection
  const handleSelectRiskZone = (riskZone: RiskZone) => {
    setSelectedRiskZoneId(riskZone.id);
    // Deselect vehicle when a risk zone is selected
    setSelectedVehicleId(null);
  };
  
  // Get vehicles in high risk zones
  const vehiclesInHighRiskCount = telemetryData.filter(t => 
    isVehicleInDanger(t)
  ).length;
  
  // Get high risk zones count
  const highRiskZonesCount = riskZones.filter(z => 
    z.riskLevel === 'high' || z.riskLevel === 'critical'
  ).length;
  
  return (
    <div className="map-container relative w-full h-full overflow-hidden border rounded-lg bg-zinc-900">
      <div className={`map-display grid-dots relative w-full h-full overflow-hidden transition-all duration-300 ease-in-out`} 
           style={{ transform: `scale(${zoom})` }}>
        <div className={`map-overlay absolute inset-0 ${mapMode === 'threat' ? 'bg-gradient-to-br from-red-950/20 to-purple-900/10' : ''}`}></div>
        
        {/* Mode indicator */}
        <div className="absolute top-4 left-4 z-50">
          <Tabs defaultValue="standard" value={mapMode} onValueChange={(value) => setMapMode(value as any)}>
            <TabsList className="bg-black/60 backdrop-blur-sm">
              <TabsTrigger value="standard" className="data-[state=active]:bg-zinc-700">
                <Truck size={16} className="mr-1" /> Standard
              </TabsTrigger>
              <TabsTrigger value="threat" className="data-[state=active]:bg-red-900/80">
                <AlertTriangle size={16} className="mr-1" /> Threat
              </TabsTrigger>
              <TabsTrigger value="detection" className="data-[state=active]:bg-blue-900/80">
                <Fingerprint size={16} className="mr-1" /> Detection
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Map statistics */}
        <div className="absolute top-4 right-4 z-50">
          <Card className="bg-black/60 backdrop-blur-sm border-zinc-800 text-white">
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Truck size={16} />
                  <span className="text-xs">Vehicles:</span>
                  <Badge variant="outline" className="ml-auto">{vehicles.length}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-xs">Risk Zones:</span>
                  <Badge variant="outline" className="ml-auto">{riskZones.length}</Badge>
                </div>
                {mapMode === 'threat' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <ShieldAlert size={16} className="text-red-500" />
                      <span className="text-xs">Vehicles at Risk:</span>
                      <Badge variant={vehiclesInHighRiskCount > 0 ? "destructive" : "outline"} className="ml-auto">
                        {vehiclesInHighRiskCount}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bell size={16} className="text-red-500" />
                      <span className="text-xs">High Risk Zones:</span>
                      <Badge variant={highRiskZonesCount > 0 ? "destructive" : "outline"} className="ml-auto">
                        {highRiskZonesCount}
                      </Badge>
                    </div>
                  </>
                )}
                {mapMode === 'detection' && (
                  <>
                    <div className="flex items-center space-x-2">
                      <Fingerprint size={16} className="text-blue-500" />
                      <span className="text-xs">Face Detections:</span>
                      <Badge variant="outline" className="ml-auto">
                        {detections.filter(d => d.type === 'face').length}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CreditCard size={16} className="text-blue-500" />
                      <span className="text-xs">License Plates:</span>
                      <Badge variant="outline" className="ml-auto">
                        {detections.filter(d => d.type === 'license_plate').length}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Risk zones - only show if layer is active */}
        {activeLayers.riskZones && riskZones.map((zone) => (
          <RiskZoneComponent 
            key={zone.id} 
            riskZone={zone}
            isInteractive={true}
            onSelect={handleSelectRiskZone}
          />
        ))}
        
        {/* Vehicle markers - only show if layer is active */}
        {activeLayers.vehicles && telemetryData.map((telemetry) => {
          const vehicle = vehicles.find(v => v.vehicleId === telemetry.vehicleId);
          if (!vehicle) return null;
          
          const inDanger = isVehicleInDanger(telemetry);
          const highlightDanger = mapMode === 'threat' && inDanger;
          
          return (
            <VehicleMarker
              key={telemetry.vehicleId}
              vehicle={vehicle}
              telemetry={telemetry}
              isSelected={selectedVehicleId === telemetry.vehicleId}
              isHighRisk={highlightDanger}
              onClick={() => handleSelectVehicle(telemetry.vehicleId)}
            />
          );
        })}
        
        {/* Detection points */}
        {activeLayers.faceDetections && mapMode === 'detection' && detections
          .filter(d => d.type === 'face' && d.metadata?.latitude && d.metadata?.longitude)
          .map((detection, index) => (
            <div 
              key={`face-${detection.id || index}`}
              className="absolute w-4 h-4 rounded-full bg-blue-600 border-2 border-white animate-pulse z-30"
              style={{
                top: `${50 - ((detection.metadata!.latitude as number + 26) * 100)}%`,
                left: `${((detection.metadata!.longitude as number - 28) * 100) + 50}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full h-full" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-blue-800">
                    <div className="text-xs space-y-1">
                      <p className="font-bold">Face Detection</p>
                      <p>Confidence: {(detection.confidence * 100).toFixed(1)}%</p>
                      <p>Vehicle: {detection.vehicleId}</p>
                      {detection.metadata?.personCategory && (
                        <p>Category: {detection.metadata.personCategory}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))
        }
        
        {/* License plate detections */}
        {activeLayers.licensePlateDetections && mapMode === 'detection' && detections
          .filter(d => d.type === 'license_plate' && d.metadata?.latitude && d.metadata?.longitude)
          .map((detection, index) => (
            <div 
              key={`plate-${detection.id || index}`}
              className="absolute w-5 h-3 rounded-sm bg-green-600 border-2 border-white z-30"
              style={{
                top: `${50 - ((detection.metadata!.latitude as number + 26) * 100)}%`,
                left: `${((detection.metadata!.longitude as number - 28) * 100) + 50}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-full h-full" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black/90 border-green-800">
                    <div className="text-xs space-y-1">
                      <p className="font-bold">License Plate</p>
                      <p>Plate: {detection.metadata?.licensePlate || "Unknown"}</p>
                      <p>Confidence: {(detection.confidence * 100).toFixed(1)}%</p>
                      {detection.metadata?.plateDetectedLocations && (
                        <p>Multiple Locations: {(detection.metadata.plateDetectedLocations as any[]).length}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))
        }

        {/* Time indicator */}
        <div className="absolute bottom-20 left-4 z-40">
          <div className="bg-black/70 backdrop-blur-sm rounded-md py-1 px-3 text-xs text-white">
            <span className="text-gray-400">Last updated: </span>
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Map controls */}
      <div className="map-controls absolute bottom-4 right-4 z-50 bg-zinc-900/90 backdrop-blur-sm rounded-lg flex flex-col divide-y divide-zinc-800">
        <div className="p-2 space-y-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={zoomIn}>
                  <Plus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={zoomOut}>
                  <Minus size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8" onClick={resetZoom}>
                  <Locate size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Reset View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant={showLayers ? "secondary" : "ghost"} 
                  size="icon" 
                  className="w-8 h-8" 
                  onClick={() => setShowLayers(!showLayers)}
                >
                  <Layers size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">Toggle Layers</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Layers panel */}
      <AnimatePresence>
        {showLayers && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute bottom-4 right-20 z-50 bg-zinc-900/95 backdrop-blur-sm rounded-lg p-3 w-60"
          >
            <h3 className="text-xs font-semibold mb-2 flex items-center">
              <Layers size={14} className="mr-1" /> Map Layers
            </h3>
            <Separator className="mb-2" />
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck size={14} className="mr-1.5" />
                  <span className="text-xs">Vehicles</span>
                </div>
                <div 
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${activeLayers.vehicles ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  onClick={() => toggleLayer('vehicles')}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${activeLayers.vehicles ? 'translate-x-4' : 'translate-x-1'}`} 
                    style={{ marginTop: '2px' }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle size={14} className="mr-1.5" />
                  <span className="text-xs">Risk Zones</span>
                </div>
                <div 
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${activeLayers.riskZones ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  onClick={() => toggleLayer('riskZones')}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${activeLayers.riskZones ? 'translate-x-4' : 'translate-x-1'}`} 
                    style={{ marginTop: '2px' }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Fingerprint size={14} className="mr-1.5" />
                  <span className="text-xs">Face Detections</span>
                </div>
                <div 
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${activeLayers.faceDetections ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  onClick={() => toggleLayer('faceDetections')}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${activeLayers.faceDetections ? 'translate-x-4' : 'translate-x-1'}`} 
                    style={{ marginTop: '2px' }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard size={14} className="mr-1.5" />
                  <span className="text-xs">License Plates</span>
                </div>
                <div 
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${activeLayers.licensePlateDetections ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  onClick={() => toggleLayer('licensePlateDetections')}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${activeLayers.licensePlateDetections ? 'translate-x-4' : 'translate-x-1'}`} 
                    style={{ marginTop: '2px' }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserCog size={14} className="mr-1.5" />
                  <span className="text-xs">Proximity Warnings</span>
                </div>
                <div 
                  className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${activeLayers.proximityWarnings ? 'bg-blue-600' : 'bg-zinc-700'}`}
                  onClick={() => toggleLayer('proximityWarnings')}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-white transition-transform ${activeLayers.proximityWarnings ? 'translate-x-4' : 'translate-x-1'}`} 
                    style={{ marginTop: '2px' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FleetMap;
