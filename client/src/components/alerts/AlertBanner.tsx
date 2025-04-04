import { Alert } from '@/types';
import { AlertCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertBannerProps {
  alert: Alert;
  onDismiss: () => void;
}

const AlertBanner = ({ alert, onDismiss }: AlertBannerProps) => {
  // Format time
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true });
  
  // Only show seconds for recent alerts
  const shortTimeAgo = new Date().getTime() - new Date(alert.timestamp).getTime() < 60000
    ? `${Math.floor((new Date().getTime() - new Date(alert.timestamp).getTime()) / 1000)}s ago`
    : timeAgo;
  
  return (
    <div className="mb-6 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 flex items-center shadow-lg shadow-red-900/20 hover:shadow-red-900/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer card-hover">
      <div className="rounded-full bg-red-500 p-2 mr-4 notification-badge animate-pulse">
        <AlertCircle className="text-white" size={20} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white text-lg">ALERT: {alert.message}</h3>
        <p className="text-gray-300">
          Vehicle {alert.vehicleId}
          {alert.metadata?.location && `, ${alert.metadata.location}`}
        </p>
      </div>
      <div className="ml-4">
        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
          {shortTimeAgo}
        </span>
      </div>
      <button 
        className="ml-4 p-2 hover:bg-zinc-800 rounded-full transition-all duration-300 transform hover:rotate-90 hover:scale-110 interactive-item" 
        aria-label="Dismiss"
        onClick={onDismiss}
      >
        <X size={16} className="text-red-300 hover:text-white" />
      </button>
    </div>
  );
};

export default AlertBanner;
