import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, RefreshCw, Mail, Search, Shield, Users, UserPlus, User, UserCog, Settings, 
  BarChart, Cog, Camera, Map, Bell, Layers, Globe, Radio, Zap, Radar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// User roles with descriptions
const userRoles = [
  { id: 'admin', name: 'Administrator', description: 'Full system access and configuration' },
  { id: 'supervisor', name: 'Supervisor', description: 'Oversee operations and manage alerts' },
  { id: 'dispatcher', name: 'Dispatcher', description: 'Assign vehicles and manage routes' },
  { id: 'driver', name: 'Driver', description: 'Vehicle operation and basic reporting' },
  { id: 'guard', name: 'Security Guard', description: 'Cash handling and security protocols' },
  { id: 'analyst', name: 'Security Analyst', description: 'Threat assessment and pattern analysis' },
  { id: 'technician', name: 'Technical Support', description: 'Hardware maintenance and troubleshooting' },
  { id: 'auditor', name: 'Auditor', description: 'Compliance and security audit access' },
  { id: 'manager', name: 'Operations Manager', description: 'Performance monitoring and staff management' },
  { id: 'viewer', name: 'Basic User', description: 'View-only access to assigned vehicles' }
];

// Define available modules that can be assigned
const availableModules = [
  { id: 'facial_recognition', name: 'Facial Recognition', icon: <User className="h-4 w-4" />, description: 'Face detection and matching' },
  { id: 'license_plate', name: 'License Plate Recognition', icon: <Camera className="h-4 w-4" />, description: 'Vehicle identification' },
  { id: 'geospatial', name: 'Geospatial Tracking', icon: <Map className="h-4 w-4" />, description: 'Real-time location tracking' },
  { id: 'weapon_detection', name: 'Weapon Detection', icon: <AlertCircle className="h-4 w-4" />, description: 'Millimeter-wave scanning' },
  { id: 'behavioral_analysis', name: 'Behavioral Analysis', icon: <BarChart className="h-4 w-4" />, description: 'ML-based pattern recognition' },
  { id: 'threat_mapping', name: 'Threat Mapping', icon: <Globe className="h-4 w-4" />, description: 'Risk zone visualization' },
  { id: 'voice_analysis', name: 'Voice Analysis', icon: <Radio className="h-4 w-4" />, description: 'Panic detection in audio' },
  { id: 'emotion_detection', name: 'Emotion Detection', icon: <Zap className="h-4 w-4" />, description: 'Cabin anomaly monitoring' },
  { id: 'escalation', name: 'Incident Escalation', icon: <Bell className="h-4 w-4" />, description: 'Response coordination' },
  { id: 'external_integrations', name: 'External Integrations', icon: <Layers className="h-4 w-4" />, description: 'Third-party connections' },
  { id: 'satellite_imagery', name: 'Satellite Imagery', icon: <Radar className="h-4 w-4" />, description: 'Aerial surveillance' },
  { id: 'system_settings', name: 'System Settings', icon: <Settings className="h-4 w-4" />, description: 'Platform configuration' }
];

// Define user type
interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt: string;
  modules?: string[]; // Assigned module IDs
}

// Define invitation schema
const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  role: z.string().min(1, "Role is required"),
  message: z.string().optional()
});

