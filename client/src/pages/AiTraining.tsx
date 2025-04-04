import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, AlertCircle, FileVideo, FileImage, CheckCircle2, Database, Brain, Gauge, UploadCloud, Play, Car, Clock4 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AiTraining = () => {
  const { toast } = useToast();
  
  // User info
  const user = {
    name: 'John Doe',
    role: 'Security Admin'
  };

  // State for active tab
  const [activeTab, setActiveTab] = useState<string>('upload');

  // State for file uploads
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [trainingInProgress, setTrainingInProgress] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);

  // State for anomaly detection settings
  const [settings, setSettings] = useState({
    autoActivateCamera: true,
    timeThreshold: '4', // minutes
    trackSurroundingVehicles: true,
    notifyAuthorities: false,
    sensitivityLevel: 'medium',
    useGPU: true
  });

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...filesArray]);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const simulateUpload = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast({
            title: "Upload Complete",
            description: `Successfully uploaded ${uploadedFiles.length} files for AI training`,
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  const simulateTraining = () => {
    setTrainingInProgress(true);
    setTrainingProgress(0);

    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTrainingInProgress(false);
          toast({
            title: "Training Complete",
            description: "AI model has been successfully trained with new data",
          });
          return 100;
        }
        return prev + 1;
      });
    }, 300);
  };

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  // Helper to determine file type icon
  const getFileIcon = (file: File) => {
    if (file.type.includes('video')) {
      return <FileVideo className="h-6 w-6 text-blue-500" />;
    } else if (file.type.includes('image')) {
      return <FileImage className="h-6 w-6 text-green-500" />;
    }
    return <FileImage className="h-6 w-6 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <Header 
          title="AI Model Training" 
          subtitle="Upload data and train anomaly detection models" 
          icon={<Upload className="h-6 w-6" />}
        />
        
        <div className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList className="bg-zinc-900">
                <TabsTrigger value="upload">Data Upload</TabsTrigger>
                <TabsTrigger value="train">Training</TabsTrigger>
                <TabsTrigger value="settings">Anomaly Settings</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="upload" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Upload Training Data</CardTitle>
                  <CardDescription>
                    Upload videos and images to train AI anomaly detection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div 
                        className="border-2 border-dashed border-zinc-700 rounded-lg p-10 text-center hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <UploadCloud className="h-10 w-10 text-zinc-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Drag & Drop or Click to Upload</h3>
                        <p className="text-sm text-zinc-400 mb-4">
                          Upload video footage or images of security incidents for model training
                        </p>
                        <Button variant="outline" size="sm">
                          Select Files
                        </Button>
                        <input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          multiple 
                          accept="video/*,image/*" 
                          onChange={handleFileChange}
                        />
                      </div>
                      
                      <div className="mt-4 text-sm text-zinc-400">
                        <p>• Supported formats: MP4, MOV, JPG, PNG</p>
                        <p>• Maximum file size: 500MB per file</p>
                        <p>• Videos should be minimum 720p resolution</p>
                        <p>• For best results, include both normal and anomalous footage</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Selected Files ({uploadedFiles.length})</h3>
                      
                      {uploadedFiles.length === 0 ? (
                        <div className="text-center py-10 border border-zinc-800 rounded-lg text-zinc-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                          <p>No files selected</p>
                        </div>
                      ) : (
                        <div className="max-h-[350px] overflow-y-auto pr-2">
                          {uploadedFiles.map((file, index) => (
                            <div 
                              key={index} 
                              className="flex items-center p-3 mb-2 bg-zinc-800 rounded-lg"
                            >
                              {getFileIcon(file)}
                              <div className="ml-3 flex-grow overflow-hidden">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-zinc-400">{formatFileSize(file.size)}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-400 hover:text-red-300 hover:bg-zinc-700"
                                onClick={() => handleRemoveFile(index)}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          {isUploading ? (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Uploading...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <Progress value={uploadProgress} className="h-2" />
                            </div>
                          ) : (
                            <Button 
                              className="w-full"
                              onClick={simulateUpload}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload {uploadedFiles.length} Files
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Recent Uploads</CardTitle>
                  <CardDescription>
                    Previously uploaded training data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <FileVideo className="h-8 w-8 text-blue-500 p-1 bg-blue-500/20 rounded-lg" />
                        <span className="text-xs text-zinc-400">3 days ago</span>
                      </div>
                      <h3 className="mt-3 font-medium">Johannesburg Route Footage</h3>
                      <p className="text-xs text-zinc-400 mt-1">14 videos • 3.2GB</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">Processed</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <FileImage className="h-8 w-8 text-purple-500 p-1 bg-purple-500/20 rounded-lg" />
                        <span className="text-xs text-zinc-400">1 week ago</span>
                      </div>
                      <h3 className="mt-3 font-medium">Suspicious Vehicles Dataset</h3>
                      <p className="text-xs text-zinc-400 mt-1">128 images • 450MB</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">Processed</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <FileVideo className="h-8 w-8 text-amber-500 p-1 bg-amber-500/20 rounded-lg" />
                        <span className="text-xs text-zinc-400">2 weeks ago</span>
                      </div>
                      <h3 className="mt-3 font-medium">Pretoria Incidents</h3>
                      <p className="text-xs text-zinc-400 mt-1">8 videos • 1.7GB</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">Processed</span>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="train" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Train AI Model</CardTitle>
                  <CardDescription>
                    Configure and start training for the anomaly detection model
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="model-type">Model Type</Label>
                        <Select defaultValue="anomaly">
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full mt-1">
                            <SelectValue placeholder="Select model type" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            <SelectItem value="anomaly">Anomaly Detection</SelectItem>
                            <SelectItem value="weapon">Weapon Recognition</SelectItem>
                            <SelectItem value="behavior">Suspicious Behavior</SelectItem>
                            <SelectItem value="vehicle">Vehicle Tracking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="training-data">Training Data Source</Label>
                        <Select defaultValue="uploaded">
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full mt-1">
                            <SelectValue placeholder="Select data source" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            <SelectItem value="uploaded">Recent Uploads</SelectItem>
                            <SelectItem value="johannesburg">Johannesburg Dataset</SelectItem>
                            <SelectItem value="pretoria">Pretoria Dataset</SelectItem>
                            <SelectItem value="all">All Available Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="epochs">Training Epochs</Label>
                        <Select defaultValue="100">
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full mt-1">
                            <SelectValue placeholder="Select epochs" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            <SelectItem value="50">50 (Quick)</SelectItem>
                            <SelectItem value="100">100 (Standard)</SelectItem>
                            <SelectItem value="200">200 (Extended)</SelectItem>
                            <SelectItem value="500">500 (Thorough)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Use GPU Acceleration</Label>
                          <p className="text-sm text-gray-400">Significantly speeds up training</p>
                        </div>
                        <Switch 
                          checked={settings.useGPU}
                          onCheckedChange={(checked) => handleSettingChange('useGPU', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" />
                        <label
                          htmlFor="terms"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Deploy model automatically after training
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 rounded-lg p-6">
                      <h3 className="font-medium text-lg mb-3">Training Statistics</h3>
                      
                      {trainingInProgress ? (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Training Progress</span>
                              <span>{trainingProgress}%</span>
                            </div>
                            <Progress value={trainingProgress} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Epoch</p>
                              <p className="text-lg font-medium">{Math.floor(trainingProgress / 2)}/100</p>
                            </div>
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Loss</p>
                              <p className="text-lg font-medium">{(0.5 - (trainingProgress / 200)).toFixed(4)}</p>
                            </div>
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Accuracy</p>
                              <p className="text-lg font-medium">{(75 + (trainingProgress / 4)).toFixed(2)}%</p>
                            </div>
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Time Remaining</p>
                              <p className="text-lg font-medium">{Math.ceil((100 - trainingProgress) / 10)} min</p>
                            </div>
                          </div>
                          
                          <Button variant="outline" className="w-full" disabled>
                            Training in Progress...
                          </Button>
                        </div>
                      ) : trainingProgress === 100 ? (
                        <div className="space-y-6">
                          <div className="text-center py-4">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                            <h3 className="text-xl font-medium text-green-500">Training Complete</h3>
                            <p className="text-sm text-zinc-400 mt-2">Model trained successfully with 97.5% accuracy</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Final Loss</p>
                              <p className="text-lg font-medium">0.0124</p>
                            </div>
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Accuracy</p>
                              <p className="text-lg font-medium text-green-500">97.5%</p>
                            </div>
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Training Time</p>
                              <p className="text-lg font-medium">32 min</p>
                            </div>
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Model Size</p>
                              <p className="text-lg font-medium">246 MB</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="default" className="flex-1">
                              Deploy Model
                            </Button>
                            <Button variant="outline" className="flex-1">
                              View Report
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="text-center py-6">
                            <Brain className="h-12 w-12 text-zinc-500 mx-auto mb-3" />
                            <h3 className="text-xl font-medium">Ready to Train</h3>
                            <p className="text-sm text-zinc-400 mt-2">Configure options and start training</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Est. Training Time</p>
                              <p className="text-lg font-medium">~30 min</p>
                            </div>
                            <div className="bg-zinc-700 p-3 rounded-lg">
                              <p className="text-xs text-zinc-400">Training Data</p>
                              <p className="text-lg font-medium">5.4 GB</p>
                            </div>
                          </div>
                          
                          <Button 
                            variant="default" 
                            className="w-full"
                            onClick={simulateTraining}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Training
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Training History</CardTitle>
                  <CardDescription>
                    Previous model training sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs text-gray-400 border-b border-zinc-800">
                          <th className="pb-2 text-left font-medium">Model Name</th>
                          <th className="pb-2 text-left font-medium">Type</th>
                          <th className="pb-2 text-left font-medium">Date</th>
                          <th className="pb-2 text-left font-medium">Accuracy</th>
                          <th className="pb-2 text-left font-medium">Status</th>
                          <th className="pb-2 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-4">anomaly-detect-v2.3</td>
                          <td className="py-4">Anomaly Detection</td>
                          <td className="py-4">Yesterday, 14:32</td>
                          <td className="py-4">94.2%</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                              Active
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <Button variant="ghost" size="sm">Details</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-4">weapon-recognition-v1.8</td>
                          <td className="py-4">Weapon Recognition</td>
                          <td className="py-4">March 24, 2025</td>
                          <td className="py-4">96.7%</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                              Active
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <Button variant="ghost" size="sm">Details</Button>
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-800 hover:bg-zinc-800">
                          <td className="py-4">anomaly-detect-v2.2</td>
                          <td className="py-4">Anomaly Detection</td>
                          <td className="py-4">March 20, 2025</td>
                          <td className="py-4">91.8%</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-zinc-500/20 text-zinc-400 rounded-full text-xs">
                              Archived
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <Button variant="ghost" size="sm">Details</Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Anomaly Detection Settings</CardTitle>
                  <CardDescription>
                    Configure how the system responds to anomalies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-Activate All Cameras</Label>
                          <p className="text-sm text-gray-400">Activate all cameras when vehicle stops for extended period</p>
                        </div>
                        <Switch 
                          checked={settings.autoActivateCamera}
                          onCheckedChange={(checked) => handleSettingChange('autoActivateCamera', checked)}
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="time-threshold">Stationary Time Threshold (minutes)</Label>
                        <Input 
                          id="time-threshold" 
                          type="number" 
                          min="1"
                          max="60"
                          value={settings.timeThreshold}
                          onChange={(e) => handleSettingChange('timeThreshold', e.target.value)}
                          className="bg-zinc-800 border-zinc-700" 
                        />
                        <p className="text-xs text-zinc-400">Trigger alert when vehicle is stationary for longer than this period</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Track Surrounding Vehicles</Label>
                          <p className="text-sm text-gray-400">Monitor and track vehicles in the vicinity during anomalies</p>
                        </div>
                        <Switch 
                          checked={settings.trackSurroundingVehicles}
                          onCheckedChange={(checked) => handleSettingChange('trackSurroundingVehicles', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">SAPS Notification</Label>
                          <p className="text-sm text-gray-400">Automatically notify authorities of critical anomalies</p>
                        </div>
                        <Switch 
                          checked={settings.notifyAuthorities}
                          onCheckedChange={(checked) => handleSettingChange('notifyAuthorities', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                        <Select 
                          value={settings.sensitivityLevel}
                          onValueChange={(value) => handleSettingChange('sensitivityLevel', value)}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 w-full">
                            <SelectValue placeholder="Select sensitivity level" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700">
                            <SelectItem value="low">Low (Fewer false positives)</SelectItem>
                            <SelectItem value="medium">Medium (Balanced)</SelectItem>
                            <SelectItem value="high">High (Maximum detection)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-zinc-400">Higher sensitivity may result in more false positives</p>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg space-y-3">
                        <h3 className="font-medium">Anomaly Triggers</h3>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="trigger-stationary" defaultChecked />
                          <label
                            htmlFor="trigger-stationary"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Extended stationary period ({settings.timeThreshold} minutes)
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="trigger-weapons" defaultChecked />
                          <label
                            htmlFor="trigger-weapons"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Weapon detection
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="trigger-vehicles" defaultChecked />
                          <label
                            htmlFor="trigger-vehicles"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Suspicious surrounding vehicles
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="trigger-deviation" defaultChecked />
                          <label
                            htmlFor="trigger-deviation"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Route deviation in high-risk zones
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox id="trigger-speed" defaultChecked />
                          <label
                            htmlFor="trigger-speed"
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Unusual speed patterns
                          </label>
                        </div>
                      </div>
                      
                      <Button className="w-full">
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Advanced AI Configuration</CardTitle>
                  <CardDescription>
                    Fine-tune AI behavior for specialized scenarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <Car className="h-8 w-8 text-blue-500 p-1 bg-blue-500/20 rounded-lg" />
                        <Switch defaultChecked />
                      </div>
                      <h3 className="mt-3 font-medium">Vehicle Tracking</h3>
                      <p className="text-xs text-zinc-400 mt-1">Track suspicious vehicles around cash transport vehicles</p>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <Clock4 className="h-8 w-8 text-purple-500 p-1 bg-purple-500/20 rounded-lg" />
                        <Switch defaultChecked />
                      </div>
                      <h3 className="mt-3 font-medium">Stationary Detection</h3>
                      <p className="text-xs text-zinc-400 mt-1">Identifies when vehicle stops for more than {settings.timeThreshold} minutes</p>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <AlertCircle className="h-8 w-8 text-red-500 p-1 bg-red-500/20 rounded-lg" />
                        <Switch defaultChecked />
                      </div>
                      <h3 className="mt-3 font-medium">Threat Analysis</h3>
                      <p className="text-xs text-zinc-400 mt-1">Real-time analysis of potential security threats</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Restore Defaults</Button>
                  <Button>Apply Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="monitoring" className="space-y-6">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>AI Performance Monitoring</CardTitle>
                  <CardDescription>
                    Track model performance and detection accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Model Performance</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Detection Accuracy</span>
                            <span className="text-sm font-medium">95.2%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '95.2%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">False Positive Rate</span>
                            <span className="text-sm font-medium">4.8%</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: '4.8%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Response Time</span>
                            <span className="text-sm font-medium">248ms</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Model Health</span>
                            <span className="text-sm font-medium">Excellent</span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Detection Categories</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex justify-between text-sm">
                            <span>Weapons</span>
                            <span className="font-medium">98.2%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Suspicious Vehicles</span>
                            <span className="font-medium">94.5%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Extended Stops</span>
                            <span className="font-medium">99.1%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Route Deviations</span>
                            <span className="font-medium">92.8%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Recent Detections</h3>
                      
                      <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2">
                        <div className="bg-zinc-800 p-3 rounded-lg border-l-4 border-amber-500">
                          <div className="flex justify-between">
                            <div className="font-medium">Extended Stop Detected</div>
                            <div className="text-xs text-zinc-400">10:32 AM</div>
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Vehicle CIT-0118 stopped for 4m 12s in Johannesburg CBD
                          </div>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">Medium Risk</span>
                            <Button variant="ghost" size="sm" className="ml-auto">
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-800 p-3 rounded-lg border-l-4 border-red-500">
                          <div className="flex justify-between">
                            <div className="font-medium">Weapon Detected</div>
                            <div className="text-xs text-zinc-400">Yesterday, 15:48</div>
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Potential firearm detected near vehicle CIT-0220
                          </div>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-full">High Risk</span>
                            <Button variant="ghost" size="sm" className="ml-auto">
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-800 p-3 rounded-lg border-l-4 border-green-500">
                          <div className="flex justify-between">
                            <div className="font-medium">Model Update Applied</div>
                            <div className="text-xs text-zinc-400">Yesterday, 09:15</div>
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Anomaly detection model was updated to v2.3
                          </div>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">System</span>
                            <Button variant="ghost" size="sm" className="ml-auto">
                              Details
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-zinc-800 p-3 rounded-lg border-l-4 border-amber-500">
                          <div className="flex justify-between">
                            <div className="font-medium">Suspicious Vehicle</div>
                            <div className="text-xs text-zinc-400">March 27, 16:20</div>
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Unidentified vehicle following CIT-0118 for 12 minutes
                          </div>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">Medium Risk</span>
                            <Button variant="ghost" size="sm" className="ml-auto">
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        View All Detections
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>
                    Hardware and system resource utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">CPU Usage</span>
                        <span className="text-sm font-medium">42%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">GPU Usage</span>
                        <span className="text-sm font-medium">78%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Memory</span>
                        <span className="text-sm font-medium">6.2/8GB</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '77.5%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Storage</span>
                        <span className="text-sm font-medium">248/500GB</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '49.6%' }}></div>
                      </div>
                    </div>
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

export default AiTraining;