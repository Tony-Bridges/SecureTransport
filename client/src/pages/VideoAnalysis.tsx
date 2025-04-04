import React from 'react';
import { VideoIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import VideoSimulation from '@/components/detection/VideoSimulation';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VideoAnalysis = () => {
  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      <Header
        title="Video Analysis & Simulation"
        subtitle="Upload and analyze video footage to simulate system response to incidents"
        icon={<VideoIcon className="text-white" size={28} />}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-zinc-800 bg-zinc-900 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">What is Video Simulation?</CardTitle>
            <CardDescription>
              Understand how incident videos are processed by the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-400">
              The video simulation feature allows you to upload video footage from security incidents and analyze how the 
              SecureTransport system would have interacted with and responded to the events captured in the video. 
              This is useful for:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-400 pl-5 list-disc">
              <li>Training security personnel on system capabilities</li>
              <li>Testing system detection against real-world scenarios</li>
              <li>Reconstructing incidents for analysis and improvement</li>
              <li>Demonstrating security features to new users</li>
              <li>Validating that security protocols are functioning as expected</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Supported Features</CardTitle>
            <CardDescription>
              What the simulation can detect and analyze
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-900 bg-opacity-50 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="flex-1">
                  <span className="font-medium text-white">Facial Recognition</span>
                  <span className="block text-zinc-400">Identifies and tracks faces across multiple videos</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-900 bg-opacity-50 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="flex-1">
                  <span className="font-medium text-white">Weapon Detection</span>
                  <span className="block text-zinc-400">Identifies potential threats and weapons</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-900 bg-opacity-50 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="flex-1">
                  <span className="font-medium text-white">License Plate Recognition</span>
                  <span className="block text-zinc-400">Reads and tracks vehicle license plates</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-900 bg-opacity-50 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="flex-1">
                  <span className="font-medium text-white">Behavioral Analysis</span>
                  <span className="block text-zinc-400">Identifies suspicious behaviors and patterns</span>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="mt-0.5 h-4 w-4 rounded-full bg-blue-900 bg-opacity-50 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                </div>
                <span className="flex-1">
                  <span className="font-medium text-white">Timeline Generation</span>
                  <span className="block text-zinc-400">Creates chronological event sequence</span>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Separator />
      
      <VideoSimulation />
    </div>
  );
};

export default VideoAnalysis;