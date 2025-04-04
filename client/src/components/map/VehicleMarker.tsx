import { Vehicle, Telemetry } from '@/types';
import { motion } from 'framer-motion';
import { AlertTriangle, Truck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VehicleMarkerProps {
  vehicle: Vehicle;
  telemetry: Telemetry;
  isSelected: boolean;
  isHighRisk?: boolean;
  onClick: () => void;
}

const VehicleMarker = ({ 
  vehicle, 
  telemetry, 
  isSelected, 
  isHighRisk = false, 
  onClick 
}: VehicleMarkerProps) => {
  // Determine status color
  const getStatusColor = () => {
    // High risk takes precedence in threat monitoring mode
    if (isHighRisk) return 'bg-red-600';
    
    // Regular status colors
    if (vehicle.status === 'alert') return 'bg-red-500';
    
    // Check speed or door status for caution state
    if (telemetry.speed && telemetry.speed > 40) return 'bg-amber-500';
    if (telemetry.doorStatus === 'Open') return 'bg-amber-500';
    if (telemetry.cellularNetwork === 'Limited') return 'bg-amber-500';
    if (telemetry.stressLevel && telemetry.stressLevel > 50) return 'bg-amber-500';
    
    return 'bg-green-500'; // Default safe status
  };
  
  // Calculate position based on telemetry lat/lng
  // This is a simplified positioning - in a real app, you would use proper map projection
  const positionStyle = {
    top: `${50 - ((telemetry.latitude + 26) * 100)}%`, // Simplified for demo
    left: `${((telemetry.longitude - 28) * 100) + 50}%`, // Simplified for demo
  };
  
  // Get stress level indicator
  const getStressIndicator = () => {
    if (!telemetry.stressLevel) return null;
    
    if (telemetry.stressLevel > 70) return 'high';
    if (telemetry.stressLevel > 40) return 'medium';
    return 'low';
  };
  
  // Get panic probability indicator
  const getPanicIndicator = () => {
    if (!telemetry.panicProbability) return null;
    
    if (telemetry.panicProbability > 50) return 'high';
    if (telemetry.panicProbability > 20) return 'medium';
    return 'low';
  };
  
  // Get biometric status summary
  const getBiometricSummary = () => {
    const stressLevel = getStressIndicator();
    const panicLevel = getPanicIndicator();
    
    if (stressLevel === 'high' || panicLevel === 'high') return 'Urgent Attention Required';
    if (stressLevel === 'medium' || panicLevel === 'medium') return 'Monitor Closely';
    return 'Normal';
  };
  
  // Format for tooltip display
  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value}`;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className={`vehicle-marker ${getStatusColor()} 
                       ${isSelected ? 'ring-2 ring-white z-40' : 'z-30'} 
                       ${isHighRisk ? 'shadow-lg shadow-red-500/50' : ''}`}
            style={positionStyle}
            onClick={onClick}
            whileHover={{ scale: 1.2 }}
            animate={isHighRisk ? { 
              scale: [1, 1.3, 1],
              boxShadow: [
                '0 0 0 0 rgba(239, 68, 68, 0.7)',
                '0 0 0 10px rgba(239, 68, 68, 0)',
                '0 0 0 0 rgba(239, 68, 68, 0)'
              ]
            } : {}}
            transition={isHighRisk ? { 
              repeat: Infinity, 
              duration: 2 
            } : {}}
          >
            {isHighRisk && (
              <div className="absolute -top-4 -right-1 text-red-500">
                <AlertTriangle size={12} className="animate-pulse" />
              </div>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-black/90 border-zinc-700 p-3 max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Truck size={16} className="mr-2" />
                <h4 className="font-bold">{vehicle.vehicleId}</h4>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                vehicle.status === 'active' ? 'bg-green-900/60 text-green-200' :
                vehicle.status === 'alert' ? 'bg-red-900/60 text-red-200' :
                'bg-zinc-800 text-zinc-200'
              }`}>
                {vehicle.status.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="text-zinc-400">Location:</span>
                <div>
                  {telemetry.latitude.toFixed(4)}, {telemetry.longitude.toFixed(4)}
                </div>
              </div>
              
              <div>
                <span className="text-zinc-400">Speed:</span>
                <div>
                  {formatValue(telemetry.speed)} km/h
                </div>
              </div>
              
              <div>
                <span className="text-zinc-400">Door:</span>
                <div>
                  {telemetry.doorStatus || 'Unknown'}
                </div>
              </div>
              
              <div>
                <span className="text-zinc-400">Vault:</span>
                <div>
                  {telemetry.vaultStatus || 'Unknown'}
                </div>
              </div>
              
              <div>
                <span className="text-zinc-400">Signal:</span>
                <div>
                  {telemetry.gpsSignal || 'Unknown'}/{telemetry.cellularNetwork || 'Unknown'}
                </div>
              </div>
              
              {(telemetry.stressLevel || telemetry.panicProbability) && (
                <div>
                  <span className="text-zinc-400">Biometrics:</span>
                  <div className={`
                    ${getBiometricSummary() === 'Urgent Attention Required' ? 'text-red-400' : 
                      getBiometricSummary() === 'Monitor Closely' ? 'text-amber-400' : 'text-green-400'}
                  `}>
                    {getBiometricSummary()}
                  </div>
                </div>
              )}
              
              {telemetry.guardFearLevel && (
                <div className="col-span-2">
                  <span className="text-zinc-400">Fear Detection:</span>
                  <div className="w-full h-2 bg-zinc-700 rounded-full mt-1">
                    <div
                      className={`h-full rounded-full ${
                        telemetry.guardFearLevel > 70 ? 'bg-red-500' :
                        telemetry.guardFearLevel > 40 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${telemetry.guardFearLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VehicleMarker;
