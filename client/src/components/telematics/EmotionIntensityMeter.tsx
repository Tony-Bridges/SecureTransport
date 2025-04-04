import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Heart, 
  Frown, 
  SmilePlus, 
  AlertCircle,
  Volume2
} from 'lucide-react';

interface EmotionIntensityMeterProps {
  emotionType: 'stress' | 'panic' | 'anger' | 'fear' | 'happiness' | 'neutral';
  value: number; // 0-100
  title?: string;
  showLabel?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const EMOTION_CONFIG = {
  stress: {
    icon: <AlertTriangle className="w-4 h-4" />,
    colorLow: 'bg-blue-500',
    colorMid: 'bg-amber-500',
    colorHigh: 'bg-red-500',
    label: 'Stress Level',
    threshold: {
      low: 30,
      medium: 60,
      high: 80
    }
  },
  panic: {
    icon: <AlertCircle className="w-4 h-4" />,
    colorLow: 'bg-blue-500',
    colorMid: 'bg-amber-500',
    colorHigh: 'bg-red-500',
    label: 'Panic Level',
    threshold: {
      low: 20,
      medium: 50,
      high: 75
    }
  },
  anger: {
    icon: <Frown className="w-4 h-4" />,
    colorLow: 'bg-green-500',
    colorMid: 'bg-amber-500',
    colorHigh: 'bg-red-500',
    label: 'Anger Level',
    threshold: {
      low: 30,
      medium: 60,
      high: 80
    }
  },
  fear: {
    icon: <AlertTriangle className="w-4 h-4" />,
    colorLow: 'bg-blue-500',
    colorMid: 'bg-amber-500',
    colorHigh: 'bg-red-500',
    label: 'Fear Level',
    threshold: {
      low: 30,
      medium: 60,
      high: 80
    }
  },
  happiness: {
    icon: <SmilePlus className="w-4 h-4" />,
    colorLow: 'bg-blue-500',
    colorMid: 'bg-green-500',
    colorHigh: 'bg-green-500',
    label: 'Happiness Level',
    threshold: {
      low: 30,
      medium: 60,
      high: 80
    }
  },
  neutral: {
    icon: <Heart className="w-4 h-4" />,
    colorLow: 'bg-blue-500',
    colorMid: 'bg-blue-500',
    colorHigh: 'bg-blue-500',
    label: 'Neutral Level',
    threshold: {
      low: 30,
      medium: 60,
      high: 80
    }
  },
};

export default function EmotionIntensityMeter({
  emotionType,
  value,
  title,
  showLabel = true,
  showIcon = true,
  size = 'md',
  className = '',
}: EmotionIntensityMeterProps) {
  const config = EMOTION_CONFIG[emotionType];
  
  // Determine color based on value and thresholds
  let color = config.colorLow;
  if (value >= config.threshold.high) {
    color = config.colorHigh;
  } else if (value >= config.threshold.medium) {
    color = config.colorMid;
  }
  
  // Determine status text
  let statusText = 'Normal';
  if (value >= config.threshold.high) {
    statusText = 'High';
  } else if (value >= config.threshold.medium) {
    statusText = 'Elevated';
  } else if (value >= config.threshold.low) {
    statusText = 'Mild';
  }
  
  // Determine size-specific classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          title: 'text-xs font-medium',
          icon: 'w-3 h-3',
          badge: 'text-xs px-1.5 py-0',
          label: 'text-xs',
        };
      case 'lg':
        return {
          container: 'p-4',
          title: 'text-base font-medium',
          icon: 'w-5 h-5',
          badge: 'text-sm',
          label: 'text-sm',
        };
      default: // md
        return {
          container: 'p-3',
          title: 'text-sm font-medium',
          icon: 'w-4 h-4',
          badge: 'text-xs',
          label: 'text-xs',
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  return (
    <div className={`rounded-lg border border-zinc-800 ${sizeClasses.container} ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          {showIcon && (
            <div className={`p-1 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}>
              {config.icon}
            </div>
          )}
          <span className={sizeClasses.title}>{title || config.label}</span>
        </div>
        
        <Badge variant={value >= config.threshold.high ? 'destructive' : 
                       value >= config.threshold.medium ? 'outline' : 
                       'secondary'}
              className={sizeClasses.badge}>
          {statusText}
        </Badge>
      </div>
      
      <div className="relative">
        <Progress
          value={value}
          className={`h-2 ${color}`}
        />
        
        {(value > 70 && (emotionType === 'stress' || emotionType === 'panic' || emotionType === 'anger' || emotionType === 'fear')) && (
          <div className="absolute right-0 top-0 transform -translate-y-5">
            <Volume2 className="w-3 h-3 animate-pulse text-red-500" />
          </div>
        )}
      </div>
      
      {showLabel && (
        <div className="flex justify-between mt-1">
          <span className={`${sizeClasses.label} text-muted-foreground`}>Low</span>
          <span className={`${sizeClasses.label} font-medium`}>{Math.round(value)}%</span>
          <span className={`${sizeClasses.label} text-muted-foreground`}>High</span>
        </div>
      )}
    </div>
  );
}