import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Bell, PhoneCall, Shield, Share2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert } from '@shared/schema';

interface IncidentEscalationProps {
  alert: Alert;
  onEscalate: (escalationData: EscalationData) => void;
}

export interface EscalationData {
  alertId: number;
  alertType: string;
  escalationLevel: 'low' | 'medium' | 'high' | 'critical';
  notifyChannels: string[];
  message: string;
  requestBackup: boolean;
}

const IncidentEscalation = ({ alert, onEscalate }: IncidentEscalationProps) => {
  const [open, setOpen] = useState(false);
  const [escalationLevel, setEscalationLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [notifyChannels, setNotifyChannels] = useState<string[]>(['management']);
  const [message, setMessage] = useState('');
  const [requestBackup, setRequestBackup] = useState(false);
  const { toast } = useToast();

  const handleChannelToggle = (channel: string) => {
    if (notifyChannels.includes(channel)) {
      setNotifyChannels(notifyChannels.filter(c => c !== channel));
    } else {
      setNotifyChannels([...notifyChannels, channel]);
    }
  };

  const handleEscalate = () => {
    const escalationData: EscalationData = {
      alertId: alert.id,
      alertType: alert.type,
      escalationLevel,
      notifyChannels,
      message: message.trim() || `Escalating ${alert.type} alert (#${alert.id})`,
      requestBackup
    };

    onEscalate(escalationData);
    
    toast({
      title: 'Incident Escalated',
      description: `Alert #${alert.id} has been escalated with ${escalationLevel} priority.`,
      variant: 'default',
    });
    
    setOpen(false);
  };

  const getSeverityColor = () => {
    switch (escalationLevel) {
      case 'low': return 'bg-blue-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'critical': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="space-x-2 bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
        >
          <Share2 className="h-4 w-4" />
          <span>Escalate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Escalate Incident
          </DialogTitle>
          <DialogDescription>
            Immediately notify relevant personnel about this security incident.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="bg-zinc-900 rounded p-3 text-sm">
            <div><span className="font-medium">Alert ID:</span> {alert.id}</div>
            <div><span className="font-medium">Type:</span> {alert.type}</div>
            <div><span className="font-medium">Vehicle:</span> {alert.vehicleId}</div>
            <div><span className="font-medium">Message:</span> {alert.message}</div>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Escalation Priority</Label>
            <RadioGroup 
              value={escalationLevel} 
              onValueChange={(value) => setEscalationLevel(value as 'low' | 'medium' | 'high' | 'critical')}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  Low Priority
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                  Medium Priority
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                  High Priority
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" id="critical" />
                <Label htmlFor="critical" className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                  Critical - Emergency Response
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2 block">Notify</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="management" 
                  checked={notifyChannels.includes('management')}
                  onCheckedChange={() => handleChannelToggle('management')}
                />
                <Label htmlFor="management" className="text-sm">Management</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="security" 
                  checked={notifyChannels.includes('security')}
                  onCheckedChange={() => handleChannelToggle('security')}
                />
                <Label htmlFor="security" className="text-sm">Security Team</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="police" 
                  checked={notifyChannels.includes('police')}
                  onCheckedChange={() => handleChannelToggle('police')}
                />
                <Label htmlFor="police" className="text-sm">Police</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="drivers" 
                  checked={notifyChannels.includes('drivers')}
                  onCheckedChange={() => handleChannelToggle('drivers')}
                />
                <Label htmlFor="drivers" className="text-sm">Other Drivers</Label>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="message" className="text-sm font-medium mb-2 block">Additional Information</Label>
            <Textarea 
              id="message" 
              placeholder="Provide any additional details about the incident..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-24"
            />
          </div>
          
          <div className="flex items-center space-x-2 border-t border-gray-700 pt-4">
            <Checkbox 
              id="backup" 
              checked={requestBackup}
              onCheckedChange={(checked) => setRequestBackup(checked as boolean)}
            />
            <Label htmlFor="backup" className="font-medium text-red-400">Request Immediate Backup</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEscalate} 
            className={getSeverityColor()}
          >
            Escalate Incident
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IncidentEscalation;