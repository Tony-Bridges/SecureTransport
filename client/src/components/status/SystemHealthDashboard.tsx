import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Camera, 
  Check, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Database, 
  HardDrive, 
  Heart, 
  Layers, 
  Maximize, 
  Minimize, 
  Network, 
  RefreshCw, 
  RotateCw, 
  Server, 
  Settings, 
  Shield, 
  ThermometerSun, 
  Wifi, 
  ZapOff 
} from 'lucide-react';

interface SystemComponentProps {
  id: string;
  name: string;
  type: 'camera' | 'sensor' | 'server' | 'network' | 'storage';
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  lastChecked: string;
  uptime: string;
  location?: string;
  load?: number;
  temperature?: number;
  utilization?: number;
  bandwidth?: {
    up: number;
    down: number;
  };
  battery?: number;
  ip?: string;
  model?: string;
  canControl?: boolean;
}

const SystemComponentCard: React.FC<{ component: SystemComponentProps }> = ({ component }) => {
  const [expanded, setExpanded] = useState(false);
  const [isControlling, setIsControlling] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500 text-green-500 border-green-500';
      case 'offline': return 'bg-red-500 text-red-500 border-red-500';
      case 'warning': return 'bg-yellow-500 text-yellow-500 border-yellow-500';
      case 'maintenance': return 'bg-blue-500 text-blue-500 border-blue-500';
      default: return 'bg-gray-500 text-gray-500 border-gray-500';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-900 bg-opacity-20';
      case 'offline': return 'bg-red-900 bg-opacity-20';
      case 'warning': return 'bg-yellow-900 bg-opacity-20';
      case 'maintenance': return 'bg-blue-900 bg-opacity-20';
      default: return 'bg-gray-900 bg-opacity-20';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'camera': return <Camera className="h-5 w-5" />;
      case 'sensor': return <Activity className="h-5 w-5" />;
      case 'server': return <Server className="h-5 w-5" />;
      case 'network': return <Wifi className="h-5 w-5" />;
      case 'storage': return <Database className="h-5 w-5" />;
      default: return <Cpu className="h-5 w-5" />;
    }
  };

  const toggleControl = () => {
    setIsControlling(!isControlling);
  };

  return (
    <Card className={`
      border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-300
      ${component.status === 'offline' ? 'border-l-4 border-l-red-500' : ''}
      ${component.status === 'warning' ? 'border-l-4 border-l-yellow-500' : ''}
      ${component.status === 'online' ? '' : ''}
      ${component.status === 'maintenance' ? 'border-l-4 border-l-blue-500' : ''}
    `}>
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`${getStatusBg(component.status)} p-2 rounded-lg`}>
              {getIcon(component.type)}
            </div>
            <div>
              <CardTitle className="text-base">{component.name}</CardTitle>
              <CardDescription>{component.model || component.type}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(component.status)} bg-opacity-10 border-opacity-50`}>
              {component.status.charAt(0).toUpperCase() + component.status.slice(1)}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last checked: {component.lastChecked}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>Uptime: {component.uptime}</span>
          </div>
        </div>

        {component.location && (
          <div className="text-xs text-zinc-400 mb-3">
            Location: {component.location}
          </div>
        )}

        {component.ip && (
          <div className="text-xs text-zinc-400 mb-3">
            IP Address: {component.ip}
          </div>
        )}

        {component.utilization !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>System Utilization</span>
              <span>{component.utilization}%</span>
            </div>
            <Progress value={component.utilization} className="h-1.5">
              <div className={`
                h-full transition-all duration-300
                ${component.utilization > 80 ? 'bg-red-500' : ''}
                ${component.utilization > 50 && component.utilization <= 80 ? 'bg-yellow-500' : ''}
                ${component.utilization <= 50 ? 'bg-green-500' : ''}
              `}></div>
            </Progress>
          </div>
        )}

        {component.temperature !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <div className="flex items-center gap-1">
                <ThermometerSun className="h-3 w-3" />
                <span>Temperature</span>
              </div>
              <span>{component.temperature}°C</span>
            </div>
            <Progress value={(component.temperature / 100) * 100} max={100} className="h-1.5">
              <div className={`
                h-full transition-all duration-300
                ${component.temperature > 80 ? 'bg-red-500' : ''}
                ${component.temperature > 60 && component.temperature <= 80 ? 'bg-yellow-500' : ''}
                ${component.temperature <= 60 ? 'bg-green-500' : ''}
              `}></div>
            </Progress>
          </div>
        )}

        {component.battery !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Battery</span>
              <span>{component.battery}%</span>
            </div>
            <Progress value={component.battery} className="h-1.5">
              <div className={`
                h-full transition-all duration-300
                ${component.battery < 20 ? 'bg-red-500' : ''}
                ${component.battery >= 20 && component.battery < 40 ? 'bg-yellow-500' : ''}
                ${component.battery >= 40 ? 'bg-green-500' : ''}
              `}></div>
            </Progress>
          </div>
        )}

        {component.bandwidth && (
          <div className="mt-3 text-xs text-zinc-400">
            <div className="flex items-center gap-1 mb-1">
              <Network className="h-3 w-3" />
              <span>Bandwidth Usage</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center gap-1 justify-between">
                  <div className="flex items-center gap-1">
                    <ArrowUpCircle className="h-3 w-3 text-blue-400" />
                    <span>Upload</span>
                  </div>
                  <span>{component.bandwidth.up} Mbps</span>
                </div>
                <Progress value={(component.bandwidth.up / 10) * 100} className="h-1 mt-1">
                  <div className="bg-blue-500 h-full"></div>
                </Progress>
              </div>
              <div>
                <div className="flex items-center gap-1 justify-between">
                  <div className="flex items-center gap-1">
                    <ArrowDownCircle className="h-3 w-3 text-green-400" />
                    <span>Download</span>
                  </div>
                  <span>{component.bandwidth.down} Mbps</span>
                </div>
                <Progress value={(component.bandwidth.down / 20) * 100} className="h-1 mt-1">
                  <div className="bg-green-500 h-full"></div>
                </Progress>
              </div>
            </div>
          </div>
        )}

        {expanded && (
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Advanced Options</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                  <RotateCw className="h-3 w-3" />
                  Reboot
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                  <Settings className="h-3 w-3" />
                  Configure
                </Button>
                {component.canControl && component.type === 'camera' && (
                  <Button 
                    size="sm" 
                    variant={isControlling ? "default" : "outline"} 
                    className={`h-8 text-xs gap-1 ${isControlling ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    onClick={toggleControl}
                  >
                    <Camera className="h-3 w-3" />
                    {isControlling ? 'Stop Control' : 'Control Camera'}
                  </Button>
                )}
              </div>
            </div>

            {isControlling && component.type === 'camera' && (
              <div className="mt-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div className="text-center mb-3 text-sm font-medium">Camera Controls</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs">Pan Left</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Pan Up</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Pan Right</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Zoom Out</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Center</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Zoom In</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Pan Down</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Focus Near</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs">Focus Far</Button>
                </div>
                <div className="mt-3 flex justify-center">
                  <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700">Take Snapshot</Button>
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-zinc-500">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="flex justify-between">
                  <span>Serial Number</span>
                  <span className="text-zinc-400">{component.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Firmware Version</span>
                  <span className="text-zinc-400">v2.4.1</span>
                </div>
                <div className="flex justify-between">
                  <span>Installed Date</span>
                  <span className="text-zinc-400">12/15/2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Maintenance</span>
                  <span className="text-zinc-400">03/02/2025</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SystemHealthDashboard: React.FC = () => {
  const [systems, setSystems] = useState<SystemComponentProps[]>([]);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [lastScan, setLastScan] = useState<string>('Never');
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock data for system components
  const mockSystems: SystemComponentProps[] = [
    // Cameras
    {
      id: 'CAM-001',
      name: 'Front Camera',
      type: 'camera',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      location: 'Vehicle Front',
      utilization: 45,
      temperature: 42,
      bandwidth: {
        up: 3.2,
        down: 0.5
      },
      ip: '192.168.1.101',
      model: 'HD PTZ 4K Camera',
      canControl: true
    },
    {
      id: 'CAM-002',
      name: 'Interior Camera',
      type: 'camera',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      location: 'Vehicle Cabin',
      utilization: 38,
      temperature: 39,
      bandwidth: {
        up: 2.9,
        down: 0.3
      },
      ip: '192.168.1.102',
      model: 'HD Indoor Camera',
      canControl: true
    },
    {
      id: 'CAM-003',
      name: 'Rear Camera',
      type: 'camera',
      status: 'warning',
      lastChecked: '5 min ago',
      uptime: '12 days',
      location: 'Vehicle Rear',
      utilization: 72,
      temperature: 56,
      bandwidth: {
        up: 1.5,
        down: 0.2
      },
      ip: '192.168.1.103',
      model: 'Wide Angle HD Camera',
      canControl: true
    },
    {
      id: 'CAM-004',
      name: 'Panoramic Camera',
      type: 'camera',
      status: 'offline',
      lastChecked: '35 min ago',
      uptime: '0 days',
      location: 'Vehicle Roof',
      utilization: 0,
      temperature: 23,
      bandwidth: {
        up: 0,
        down: 0
      },
      ip: '192.168.1.104',
      model: '360° Panoramic Camera',
      canControl: false
    },
    
    // Sensors
    {
      id: 'SNS-001',
      name: 'Motion Sensor A',
      type: 'sensor',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      location: 'Vehicle Exterior',
      battery: 85,
      temperature: 32,
      model: 'Motion Detector MK3'
    },
    {
      id: 'SNS-002',
      name: 'Temperature Sensor',
      type: 'sensor',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      location: 'Vehicle Engine Bay',
      battery: 72,
      temperature: 95,
      model: 'High-Temp Thermosensor'
    },
    {
      id: 'SNS-003',
      name: 'Door Contact Sensor',
      type: 'sensor',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      location: 'Vehicle Doors',
      battery: 91,
      model: 'Magnetic Contact Sensor'
    },
    {
      id: 'SNS-004',
      name: 'Millimeter Wave Scanner',
      type: 'sensor',
      status: 'maintenance',
      lastChecked: '45 min ago',
      uptime: '12 days',
      location: 'Vehicle Interior',
      battery: 63,
      temperature: 41,
      model: 'Weapons Detection System'
    },
    
    // Network
    {
      id: 'NET-001',
      name: 'Primary Router',
      type: 'network',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      utilization: 36,
      temperature: 48,
      bandwidth: {
        up: 8.5,
        down: 15.2
      },
      ip: '192.168.1.1',
      model: 'Mobile 5G Router'
    },
    {
      id: 'NET-002',
      name: 'Backup LTE Modem',
      type: 'network',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      utilization: 10,
      temperature: 39,
      bandwidth: {
        up: 1.2,
        down: 3.8
      },
      ip: '192.168.2.1',
      model: 'LTE Failover System'
    },
    
    // Servers
    {
      id: 'SRV-001',
      name: 'Edge Processing Unit',
      type: 'server',
      status: 'online',
      lastChecked: '2 min ago',
      uptime: '26 days',
      utilization: 72,
      temperature: 62,
      ip: '192.168.1.50',
      model: 'Edge AI Compute Box'
    },
    
    // Storage
    {
      id: 'STR-001',
      name: 'Video Storage Array',
      type: 'storage',
      status: 'warning',
      lastChecked: '5 min ago',
      uptime: '26 days',
      utilization: 89,
      temperature: 51,
      model: '4TB SSD RAID Array'
    }
  ];
  
  useEffect(() => {
    // Initialize with mock data
    setSystems(mockSystems);
    setLastScan(new Date().toLocaleTimeString());
  }, []);
  
  const scanForDevices = () => {
    setIsScanning(true);
    
    // Simulate device scanning
    setTimeout(() => {
      // In a real implementation, this would make API calls to discover devices
      setLastScan(new Date().toLocaleTimeString());
      
      // Simulate finding a new camera
      const newCamera: SystemComponentProps = {
        id: 'CAM-005',
        name: 'Side Camera',
        type: 'camera',
        status: 'online',
        lastChecked: 'Just now',
        uptime: '0 days',
        location: 'Vehicle Right Side',
        utilization: 15,
        temperature: 32,
        bandwidth: {
          up: 2.1,
          down: 0.3
        },
        ip: '192.168.1.105',
        model: 'HD Side-Mount Camera',
        canControl: true
      };
      
      // Add the new camera to the existing systems if it doesn't exist already
      if (!systems.some(system => system.id === newCamera.id)) {
        setSystems([...systems, newCamera]);
      } else {
        // Otherwise just update the lastChecked property
        setSystems(systems.map(system => ({
          ...system,
          lastChecked: 'Just now'
        })));
      }
      
      setIsScanning(false);
    }, 3000);
  };
  
  const startAutoRefresh = () => {
    setIsAutoRefreshing(true);
    // In a real implementation, this would set up a polling interval
  };
  
  const stopAutoRefresh = () => {
    setIsAutoRefreshing(false);
    // In a real implementation, this would clear the polling interval
  };
  
  const filteredSystems = systems.filter(system => {
    if (activeTab === 'all') return true;
    if (activeTab === 'online') return system.status === 'online';
    if (activeTab === 'warning') return system.status === 'warning';
    if (activeTab === 'offline') return system.status === 'offline';
    if (activeTab === 'cameras') return system.type === 'camera';
    if (activeTab === 'sensors') return system.type === 'sensor';
    if (activeTab === 'network') return system.type === 'network' || system.type === 'server' || system.type === 'storage';
    return true;
  });
  
  // Calculate system statistics
  const stats = {
    total: systems.length,
    online: systems.filter(s => s.status === 'online').length,
    warning: systems.filter(s => s.status === 'warning').length,
    offline: systems.filter(s => s.status === 'offline').length,
    maintenance: systems.filter(s => s.status === 'maintenance').length,
    cameras: systems.filter(s => s.type === 'camera').length,
    sensors: systems.filter(s => s.type === 'sensor').length,
    network: systems.filter(s => s.type === 'network').length,
    servers: systems.filter(s => s.type === 'server').length,
    storage: systems.filter(s => s.type === 'storage').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1 border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              System Health Overview
            </CardTitle>
            <CardDescription>
              Real-time monitoring of all connected devices and systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-zinc-800 p-3 rounded-lg text-center">
                <div className="text-2xl font-semibold text-white">{stats.total}</div>
                <div className="text-xs text-zinc-400">Total Devices</div>
              </div>
              <div className="bg-green-900 bg-opacity-20 p-3 rounded-lg text-center border border-green-900 border-opacity-20">
                <div className="text-2xl font-semibold text-green-400">{stats.online}</div>
                <div className="text-xs text-green-400">Online</div>
              </div>
              <div className="bg-yellow-900 bg-opacity-20 p-3 rounded-lg text-center border border-yellow-900 border-opacity-20">
                <div className="text-2xl font-semibold text-yellow-400">{stats.warning}</div>
                <div className="text-xs text-yellow-400">Warning</div>
              </div>
              <div className="bg-red-900 bg-opacity-20 p-3 rounded-lg text-center border border-red-900 border-opacity-20">
                <div className="text-2xl font-semibold text-red-400">{stats.offline}</div>
                <div className="text-xs text-red-400">Offline</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/3 border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Security Status
            </CardTitle>
            <CardDescription>
              System security health and protection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Firmware Up to Date</span>
                </div>
                <Badge className="bg-green-500 text-white">Secured</Badge>
              </div>
              <div className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Encryption</span>
                </div>
                <Badge className="bg-green-500 text-white">Active</Badge>
              </div>
              <div className="flex items-center justify-between bg-zinc-800 p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Last Security Scan</span>
                </div>
                <Badge className="bg-yellow-500 text-white">12h ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-900 p-4 rounded-lg border border-zinc-800">
        <div>
          <h3 className="text-lg font-medium">Connected Devices</h3>
          <p className="text-sm text-zinc-400">Manage and monitor all system components</p>
          <div className="text-xs text-zinc-500 mt-1">Last auto-detected scan: {lastScan}</div>
        </div>
        <div className="flex gap-3 mt-3 md:mt-0">
          <Button 
            variant="outline" 
            onClick={scanForDevices}
            disabled={isScanning}
            className="flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Scan for Devices
              </>
            )}
          </Button>
          {!isAutoRefreshing ? (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={startAutoRefresh}
            >
              Start Auto-Refresh
            </Button>
          ) : (
            <Button 
              variant="destructive"
              onClick={stopAutoRefresh}
            >
              Stop Auto-Refresh
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 mb-4 bg-zinc-800 p-1 rounded-lg">
          <TabsTrigger value="all" className="text-sm">
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="online" className="text-sm">
            Online ({stats.online})
          </TabsTrigger>
          <TabsTrigger value="warning" className="text-sm">
            Warning ({stats.warning})
          </TabsTrigger>
          <TabsTrigger value="offline" className="text-sm">
            Offline ({stats.offline})
          </TabsTrigger>
          <TabsTrigger value="cameras" className="text-sm">
            Cameras ({stats.cameras})
          </TabsTrigger>
          <TabsTrigger value="sensors" className="text-sm">
            Sensors ({stats.sensors})
          </TabsTrigger>
          <TabsTrigger value="network" className="text-sm">
            Network ({stats.network + stats.servers + stats.storage})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map(system => (
              <SystemComponentCard key={system.id} component={system} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="online" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map(system => (
              <SystemComponentCard key={system.id} component={system} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="warning" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map(system => (
              <SystemComponentCard key={system.id} component={system} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="offline" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map(system => (
              <SystemComponentCard key={system.id} component={system} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="cameras" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map(system => (
              <SystemComponentCard key={system.id} component={system} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="sensors" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map(system => (
              <SystemComponentCard key={system.id} component={system} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="network" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSystems.map(system => (
              <SystemComponentCard key={system.id} component={system} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;