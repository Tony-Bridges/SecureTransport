import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Detection, Vehicle } from '@/types';
import Header from '@/components/layout/Header';
import CameraFeed from '@/components/detection/CameraFeed';
import DetectionItem from '@/components/detection/DetectionItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, CameraOff, Shield, EyeOff, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const LiveFeeds = () => {
  // State for user info
  const user = {
    name: 'John Doe',
    role: 'Security Admin'
  };

  // State for selected vehicle/camera
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('CIT-0118');
  const [selectedCamera, setSelectedCamera] = useState('main');

  // Fetch vehicles data
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  // Fetch detections data
  const { data: detections = [] } = useQuery<Detection[]>({
    queryKey: ['/api/detections'],
  });

  // Filter detections by selected vehicle
  const vehicleDetections = detections.filter(d => d.vehicleId === selectedVehicleId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Get active vehicles
  const activeVehicles = vehicles.filter(v => v.status === 'active');

  // Handler for vehicle selection
  const handleVehicleChange = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  // Camera options
  const cameraOptions = [
    { id: 'main', label: 'Main Camera' },
    { id: 'front', label: 'Front View' },
    { id: 'rear', label: 'Rear View' },
    { id: 'inside', label: 'Inside Vault' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <Header 
          title="Live Camera Feeds" 
          subtitle="Real-time visual monitoring of fleet" 
          icon={<Video className="h-6 w-6" />}
        />
        
        <div className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Select value={selectedVehicleId} onValueChange={handleVehicleChange}>
                <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {activeVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.vehicleId}>
                      {vehicle.vehicleId} - {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Tabs defaultValue={selectedCamera} onValueChange={setSelectedCamera} className="w-full sm:w-auto">
                <TabsList className="bg-zinc-900">
                  {cameraOptions.map((camera) => (
                    <TabsTrigger key={camera.id} value={camera.id}>
                      {camera.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Shield className="mr-2 h-4 w-4" /> AI Analysis
              </Button>
              <Button variant="outline" size="sm">
                <Maximize2 className="mr-2 h-4 w-4" /> Fullscreen
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Camera Feed</CardTitle>
                      <CardDescription>
                        {selectedCamera === 'main' ? 'Main camera view with AI detection' : 
                         selectedCamera === 'front' ? 'Front view of vehicle' :
                         selectedCamera === 'rear' ? 'Rear view of vehicle' : 'Inside vault camera'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></span>
                      <span>Live</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-black rounded-md overflow-hidden aspect-video">
                    <CameraFeed 
                      vehicleId={selectedVehicleId}
                      detections={vehicleDetections.slice(0, 1)}
                      cameraView={selectedCamera}
                    />
                    
                    <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded-full text-xs flex items-center">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                      REC | {new Date().toLocaleTimeString()}
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded-full text-xs">
                      {selectedVehicleId} - {selectedCamera.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {cameraOptions.map((camera) => (
                      <button
                        key={camera.id}
                        className={`aspect-video rounded-md overflow-hidden relative ${
                          selectedCamera === camera.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedCamera(camera.id)}
                      >
                        {camera.id === 'main' ? (
                          <CameraFeed 
                            vehicleId={selectedVehicleId}
                            detections={[]}
                            cameraView={camera.id}
                            thumbnail
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                            <CameraOff className="h-6 w-6 text-zinc-600" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 py-1 text-center text-xs">
                          {camera.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Vehicle Status</CardTitle>
                  <CardDescription>
                    Real-time status information for {selectedVehicleId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">Engine Status</div>
                      <div className="text-lg font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Running
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">Door Status</div>
                      <div className="text-lg font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Secured
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">Vault Status</div>
                      <div className="text-lg font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Locked
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">Personnel</div>
                      <div className="text-lg font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        3 Active
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>AI Detections</CardTitle>
                  <CardDescription>
                    Recent threat detections from selected vehicle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vehicleDetections.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 flex flex-col items-center">
                      <EyeOff className="h-8 w-8 mb-2 text-gray-500" />
                      <p>No detections for this vehicle</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vehicleDetections.slice(0, 5).map((detection) => (
                        <DetectionItem 
                          key={detection.id} 
                          detection={detection} 
                        />
                      ))}
                    </div>
                  )}
                  
                  {vehicleDetections.length > 0 && (
                    <Button variant="outline" className="w-full mt-4">
                      View All Detections
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Active Vehicles</CardTitle>
                  <CardDescription>
                    All vehicles currently active with camera feeds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeVehicles.map((vehicle) => (
                      <div 
                        key={vehicle.id} 
                        className={`p-3 rounded-lg flex items-center cursor-pointer ${
                          vehicle.vehicleId === selectedVehicleId 
                            ? 'bg-blue-600 bg-opacity-20 border-l-4 border-blue-600' 
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        onClick={() => handleVehicleChange(vehicle.vehicleId)}
                      >
                        <div className="bg-zinc-700 rounded-full p-2 mr-3">
                          <Video className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{vehicle.vehicleId}</div>
                          <div className="text-xs text-gray-400">{vehicle.division} Division</div>
                        </div>
                        <div className="ml-auto flex items-center">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          <span className="text-xs">Live</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveFeeds;