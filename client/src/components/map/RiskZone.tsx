import { useState, useEffect } from 'react';
import { RiskZone } from '@/types';
import { AlertTriangle, ShieldAlert, Info, Eye } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';

interface RiskZoneProps {
  riskZone: RiskZone;
  isInteractive?: boolean;
  onSelect?: (riskZone: RiskZone) => void;
}

const RiskZoneComponent = ({ riskZone, isInteractive = true, onSelect }: RiskZoneProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(riskZone.riskLevel === 'critical' || riskZone.riskLevel === 'high');

  // Simulate real-time risk level changes for demonstration purposes
  useEffect(() => {
    if (riskZone.riskLevel === 'high' || riskZone.riskLevel === 'critical') {
      const interval = setInterval(() => {
        setIsPulsing(prev => !prev);
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [riskZone.riskLevel]);
  
  // Determine color based on risk level
  const getColor = () => {
    switch (riskZone.riskLevel) {
      case 'critical':
        return 'bg-purple-600';
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-amber-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getBorderColor = () => {
    switch (riskZone.riskLevel) {
      case 'critical':
        return 'border-purple-600';
      case 'high':
        return 'border-red-500';
      case 'medium':
        return 'border-amber-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  const getRiskIcon = () => {
    switch (riskZone.riskLevel) {
      case 'critical':
        return <ShieldAlert size={16} className="text-white" />;
      case 'high':
        return <AlertTriangle size={16} className="text-white" />;
      case 'medium':
        return <Info size={16} className="text-white" />;
      case 'low':
        return <Eye size={16} className="text-white" />;
      default:
        return <Info size={16} className="text-white" />;
    }
  };
  
  // Calculate size based on radius
  const size = Math.min(200, Math.max(50, riskZone.radius / 20));
  
  // Calculate position based on lat/lng
  // This is a simplified positioning - in a real app, you would use proper map projection
  const positionStyle = {
    top: `${50 - ((riskZone.latitude + 26) * 100)}%`, // Simplified for demo
    left: `${((riskZone.longitude - 28) * 100) + 50}%`, // Simplified for demo
    width: `${size}px`,
    height: `${size}px`,
  };
  
  const handleClick = () => {
    if (isInteractive && onSelect) {
      onSelect(riskZone);
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className={`
              risk-zone 
              ${getColor()} 
              bg-opacity-40 
              rounded-full 
              absolute 
              border-2 
              ${getBorderColor()}
              backdrop-blur-sm
              ${isHovered ? 'z-20' : 'z-10'}
              ${isInteractive ? 'cursor-pointer' : 'cursor-default'}
              transition-all
              duration-300 ease-in-out
            `}
            style={positionStyle}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ 
              scale: isPulsing ? 1.05 : 1,
              opacity: isPulsing ? 0.9 : 0.8,
              boxShadow: isPulsing ? '0 0 20px rgba(255,0,0,0.4)' : '0 0 0px rgba(0,0,0,0)'
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            <AnimatePresence>
              {isHovered && (
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 rounded-lg p-2 whitespace-nowrap"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="p-1 rounded-full bg-opacity-80 flex items-center justify-center">
                      {getRiskIcon()}
                    </div>
                    <p className="text-white text-xs font-semibold">{riskZone.name}</p>
                  </div>
                  <Badge className={`mt-1 ${getColor()} bg-opacity-70 w-full justify-center text-[10px]`}>
                    {riskZone.riskLevel.toUpperCase()} RISK
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <p className="font-bold">{riskZone.name}</p>
            <p className="text-xs">Risk Level: <span className="font-semibold">{riskZone.riskLevel.toUpperCase()}</span></p>
            <p className="text-xs">Radius: {riskZone.radius}m</p>
            {riskZone.metadata && riskZone.metadata.incidents && (
              <p className="text-xs">Recent Incidents: {riskZone.metadata.incidents}</p>
            )}
            {riskZone.metadata && riskZone.metadata.lastUpdated && (
              <p className="text-xs text-gray-400">Updated: {new Date(riskZone.metadata.lastUpdated).toLocaleString()}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RiskZoneComponent;
