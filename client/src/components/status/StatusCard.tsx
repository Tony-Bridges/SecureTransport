import { ArrowUpIcon, ArrowDownIcon, ClockIcon } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'time';
    color?: string;
  };
}

const StatusCard = ({ title, value, icon, iconBgColor, change }: StatusCardProps) => {
  return (
    <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 font-medium">{title}</h3>
        <div className={`${iconBgColor} bg-opacity-20 p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {change && (
        <div className={`mt-2 flex items-center text-sm ${change.color || 'text-gray-400'}`}>
          {change.type === 'increase' && <ArrowUpIcon size={16} className="mr-1" />}
          {change.type === 'decrease' && <ArrowDownIcon size={16} className="mr-1" />}
          {change.type === 'time' && <ClockIcon size={16} className="mr-1" />}
          <span>{change.value}</span>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
