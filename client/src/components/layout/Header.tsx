import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { HelpButton } from '@/components/ui/help-button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  icon, 
  actions 
}) => {
  return (
    <div className="border-b border-zinc-800 bg-zinc-900 px-8 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {icon && (
            <div className="p-2 rounded-lg bg-blue-600 bg-opacity-20">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-zinc-400 mt-1">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <HelpButton />
          {actions && actions}
        </div>
      </div>
    </div>
  );
};

export default Header;