import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { WebSocketProvider } from "./lib/websocket";
import { AuthProvider, PrivateRoute, useAuth } from "./lib/auth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Routes from "@/pages/Routes";
import LiveFeeds from "@/pages/LiveFeeds";
import Alerts from "@/pages/Alerts";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import AiTraining from "@/pages/AiTraining";
import DeviceManagement from "@/pages/DeviceManagement";
import UserManagement from "@/pages/UserManagement";
import Learn from "@/pages/Learn";
import SystemHealth from "@/pages/SystemHealth";
import VideoAnalysis from "@/pages/VideoAnalysis";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

// Layout wrapper for authenticated pages
function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [location] = useLocation();

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Only render layout if user is authenticated
  if (!user) return <>{children}</>;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      {/* Sidebar - hidden on mobile unless toggled */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block z-40 ${isMobile ? 'fixed inset-0 bg-black bg-opacity-50' : ''}`}>
        <div className={`${isMobile ? 'w-64 max-w-[80%]' : 'w-16 md:w-64'} h-full transition-all duration-300 ease-in-out`}>
          <Sidebar user={user} />
        </div>
        {isMobile && (
          <div className="absolute inset-0 z-[-1]" onClick={() => setSidebarOpen(false)}></div>
        )}
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 h-screen overflow-x-hidden">
        {/* Mobile header with menu button */}
        <div className="md:hidden flex items-center p-4 border-b border-zinc-800">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="ml-4 font-semibold text-xl">
            SecureTransport
          </div>
        </div>
        
        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <PrivateRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/routes">
        <PrivateRoute>
          <AppLayout>
            <Routes />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/feeds">
        <PrivateRoute>
          <AppLayout>
            <LiveFeeds />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/alerts">
        <PrivateRoute>
          <AppLayout>
            <Alerts />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/history">
        <PrivateRoute>
          <AppLayout>
            <History />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/settings">
        <PrivateRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/ai-training">
        <PrivateRoute>
          <AppLayout>
            <AiTraining />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/devices">
        <PrivateRoute>
          <AppLayout>
            <DeviceManagement />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/user-management">
        <PrivateRoute>
          <AppLayout>
            <UserManagement />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/learn">
        <PrivateRoute>
          <AppLayout>
            <Learn />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/system-health">
        <PrivateRoute>
          <AppLayout>
            <SystemHealth />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/video-analysis">
        <PrivateRoute>
          <AppLayout>
            <VideoAnalysis />
          </AppLayout>
        </PrivateRoute>
      </Route>
      <Route path="/:rest*">
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <Router />
          <Toaster />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
