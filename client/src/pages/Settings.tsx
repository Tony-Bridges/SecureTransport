import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Check, Loader2, Moon, Palette, RefreshCw, RotateCw, Save, Sun, User, Eye, EyeOff, Bell, BellOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define theme type
interface ThemeSettings {
  primary: string;
  variant: 'professional' | 'tint' | 'vibrant';
  appearance: 'light' | 'dark' | 'system';
  radius: number;
}

// Define notification settings type
interface NotificationSettings {
  emailAlerts: boolean;
  smsAlerts: boolean;
  pushAlerts: boolean;
  soundEnabled: boolean;
  criticalAlertsOnly: boolean;
}

// Define profile schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  oldPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // If any password field is filled, all must be filled
  const { oldPassword, newPassword, confirmPassword } = data;
  if (oldPassword || newPassword || confirmPassword) {
    return oldPassword && newPassword && confirmPassword;
  }
  return true;
}, {
  message: "All password fields must be filled to change password",
  path: ["oldPassword"],
}).refine(data => {
  // New password and confirm password must match
  const { newPassword, confirmPassword } = data;
  if (newPassword && confirmPassword) {
    return newPassword === confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState<ThemeSettings>({
    primary: '#3B82F6',
    variant: 'professional',
    appearance: 'system',
    radius: 0.5,
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    soundEnabled: true,
    criticalAlertsOnly: false,
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Theme update mutation
  const { mutate: updateTheme, isPending: isUpdatingTheme } = useMutation({
    mutationFn: async (themeData: ThemeSettings) => {
      // Apply theme immediately without waiting for server
      applyTheme(themeData);
      
      // Simulate a successful response since we're not using a real backend
      return new Promise(resolve => {
        setTimeout(() => resolve({ success: true }), 500);
      });
      // In a real app with backend: 
      // return apiRequest('PATCH', '/api/settings/theme', themeData);
    },
    onSuccess: () => {
      toast({
        title: "Theme updated",
        description: "Your theme settings have been saved and applied.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update theme settings.",
        variant: "destructive",
      });
      console.error("Error updating theme:", error);
    }
  });

  // Notification settings mutation
  const { mutate: updateNotifications, isPending: isUpdatingNotifications } = useMutation({
    mutationFn: async (notificationData: NotificationSettings) => {
      return apiRequest('PATCH', '/api/settings/notifications', notificationData);
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      });
      console.error("Error updating notifications:", error);
    }
  });

  // Profile form
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Profile update mutation
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      return apiRequest('PATCH', '/api/auth/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      // Clear password fields
      form.setValue('oldPassword', '');
      form.setValue('newPassword', '');
      form.setValue('confirmPassword', '');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    }
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.setValue('name', user.name || '');
      form.setValue('email', user.email || '');
      form.setValue('phone', user.phone || '');
    }
  }, [user, form]);

  // Load theme from localStorage or server
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const themeJson = localStorage.getItem('theme');
        if (themeJson) {
          const savedTheme = JSON.parse(themeJson);
          setTheme(savedTheme);
          applyTheme(savedTheme);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    
    loadTheme();
  }, []);

  // Apply theme to DOM
  const applyTheme = (themeSettings: ThemeSettings) => {
    // Save to localStorage
    localStorage.setItem('theme', JSON.stringify(themeSettings));
    
    // Update theme.json (in a real app, this would be server-side)
    const themeConfig = {
      primary: themeSettings.primary,
      variant: themeSettings.variant,
      appearance: themeSettings.appearance,
      radius: themeSettings.radius,
    };
    
    // Apply dark/light mode
    const root = document.documentElement;
    if (themeSettings.appearance === 'dark' || 
        (themeSettings.appearance === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply border radius
    document.documentElement.style.setProperty('--radius', `${themeSettings.radius}rem`);
    
    // Apply primary color
    document.documentElement.style.setProperty('--primary', themeSettings.primary);
    document.documentElement.style.setProperty('--primary-foreground', '#ffffff');
    
    // Apply variant
    root.setAttribute('data-variant', themeSettings.variant);
    
    // Log for debugging
    console.log("Theme applied:", themeConfig);
  };

  // Handle profile form submission
  const onSubmitProfile = (data: z.infer<typeof profileSchema>) => {
    updateProfile(data);
  };

  // Reset theme to default
  const resetTheme = () => {
    const defaultTheme: ThemeSettings = {
      primary: '#3B82F6',
      variant: 'professional',
      appearance: 'system',
      radius: 0.5,
    };
    setTheme(defaultTheme);
    applyTheme(defaultTheme);
    toast({
      title: "Theme reset",
      description: "Theme has been reset to default settings.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormDescription>
                            Used for SMS alerts and account recovery
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="oldPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showOldPassword ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                              >
                                {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  type={showNewPassword ? "text" : "password"} 
                                  placeholder="••••••••" 
                                  {...field}
                                />
                              </FormControl>
                              <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type={showNewPassword ? "text" : "password"} 
                                placeholder="••••••••" 
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isUpdatingProfile} className="w-full">
                    {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Profile Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Color */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="theme-color">Primary Color</Label>
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full border mr-2" 
                      style={{ backgroundColor: theme.primary }}
                    />
                    <span className="text-sm text-muted-foreground">{theme.primary}</span>
                  </div>
                </div>
                <Input
                  id="theme-color"
                  type="color"
                  value={theme.primary}
                  onChange={(e) => setTheme({ ...theme, primary: e.target.value })}
                  className="h-10 w-full"
                />
              </div>
              
              {/* Theme Variant */}
              <div className="space-y-3">
                <Label>Theme Variant</Label>
                <RadioGroup 
                  value={theme.variant}
                  onValueChange={(value: string) => {
                    // Ensure value is one of the allowed variants
                    const variant = (['professional', 'tint', 'vibrant'].includes(value) 
                      ? value as 'professional' | 'tint' | 'vibrant' 
                      : 'professional');
                    setTheme({ ...theme, variant });
                  }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem 
                      value="professional" 
                      id="professional" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="professional"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Palette className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Professional</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="tint" 
                      id="tint" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="tint"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Palette className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Tint</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="vibrant" 
                      id="vibrant" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="vibrant"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Palette className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Vibrant</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Appearance Mode */}
              <div className="space-y-3">
                <Label>Appearance Mode</Label>
                <RadioGroup 
                  value={theme.appearance}
                  onValueChange={(value: string) => {
                    // Ensure value is one of the allowed appearances
                    const appearance = (['light', 'dark', 'system'].includes(value) 
                      ? value as 'light' | 'dark' | 'system' 
                      : 'system');
                    setTheme({ ...theme, appearance });
                  }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div>
                    <RadioGroupItem 
                      value="light" 
                      id="light" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Light</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="dark" 
                      id="dark" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Moon className="mb-3 h-6 w-6" />
                      <span className="text-sm font-medium">Dark</span>
                    </Label>
                  </div>
                  
                  <div>
                    <RadioGroupItem 
                      value="system" 
                      id="system" 
                      className="peer sr-only" 
                    />
                    <Label
                      htmlFor="system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <Sun className="mb-3 h-6 w-6" />
                      <Moon className="mb-3 h-6 w-6 -mt-6 ml-4" />
                      <span className="text-sm font-medium">System</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              {/* Border Radius */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="border-radius">Border Radius</Label>
                  <span className="text-sm text-muted-foreground">{theme.radius}rem</span>
                </div>
                <Slider
                  id="border-radius"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[theme.radius]}
                  onValueChange={(value) => setTheme({ ...theme, radius: value[0] })}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Square</span>
                  <span>Rounded</span>
                  <span>Circular</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetTheme}>
                <RotateCw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
              <Button onClick={() => updateTheme(theme)} disabled={isUpdatingTheme}>
                {isUpdatingTheme ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Theme
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Control how and when you receive alerts and notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-alerts">Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive security alerts via email
                    </p>
                  </div>
                  <Switch
                    id="email-alerts"
                    checked={notifications.emailAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, emailAlerts: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-alerts">SMS Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive urgent security alerts via SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-alerts"
                    checked={notifications.smsAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, smsAlerts: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-alerts">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts as push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    id="push-alerts"
                    checked={notifications.pushAlerts}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, pushAlerts: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sound-enabled">Sound Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Play sound when new alerts are received
                    </p>
                  </div>
                  <Switch
                    id="sound-enabled"
                    checked={notifications.soundEnabled}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, soundEnabled: checked })}
                  />
                </div>
                
                <div className="pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="critical-only">Critical Alerts Only</Label>
                      <p className="text-sm text-muted-foreground">
                        Only notify for high-priority security alerts
                      </p>
                    </div>
                    <Switch
                      id="critical-only"
                      checked={notifications.criticalAlertsOnly}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, criticalAlertsOnly: checked })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => updateNotifications(notifications)}
                disabled={isUpdatingNotifications}
              >
                {isUpdatingNotifications ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bell className="mr-2 h-4 w-4" />
                )}
                Save Notification Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}