import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  History as HistoryIcon, 
  Car, 
  Calendar, 
  Filter, 
  Download, 
  Search,
  User,
  Clock,
  Map,
  ChevronDown,
  ArrowUpDown,
  Gauge,
  Thermometer,
  Droplets,
  Battery,
  Fuel,
  Wrench,
  AlertTriangle,
  Cpu,
  Check
} from 'lucide-react';

import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const HistoryPage = () => {
  const user = {
    name: 'John Doe',
    role: 'Security Admin'
  };

  const [activeTab, setActiveTab] = useState<string>('incidents');
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('CIT-0118');
  
  // Filter states
  const [dateRange, setDateRange] = useState<string>('7');
  const [incidentType, setIncidentType] = useState<string>('all');

  // OBD Scanner data state
  const [obdData, setObdData] = useState({
    engineRPM: 820,
    speed: 0,
    engineTemp: 92,
    fuelLevel: 78,
    batteryVoltage: 12.6,
    oilPressure: 40,
    tirePressure: [
      { position: 'Front Left', value: 32.5, status: 'normal' },
      { position: 'Front Right', value: 32.0, status: 'normal' },
      { position: 'Rear Left', value: 33.0, status: 'normal' },
      { position: 'Rear Right', value: 31.5, status: 'normal' }
    ],
    diagnosticCodes: [
      { code: 'P0300', description: 'Random/Multiple Cylinder Misfire Detected', severity: 'medium', status: 'active' },
      { code: 'P0171', description: 'System Too Lean (Bank 1)', severity: 'low', status: 'pending' }
    ],
    lastUpdated: '10:45 AM'
  });

  // Query for detections history
  const { data: detections = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/detections'],
  });

  // Header actions
  const headerActions = (
    <>
      <Button variant="outline" className="mr-2">
        <Download className="mr-2 h-4 w-4" />
        Export
      </Button>
      <Button>
        <Search className="mr-2 h-4 w-4" />
        Advanced Search
      </Button>
    </>
  );

  // Dummy recognition data for facial analysis section
  const recognitionData = [
    { id: 1, timestamp: 'Today, 10:32 AM', confidence: 98.7, image: 'person1.jpg', name: 'Unknown Person', status: 'Suspicious', location: 'Johannesburg CBD' },
    { id: 2, timestamp: 'Today, 09:15 AM', confidence: 92.4, image: 'person2.jpg', name: 'Unknown Person', status: 'Suspicious', location: 'Sandton' },
    { id: 3, timestamp: 'Yesterday, 15:48 PM', confidence: 97.2, image: 'person3.jpg', name: 'John Smith', status: 'Known Criminal', location: 'Pretoria East' },
    { id: 4, timestamp: 'Mar 27, 14:22 PM', confidence: 89.5, image: 'person4.jpg', name: 'Unknown Person', status: 'Suspicious', location: 'Midrand' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <Header 
          title="History & Analytics" 
          subtitle="Review past incidents and vehicle data" 
          icon={<HistoryIcon className="h-6 w-6" />}
          actions={headerActions}
        />
        
        <div className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-zinc-900">
                <TabsTrigger value="incidents">Security Incidents</TabsTrigger>
                <TabsTrigger value="vehicle">Vehicle Telemetry</TabsTrigger>
                <TabsTrigger value="facial">Facial Recognition</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="incidents" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>Incident History</CardTitle>
                        <Button variant="ghost" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                      <CardDescription>
                        Past security incidents and detections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div>
                          <Label htmlFor="vehicle-select" className="text-xs">Vehicle</Label>
                          <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700">
                              <SelectValue placeholder="Select vehicle" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                              <SelectItem value="CIT-0118">CIT-0118</SelectItem>
                              <SelectItem value="CIT-0205">CIT-0205</SelectItem>
                              <SelectItem value="CIT-0092">CIT-0092</SelectItem>
                              <SelectItem value="all">All Vehicles</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="date-range" className="text-xs">Time Period</Label>
                          <Select value={dateRange} onValueChange={setDateRange}>
                            <SelectTrigger className="bg-zinc-800 border-zinc-700">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                              <SelectItem value="1">Last 24 Hours</SelectItem>
                              <SelectItem value="7">Last 7 Days</SelectItem>
                              <SelectItem value="30">Last 30 Days</SelectItem>
                              <SelectItem value="90">Last 90 Days</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="search"
                            placeholder="Search incidents..."
                            className="bg-zinc-800 border-zinc-700 pl-10"
                          />
                          <div className="absolute left-3 top-3 text-zinc-400">
                            <Search className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {isLoading ? (
                          <div className="text-center py-10">
                            <div className="inline-block animate-spin h-6 w-6 border-2 border-zinc-500 border-t-blue-500 rounded-full mb-2"></div>
                            <p>Loading detections...</p>
                          </div>
                        ) : detections.length === 0 ? (
                          <div className="text-center py-10 text-zinc-500">
                            <HistoryIcon className="h-10 w-10 mx-auto mb-2" />
                            <p>No detection history</p>
                          </div>
                        ) : (
                          detections.map((detection: any, index: number) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg ${
                                selectedIncident === detection ? 'bg-blue-600 bg-opacity-20 border-l-4 border-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
                              } cursor-pointer transition-colors`}
                              onClick={() => setSelectedIncident(detection)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{detection.type.charAt(0).toUpperCase() + detection.type.slice(1)} Detection</div>
                                <div className="text-xs text-zinc-400">{detection.timestamp}</div>
                              </div>
                              <div className="text-sm text-zinc-400 mt-1">
                                Vehicle {detection.vehicleId} in {detection.location}
                              </div>
                              <div className="mt-1.5 flex items-center">
                                <Badge 
                                  className={`${
                                    detection.confidence > 90 ? 'bg-green-500/20 text-green-500' :
                                    detection.confidence > 75 ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-red-500/20 text-red-500'
                                  }`}
                                >
                                  {detection.confidence}% Confidence
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Load More
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="col-span-2">
                  {selectedIncident ? (
                    <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{selectedIncident.type.charAt(0).toUpperCase() + selectedIncident.type.slice(1)} Detection</CardTitle>
                            <CardDescription className="mt-1">
                              {selectedIncident.timestamp} • {selectedIncident.location}
                            </CardDescription>
                          </div>
                          <Badge className="bg-green-500/20 text-green-500 text-sm py-1.5">
                            {selectedIncident.confidence}% Confidence
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                          <div className="bg-zinc-800 p-4 rounded-lg">
                            <div className="flex items-center mb-3">
                              <Car className="h-5 w-5 mr-2 text-blue-500" />
                              <h3 className="font-medium">Vehicle Details</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">ID:</span>
                                <span>{selectedIncident.vehicleId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Status:</span>
                                <span>In Transit</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Route:</span>
                                <span>Sandton-Pretoria</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Speed:</span>
                                <span>72 km/h</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-800 p-4 rounded-lg">
                            <div className="flex items-center mb-3">
                              <Calendar className="h-5 w-5 mr-2 text-purple-500" />
                              <h3 className="font-medium">Event Details</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Type:</span>
                                <span>{selectedIncident.type.charAt(0).toUpperCase() + selectedIncident.type.slice(1)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Detected:</span>
                                <span>{selectedIncident.timestamp}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Duration:</span>
                                <span>42 seconds</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Alert Generated:</span>
                                <span className="text-green-500">Yes</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-800 p-4 rounded-lg">
                            <div className="flex items-center mb-3">
                              <Map className="h-5 w-5 mr-2 text-green-500" />
                              <h3 className="font-medium">Location Details</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Area:</span>
                                <span>{selectedIncident.location}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Coordinates:</span>
                                <span>-25.7461, 28.1881</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Risk Zone:</span>
                                <span className="text-yellow-500">Medium</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Nearest SAPS:</span>
                                <span>4.3 km</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="font-medium text-lg mb-3">Detection Evidence</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                              <div className="text-center">
                                <Search className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">Video evidence</p>
                              </div>
                            </div>
                            
                            <div className="bg-zinc-800 p-4 rounded-lg h-full">
                              <h4 className="text-sm font-medium mb-3">Detection Analysis</h4>
                              <div className="space-y-2 text-sm text-zinc-400">
                                <p>• AI identified potential {selectedIncident.type} with {selectedIncident.confidence}% confidence</p>
                                <p>• Object detected at timestamp 14:22:45</p>
                                <p>• Location matched with known high-risk zone</p>
                                <p>• Alert triggered and sent to response team</p>
                                <p>• Response time: 3 minutes 22 seconds</p>
                                <p>• Confirmed as true positive by security team</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-lg mb-3">Vehicle Telemetry at Time of Incident</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-zinc-800 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Gauge className="h-4 w-4 mr-2 text-blue-500" />
                                <span className="text-sm">Speed</span>
                              </div>
                              <p className="text-xl font-medium">72 km/h</p>
                            </div>
                            
                            <div className="bg-zinc-800 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Clock className="h-4 w-4 mr-2 text-purple-500" />
                                <span className="text-sm">Engine Hours</span>
                              </div>
                              <p className="text-xl font-medium">3,248</p>
                            </div>
                            
                            <div className="bg-zinc-800 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Fuel className="h-4 w-4 mr-2 text-green-500" />
                                <span className="text-sm">Fuel Level</span>
                              </div>
                              <p className="text-xl font-medium">78%</p>
                            </div>
                            
                            <div className="bg-zinc-800 p-3 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Thermometer className="h-4 w-4 mr-2 text-red-500" />
                                <span className="text-sm">Engine Temp</span>
                              </div>
                              <p className="text-xl font-medium">92°C</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex-shrink-0 border-t border-zinc-800 pt-4">
                        <div className="flex gap-3 w-full">
                          <Button variant="outline" className="flex-1">
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                          </Button>
                          <Button className="flex-1">
                            View Full Details
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="bg-zinc-900 border-zinc-800 h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-zinc-700" />
                        <h3 className="text-xl font-medium mb-2">No Incident Selected</h3>
                        <p className="text-zinc-400 max-w-sm">
                          Select an incident from the list to view detailed information and analytics
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="vehicle" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Vehicle Diagnostic Data</CardTitle>
                      <CardDescription>OBD scanner telemetry information</CardDescription>
                    </div>
                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                      <SelectTrigger className="w-[180px] bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="CIT-0118">CIT-0118</SelectItem>
                        <SelectItem value="CIT-0205">CIT-0205</SelectItem>
                        <SelectItem value="CIT-0092">CIT-0092</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-4">Engine Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-zinc-400">RPM</div>
                            <div className="text-2xl font-medium">{obdData.engineRPM}</div>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Speed</div>
                            <div className="text-2xl font-medium">{obdData.speed} km/h</div>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Temperature</div>
                            <div className="text-2xl font-medium">{obdData.engineTemp}°C</div>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Oil Pressure</div>
                            <div className="text-2xl font-medium">{obdData.oilPressure} psi</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-4">Fuel & Battery</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-zinc-400">Fuel Level</div>
                            <div className="text-2xl font-medium">{obdData.fuelLevel}%</div>
                            <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${obdData.fuelLevel}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-zinc-400">Battery</div>
                            <div className="text-2xl font-medium">{obdData.batteryVoltage}V</div>
                            <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  obdData.batteryVoltage >= 12.5 ? 'bg-green-500' : 
                                  obdData.batteryVoltage >= 11.5 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${(obdData.batteryVoltage / 14) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                      
                    <div className="space-y-6">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-4">Tire Pressure (PSI)</h3>
                        <div className="relative">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {obdData.tirePressure.map((tire, index) => (
                              <div key={index} className="bg-zinc-700 p-3 rounded-lg">
                                <div className="text-sm text-zinc-400">{tire.position}</div>
                                <div className="text-xl font-medium flex items-center">
                                  {tire.value} PSI
                                  {tire.status === 'normal' ? (
                                    <Check className="h-4 w-4 text-green-500 ml-2" />
                                  ) : tire.status === 'low' ? (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500 ml-2" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="text-center opacity-30">
                            <Car className="h-24 w-24 mx-auto" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium">Last Updated</h3>
                          <span className="text-sm text-zinc-400">{obdData.lastUpdated}</span>
                        </div>
                        <Button variant="outline" className="w-full">
                          Refresh OBD Data
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-zinc-800 p-4 rounded-lg h-full">
                        <h3 className="font-medium mb-4">Diagnostic Trouble Codes</h3>
                        {obdData.diagnosticCodes.length === 0 ? (
                          <div className="text-center py-8">
                            <Check className="h-12 w-12 text-green-500 mx-auto mb-2" />
                            <p className="text-zinc-400">No diagnostic trouble codes</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {obdData.diagnosticCodes.map((code, index) => (
                              <div key={index} className="bg-zinc-700 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div className="font-medium">{code.code}</div>
                                  <Badge className={
                                    code.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                                    code.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-blue-500/20 text-blue-500'
                                  }>
                                    {code.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-zinc-400 mt-1">{code.description}</div>
                                <div className="mt-2 text-xs text-zinc-500 flex items-center">
                                  <Wrench className="h-3 w-3 mr-1" />
                                  Recommended: Schedule maintenance
                                </div>
                              </div>
                            ))}
                            <Button variant="ghost" size="sm" className="w-full mt-2">
                              View All Codes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-4">Advanced Diagnostics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            <div className="flex items-center">
                              <Cpu className="h-4 w-4 mr-2 text-blue-500" />
                              ECU Data
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Mass Air Flow:</span>
                              <span>14.2 g/s</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Intake Manifold:</span>
                              <span>33.5 kPa</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Timing Advance:</span>
                              <span>12.5°</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Coolant Temp:</span>
                              <span>89°C</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            <div className="flex items-center">
                              <Droplets className="h-4 w-4 mr-2 text-green-500" />
                              Fluid Levels
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Engine Oil:</span>
                              <span className="text-green-500">Normal</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Coolant:</span>
                              <span className="text-green-500">Normal</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Brake Fluid:</span>
                              <span className="text-yellow-500">Low</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Washer Fluid:</span>
                              <span className="text-green-500">Normal</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-zinc-800 border-zinc-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            <div className="flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                              Security Status
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Immobilizer:</span>
                              <span className="text-green-500">Active</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Anti-Tamper:</span>
                              <span className="text-green-500">Active</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">GPS Tracking:</span>
                              <span className="text-green-500">Active</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-400">Remote Kill:</span>
                              <span className="text-green-500">Ready</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">
                    Performance History
                  </Button>
                  <Button variant="outline">
                    Maintenance Schedule
                  </Button>
                  <Button>
                    Detailed OBD Report
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="facial" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle>Facial Recognition</CardTitle>
                      <CardDescription>
                        Detected persons from security footage
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="relative">
                          <Input
                            type="search"
                            placeholder="Search faces..."
                            className="bg-zinc-800 border-zinc-700 pl-10"
                          />
                          <div className="absolute left-3 top-3 text-zinc-400">
                            <Search className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {recognitionData.map((person) => (
                          <div 
                            key={person.id}
                            className="flex items-center p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 cursor-pointer"
                          >
                            <div className="w-12 h-12 bg-zinc-700 rounded-lg mr-3 flex items-center justify-center text-zinc-500">
                              <User className="h-6 w-6" />
                            </div>
                            <div className="flex-grow">
                              <div className="text-sm font-medium">{person.name}</div>
                              <div className="text-xs text-zinc-400">{person.timestamp}</div>
                            </div>
                            <Badge 
                              className={person.status === 'Known Criminal' ? 
                                'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}
                            >
                              {person.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Detections
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div className="col-span-2">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle>Facial Analysis</CardTitle>
                      <CardDescription>
                        Live video feed analysis and identity verification
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="aspect-video bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
                            <div className="text-center">
                              <User className="h-12 w-12 text-zinc-700 mx-auto mb-2" />
                              <p className="text-zinc-500">Facial capture preview</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="w-full">
                              Capture Image
                            </Button>
                            <Button variant="outline" className="w-full">
                              Upload Image
                            </Button>
                          </div>
                          
                          <div className="mt-4">
                            <h3 className="font-medium text-sm mb-2">Search Options</h3>
                            <div className="grid grid-cols-1 gap-3">
                              <Select defaultValue="criminals">
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full">
                                  <SelectValue placeholder="Select database" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-700">
                                  <SelectItem value="criminals">Known Criminals</SelectItem>
                                  <SelectItem value="watchlist">Security Watchlist</SelectItem>
                                  <SelectItem value="personnel">Personnel Database</SelectItem>
                                  <SelectItem value="all">All Databases</SelectItem>
                                </SelectContent>
                              </Select>
                              
                              <Button>
                                Run Database Comparison
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-800 p-4 rounded-lg">
                          <h3 className="font-medium mb-4">Analysis Results</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="text-sm text-zinc-400 mb-1">Identity Match</div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium">92.4% John Smith</span>
                                <Badge className="bg-red-500/20 text-red-500">Known Criminal</Badge>
                              </div>
                              <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: '92.4%' }}></div>
                              </div>
                            </div>
                            
                            <div className="py-3 border-t border-zinc-700">
                              <div className="text-sm font-medium mb-2">Biometric Analysis</div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Age Estimate:</span>
                                  <span>32-38 years</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Gender:</span>
                                  <span>Male (98%)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Facial Hair:</span>
                                  <span>Yes</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Glasses:</span>
                                  <span>No</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Ethnicity:</span>
                                  <span>Multiracial</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Emotion:</span>
                                  <span>Neutral</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="py-3 border-t border-zinc-700">
                              <div className="text-sm font-medium mb-2">Criminal Records</div>
                              <div className="space-y-2 text-sm">
                                <div className="bg-zinc-700 p-2 rounded-lg">
                                  <div className="font-medium">Armed Robbery</div>
                                  <div className="text-xs text-zinc-400">Conviction Date: 12/05/2020</div>
                                </div>
                                <div className="bg-zinc-700 p-2 rounded-lg">
                                  <div className="font-medium">Assault</div>
                                  <div className="text-xs text-zinc-400">Conviction Date: 03/18/2018</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-3 border-t border-zinc-700 flex justify-between">
                              <Button variant="outline" size="sm">
                                View Full Profile
                              </Button>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                Send Alert
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-900 border-zinc-800 mt-6">
                    <CardHeader>
                      <CardTitle>Live Video Feed Analysis</CardTitle>
                      <CardDescription>
                        Real-time facial processing from vehicle cameras
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-xs bg-red-500 px-2 py-1 rounded-full mb-2 inline-block">LIVE</span>
                            <p className="text-xs">Front Camera</p>
                          </div>
                        </div>
                        <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-xs bg-red-500 px-2 py-1 rounded-full mb-2 inline-block">LIVE</span>
                            <p className="text-xs">Rear Camera</p>
                          </div>
                        </div>
                        <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-xs bg-green-500 px-2 py-1 rounded-full mb-2 inline-block">ACTIVE</span>
                            <p className="text-xs">Left Camera</p>
                          </div>
                        </div>
                        <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <span className="text-xs bg-green-500 px-2 py-1 rounded-full mb-2 inline-block">ACTIVE</span>
                            <p className="text-xs">Right Camera</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg mt-4">
                        <h3 className="font-medium text-sm mb-3">AI Processing Status</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-xs text-zinc-400">Face Detection</div>
                            <div className="font-medium text-green-500">Active</div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400">Database Matching</div>
                            <div className="font-medium text-green-500">Active</div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400">Threat Analysis</div>
                            <div className="font-medium text-green-500">Active</div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400">Alert Status</div>
                            <div className="font-medium text-green-500">Ready</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Incident Analytics</CardTitle>
                  <CardDescription>
                    Historical trends and security insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <div className="bg-zinc-800 p-4 rounded-lg aspect-[2/1] flex items-center justify-center">
                        <div className="text-center">
                          <HistoryIcon className="h-12 w-12 text-zinc-700 mx-auto mb-2" />
                          <p className="text-zinc-500">Incident trend chart</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-4">Security Overview</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">Incidents Today</span>
                              <span className="text-sm font-medium">3</span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">This Week</span>
                              <span className="text-sm font-medium">14</span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">This Month</span>
                              <span className="text-sm font-medium">42</span>
                            </div>
                            <div className="w-full bg-zinc-700 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-zinc-700 p-2 rounded-lg text-center">
                              <div className="text-xs text-zinc-400">Critical</div>
                              <div className="font-medium text-red-500">5</div>
                            </div>
                            <div className="bg-zinc-700 p-2 rounded-lg text-center">
                              <div className="text-xs text-zinc-400">High</div>
                              <div className="font-medium text-orange-500">12</div>
                            </div>
                            <div className="bg-zinc-700 p-2 rounded-lg text-center">
                              <div className="text-xs text-zinc-400">Medium</div>
                              <div className="font-medium text-yellow-500">18</div>
                            </div>
                            <div className="bg-zinc-700 p-2 rounded-lg text-center">
                              <div className="text-xs text-zinc-400">Low</div>
                              <div className="font-medium text-blue-500">7</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <Card className="bg-zinc-800 border-zinc-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            Response Time
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">4.2m</div>
                        <p className="text-xs text-zinc-400">Avg. response time</p>
                        <div className="text-xs text-green-500 mt-1">
                          ↓ 0.8m from last month
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-800 border-zinc-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                            False Positives
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">8.4%</div>
                        <p className="text-xs text-zinc-400">Error rate</p>
                        <div className="text-xs text-green-500 mt-1">
                          ↓ 2.1% from last month
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-800 border-zinc-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          <div className="flex items-center">
                            <Map className="h-4 w-4 mr-2 text-green-500" />
                            High Risk Areas
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-zinc-400">Active risk zones</p>
                        <div className="text-xs text-red-500 mt-1">
                          ↑ 1 from last month
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-zinc-800 border-zinc-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-purple-500" />
                            Personnel Affected
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-zinc-400">Injuries this month</p>
                        <div className="text-xs text-green-500 mt-1">
                          No change from last month
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;