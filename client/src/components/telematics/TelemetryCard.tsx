import { Telemetry } from '@/types';

interface TelemetryCardProps {
  title: string;
  value: string | number;
  subtext: string;
  status: 'success' | 'warning' | 'danger' | 'neutral';
}

const TelemetryCard = ({ title, value, subtext, status }: TelemetryCardProps) => {
  // Determine status color
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-amber-500';
      case 'danger':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Determine text color for subtext
  const getSubtextColor = () => {
    switch (status) {
      case 'warning':
        return 'text-amber-500';
      case 'danger':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <div className="bg-zinc-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs text-gray-400">{title}</h4>
        <span className={`w-2 h-2 rounded-full ${getStatusColor()}`}></span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
      <p className={`text-xs mt-1 ${getSubtextColor()}`}>{subtext}</p>
    </div>
  );
};

export default TelemetryCard;