export default function UserManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State for module assignment
  const [selectedUserForModules, setSelectedUserForModules] = useState<User | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  
  // Handle module assignment
  const { mutate: updateUserModules, isPending: isUpdatingModules } = useMutation({
    mutationFn: async ({ userId, modules }: { userId: number, modules: string[] }) => {
      return apiRequest('PATCH', `/api/auth/users/${userId}/modules`, { modules });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
      toast({
        title: "Modules updated",
        description: "User access to modules has been successfully updated.",
      });
      setShowModuleDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user modules. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating user modules:", error);
    }
  });

  // Open module assignment dialog
  const openModuleDialog = (user: User) => {
    setSelectedUserForModules(user);
    setSelectedModules(user.modules || []);
    setShowModuleDialog(true);
  };

  // Handle module toggle
  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Save module assignments
  const saveModuleAssignments = () => {
    if (selectedUserForModules) {
      updateUserModules({
        userId: selectedUserForModules.id,
        modules: selectedModules
      });
    }
  };

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

  // Fetch users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/auth/users'],
  });

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Invite form
  const inviteForm = useForm<z.infer<typeof inviteUserSchema>>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: '',
      role: '',
      message: '',
    },
  });

  // Send invitation
  const { mutate: inviteUser, isPending: isInviting } = useMutation({
    mutationFn: async (data: z.infer<typeof inviteUserSchema>) => {
      return apiRequest('POST', '/api/auth/invite', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
      toast({
        title: "Invitation sent",
        description: "User has been invited to join the platform.",
      });
      inviteForm.reset();
      setShowInviteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      console.error("Error inviting user:", error);
    }
  });

  // Invite user function
  const onInviteUser = (data: z.infer<typeof inviteUserSchema>) => {
    inviteUser(data);
  };

  // User status change
  const { mutate: updateUserStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: async ({ userId, status }: { userId: number, status: string }) => {
      return apiRequest('PATCH', `/api/auth/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/users'] });
      toast({
        title: "User status updated",
        description: "The user's status has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating user status:", error);
    }
  });

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Get badge for user status
  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
      case 'inactive':
        return <Badge variant="secondary">{status}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get role display name
  const getRoleDisplayName = (roleId: string) => {
    const role = userRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  // Get role icon
  const getRoleIcon = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'supervisor':
        return <UserCog className="h-4 w-4" />;
      case 'dispatcher':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <p className="text-muted-foreground">
        Manage users, roles and send invitations
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">User List</TabsTrigger>
          <TabsTrigger value="modules">Module Assignment</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>System Users</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setShowInviteDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="animate-spin h-6 w-6" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {searchQuery ? 'No users found matching your search.' : 'No users have been added yet.'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name} (@{user.username})</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(user.role)}
                            <span>{getRoleDisplayName(user.role)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                        <TableCell>{formatDate(user.lastLogin)}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Select 
                            value={user.status} 
                            onValueChange={(value) => updateUserStatus({ userId: user.id, status: value })}
                            disabled={isUpdatingStatus}
                          >
                            <SelectTrigger className="w-[110px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activate</SelectItem>
                              <SelectItem value="inactive">Deactivate</SelectItem>
                              <SelectItem value="pending">Set Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Module Assignment Tab */}
        <TabsContent value="modules">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Module Assignment</CardTitle>
                <CardDescription>Configure user access to system features</CardDescription>
              </div>
              <div className="flex space-x-2">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingUsers ? (
                <div className="flex justify-center py-6">
                  <RefreshCw className="animate-spin h-6 w-6" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {searchQuery ? 'No users found matching your search.' : 'No users have been added yet.'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned Modules</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name} (@{user.username})</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(user.role)}
                            <span>{getRoleDisplayName(user.role)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.modules && user.modules.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {user.modules.slice(0, 3).map((moduleId) => {
                                const module = availableModules.find(m => m.id === moduleId);
                                return module ? (
                                  <Badge key={moduleId} variant="outline" className="whitespace-nowrap">
                                    {module.name}
                                  </Badge>
                                ) : null;
                              })}
                              {user.modules.length > 3 && (
                                <Badge variant="outline">+{user.modules.length - 3} more</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">No modules assigned</span>
                          )}
                        </TableCell>
                        <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openModuleDialog(user)}
                            disabled={user.status !== 'active'}
                          >
                            <Cog className="mr-2 h-4 w-4" />
                            Configure Access
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mt-4">
                <h3 className="text-lg font-medium mb-2">About Module Assignment</h3>
                <p className="text-muted-foreground mb-3">
                  Administrators can control which specific security modules and features each user can access. 
                  This allows for fine-grained permission management beyond the basic role assignment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableModules.slice(0, 6).map(module => (
                    <div key={module.id} className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-md">
                        {module.icon}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{module.name}</div>
                        <div className="text-xs text-muted-foreground">{module.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Invitations Tab */}
        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>User Invitations</CardTitle>
              <CardDescription>Invite new users to the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => setShowInviteDialog(true)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send New Invitation
                </Button>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">About User Roles</h3>
                <p className="text-muted-foreground">
                  Assign the appropriate role to each user to control their permissions and access levels within the system.
                </p>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Access Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {getRoleIcon(role.id)}
                            <span>{role.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{role.description}</TableCell>
                        <TableCell>
                          {role.id === 'admin' && <Badge className="bg-red-500">Highest</Badge>}
                          {role.id === 'supervisor' && <Badge className="bg-orange-500">High</Badge>}
                          {(role.id === 'dispatcher' || role.id === 'analyst' || role.id === 'manager') && <Badge className="bg-yellow-500">Medium</Badge>}
                          {(role.id === 'driver' || role.id === 'guard' || role.id === 'technician' || role.id === 'auditor') && <Badge className="bg-blue-500">Standard</Badge>}
                          {role.id === 'viewer' && <Badge className="bg-gray-500">Basic</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Module Assignment Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Module Access</DialogTitle>
            <DialogDescription>
              {selectedUserForModules && (
                <span>
                  Manage module access for <span className="font-medium">{selectedUserForModules.name}</span> ({getRoleDisplayName(selectedUserForModules.role)})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Available Modules</h3>
              <div className="text-sm text-muted-foreground">
                {selectedModules.length} of {availableModules.length} modules selected
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableModules.map(module => (
                <div 
                  key={module.id} 
                  className={`flex items-start space-x-3 border rounded-md p-3 ${
                    selectedModules.includes(module.id) 
                      ? 'bg-primary/5 border-primary/20'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className={`p-2 rounded-md ${selectedModules.includes(module.id) ? 'bg-primary/20' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                    {module.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{module.name}</div>
                      <Checkbox 
                        checked={selectedModules.includes(module.id)} 
                        onCheckedChange={() => toggleModule(module.id)}
                        id={`module-${module.id}`}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{module.description}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md mt-4">
              <p className="text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 inline-block mr-1" />
                Adjusting module access will affect what features this user can see and use within the platform. 
                Modifications take effect immediately upon saving.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={saveModuleAssignments} 
              disabled={isUpdatingModules}
            >
              {isUpdatingModules && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Save Module Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an email invitation to a new user to join the platform.
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onInviteUser)} className="space-y-4">
              <FormField
                control={inviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      The invitation will be sent to this email address
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userRoles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center">
                              <span>{role.name}</span>
                              <span className="ml-2 text-muted-foreground text-xs">({role.description})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the appropriate role for this user
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={inviteForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a personal message to include in the invitation email..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isInviting}>
                  {isInviting && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Send Invitation
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}