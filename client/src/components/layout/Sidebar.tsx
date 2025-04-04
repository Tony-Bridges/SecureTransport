import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  ShieldCheck, 
  MapPin, 
  Video, 
  Bell, 
  History, 
  Settings, 
  LayoutDashboard,
  LogOut,
  Upload,
  AlertCircle,
  Cpu,
  Server,
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Activity,
  VideoIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: {
    name: string;
    role: string;
  };
}

const Sidebar = ({ user }: SidebarProps) => {
  const [location] = useLocation();
  const { logout } = useAuth();
  
  // Dynamically filter items based on user role
  const allNavItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard /> },
    { path: '/routes', label: 'Route Planning', icon: <MapPin /> },
    { path: '/feeds', label: 'Live Feeds', icon: <Video /> },
    { path: '/alerts', label: 'Alerts', icon: <Bell /> },
    { path: '/history', label: 'History', icon: <History /> },
    { path: '/video-analysis', label: 'Video Analysis', icon: <VideoIcon /> },
    { path: '/learn', label: 'Learning Center', icon: <BookOpen /> },
    { path: '/system-health', label: 'System Health', icon: <Activity /> },
    // Admin-only items
    { path: '/devices', label: 'Device Management', icon: <Server />, adminOnly: true },
    { path: '/ai-training', label: 'AI Training', icon: <Upload />, adminOnly: true },
    { path: '/user-management', label: 'User Management', icon: <Users />, adminOnly: true },
    // Available to all users
    { path: '/settings', label: 'Settings', icon: <Settings /> },
  ];
  
  // Filter items based on user role
  const navItems = allNavItems.filter(item => !item.adminOnly || user.role === 'admin');
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <aside className="w-16 md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-center md:justify-start">
        <Link href="/" className="cursor-pointer">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-lg w-10 h-10 flex items-center justify-center">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <h1 className="hidden md:block text-xl font-bold ml-3 text-white">SecureTransport</h1>
          </div>
        </Link>
      </div>
      
      {/* Home button always visible on mobile for quick navigation */}
      <div className="md:hidden flex justify-center py-3 border-b border-zinc-800">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href="/" 
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 interactive-item"
              >
                <Home size={24} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Home</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <nav className="flex-1 pt-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path} 
                className={cn(
                  "flex items-center px-4 py-3 cursor-pointer interactive-item btn-hover-effect",
                  location === item.path 
                    ? "text-white bg-blue-600 bg-opacity-20 border-l-4 border-blue-600" 
                    : "text-gray-400 hover:bg-zinc-800 hover:text-white border-l-4 border-transparent"
                )}
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                <span className="hidden md:block ml-3">{item.label}</span>
                {item.label === 'Alerts' && (
                  <span className="hidden md:flex ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded notification-badge">3</span>
                )}
                {(item.label === 'AI Training' || item.label === 'Learning Center' || item.label === 'System Health' || item.label === 'Video Analysis') && (
                  <span className="hidden md:flex ml-2 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded animate-pulse">New</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-zinc-800">
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
              {/* User avatar would go here */}
              <div className="w-full h-full bg-zinc-600 flex items-center justify-center text-xs text-white">
                {user.name.charAt(0)}
              </div>
            </div>
            <div className="hidden md:block ml-3">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="mt-3 text-red-500 hover:text-red-400 hover:bg-zinc-800 flex items-center justify-center md:justify-start interactive-item"
          >
            <LogOut size={18} className="mr-0 md:mr-2" />
            <span className="hidden md:inline">Log Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
