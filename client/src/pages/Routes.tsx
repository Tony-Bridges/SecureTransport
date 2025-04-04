import { useQuery } from '@tanstack/react-query';
import { Route as RouteType, RiskZone } from '@/types';
import Header from '@/components/layout/Header';
import RouteItem from '@/components/routes/RouteItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Routes = () => {
  // State for user info
  const user = {
    name: 'John Doe',
    role: 'Security Admin'
  };

  // Fetch routes data
  const { data: routes = [], isLoading } = useQuery<RouteType[]>({
    queryKey: ['/api/routes'],
  });

  // Fetch risk zones data
  const { data: riskZones = [] } = useQuery<RiskZone[]>({
    queryKey: ['/api/risk-zones'],
  });

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <Header 
          title="Route Planning" 
          subtitle="Optimize routes for safety and efficiency" 
          icon={<MapPin className="h-6 w-6" />}
        />
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Recommended Routes</CardTitle>
                  <CardDescription>
                    AI-optimized routes based on real-time risk assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center p-6">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : routes.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No routes available</p>
                  ) : (
                    <div className="space-y-4">
                      {routes.map((route) => (
                        <RouteItem 
                          key={route.id} 
                          route={route} 
                          onSelect={() => {}}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800 mt-6">
                <CardHeader>
                  <CardTitle>Route Optimization</CardTitle>
                  <CardDescription>
                    Advanced route planning with real-time data integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Risk Avoidance</h3>
                        <p className="text-sm text-gray-400">
                          Routes automatically avoid high-risk areas identified through historical data 
                          and real-time threat intelligence.
                        </p>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Time Optimization</h3>
                        <p className="text-sm text-gray-400">
                          Routes are optimized for both safety and time efficiency, using traffic data
                          and machine learning to predict optimal travel times.
                        </p>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Real-time Adaptation</h3>
                        <p className="text-sm text-gray-400">
                          Routes dynamically adapt to emerging threats, traffic conditions, and other
                          environmental factors in real-time.
                        </p>
                      </div>
                      
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">SAPS Integration</h3>
                        <p className="text-sm text-gray-400">
                          Integration with South African Police Service data provides additional
                          security insights for route planning.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle>Risk Zones</CardTitle>
                  <CardDescription>
                    Areas identified as high-risk through AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {riskZones.length === 0 ? (
                    <p className="text-center text-gray-400 py-8">No risk zones available</p>
                  ) : (
                    <div className="space-y-4">
                      {riskZones.map((zone) => (
                        <div 
                          key={zone.id} 
                          className="bg-zinc-800 rounded-lg p-4 border-l-4 border-red-500"
                        >
                          <h3 className="font-medium">{zone.name}</h3>
                          <div className="mt-2 text-sm text-gray-400">
                            <div className="flex justify-between">
                              <span>Risk Level:</span>
                              <span className="text-red-500 font-medium">{zone.riskLevel}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Radius:</span>
                              <span>{zone.radius} km</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Last Incident:</span>
                              <span>{zone.description || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      View All Risk Zones
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-zinc-900 border-zinc-800 mt-6">
                <CardHeader>
                  <CardTitle>Analytics Insights</CardTitle>
                  <CardDescription>
                    Route performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Risk Avoidance Rate</span>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Route Efficiency</span>
                        <span className="text-sm font-medium">87%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                      </div>
                    </div>
                    
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Incident Prediction Accuracy</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <div className="w-full bg-zinc-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Routes;