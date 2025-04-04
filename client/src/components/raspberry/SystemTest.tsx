import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Camera, 
  Cctv, 
  CheckCircle2, 
  Clock, 
  Laptop, 
  Radio, 
  RefreshCw, 
  Settings, 
  ShieldCheck, 
  TestTube, 
  Wifi 
} from 'lucide-react';

interface SystemTestProps {
  id: number;
  title: string;
  description: string;
  status: 'ready' | 'warning' | 'error';
  lastTested: string;
  icon: React.ReactNode;
  category: string;
  duration: string;
}

interface SystemTestCardProps {
  test: SystemTestProps;
}

const SystemTestCard: React.FC<SystemTestCardProps> = ({ test }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runTest = () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulate test progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsRunning(false);
            // You could update the test status here in a real implementation
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <Card 
      className={`
        card-hover overflow-hidden border-zinc-800 bg-zinc-900 shadow-md group
        ${test.status === 'warning' ? 'border-l-yellow-500 border-l-4' : ''}
        ${test.status === 'error' ? 'border-l-red-500 border-l-4' : ''}
        ${test.status === 'ready' ? 'border-l-green-500 border-l-4' : ''}
      `}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className={`
            p-3 rounded-lg transition-colors duration-300
            ${test.status === 'ready' ? 'bg-green-900 bg-opacity-30 text-green-500' : ''}
            ${test.status === 'warning' ? 'bg-yellow-900 bg-opacity-30 text-yellow-500' : ''}
            ${test.status === 'error' ? 'bg-red-900 bg-opacity-30 text-red-500' : ''}
          `}>
            {test.icon}
          </div>
          <Badge variant="outline" className={`
            text-xs py-0 px-2 interactive-item
            ${test.status === 'ready' ? 'border-green-500 text-green-500' : ''}
            ${test.status === 'warning' ? 'border-yellow-500 text-yellow-500' : ''}
            ${test.status === 'error' ? 'border-red-500 text-red-500' : ''}
          `}>
            {test.status === 'ready' ? 'Ready' : ''}
            {test.status === 'warning' ? 'Warning' : ''}
            {test.status === 'error' ? 'Error' : ''}
          </Badge>
        </div>
        <CardTitle className="text-lg text-white mt-2">{test.title}</CardTitle>
        <CardDescription className="text-sm text-zinc-400">
          {test.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center text-xs text-zinc-400 mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-900 bg-opacity-20 border-blue-800 text-blue-300">
              {test.category}
            </Badge>
            <span>{test.duration}</span>
          </div>
          <span>Last tested: {test.lastTested}</span>
        </div>
        
        {isRunning && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Running test...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2">
              <div className="bg-blue-500 h-full transition-all duration-300"></div>
            </Progress>
          </div>
        )}
        
        <Button 
          className={`
            w-full mt-2 interactive-item shadow-md 
            ${test.status === 'ready' && !isRunning ? 'bg-green-600 hover:bg-green-700' : ''}
            ${test.status === 'warning' && !isRunning ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
            ${test.status === 'error' && !isRunning ? 'bg-red-600 hover:bg-red-700' : ''}
            ${isRunning ? 'bg-blue-600 hover:bg-blue-700' : ''}
          `}
          onClick={runTest}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              {test.status === 'error' && <AlertTriangle className="mr-2 h-4 w-4" />}
              {test.status === 'warning' && <AlertTriangle className="mr-2 h-4 w-4" />}
              {test.status === 'ready' && <TestTube className="mr-2 h-4 w-4" />}
              Run Test
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

const SystemTestDashboard: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [isRunningAll, setIsRunningAll] = useState(false);
  
  // Mock system test data
  const systemTests: SystemTestProps[] = [
    {
      id: 1,
      title: 'Camera System Diagnostics',
      description: 'Test and calibrate the onboard camera systems',
      status: 'ready',
      lastTested: '2 days ago',
      icon: <Camera size={24} />,
      category: 'Hardware',
      duration: '2-3 min'
    },
    {
      id: 2,
      title: 'Vehicle Connection Status',
      description: 'Verify connectivity to all vehicle sensors and systems',
      status: 'ready',
      lastTested: 'Never',
      icon: <Laptop size={24} />,
      category: 'Connectivity',
      duration: '1-2 min'
    },
    {
      id: 3,
      title: 'Wireless Network Test',
      description: 'Test Wi-Fi and cellular connectivity strength',
      status: 'warning',
      lastTested: '1 week ago',
      icon: <Wifi size={24} />,
      category: 'Connectivity',
      duration: '3-4 min'
    },
    {
      id: 4,
      title: 'Security Sensor Check',
      description: 'Verify all security sensors are operational',
      status: 'error',
      lastTested: '1 month ago',
      icon: <ShieldCheck size={24} />,
      category: 'Security',
      duration: '5-6 min'
    },
    {
      id: 5,
      title: 'Video Quality Calibration',
      description: 'Adjust and test video quality settings for optimal recognition',
      status: 'ready',
      lastTested: '3 days ago',
      icon: <Cctv size={24} />,
      category: 'Hardware',
      duration: '4-5 min'
    },
    {
      id: 6,
      title: 'Communication System Check',
      description: 'Test two-way radio and emergency communication systems',
      status: 'ready',
      lastTested: '1 day ago',
      icon: <Radio size={24} />,
      category: 'Communication',
      duration: '2-3 min'
    }
  ];

  const runAllTests = () => {
    setIsRunningAll(true);
    setTimeout(() => {
      setIsRunningAll(false);
      alert('All tests completed');
    }, 5000);
  };

  const filteredTests = systemTests.filter(test => {
    // Apply category filter
    if (selectedFilter === 'hardware' && test.category !== 'Hardware') {
      return false;
    }
    if (selectedFilter === 'connectivity' && test.category !== 'Connectivity') {
      return false;
    }
    if (selectedFilter === 'security' && test.category !== 'Security') {
      return false;
    }
    if (selectedFilter === 'communication' && test.category !== 'Communication') {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-white">System Diagnostics</h3>
            <p className="text-sm text-zinc-400">Test your connected security components and ensure they are working properly</p>
          </div>
          <div className="flex mt-4 md:mt-0 gap-2">
            <Button variant="outline" className="interactive-item border-zinc-700 flex items-center gap-2">
              <Settings size={16} className="text-blue-400" />
              Configure Tests
            </Button>
            <Button 
              className="interactive-item shadow-md hover:shadow-blue-900/20 flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={runAllTests}
              disabled={isRunningAll}
            >
              {isRunningAll ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'hardware' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'hardware' ? null : 'hardware')}
          >
            Hardware
          </Badge>
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'connectivity' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'connectivity' ? null : 'connectivity')}
          >
            Connectivity
          </Badge>
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'security' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'security' ? null : 'security')}
          >
            Security
          </Badge>
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'communication' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'communication' ? null : 'communication')}
          >
            Communication
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTests.map((test) => (
          <SystemTestCard key={test.id} test={test} />
        ))}
      </div>
    </div>
  );
};

export default SystemTestDashboard;