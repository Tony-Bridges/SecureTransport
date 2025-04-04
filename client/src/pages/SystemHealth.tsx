import React from 'react';
import Header from '@/components/layout/Header';
import SystemHealthDashboard from '@/components/status/SystemHealthDashboard';
import { Activity } from 'lucide-react';

const SystemHealth = () => {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <Header
        title="System Health"
        subtitle="Monitor and manage system components and connected devices"
        icon={<Activity className="text-white" size={28} />}
      />
      
      <SystemHealthDashboard />
    </div>
  );
};

export default SystemHealth;