import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, User, Car, MapPin, AlertTriangle, AlertCircle, Shield, Clock, ExternalLink, Send } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import IncidentEscalation, { EscalationData } from '@/components/alerts/IncidentEscalation';

const Alerts = () => {
  const user = {
    name: 'John Doe',
    role: 'Security Admin'
  };

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string>('current');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    smsAlerts: true,
    emailAlerts: true,
    sapsNotifications: false
  });

  // Query for alerts
  const { data: alerts = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/alerts'],
  });
  
  // Mutation for escalating incidents
  const escalateMutation = useMutation({
    mutationFn: async (escalationData: EscalationData) => {
      const response = await fetch('/api/alerts/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(escalationData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to escalate incident');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: 'Incident Escalated',
        description: 'The incident has been escalated to the appropriate personnel.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Escalation Failed',
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  });
  
  // Handle incident escalation
  const handleEscalate = (escalationData: EscalationData) => {
    escalateMutation.mutate(escalationData);
  };

  // Handle notification setting changes
  const handleNotificationToggle = (setting: string, value: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: value
    });
  };

  // Get severity class based on type
  const getSeverityClass = (type: string) => {
    switch (type) {
      case 'weapon_detected':
        return 'bg-red-500';
      case 'unusual_stop':
        return 'bg-yellow-500';
      case 'route_deviation':
        return 'bg-orange-500';
      case 'suspicious_vehicle':
        return 'bg-purple-500';
      case 'convoy_formation':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Format alert type for display
  const formatAlertType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Send push notification function
  const sendPushNotification = (alertId: number) => {
    console.log('Sending push notification for alert:', alertId);
    // This would connect to a push notification service in production
  };

  // Actions for the header
  const headerActions = (
    <>
      <Button variant="outline" className="mr-2">
        Export Alerts
      </Button>
      <Button>
        <Bell className="mr-2 h-4 w-4" />
        Configure Alerts
      </Button>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <Header 
          title="Security Alerts" 
          subtitle="Manage and respond to security incidents" 
          icon={<AlertCircle className="h-6 w-6" />}
          actions={headerActions}
        />
        
        <div className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-zinc-900">
                <TabsTrigger value="current">Current Alerts</TabsTrigger>
                <TabsTrigger value="history">Alert History</TabsTrigger>
                <TabsTrigger value="settings">Notification Settings</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="current" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-6">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle>Active Alerts</CardTitle>
                      <CardDescription>
                        Real-time security incidents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="relative">
                          <Input
                            type="search"
                            placeholder="Search alerts..."
                            className="bg-zinc-800 border-zinc-700 pl-10"
                          />
                          <div className="absolute left-3 top-3 text-zinc-400">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="11" cy="11" r="8" />
                              <path d="m21 21-4.3-4.3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {isLoading ? (
                          <div className="text-center py-10">
                            <div className="inline-block animate-spin h-6 w-6 border-2 border-zinc-500 border-t-blue-500 rounded-full mb-2"></div>
                            <p>Loading alerts...</p>
                          </div>
                        ) : alerts.length === 0 ? (
                          <div className="text-center py-10 text-zinc-500">
                            <Shield className="h-10 w-10 mx-auto mb-2" />
                            <p>No active alerts</p>
                          </div>
                        ) : (
                          alerts.map((alert: any, index: number) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-lg border-l-4 ${getSeverityClass(alert.type)} bg-zinc-800 cursor-pointer hover:bg-zinc-700 transition-colors`}
                              onClick={() => setSelectedAlert(alert)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{formatAlertType(alert.type)}</div>
                                <div className="text-xs text-zinc-400">{alert.timestamp}</div>
                              </div>
                              <div className="text-sm text-zinc-400 mt-1">
                                Vehicle {alert.vehicleId} in {alert.location}
                              </div>
                              <div className="mt-1.5 flex items-center">
                                <Badge variant="outline" className="mr-2">
                                  {alert.acknowledged ? 'Acknowledged' : 'New'}
                                </Badge>
                                <Badge 
                                  className={`${
                                    alert.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                                    alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                                    'bg-blue-500/20 text-blue-500'
                                  }`}
                                >
                                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                                </Badge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Alerts
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                      <CardTitle>Alert Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-sm text-zinc-400">Total Alerts Today</p>
                          <p className="text-2xl font-medium">12</p>
                        </div>
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-sm text-zinc-400">Critical Incidents</p>
                          <p className="text-2xl font-medium text-red-500">3</p>
                        </div>
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-sm text-zinc-400">Avg. Response Time</p>
                          <p className="text-2xl font-medium">4.2m</p>
                        </div>
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-sm text-zinc-400">Pending Actions</p>
                          <p className="text-2xl font-medium">2</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="col-span-2">
                  {selectedAlert ? (
                    <Card className="bg-zinc-900 border-zinc-800 h-full flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{formatAlertType(selectedAlert.type)}</CardTitle>
                            <CardDescription className="mt-1">
                              {selectedAlert.timestamp} • {selectedAlert.location}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={`${
                              selectedAlert.severity === 'high' ? 'bg-red-500/20 text-red-500' :
                              selectedAlert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-blue-500/20 text-blue-500'
                            } text-sm py-1.5`}
                          >
                            {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)} Priority
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
                                <span>{selectedAlert.vehicleId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Status:</span>
                                <span>Stationary</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Route:</span>
                                <span>Sandton-Pretoria</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Speed:</span>
                                <span>0 km/h</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-800 p-4 rounded-lg">
                            <div className="flex items-center mb-3">
                              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                              <h3 className="font-medium">Alert Details</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Type:</span>
                                <span>{formatAlertType(selectedAlert.type)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Detected:</span>
                                <span>{selectedAlert.timestamp}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Status:</span>
                                <span>{selectedAlert.acknowledged ? 'Acknowledged' : 'Pending'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Risk Score:</span>
                                <span className="text-red-500 font-medium">86/100</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-zinc-800 p-4 rounded-lg">
                            <div className="flex items-center mb-3">
                              <MapPin className="h-5 w-5 mr-2 text-green-500" />
                              <h3 className="font-medium">Location Details</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-zinc-400">Area:</span>
                                <span>{selectedAlert.location}</span>
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
                        
                        <div className="grid grid-cols-1 gap-4">
                          {/* Convoy Formation Tracking */}
                          {selectedAlert.type === 'convoy_formation' && (
                            <div className="mb-4 space-y-4">
                              <h3 className="font-medium text-lg">Convoy Details</h3>
                              <div className="bg-zinc-800 p-4 rounded-lg">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                    <div className="font-medium mb-1">Convoy Formation</div>
                                    <div className="text-sm text-zinc-400">
                                      3 vehicles detected, moving in formation 
                                      <span className="text-yellow-500 font-medium"> 12.4m</span> apart on average
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-medium mb-1">Duration</div>
                                    <div className="text-sm text-zinc-400">
                                      Following for <span className="text-yellow-500 font-medium">17 minutes</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div className="text-sm font-medium">Suspicious Vehicles</div>
                                  <div className="flex items-center p-2 bg-zinc-700 rounded-lg mb-2">
                                    <div className="bg-red-500/20 p-1.5 rounded-md mr-3">
                                      <Car className="h-4 w-4 text-red-500" />
                                    </div>
                                    <div className="flex-grow">
                                      <div className="text-sm">Toyota Hilux (White)</div>
                                      <div className="text-xs text-zinc-400">Plate: JHB 432 GP • Distance: <span className="text-yellow-500">8.2m</span></div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </div>
                                  <div className="flex items-center p-2 bg-zinc-700 rounded-lg mb-2">
                                    <div className="bg-orange-500/20 p-1.5 rounded-md mr-3">
                                      <Car className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div className="flex-grow">
                                      <div className="text-sm">VW Golf (Black)</div>
                                      <div className="text-xs text-zinc-400">Plate: WP 558 CJ • Distance: <span className="text-yellow-500">15.7m</span></div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </div>
                                  <div className="flex items-center p-2 bg-zinc-700 rounded-lg">
                                    <div className="bg-yellow-500/20 p-1.5 rounded-md mr-3">
                                      <Car className="h-4 w-4 text-yellow-500" />
                                    </div>
                                    <div className="flex-grow">
                                      <div className="text-sm">Ford Ranger (Grey)</div>
                                      <div className="text-xs text-zinc-400">Plate: ND 421 GP • Distance: <span className="text-yellow-500">18.3m</span></div>
                                    </div>
                                    <Button variant="ghost" size="sm">
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="mb-4">
                            <h3 className="font-medium text-lg mb-3">Evidence & Analysis</h3>
                            <div className="bg-zinc-800 rounded-lg p-4 flex flex-col md:flex-row gap-4">
                              <div className="flex-1">
                                <div className="aspect-video bg-zinc-700 rounded-lg mb-3 flex items-center justify-center text-zinc-500">
                                  <div className="text-center">
                                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm">Video evidence available</p>
                                  </div>
                                </div>
                                <div className="text-sm font-medium">AI Identification</div>
                                <p className="text-sm text-zinc-400 mt-1">
                                  Threat detection confidence: <span className="text-green-500 font-medium">94.8%</span>
                                </p>
                              </div>
                              <div className="flex-1">
                                <div className="bg-zinc-700 p-3 rounded-lg mb-3 h-[calc(100%-3rem)]">
                                  <h4 className="text-sm font-medium mb-2">Automatic Analysis</h4>
                                  <div className="space-y-2 text-sm text-zinc-400">
                                    <p>• Multiple vehicles moving in coordinated pattern</p>
                                    <p>• Suspicious behavior detected at timestamp 14:22:45</p>
                                    <p>• Same vehicles spotted at previous CIT locations</p>
                                    <p>• Pattern matches known heist preparation tactics</p>
                                    <p>• Recommended action: Request immediate support</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      
                      {/* Incident Escalation Section */}
                      <div className="px-6 pb-4 border-t border-zinc-800 pt-4">
                        <h3 className="text-lg font-medium mb-3">Incident Escalation</h3>
                        <IncidentEscalation 
                          alert={selectedAlert} 
                          onEscalate={handleEscalate} 
                        />
                      </div>
                      
                      <CardFooter className="flex-shrink-0 border-t border-zinc-800 pt-4">
                        <div className="flex flex-col md:flex-row gap-3 w-full">
                          <Button className="flex-1" onClick={() => sendPushNotification(selectedAlert.id)}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Push Notification
                          </Button>
                          <Button variant="outline" className="flex-1">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Dispatch Response
                          </Button>
                          <Button variant="secondary" className="flex-1">
                            Acknowledge
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ) : (
                    <Card className="bg-zinc-900 border-zinc-800 h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-zinc-700" />
                        <h3 className="text-xl font-medium mb-2">No Alert Selected</h3>
                        <p className="text-zinc-400 max-w-sm">
                          Select an alert from the list to view detailed information and take action
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Alert History</CardTitle>
                      <CardDescription>
                        Review past security incidents
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                      <Button variant="outline" size="sm">
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-zinc-400 border-b border-zinc-800">
                          <th className="pb-2 pl-4 text-left font-medium">Type</th>
                          <th className="pb-2 text-left font-medium">Vehicle</th>
                          <th className="pb-2 text-left font-medium">Location</th>
                          <th className="pb-2 text-left font-medium">Time</th>
                          <th className="pb-2 text-left font-medium">Severity</th>
                          <th className="pb-2 text-left font-medium">Status</th>
                          <th className="pb-2 text-left font-medium">Response Time</th>
                          <th className="pb-2 text-right pr-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-3 pl-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              Weapon Detected
                            </div>
                          </td>
                          <td className="py-3">CIT-0118</td>
                          <td className="py-3">Johannesburg CBD</td>
                          <td className="py-3">Today, 10:32</td>
                          <td className="py-3">
                            <Badge className="bg-red-500/20 text-red-500">High</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">Resolved</Badge>
                          </td>
                          <td className="py-3">3m 12s</td>
                          <td className="py-3 text-right pr-4">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-3 pl-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              Convoy Formation
                            </div>
                          </td>
                          <td className="py-3">CIT-0205</td>
                          <td className="py-3">Pretoria East</td>
                          <td className="py-3">Yesterday, 15:48</td>
                          <td className="py-3">
                            <Badge className="bg-yellow-500/20 text-yellow-500">Medium</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">Resolved</Badge>
                          </td>
                          <td className="py-3">2m 45s</td>
                          <td className="py-3 text-right pr-4">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-3 pl-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                              Unusual Stop
                            </div>
                          </td>
                          <td className="py-3">CIT-0118</td>
                          <td className="py-3">Sandton</td>
                          <td className="py-3">Mar 27, 11:20</td>
                          <td className="py-3">
                            <Badge className="bg-blue-500/20 text-blue-500">Low</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">Resolved</Badge>
                          </td>
                          <td className="py-3">4m 07s</td>
                          <td className="py-3 text-right pr-4">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-3 pl-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                              Route Deviation
                            </div>
                          </td>
                          <td className="py-3">CIT-0092</td>
                          <td className="py-3">Centurion</td>
                          <td className="py-3">Mar 26, 09:15</td>
                          <td className="py-3">
                            <Badge className="bg-yellow-500/20 text-yellow-500">Medium</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">Resolved</Badge>
                          </td>
                          <td className="py-3">5m 31s</td>
                          <td className="py-3 text-right pr-4">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-3 pl-4">
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                              Suspicious Vehicle
                            </div>
                          </td>
                          <td className="py-3">CIT-0118</td>
                          <td className="py-3">Midrand</td>
                          <td className="py-3">Mar 25, 14:02</td>
                          <td className="py-3">
                            <Badge className="bg-yellow-500/20 text-yellow-500">Medium</Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant="outline">Resolved</Badge>
                          </td>
                          <td className="py-3">2m 58s</td>
                          <td className="py-3 text-right pr-4">
                            <Button variant="ghost" size="sm">View</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <div className="text-sm text-zinc-400">
                      Showing 5 of 124 alerts
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" disabled>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm">
                        Next
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Alert Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Unusual Stops</span>
                          <span className="text-sm font-medium">32%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Weapon Detections</span>
                          <span className="text-sm font-medium">18%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Route Deviations</span>
                          <span className="text-sm font-medium">25%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Suspicious Vehicles</span>
                          <span className="text-sm font-medium">15%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Convoy Formations</span>
                          <span className="text-sm font-medium">10%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Top Alert Locations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                          1
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-medium">Johannesburg CBD</div>
                          <div className="text-xs text-zinc-400">28 alerts</div>
                        </div>
                        <div className="text-sm font-medium text-red-500">High Risk</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                          2
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-medium">Sandton</div>
                          <div className="text-xs text-zinc-400">24 alerts</div>
                        </div>
                        <div className="text-sm font-medium text-yellow-500">Medium Risk</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                          3
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-medium">Pretoria East</div>
                          <div className="text-xs text-zinc-400">19 alerts</div>
                        </div>
                        <div className="text-sm font-medium text-yellow-500">Medium Risk</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                          4
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-medium">Midrand</div>
                          <div className="text-xs text-zinc-400">15 alerts</div>
                        </div>
                        <div className="text-sm font-medium text-blue-500">Low Risk</div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                          5
                        </div>
                        <div className="flex-grow">
                          <div className="text-sm font-medium">Centurion</div>
                          <div className="text-xs text-zinc-400">12 alerts</div>
                        </div>
                        <div className="text-sm font-medium text-blue-500">Low Risk</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle>Response Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Average Response Time</span>
                          <span className="text-sm font-medium">4.2 min</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Response by Priority</div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-xs text-zinc-400">High</div>
                            <div className="font-medium text-red-500">2.8 min</div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400">Medium</div>
                            <div className="font-medium text-yellow-500">4.5 min</div>
                          </div>
                          <div>
                            <div className="text-xs text-zinc-400">Low</div>
                            <div className="font-medium text-blue-500">6.2 min</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">Resolution Stats</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">True Positives</span>
                            <span>89%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">False Alarms</span>
                            <span>11%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Resolved</span>
                            <span>98%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Escalated</span>
                            <span>4%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Push Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how you receive alert notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Push Notifications</Label>
                          <p className="text-sm text-zinc-400">Receive notifications on your mobile devices</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => handleNotificationToggle('pushNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">SMS Alerts</Label>
                          <p className="text-sm text-zinc-400">Receive text messages for critical alerts</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.smsAlerts}
                          onCheckedChange={(checked) => handleNotificationToggle('smsAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Email Alerts</Label>
                          <p className="text-sm text-zinc-400">Receive email notifications for alerts</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.emailAlerts}
                          onCheckedChange={(checked) => handleNotificationToggle('emailAlerts', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">SAPS Notifications</Label>
                          <p className="text-sm text-zinc-400">Automatically notify police for high-severity alerts</p>
                        </div>
                        <Switch 
                          checked={notificationSettings.sapsNotifications}
                          onCheckedChange={(checked) => handleNotificationToggle('sapsNotifications', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Alert Recipients</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Security Team</span>
                            </div>
                            <Badge>All Alerts</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Operations Manager</span>
                            </div>
                            <Badge>High & Medium</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">Fleet Manager</span>
                            </div>
                            <Badge>Vehicle Issues</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-zinc-400" />
                              <span className="text-sm">SAPS Liaison</span>
                            </div>
                            <Badge>High Only</Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          Manage Recipients
                        </Button>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-3">Alert Types to Send</h3>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="alert-weapon" defaultChecked />
                            <label
                              htmlFor="alert-weapon"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Weapon Detections
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="alert-stop" defaultChecked />
                            <label
                              htmlFor="alert-stop"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Unusual Stops
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="alert-route" defaultChecked />
                            <label
                              htmlFor="alert-route"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Route Deviations
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="alert-vehicle" defaultChecked />
                            <label
                              htmlFor="alert-vehicle"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Suspicious Vehicles
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="alert-convoy" defaultChecked />
                            <label
                              htmlFor="alert-convoy"
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Convoy Formations
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto">
                    Save Notification Settings
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Notification Templates</CardTitle>
                  <CardDescription>
                    Customize message templates for different alert types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">Critical Alert Template</h3>
                        <Badge className="bg-red-500/20 text-red-500">High Priority</Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">
                        Message sent for high-priority alerts requiring immediate response
                      </p>
                      <div className="bg-zinc-700 p-3 rounded-lg">
                        <code className="text-sm">
                          ⚠️ URGENT ALERT: [Alert_Type] detected at [Location] for vehicle [Vehicle_ID]. 
                          Immediate response required. Severity: HIGH. 
                          Click for details: [Alert_Link]
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">Standard Alert Template</h3>
                        <Badge className="bg-yellow-500/20 text-yellow-500">Medium Priority</Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">
                        Message sent for medium-priority alerts
                      </p>
                      <div className="bg-zinc-700 p-3 rounded-lg">
                        <code className="text-sm">
                          Alert: [Alert_Type] detected at [Location] for vehicle [Vehicle_ID]. 
                          Please review within 5 minutes. Severity: MEDIUM. 
                          Details: [Alert_Link]
                        </code>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium">Information Template</h3>
                        <Badge className="bg-blue-500/20 text-blue-500">Low Priority</Badge>
                      </div>
                      <p className="text-sm text-zinc-400 mb-3">
                        Message sent for low-priority informational alerts
                      </p>
                      <div className="bg-zinc-700 p-3 rounded-lg">
                        <code className="text-sm">
                          Info: [Alert_Type] notification for vehicle [Vehicle_ID] at [Location].
                          Severity: LOW.
                          Review at your convenience: [Alert_Link]
                        </code>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex justify-between w-full">
                    <Button variant="outline">Reset to Default</Button>
                    <Button>Save Templates</Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Alerts;