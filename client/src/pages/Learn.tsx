import React, { useState } from 'react';
import { useLocation } from 'wouter';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SystemTestDashboard from '@/components/raspberry/SystemTest';
import { 
  Book, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  FileText, 
  GraduationCap, 
  PlayCircle, 
  Video, 
  Search, 
  Medal, 
  Star, 
  Scroll, 
  Check, 
  Users, 
  PieChart,
  Award,
  BarChart,
  Zap,
  Lightbulb,
  Ruler,
  Calendar,
  Filter,
  Bell,
  TestTube,
  Camera,
  Laptop,
  Wifi,
  ShieldCheck,
  Radio,
  Cctv,
  Settings,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const Learn = () => {
  const [location, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Mock course data
  const courses = [
    {
      id: 1,
      title: 'Security Platform Basics',
      description: 'Learn the fundamentals of our security platform and how to operate the core features.',
      progress: 85,
      duration: '2h 15m',
      lessons: 12,
      image: '🔐'
    },
    {
      id: 2,
      title: 'Advanced Threat Detection',
      description: 'Master advanced techniques for threat identification and risk assessment.',
      progress: 43,
      duration: '3h 30m',
      lessons: 18,
      image: '🛡️'
    },
    {
      id: 3,
      title: 'Emergency Response Protocols',
      description: 'Learn standard operating procedures for emergency situations and alert escalation.',
      progress: 10,
      duration: '1h 45m',
      lessons: 8,
      image: '🚨'
    },
    {
      id: 4,
      title: 'Vehicle Monitoring Systems',
      description: 'Comprehensive overview of vehicle monitoring and tracking capabilities.',
      progress: 0,
      duration: '2h 30m',
      lessons: 14,
      image: '🚚'
    }
  ];

  // Mock documentation data
  const documentation = [
    {
      id: 1,
      title: 'User Guide: Dashboard Navigation',
      category: 'User Manual',
      updated: '2 days ago',
      icon: <FileText size={16} />
    },
    {
      id: 2,
      title: 'System Configuration Guide',
      category: 'Technical',
      updated: '1 week ago',
      icon: <FileText size={16} />
    },
    {
      id: 3,
      title: 'Data Privacy and Compliance',
      category: 'Legal',
      updated: '2 weeks ago',
      icon: <FileText size={16} />
    },
    {
      id: 4,
      title: 'Hardware Installation Manual',
      category: 'Installation',
      updated: '1 month ago',
      icon: <FileText size={16} />
    },
    {
      id: 5,
      title: 'Troubleshooting Common Issues',
      category: 'Support',
      updated: '2 months ago',
      icon: <FileText size={16} />
    }
  ];

  // Mock videos data
  const videos = [
    {
      id: 1,
      title: 'Getting Started with the Platform',
      duration: '8:25',
      thumbnail: '▶️',
      views: '2.1k'
    },
    {
      id: 2,
      title: 'Vehicle Assignment Walkthrough',
      duration: '12:10',
      thumbnail: '▶️',
      views: '1.8k'
    },
    {
      id: 3,
      title: 'Alert Monitoring Best Practices',
      duration: '15:45',
      thumbnail: '▶️',
      views: '3.2k'
    },
    {
      id: 4,
      title: 'Route Planning and Risk Assessment',
      duration: '10:30',
      thumbnail: '▶️',
      views: '2.5k'
    },
    {
      id: 5,
      title: 'AI System Training Tutorial',
      duration: '18:15',
      thumbnail: '▶️',
      views: '1.9k'
    }
  ];
  
  // Mock assessments data
  const assessments = [
    {
      id: 1,
      title: 'Security Fundamentals Certification',
      description: 'Evaluate your knowledge of core security concepts and platform features',
      questions: 25,
      timeLimit: '45 min',
      passingScore: '80%',
      difficulty: 'Beginner',
      icon: <Lightbulb size={24} />
    },
    {
      id: 2,
      title: 'Advanced Threat Recognition',
      description: 'Test your ability to identify and respond to complex security scenarios',
      questions: 30,
      timeLimit: '60 min',
      passingScore: '75%',
      difficulty: 'Intermediate',
      icon: <Zap size={24} />
    },
    {
      id: 3,
      title: 'Emergency Protocol Assessment',
      description: 'Validate your understanding of emergency procedures and protocols',
      questions: 20,
      timeLimit: '30 min',
      passingScore: '90%',
      difficulty: 'Advanced',
      icon: <Bell size={24} />
    },
    {
      id: 4,
      title: 'Vehicle Monitoring Specialist',
      description: 'Certification for professional vehicle security monitoring',
      questions: 40,
      timeLimit: '75 min',
      passingScore: '85%',
      difficulty: 'Expert',
      icon: <BarChart size={24} />
    }
  ];
  
  // Mock system test data
  const systemTests = [
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

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <Header
        title="Learning Center"
        subtitle="Courses, tutorials and documentation for the security platform"
        icon={<GraduationCap className="text-white" size={28} />}
      />

      {/* Search Bar */}
      <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-md mb-6">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={18} />
            <Input 
              placeholder="Search for courses, documentation or videos..." 
              className="pl-10 bg-zinc-800 border-zinc-700 h-11 focus-visible:ring-blue-600 interactive-item"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            className="h-11 interactive-item border-zinc-700"
            onClick={() => {
              alert('Filter dialog would open here');
            }}
          >
            <Filter size={18} className="mr-2" /> Filters
          </Button>
        </div>

        <div className="flex gap-2 mt-3">
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'security' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'security' ? null : 'security')}
          >
            Security Basics
          </Badge>
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'certification' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'certification' ? null : 'certification')}
          >
            Certification
          </Badge>
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'advanced' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'advanced' ? null : 'advanced')}
          >
            Advanced
          </Badge>
          <Badge 
            className={`cursor-pointer transition-colors interactive-item ${
              selectedFilter === 'new' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-900 bg-opacity-40 hover:bg-blue-800'
            }`}
            onClick={() => setSelectedFilter(selectedFilter === 'new' ? null : 'new')}
          >
            New Content
          </Badge>
        </div>
      </div>

      {/* Learning Progress Summary */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-5 rounded-lg shadow-lg mb-6 border border-blue-600">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Your Learning Progress</h3>
            <p className="text-blue-200">Continue learning to earn certifications</p>
          </div>
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <Award className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-white bg-opacity-10 border-0 shadow-md">
            <CardContent className="p-4 flex flex-col items-center">
              <div className="bg-blue-500 p-2 rounded-full mb-2">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-medium">2/4</p>
              <p className="text-xs text-blue-200">Courses in progress</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white bg-opacity-10 border-0 shadow-md">
            <CardContent className="p-4 flex flex-col items-center">
              <div className="bg-blue-500 p-2 rounded-full mb-2">
                <Medal className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-medium">3</p>
              <p className="text-xs text-blue-200">Certificates earned</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white bg-opacity-10 border-0 shadow-md">
            <CardContent className="p-4 flex flex-col items-center">
              <div className="bg-blue-500 p-2 rounded-full mb-2">
                <Award className="w-5 h-5 text-white" />
              </div>
              <p className="text-white font-medium">18h</p>
              <p className="text-xs text-blue-200">Total learning time</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6 bg-zinc-800 p-1 rounded-lg">
            <TabsTrigger 
              value="courses" 
              className="btn-hover-effect text-base py-3 transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg interactive-item"
            >
              <BookOpen className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="documentation" 
              className="btn-hover-effect text-base py-3 transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg interactive-item"
            >
              <Book className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Documentation
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="btn-hover-effect text-base py-3 transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg interactive-item"
            >
              <Video className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Video Tutorials
            </TabsTrigger>
            <TabsTrigger 
              value="assessments" 
              className="btn-hover-effect text-base py-3 transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg interactive-item"
            >
              <Ruler className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Assessments
            </TabsTrigger>
            <TabsTrigger 
              value="systemTests" 
              className="btn-hover-effect text-base py-3 transition-all duration-300 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg interactive-item"
            >
              <TestTube className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              System Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses
                .filter(course => {
                  // Apply search query filter
                  if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
                      !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                  
                  // Apply category filter
                  if (selectedFilter === 'security' && !course.title.toLowerCase().includes('security')) {
                    return false;
                  }
                  if (selectedFilter === 'advanced' && !course.title.toLowerCase().includes('advanced')) {
                    return false;
                  }
                  if (selectedFilter === 'certification' && course.progress < 85) {
                    return false;
                  }
                  if (selectedFilter === 'new' && course.progress > 0) {
                    return false;
                  }
                  
                  return true;
                })
                .map((course) => (
                <Card key={course.id} className="card-hover overflow-hidden border-zinc-800 bg-zinc-900 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="text-4xl mb-2 animate-bounce-subtle">{course.image}</div>
                      <Badge variant="outline" className="text-xs py-0 interactive-item">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white">{course.title}</CardTitle>
                    <CardDescription className="text-sm text-zinc-400">
                      {course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-xs text-zinc-400 mb-2">
                      <span>{course.lessons} lessons</span>
                      <span>{course.progress > 0 ? `${course.progress}% complete` : 'Not started'}</span>
                    </div>
                    <Progress value={course.progress} className="h-2 overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all duration-500 animate-pulse-ring"></div>
                    </Progress>
                    
                    <Button 
                      className="w-full mt-4 interactive-item shadow-md hover:shadow-blue-900/20" 
                      variant={course.progress > 0 ? "default" : "outline"}
                      onClick={() => {
                        alert(`${course.progress > 0 ? 'Continuing' : 'Starting'} course: ${course.title}`);
                      }}
                    >
                      {course.progress > 0 ? (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4 animate-pulse" />
                          Continue
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Course
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documentation" className="mt-4">
            <Card className="border-zinc-800 bg-zinc-900">
              <CardHeader>
                <CardTitle>Documentation Library</CardTitle>
                <CardDescription>
                  Access all technical documentation and user guides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {documentation
                      .filter(doc => {
                        // Apply search query filter
                        if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                          return false;
                        }
                        
                        // Apply category filter
                        if (selectedFilter === 'security' && !doc.title.toLowerCase().includes('security') && doc.category !== 'Security') {
                          return false;
                        }
                        if (selectedFilter === 'certification' && doc.category !== 'Legal') {
                          return false;
                        }
                        if (selectedFilter === 'advanced' && doc.category !== 'Technical') {
                          return false;
                        }
                        if (selectedFilter === 'new' && doc.updated !== '2 days ago') {
                          return false;
                        }
                        
                        return true;
                      })
                      .map((doc) => (
                      <div 
                        key={doc.id} 
                        className="p-4 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all cursor-pointer card-hover shadow-md group"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex">
                            <div className="p-2 rounded-full bg-blue-600 bg-opacity-20 mr-3 group-hover:bg-blue-600 group-hover:bg-opacity-30 transition-colors duration-300">
                              {doc.icon}
                            </div>
                            <div>
                              <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors duration-300">{doc.title}</h3>
                              <div className="flex items-center mt-1">
                                <Badge variant="secondary" className="text-xs group-hover:bg-blue-900 group-hover:bg-opacity-50 transition-colors duration-300">
                                  {doc.category}
                                </Badge>
                                <span className="text-xs text-zinc-500 ml-2">Updated {doc.updated}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="interactive-item opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-blue-900 hover:bg-opacity-20"
                            onClick={() => {
                              alert(`Opening documentation: ${doc.title}`);
                            }}
                          >
                            <FileText className="h-4 w-4 text-blue-300" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos
                .filter(video => {
                  // Apply search query filter
                  if (searchQuery && !video.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                  
                  // Apply category filter
                  if (selectedFilter === 'security' && !video.title.toLowerCase().includes('security')) {
                    return false;
                  }
                  if (selectedFilter === 'advanced' && !video.title.toLowerCase().includes('advanced')) {
                    return false;
                  }
                  if (selectedFilter === 'certification' && video.views < '2.5k') {
                    return false;
                  }
                  
                  return true;
                })
                .map((video) => (
                <div 
                  key={video.id} 
                  className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden card-hover shadow-md"
                >
                  <div className="aspect-video bg-zinc-800 flex items-center justify-center text-4xl relative group">
                    {video.thumbnail}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-all duration-300 group-hover:bg-opacity-20">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="w-16 h-16 rounded-full bg-white bg-opacity-20 hover:bg-opacity-50 interactive-item transition-transform duration-300 transform group-hover:scale-110"
                        onClick={() => {
                          alert(`Playing video: ${video.title}`);
                        }}
                      >
                        <PlayCircle className="h-10 w-10 text-white animate-pulse" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      {video.duration}
                    </div>
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      New
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg text-white">{video.title}</h3>
                    <div className="flex justify-between mt-2 text-xs text-zinc-400">
                      <span>{video.views} views</span>
                      <div className="flex items-center bg-green-500 bg-opacity-10 rounded-full px-2 py-1">
                        <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                        <span className="text-green-400">Certificate available</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assessments" className="mt-4">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-md mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Assessment Center</h3>
                  <p className="text-sm text-zinc-400">Test your knowledge and earn certifications</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-900 bg-opacity-20 border-blue-800 text-blue-300">
                    <Star className="mr-1 h-3 w-3" /> 3 Certifications Earned
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assessments
                .filter(assessment => {
                  // Apply search query filter
                  if (searchQuery && 
                     !assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
                     !assessment.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                  
                  // Apply category filter
                  if (selectedFilter === 'security' && !assessment.title.toLowerCase().includes('security')) {
                    return false;
                  }
                  if (selectedFilter === 'advanced' && assessment.difficulty !== 'Advanced') {
                    return false;
                  }
                  if (selectedFilter === 'certification' && !assessment.title.toLowerCase().includes('certification')) {
                    return false;
                  }
                  
                  return true;
                })
                .map((assessment) => (
                <Card 
                  key={assessment.id} 
                  className="card-hover overflow-hidden border-zinc-800 bg-zinc-900 shadow-md group"
                >
                  <CardHeader className="pb-3 relative overflow-hidden">
                    <div className="absolute -right-16 -top-12 w-40 h-40 bg-blue-600 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
                    <div className="flex items-start justify-between relative z-10">
                      <div className="p-3 rounded-lg bg-blue-600 bg-opacity-20 group-hover:bg-opacity-30 transition-colors duration-300">
                        {assessment.icon}
                      </div>
                      <Badge variant="outline" className={`
                        px-2 py-1 interactive-item
                        ${assessment.difficulty === 'Beginner' ? 'border-green-500 text-green-500' : ''}
                        ${assessment.difficulty === 'Intermediate' ? 'border-blue-500 text-blue-500' : ''}
                        ${assessment.difficulty === 'Advanced' ? 'border-orange-500 text-orange-500' : ''}
                        ${assessment.difficulty === 'Expert' ? 'border-red-500 text-red-500' : ''}
                      `}>
                        {assessment.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white mt-3 group-hover:text-blue-300 transition-colors duration-300">
                      {assessment.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-zinc-400">
                      {assessment.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400 mb-4">
                      <div className="flex items-center">
                        <div className="bg-zinc-800 p-1.5 rounded-full mr-2">
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        {assessment.timeLimit}
                      </div>
                      <div className="flex items-center">
                        <div className="bg-zinc-800 p-1.5 rounded-full mr-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        {assessment.passingScore} to pass
                      </div>
                      <div className="flex items-center">
                        <div className="bg-zinc-800 p-1.5 rounded-full mr-2">
                          <FileText className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        {assessment.questions} questions
                      </div>
                      <div className="flex items-center">
                        <div className="bg-zinc-800 p-1.5 rounded-full mr-2">
                          <Medal className="h-3.5 w-3.5 text-blue-400" />
                        </div>
                        Certification
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full interactive-item shadow-md hover:shadow-blue-900/20 group-hover:bg-blue-600 transition-colors duration-300" 
                      variant="outline"
                      onClick={() => {
                        alert(`Starting assessment: ${assessment.title}`);
                      }}
                    >
                      <Ruler className="mr-2 h-4 w-4" />
                      Start Assessment
                    </Button>
                  </CardContent>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="systemTests" className="mt-4">
            <SystemTestDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Learn;