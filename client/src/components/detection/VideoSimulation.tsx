import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  Check,
  ChevronRight,
  Clock,
  FileVideo,
  Info,
  Layers,
  List,
  Maximize,
  Minimize,
  Shield,
  Upload,
  VideoIcon,
  X
} from 'lucide-react';

interface DetectedObject {
  type: 'person' | 'weapon' | 'vehicle' | 'face' | 'gesture' | 'license_plate';
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: {
    id?: string;
    class?: string;
    model?: string;
    plate?: string;
    timestamp?: string;
    location?: string;
    distance?: number;
    matchScore?: number;
    matchedWith?: {
      id: string;
      timestamp: string;
      location: string;
    }[];
  };
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: 'detection' | 'alert' | 'system' | 'user_action';
  description: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

interface VideoFile {
  id: string;
  name: string;
  source: string;
  camera: string;
  location: string;
  uploadTime: string;
  duration: number;
  detections: DetectedObject[];
}

const VideoSimulation: React.FC = () => {
  const [uploadedVideos, setUploadedVideos] = useState<VideoFile[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);

  // Mock data for demonstration
  const mockVideos: VideoFile[] = [
    {
      id: 'vid-001',
      name: 'Front Camera - 10:15 AM.mp4',
      source: '/videos/front-camera.mp4',
      camera: 'Front Camera',
      location: 'Vehicle Front',
      uploadTime: '2025-03-30T10:20:00Z',
      duration: 45,
      detections: [
        {
          type: 'person',
          confidence: 0.94,
          boundingBox: { x: 120, y: 80, width: 100, height: 200 },
          metadata: {
            id: 'person-1',
            timestamp: '10:15:23 AM',
            location: 'Vehicle Front'
          }
        },
        {
          type: 'weapon',
          confidence: 0.87,
          boundingBox: { x: 180, y: 150, width: 40, height: 20 },
          metadata: {
            id: 'weapon-1',
            class: 'handgun',
            timestamp: '10:15:26 AM',
            location: 'Vehicle Front'
          }
        }
      ]
    },
    {
      id: 'vid-002',
      name: 'Side Camera - 10:14 AM.mp4',
      source: '/videos/side-camera.mp4',
      camera: 'Right Side Camera',
      location: 'Vehicle Right Side',
      uploadTime: '2025-03-30T10:21:00Z',
      duration: 60,
      detections: [
        {
          type: 'vehicle',
          confidence: 0.96,
          boundingBox: { x: 50, y: 100, width: 200, height: 150 },
          metadata: {
            id: 'vehicle-1',
            class: 'sedan',
            timestamp: '10:14:15 AM',
            location: 'Vehicle Right Side',
            distance: 12
          }
        },
        {
          type: 'license_plate',
          confidence: 0.83,
          boundingBox: { x: 110, y: 160, width: 80, height: 20 },
          metadata: {
            id: 'plate-1',
            plate: 'ABC123',
            timestamp: '10:14:17 AM',
            location: 'Vehicle Right Side',
            matchedWith: [
              {
                id: 'plate-previous-1',
                timestamp: '09:45:22 AM',
                location: 'Shopping Mall Entrance'
              }
            ]
          }
        }
      ]
    }
  ];

  const mockTimeline: TimelineEvent[] = [
    {
      id: 'event-001',
      timestamp: '10:14:15 AM',
      type: 'detection',
      description: 'Vehicle detected on right side',
      severity: 'info',
      metadata: {
        objectId: 'vehicle-1',
        videoId: 'vid-002'
      }
    },
    {
      id: 'event-002',
      timestamp: '10:14:17 AM',
      type: 'detection',
      description: 'License plate ABC123 detected and matched with previous sighting',
      severity: 'medium',
      metadata: {
        objectId: 'plate-1',
        videoId: 'vid-002',
        matchCount: 1
      }
    },
    {
      id: 'event-003',
      timestamp: '10:15:23 AM',
      type: 'detection',
      description: 'Person detected approaching vehicle',
      severity: 'low',
      metadata: {
        objectId: 'person-1',
        videoId: 'vid-001'
      }
    },
    {
      id: 'event-004',
      timestamp: '10:15:26 AM',
      type: 'detection',
      description: 'Weapon detected - handgun',
      severity: 'critical',
      metadata: {
        objectId: 'weapon-1',
        videoId: 'vid-001'
      }
    },
    {
      id: 'event-005',
      timestamp: '10:15:27 AM',
      type: 'alert',
      description: 'CRITICAL ALERT: Weapon detected near vehicle',
      severity: 'critical',
      metadata: {
        objectId: 'weapon-1',
        videoId: 'vid-001',
        alertId: 'alert-001'
      }
    },
    {
      id: 'event-006',
      timestamp: '10:15:28 AM',
      type: 'system',
      description: 'Automatic lock engaged on all doors',
      severity: 'info'
    },
    {
      id: 'event-007',
      timestamp: '10:15:29 AM',
      type: 'system',
      description: 'Silent alarm triggered to central monitoring',
      severity: 'high'
    },
    {
      id: 'event-008',
      timestamp: '10:15:35 AM',
      type: 'user_action',
      description: 'Driver initiated emergency response protocol',
      severity: 'high'
    }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newVideos: VideoFile[] = files.map((file, index) => ({
        id: `upload-${Date.now()}-${index}`,
        name: file.name,
        source: URL.createObjectURL(file),
        camera: 'Unknown Camera',
        location: 'Custom Upload',
        uploadTime: new Date().toISOString(),
        duration: 0, // Would calculate from actual video metadata
        detections: []
      }));
      
      setUploadedVideos([...uploadedVideos, ...newVideos]);
    }
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeVideo = (id: string) => {
    setUploadedVideos(uploadedVideos.filter(video => video.id !== id));
  };

  const toggleVideoExpand = (id: string) => {
    if (expandedVideo === id) {
      setExpandedVideo(null);
    } else {
      setExpandedVideo(id);
    }
  };

  const startSimulation = () => {
    setSimulationRunning(true);
    setActiveTab('simulation');
    setSimulationProgress(0);
    setSimulationComplete(false);
    setDetectedObjects([]);
    setTimeline([]);
    
    // In a real implementation, we would process the videos
    // For now, simulate the process with a timer
    const simulationDuration = 3000; // 3 seconds for demo
    const interval = 50;
    let progress = 0;
    
    const simulationTimer = setInterval(() => {
      progress += (interval / simulationDuration) * 100;
      setSimulationProgress(Math.min(progress, 100));
      
      if (progress >= 100) {
        clearInterval(simulationTimer);
        setSimulationRunning(false);
        setSimulationComplete(true);
        
        // In a real implementation, this would be the result of video processing
        // For now, use our mock data
        setDetectedObjects([
          ...mockVideos[0].detections,
          ...mockVideos[1].detections
        ]);
        
        setTimeline(mockTimeline);
        
        // Set the uploaded videos to include our mock videos for demonstration
        // In a real implementation, we would process the actual uploaded videos
        if (uploadedVideos.length === 0) {
          setUploadedVideos(mockVideos);
        }
      }
    }, interval);
  };

  const resetSimulation = () => {
    setSimulationRunning(false);
    setSimulationComplete(false);
    setSimulationProgress(0);
    setDetectedObjects([]);
    setTimeline([]);
    setActiveTab('upload');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-zinc-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'detection': return <Camera className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'system': return <Shield className="h-4 w-4" />;
      case 'user_action': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <VideoIcon className="h-5 w-5 text-blue-400" />
            Incident Video Simulation
          </CardTitle>
          <CardDescription>
            Upload video footage to analyze how the security system would have interacted and responded to the incident
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="upload">Upload Videos</TabsTrigger>
              <TabsTrigger value="simulation" disabled={uploadedVideos.length === 0 && !simulationComplete}>Simulation</TabsTrigger>
              <TabsTrigger value="timeline" disabled={!simulationComplete}>Timeline Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-6">
              <div className="flex flex-col items-center p-8 border-2 border-dashed border-zinc-700 rounded-lg">
                <FileVideo className="h-12 w-12 text-zinc-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Video Files</h3>
                <p className="text-zinc-400 text-sm mb-4 text-center">
                  Upload multiple video files from different cameras to analyze the incident from various angles.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  multiple
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={handleTriggerFileInput}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Select Videos
                </Button>
              </div>
              
              {uploadedVideos.length > 0 && (
                <>
                  <h3 className="text-lg font-medium mb-2">Uploaded Videos ({uploadedVideos.length})</h3>
                  <div className="space-y-3">
                    {uploadedVideos.map(video => (
                      <div 
                        key={video.id} 
                        className="flex flex-col bg-zinc-800 rounded-lg overflow-hidden"
                      >
                        <div className="flex justify-between items-center p-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-zinc-700 p-2 rounded-lg">
                              <FileVideo className="h-5 w-5 text-zinc-300" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{video.name}</h4>
                              <div className="text-xs text-zinc-400 mt-1">
                                <span>{video.camera}</span>
                                <span className="mx-2">•</span>
                                <span>{video.location}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => toggleVideoExpand(video.id)}
                            >
                              {expandedVideo === video.id ? (
                                <Minimize className="h-4 w-4" />
                              ) : (
                                <Maximize className="h-4 w-4" />
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                              onClick={() => removeVideo(video.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {expandedVideo === video.id && (
                          <div className="px-3 pb-3">
                            <Label htmlFor={`camera-${video.id}`} className="text-xs mb-1 block">Camera Name</Label>
                            <Input 
                              id={`camera-${video.id}`}
                              value={video.camera}
                              onChange={(e) => {
                                const updatedVideos = uploadedVideos.map(v => 
                                  v.id === video.id ? {...v, camera: e.target.value} : v
                                );
                                setUploadedVideos(updatedVideos);
                              }}
                              className="h-8 text-sm mb-2"
                            />
                            
                            <Label htmlFor={`location-${video.id}`} className="text-xs mb-1 block">Camera Location</Label>
                            <Input 
                              id={`location-${video.id}`}
                              value={video.location}
                              onChange={(e) => {
                                const updatedVideos = uploadedVideos.map(v => 
                                  v.id === video.id ? {...v, location: e.target.value} : v
                                );
                                setUploadedVideos(updatedVideos);
                              }}
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                
                  <div className="flex justify-end">
                    <Button 
                      onClick={startSimulation}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={simulationRunning}
                    >
                      {simulationRunning ? 'Processing...' : 'Run Simulation'}
                    </Button>
                  </div>
                </>
              )}

              {/* Demo data notice */}
              <div className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 text-xs text-zinc-400">
                <p className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  <span>
                    For demonstration purposes, you can run the simulation without uploading videos to see sample results.
                  </span>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="simulation" className="space-y-6">
              {simulationRunning ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Processing Videos...</h3>
                  <Progress value={simulationProgress} className="h-2 w-full">
                    <div className="h-full bg-blue-600 transition-all duration-300"></div>
                  </Progress>
                  <div className="text-sm text-zinc-400">
                    <p>Analyzing footage from {uploadedVideos.length} camera{uploadedVideos.length !== 1 ? 's' : ''}</p>
                    <ul className="mt-2 space-y-1 pl-5 list-disc">
                      <li>Detecting objects and persons</li>
                      <li>Identifying potential weapons</li>
                      <li>Cross-referencing with database</li>
                      <li>Generating incident timeline</li>
                    </ul>
                  </div>
                </div>
              ) : simulationComplete ? (
                <div className="space-y-4">
                  <div className="bg-green-900 bg-opacity-20 p-4 rounded-lg border border-green-900 border-opacity-20">
                    <h3 className="text-lg font-medium text-green-400 flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      Simulation Complete
                    </h3>
                    <p className="text-sm text-zinc-300 mt-1">
                      The system has analyzed the video footage and identified {detectedObjects.length} objects 
                      and generated a timeline with {timeline.length} events.
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Simulation Results</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">Simulation Speed:</span>
                      <Slider
                        value={[simulationSpeed]}
                        min={0.5}
                        max={2}
                        step={0.5}
                        onValueChange={(value) => setSimulationSpeed(value[0])}
                        className="w-32"
                      />
                      <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded">
                        {simulationSpeed}x
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {uploadedVideos.map(video => (
                      <Card key={video.id} className="border-zinc-800 bg-zinc-800">
                        <CardHeader className="p-3 pb-0">
                          <CardTitle className="text-base flex items-center gap-2">
                            <VideoIcon className="h-4 w-4 text-blue-400" />
                            {video.camera}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {video.location} • Duration: {video.duration}s
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3">
                          <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-zinc-600">
                            {/* In a real implementation, this would be the video playback */}
                            {/* For demo, just show a canvas that could display the video */}
                            <canvas 
                              ref={videoCanvasRef}
                              width={640}
                              height={360}
                              className="w-full h-full rounded-lg"
                            ></canvas>
                            <div className="absolute inset-0 flex items-center justify-center text-xs">
                              Video playback would appear here
                            </div>
                          </div>
                          
                          {video.detections.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-2">Detected Objects:</h4>
                              <div className="flex flex-wrap gap-2">
                                {video.detections.map((detection, idx) => (
                                  <Badge 
                                    key={idx} 
                                    className="bg-zinc-700 hover:bg-zinc-600 text-xs py-1"
                                  >
                                    {detection.type} ({(detection.confidence * 100).toFixed(0)}%)
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button onClick={resetSimulation} variant="outline">
                      New Simulation
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('timeline')} 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View Timeline Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-zinc-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Simulation Run Yet</h3>
                  <p className="text-zinc-400 text-sm mb-4 text-center">
                    Upload videos and run a simulation to see the results.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    variant="outline"
                  >
                    Go to Upload
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline" className="space-y-6">
              {!simulationComplete ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-zinc-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Timeline Available</h3>
                  <p className="text-zinc-400 text-sm mb-4 text-center">
                    Complete a simulation first to generate a timeline.
                  </p>
                  <Button 
                    onClick={() => setActiveTab('upload')}
                    variant="outline"
                  >
                    Go to Upload
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Incident Timeline</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <List className="h-4 w-4" />
                        <span className="text-xs">Export</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <Layers className="h-4 w-4" />
                        <span className="text-xs">Filter</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {timeline.map((event) => (
                      <div 
                        key={event.id}
                        className="flex items-start p-3 rounded-lg hover:bg-zinc-800 transition-colors group"
                      >
                        <div className="flex items-center justify-center min-w-10 mr-3">
                          <div className={`h-8 w-8 flex items-center justify-center rounded-full ${getSeverityColor(event.severity)}`}>
                            {getTypeIcon(event.type)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">{event.description}</span>
                            <Badge 
                              className={`ml-2 text-xs ${getSeverityColor(event.severity)}`}
                            >
                              {event.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-zinc-400 mt-1">
                            {event.timestamp}
                            {event.metadata?.videoId && (
                              <>
                                <span className="mx-2">•</span>
                                <span>
                                  {uploadedVideos.find(v => v.id === event.metadata?.videoId)?.camera || 'Unknown Camera'}
                                </span>
                              </>
                            )}
                          </div>
                          {event.metadata?.matchCount && (
                            <div className="mt-2 text-xs px-3 py-2 bg-zinc-800 rounded-lg">
                              <span className="text-blue-400">
                                Match found with {event.metadata.matchCount} previous sighting{event.metadata.matchCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="text-base font-medium mb-2">System Response Analysis</h3>
                    <p className="text-sm text-zinc-400 mb-3">
                      Based on the incident timeline, here's how the system would have responded:
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span>Threat detected and classified correctly within 3 seconds</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span>Vehicle security systems engaged automatically</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span>Alert sent to monitoring center with priority classification</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span>Cross-referenced license plate with previous locations</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-400" />
                        <span>Video evidence automatically preserved in secure storage</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoSimulation;