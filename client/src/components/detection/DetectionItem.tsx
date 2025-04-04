import { useState } from 'react';
import { Detection } from '@shared/schema';
import { Shield, User, Car, Play } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import VideoReconstruction from './VideoReconstruction';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DetectionItemProps {
  detection: Detection;
}

const DetectionItem = ({ detection }: DetectionItemProps) => {
  const [videoOpen, setVideoOpen] = useState(false);
  
  // Calculate time since detection
  const timeSince = formatDistanceToNow(new Date(detection.timestamp), { addSuffix: true });
  
  // Determine icon based on detection type
  const renderIcon = () => {
    switch (detection.type) {
      case 'weapon':
        return <Shield className="text-red-500" />;
      case 'face':
        return <User className="text-amber-500" />;
      case 'license_plate':
        return <Car className="text-blue-500" />;
      default:
        return <Shield className="text-gray-500" />;
    }
  };
  
  // Format detection type for display
  const formatType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Format confidence as percentage
  const confidencePercent = detection.confidence ? (detection.confidence * 100).toFixed(1) + '%' : 'N/A';
  
  // Determine color based on detection type
  const getTypeColor = () => {
    switch (detection.type) {
      case 'weapon':
        return 'bg-red-500 bg-opacity-20 text-red-500';
      case 'face':
        return 'bg-amber-500 bg-opacity-20 text-amber-500';
      case 'license_plate':
        return 'bg-blue-500 bg-opacity-20 text-blue-500';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-500';
    }
  };
  
  return (
    <>
      <div className="flex items-center p-2 bg-gray-800 bg-opacity-50 rounded group">
        <div className="w-10 h-10 rounded bg-opacity-20 flex items-center justify-center">
          {renderIcon()}
        </div>
        <div className="ml-3 flex-grow">
          <p className="font-medium">{formatType(detection.type)} Detected</p>
          <p className="text-xs text-gray-400">{timeSince}</p>
        </div>
        <span className={`${getTypeColor()} text-xs px-2 py-1 rounded mr-2`}>
          {confidencePercent}
        </span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setVideoOpen(true)}
        >
          <Play className="h-4 w-4 mr-1" /> Video
        </Button>
      </div>
      
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0">
          <VideoReconstruction 
            detection={detection} 
            onClose={() => setVideoOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DetectionItem;
