import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Pause, SkipBack, Download, Camera } from 'lucide-react';
import { Detection } from '@shared/schema';

// Define a simplified metadata type to help TypeScript
interface DetectionMetadata {
  latitude?: number;
  longitude?: number;
  additionalImages?: string[];
  [key: string]: any;
}

interface VideoReconstructionProps {
  detection: Detection;
  onClose: () => void;
}

const VideoReconstruction: React.FC<VideoReconstructionProps> = ({ detection, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30); // 10s before + 20s after
  const [captureMode, setCaptureMode] = useState<'before' | 'during' | 'after'>('during');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Cast metadata to the appropriate type for TypeScript
  const metadata = detection.metadata as DetectionMetadata | null | undefined;
  
  // Simulated video URL - In a real implementation, this would come from your API
  const videoUrl = `/api/detections/${detection.id}/video`;
  
  useEffect(() => {
    // Setup interval for playback
    let interval: NodeJS.Timeout | null = null;
    
    if (playing && videoRef.current) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1;
          if (newTime >= duration) {
            setPlaying(false);
            return duration;
          }
          return newTime;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [playing, duration]);
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);
  
  const handlePlayPause = () => {
    setPlaying(!playing);
  };
  
  const handleSliderChange = (value: number[]) => {
    setCurrentTime(value[0]);
    setPlaying(false);
  };
  
  const handleRestart = () => {
    setCurrentTime(0);
    setPlaying(true);
  };
  
  const handleSkipToDetection = () => {
    // Skip to the detection point (10 seconds into the video)
    setCurrentTime(10);
    setPlaying(false);
  };
  
  const handleCaptureModeChange = (mode: 'before' | 'during' | 'after') => {
    setCaptureMode(mode);
    switch (mode) {
      case 'before':
        setCurrentTime(5); // 5 seconds before detection
        break;
      case 'during':
        setCurrentTime(10); // At detection
        break;
      case 'after':
        setCurrentTime(15); // 5 seconds after detection
        break;
    }
    setPlaying(false);
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds}`;
  };
  
  const handleScreenshot = () => {
    if (!videoRef.current) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    // Draw the current frame to the canvas
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Create a download link
      const link = document.createElement('a');
      link.download = `detection-${detection.id}-screenshot-${formatTime(currentTime)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };
  
  // Timeline markers
  const renderTimelineMarkers = () => {
    const markers = [];
    
    // Add marker for before detection period (0-10s)
    markers.push(
      <div 
        key="before" 
        className="absolute top-0 h-4 bg-yellow-500 opacity-20" 
        style={{ 
          left: '0%', 
          width: '33%',
          opacity: captureMode === 'before' ? 0.4 : 0.2 
        }}
      />
    );
    
    // Add marker for detection moment (10s)
    markers.push(
      <div 
        key="detection" 
        className="absolute top-0 h-4 bg-red-500" 
        style={{ 
          left: '33%', 
          width: '33%',
          opacity: captureMode === 'during' ? 0.4 : 0.2 
        }}
      />
    );
    
    // Add marker for after detection period (10-30s)
    markers.push(
      <div 
        key="after" 
        className="absolute top-0 h-4 bg-blue-500 opacity-20" 
        style={{ 
          left: '66%', 
          width: '34%',
          opacity: captureMode === 'after' ? 0.4 : 0.2 
        }}
      />
    );
    
    return markers;
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Video Reconstruction: {detection.type} Detection
            {detection.confidence && ` (${(detection.confidence * 100).toFixed(1)}% confidence)`}
          </span>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-black rounded-md overflow-hidden aspect-video mb-4">
          {/* Video would be replaced with actual video feed in production */}
          <div className="absolute inset-0 flex items-center justify-center text-white">
            {/* Placeholder for actual video - would be replaced with actual element */}
            <video 
              ref={videoRef}
              className="w-full h-full object-contain"
              src={videoUrl}
              poster={`/api/detections/${detection.id}/thumbnail`}
            />
            
            {/* Overlay showing detection data */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
              <div>Time: {formatTime(currentTime)}</div>
              <div>Vehicle: {detection.vehicleId}</div>
              <div>Location: {
                metadata && metadata.latitude && metadata.longitude
                  ? `${metadata.latitude.toFixed(4)}, ${metadata.longitude.toFixed(4)}`
                  : 'Unknown'
              }</div>
            </div>
            
            {/* Red box around detected object - position would be dynamic in real implementation */}
            {captureMode === 'during' && (
              <div className="absolute border-2 border-red-500 w-48 h-48 flex items-center justify-center">
                <span className="bg-red-500 bg-opacity-50 px-2 py-1 text-xs uppercase font-bold">
                  {detection.type}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Timeline with markers */}
          <div className="relative pt-4">
            <div className="relative">
              {renderTimelineMarkers()}
              <Slider
                value={[currentTime]}
                min={0}
                max={duration}
                step={0.1}
                onValueChange={handleSliderChange}
                className="z-10"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-10s (Before)</span>
              <span>Detection Point</span>
              <span>+20s (After)</span>
            </div>
          </div>
          
          {/* Playback controls */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleRestart}>
                <SkipBack className="h-4 w-4 mr-1" /> Start
              </Button>
              <Button variant="outline" size="sm" onClick={handleSkipToDetection}>
                <ChevronRight className="h-4 w-4 mr-1" /> Detection Point
              </Button>
              <Button variant="outline" size="sm" onClick={handleScreenshot}>
                <Camera className="h-4 w-4 mr-1" /> Screenshot
              </Button>
            </div>
            
            <div className="text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant={captureMode === 'before' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => handleCaptureModeChange('before')}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Before
              </Button>
              <Button 
                variant={captureMode === 'during' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => handleCaptureModeChange('during')}
              >
                During
              </Button>
              <Button 
                variant={captureMode === 'after' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => handleCaptureModeChange('after')}
              >
                After <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="w-32"
              onClick={handlePlayPause}
            >
              {playing ? (
                <><Pause className="h-5 w-5 mr-2" /> Pause</>
              ) : (
                <><Play className="h-5 w-5 mr-2" /> Play</>
              )}
            </Button>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
            <h4 className="text-sm font-semibold mb-2">Detection Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">ID:</span> {detection.id}
              </div>
              <div>
                <span className="font-medium">Timestamp:</span> {new Date(detection.timestamp).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Type:</span> {detection.type}
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {detection.confidence ? `${(detection.confidence * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Location:</span> {
                  metadata && metadata.latitude && metadata.longitude
                    ? `${metadata.latitude.toFixed(4)}, ${metadata.longitude.toFixed(4)}`
                    : 'Unknown'
                }
              </div>
              {metadata && metadata.additionalImages && (
                <div className="col-span-2">
                  <span className="font-medium">Additional Images:</span> {
                    Array.isArray(metadata.additionalImages) 
                      ? metadata.additionalImages.length 
                      : 0
                  } available
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" className="mr-2">
              <Download className="h-4 w-4 mr-2" /> Export Video
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoReconstruction;