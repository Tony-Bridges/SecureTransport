import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Bell, Check, Clock, Shield, User } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';

interface Alert {
  id: number;
  vehicleId: string;
  type: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  metadata?: Record<string, any>;
}

const severityColors = {
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const typeIcons: Record<string, React.ReactNode> = {
  weapon_detected: <Shield className="w-4 h-4" />,
  panic_detected: <AlertCircle className="w-4 h-4" />,
  stress_detected: <User className="w-4 h-4" />,
  perimeter_breach: <Bell className="w-4 h-4" />,
  tamper_detected: <AlertCircle className="w-4 h-4" />,
  facial_recognition: <User className="w-4 h-4" />,
  emotion_anomaly: <User className="w-4 h-4" />,
  fear_detected: <User className="w-4 h-4" />,
  anger_detected: <User className="w-4 h-4" />,
};

export default function AlertReview() {
  const [activeTab, setActiveTab] = useState('unacknowledged');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch alerts
  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
  });

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter((alert: Alert) => {
    if (activeTab === 'unacknowledged') {
      return !alert.acknowledged;
    } else if (activeTab === 'critical') {
      return alert.severity === 'critical';
    } else if (activeTab === 'acknowledged') {
      return alert.acknowledged;
    }
    return true;
  });

  // Sort alerts by timestamp (most recent first)
  const sortedAlerts = [...filteredAlerts].sort((a: Alert, b: Alert) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const { mutate: acknowledgeAlert } = useMutation({
    mutationFn: async (alertId: number) => {
      return apiRequest('PATCH', `/api/alerts/${alertId}/acknowledge`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alert acknowledged",
        description: "The alert has been marked as reviewed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      });
      console.error("Error acknowledging alert:", error);
    },
  });

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Alert Review</span>
          <Badge variant="outline" className="ml-2">
            {alerts.filter((a: Alert) => !a.acknowledged).length} pending
          </Badge>
        </CardTitle>
        <CardDescription>Review and acknowledge security alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unacknowledged" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unacknowledged" className="btn-hover-effect">Pending</TabsTrigger>
            <TabsTrigger value="critical" className="btn-hover-effect">Critical</TabsTrigger>
            <TabsTrigger value="acknowledged" className="btn-hover-effect">Reviewed</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-8">Loading alerts...</div>
            ) : sortedAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab} alerts found.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 transition-all card-hover ${
                      alert.acknowledged ? 'opacity-75' : ''
                    } ${alert.severity === 'critical' && !alert.acknowledged ? 'alert-pulse' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                                        <div className={`p-2 rounded-full mr-3 ${
                          severityColors[alert.severity as keyof typeof severityColors]
                        }`}>
                          {typeIcons[alert.type as keyof typeof typeIcons] || <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {alert.type.split('_').map((word: string) => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={
                          alert.severity === 'critical' ? 'destructive' : 
                          alert.severity === 'warning' ? 'outline' : 'secondary'
                        }>
                          {alert.severity}
                        </Badge>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 mr-1" />
                          {getTimeAgo(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">Vehicle:</span> 
                        {alert.vehicleId}
                      </div>
                      {alert.metadata?.detectedEmotion && (
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-2">Emotion:</span>
                          {alert.metadata.detectedEmotion}
                        </div>
                      )}
                      {alert.metadata?.panicProbability && (
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-2">Panic Level:</span>
                          {Math.round(alert.metadata.panicProbability)}%
                        </div>
                      )}
                      {alert.metadata?.stressLevel && (
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-2">Stress Level:</span>
                          {Math.round(alert.metadata.stressLevel)}%
                        </div>
                      )}
                      {alert.metadata?.anomalyScore && (
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-2">Anomaly Score:</span>
                          {Math.round(alert.metadata.anomalyScore)}%
                        </div>
                      )}
                    </div>
                    
                    {!alert.acknowledged && (
                      <div className="mt-3 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="flex items-center interactive-item"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Acknowledge
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="justify-between text-xs text-muted-foreground">
        <div>Total Alerts: {alerts.length}</div>
        <div>Last Updated: {new Date().toLocaleTimeString()}</div>
      </CardFooter>
    </Card>
  );
}