import { Route } from '@/types';

interface RouteItemProps {
  route: Route;
  onSelect: () => void;
}

const RouteItem = ({ route, onSelect }: RouteItemProps) => {
  // Determine border color based on risk level
  const getBorderColor = () => {
    switch (route.riskLevel) {
      case 'low':
        return 'border-green-500';
      case 'medium':
        return 'border-amber-500';
      case 'high':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };
  
  // Determine badge color based on risk level
  const getBadgeColor = () => {
    switch (route.riskLevel) {
      case 'low':
        return 'bg-green-500 bg-opacity-20 text-green-500';
      case 'medium':
        return 'bg-amber-500 bg-opacity-20 text-amber-500';
      case 'high':
        return 'bg-red-500 bg-opacity-20 text-red-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };
  
  // Format risk level for display
  const formatRiskLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1) + ' Risk';
  };
  
  return (
    <div className={`bg-zinc-800 rounded-lg p-3 flex items-center border-l-4 ${getBorderColor()}`}>
      <div className="flex-1">
        <div className="flex items-center">
          <h5 className="font-medium">{route.name}</h5>
          <span className={`ml-3 px-2 py-0.5 text-xs rounded ${getBadgeColor()}`}>
            {formatRiskLevel(route.riskLevel)}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Via {route.metadata?.via || 'Direct Route'} - {route.distance}km
        </p>
      </div>
      <button 
        className="bg-zinc-700 hover:bg-zinc-600 text-sm px-3 py-1 rounded"
        onClick={onSelect}
      >
        Select
      </button>
    </div>
  );
};

export default RouteItem;
