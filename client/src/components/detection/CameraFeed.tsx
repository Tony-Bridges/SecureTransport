import { useState, useEffect } from 'react';
import { Detection } from '@/types';

interface CameraFeedProps {
  vehicleId: string;
  detections: Detection[];
  cameraView?: string;
  thumbnail?: boolean;
}

const CameraFeed = ({ vehicleId, detections, cameraView = 'main', thumbnail = false }: CameraFeedProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the timestamp every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format date for display
  const formattedDate = currentTime.toISOString().split('T')[0];
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Get camera display name based on view
  const getCameraDisplayName = () => {
    switch (cameraView) {
      case 'main': return 'External Cam 1';
      case 'front': return 'Front View';
      case 'rear': return 'Rear View';
      case 'inside': return 'Inside Vault';
      default: return 'External Cam 1';
    }
  };
  
  return (
    <div className={`camera-feed w-full relative ${thumbnail ? 'h-full' : ''}`}>
      {/* Simulated camera feed - would be replaced with actual RTSP stream or similar */}
      <div className={`w-full h-full bg-black ${!thumbnail ? 'aspect-video' : ''} flex items-center justify-center`}>
        {!thumbnail && <div className="text-gray-500 text-xs absolute top-2 left-2">LIVE FEED</div>}
        <div className="grid-dots absolute inset-0 opacity-20"></div>
      </div>
      
      {/* Detection overlays - only show in non-thumbnail mode */}
      {!thumbnail && detections.map((detection, index) => (
        <div 
          key={index}
          className={`detection-box border-2 absolute ${
            detection.type === 'weapon' ? 'border-red-500' : 
            detection.type === 'face' ? 'border-amber-500' : 'border-blue-500'
          }`}
          style={{
            top: `${30 + (index * 15)}%`,
            left: `${40 + (index * 10)}%`,
            width: detection.type === 'weapon' ? '120px' : '50px',
            height: detection.type === 'weapon' ? '60px' : '50px',
          }}
        >
          <div className={`detection-label text-white ${
            detection.type === 'weapon' ? 'bg-red-500' : 
            detection.type === 'face' ? 'bg-amber-500' : 'border-blue-500'
          }`}>
            {detection.type.charAt(0).toUpperCase() + detection.type.slice(1)} ({(detection.confidence * 100).toFixed(1)}%)
          </div>
        </div>
      ))}
      
      {/* Camera data overlay - simplified for thumbnails */}
      {!thumbnail ? (
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-xs text-white bg-black bg-opacity-60 p-2 rounded">
          <div>{vehicleId} - {getCameraDisplayName()}</div>
          <div>{formattedDate} {formattedTime}</div>
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-xs text-white text-center py-1">
          {getCameraDisplayName()}
        </div>
      )}
    </div>
  );
};

export default CameraFeed;
