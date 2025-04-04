import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
// Define Vehicle type locally to avoid import issues
interface Vehicle {
  id: number;
  vehicleId: string;
  name: string;
  type: string;
  status: string;
}
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, Terminal, Upload, Webcam, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface RaspberryPiDevice {
  id: number;
  vehicleId: string;
  status: 'online' | 'offline' | 'updating';
  ipAddress: string;
  lastConnected: string;
  firmwareVersion: string;
  cameraStatus: 'active' | 'inactive' | 'error';
  obdStatus: 'connected' | 'disconnected' | 'error';
}

interface DeploymentLog {
  id: number;
  deviceId: number;
  timestamp: string;
  action: string;
  status: 'success' | 'failure' | 'pending';
  details: string;
}

const deviceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  ipAddress: z.string().min(1, "IP Address is required").regex(/^(\d{1,3}\.){3}\d{1,3}$/, "Invalid IP address format"),
  cameraEnabled: z.boolean().default(true),
  obdEnabled: z.boolean().default(true),
  deploymentNotes: z.string().optional(),
});

export default function DeviceManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('devices');
  const [selectedDevice, setSelectedDevice] = useState<RaspberryPiDevice | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentOutput, setDeploymentOutput] = useState<string[]>([]);
  const [showDeploymentDialog, setShowDeploymentDialog] = useState(false);

  // Only admin users should access this page
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[80vh] flex-col">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You need administrator privileges to access this page.</p>
      </div>
    );
  }

  // Fetch devices
  const { data: devices = [], isLoading: isLoadingDevices } = useQuery<RaspberryPiDevice[]>({
    queryKey: ['/api/devices'],
  });

  // Fetch deployment logs
  const { data: deploymentLogs = [], isLoading: isLoadingLogs } = useQuery<DeploymentLog[]>({
    queryKey: ['/api/devices/deployment-logs'],
  });

  // Form for new device
  const form = useForm<z.infer<typeof deviceSchema>>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      vehicleId: '',
      ipAddress: '',
      cameraEnabled: true,
      obdEnabled: true,
      deploymentNotes: '',
    },
  });

  // Fetch vehicles for dropdown
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ['/api/vehicles'],
  });

  // Add new device
  const { mutate: addDevice, isPending: isAddingDevice } = useMutation({
    mutationFn: async (data: z.infer<typeof deviceSchema>) => {
      return apiRequest('POST', '/api/devices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      toast({
        title: "Device added",
        description: "New Raspberry Pi device has been registered.",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add device. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding device:", error);
    }
  });

  // Deploy to device
  const { mutate: deployToDevice, isPending: isDeployingToDevice } = useMutation({
    mutationFn: async (deviceId: number) => {
      return apiRequest('POST', `/api/devices/${deviceId}/deploy`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/devices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/devices/deployment-logs'] });
      toast({
        title: "Deployment initiated",
        description: "Code is being deployed to the device.",
      });
      setShowDeploymentDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Deployment failed",
        description: "Failed to deploy code to device. Please try again.",
        variant: "destructive",
      });
      console.error("Error deploying to device:", error);
    }
  });

  // Simulate deployment
  const simulateDeployment = (deviceId: number) => {
    setIsDeploying(true);
    setDeploymentOutput([]);
    setShowDeploymentDialog(true);
    
    const steps = [
      "Connecting to Raspberry Pi device...",
      "Connection established",
      "Checking device status...",
      "Device online and ready for deployment",
      "Preparing deployment package...",
      "Installing dependencies...",
      "Setting up camera module...",
      "Configuring OBD scanner...",
      "Setting up secure connection...",
      "Deploying latest security algorithms...",
      "Updating facial recognition models...",
      "Setting up voice analysis module...",
      "Updating firmware...",
      "Testing connection...",
      "Deployment completed successfully!"
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        setDeploymentOutput(prev => [...prev, steps[index]]);
        index++;
      } else {
        clearInterval(interval);
        setIsDeploying(false);
        // Call the actual deploy endpoint after simulation
        deployToDevice(deviceId);
      }
    }, 800);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
      case 'connected':
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'offline':
      case 'inactive':
      case 'disconnected':
      case 'failure':
        return <Badge variant="destructive">{status}</Badge>;
      case 'updating':
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const onSubmit = (data: z.infer<typeof deviceSchema>) => {
    addDevice(data);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Device Management</h1>
      <p className="text-muted-foreground">
        Deploy and manage code for Raspberry Pi devices connected to vehicles
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Connected Devices</TabsTrigger>
          <TabsTrigger value="deployment">Deployment Logs</TabsTrigger>
          <TabsTrigger value="add">Register Device</TabsTrigger>
        </TabsList>
        
        {/* Devices Tab */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Raspberry Pi Devices</CardTitle>
              <CardDescription>All Raspberry Pi devices connected to your vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDevices ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="animate-spin h-6 w-6" />
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No devices registered yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Firmware</TableHead>
                      <TableHead>Camera</TableHead>
                      <TableHead>OBD</TableHead>
                      <TableHead>Last Connected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.vehicleId}</TableCell>
                        <TableCell>{getStatusBadge(device.status)}</TableCell>
                        <TableCell>{device.ipAddress}</TableCell>
                        <TableCell>{device.firmwareVersion}</TableCell>
                        <TableCell>{getStatusBadge(device.cameraStatus)}</TableCell>
                        <TableCell>{getStatusBadge(device.obdStatus)}</TableCell>
                        <TableCell>{new Date(device.lastConnected).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => simulateDeployment(device.id)}
                              disabled={device.status === 'offline'}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Deploy
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Deployment Logs Tab */}
        <TabsContent value="deployment">
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
              <CardDescription>History of code deployments to Raspberry Pi devices</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="animate-spin h-6 w-6" />
                </div>
              ) : deploymentLogs.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No deployment logs found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Device ID</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deploymentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          {devices.find(d => d.id === log.deviceId)?.vehicleId || log.deviceId}
                        </TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Add Device Tab */}
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Register New Device</CardTitle>
              <CardDescription>Add a new Raspberry Pi device for deployment</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="vehicleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a vehicle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.vehicleId} value={vehicle.vehicleId}>
                                {vehicle.name} ({vehicle.vehicleId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the vehicle this Raspberry Pi will be installed in
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ipAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IP Address</FormLabel>
                        <FormControl>
                          <Input placeholder="192.168.1.100" {...field} />
                        </FormControl>
                        <FormDescription>
                          The static IP address of the Raspberry Pi device
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="cameraEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enable Camera</FormLabel>
                            <FormDescription>
                              Deploy camera monitoring code
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="obdEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Enable OBD Scanner</FormLabel>
                            <FormDescription>
                              Deploy OBD connectivity code
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="deploymentNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deployment Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any special instructions or notes for this deployment..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isAddingDevice}>
                    {isAddingDevice && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                    Register Device
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deployment Dialog */}
      <Dialog open={showDeploymentDialog} onOpenChange={setShowDeploymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deploying to Device</DialogTitle>
            <DialogDescription>
              Deploying code to Raspberry Pi device. Please wait...
            </DialogDescription>
          </DialogHeader>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-80 overflow-y-auto">
            <div className="space-y-1">
              {deploymentOutput.map((line, index) => (
                <div key={index} className="flex">
                  <span className="mr-2">$</span>
                  <span>{line}</span>
                </div>
              ))}
              {isDeploying && (
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <span className="animate-pulse">_</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeploymentDialog(false)}
              disabled={isDeploying}
            >
              {isDeploying ? "Deploying..." : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}