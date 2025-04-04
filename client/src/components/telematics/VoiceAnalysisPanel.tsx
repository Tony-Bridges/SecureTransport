import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, Volume2, Volume1, VolumeX, AlertTriangle } from 'lucide-react';
import EmotionIntensityMeter from './EmotionIntensityMeter';

interface VoiceAnalysis {
  id: string;
  vehicleId: string;
  timestamp: string;
  detectedEmotion: 'neutral' | 'stressed' | 'panic' | 'calm' | 'angry';
  stressLevel: number;
  panicProbability: number;
  keywordsDetected: string[];
  speechToText?: string;
}

interface VoiceAnalysisPanelProps {
  voiceData: VoiceAnalysis | null;
  vehicleId: string;
  isRecording?: boolean;
  className?: string;
}

export default function VoiceAnalysisPanel({
  voiceData,
  vehicleId,
  isRecording = false,
  className = '',
}: VoiceAnalysisPanelProps) {
  // Map emotion types from API to our component props
  const mapEmotionType = (emotion: string | undefined): 'stress' | 'panic' | 'anger' | 'fear' | 'happiness' | 'neutral' => {
    if (!emotion) return 'neutral';
    
    switch (emotion) {
      case 'stressed': return 'stress';
      case 'panic': return 'panic';
      case 'angry': return 'anger';
      case 'fearful': return 'fear';
      case 'happy': return 'happiness';
      case 'calm': 
      case 'neutral':
      default:
        return 'neutral';
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Determine alert level for display
  const getAlertLevel = () => {
    if (!voiceData) return 'normal';
    
    if (voiceData.panicProbability > 80) return 'critical';
    if (voiceData.panicProbability > 60 || voiceData.stressLevel > 75) return 'warning';
    return 'normal';
  };
  
  const alertLevel = getAlertLevel();
  
  return (
    <Card className={`${className} bg-zinc-900 border-zinc-800`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            <Mic className="mr-2 h-5 w-5" />
            Cabin Voice Analysis
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isRecording && (
              <Badge variant="outline" className="bg-red-950 text-red-400 flex items-center">
                <span className="mr-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Recording
              </Badge>
            )}
            <Badge 
              variant={
                alertLevel === 'critical' ? 'destructive' : 
                alertLevel === 'warning' ? 'outline' : 'secondary'
              }
            >
              {alertLevel === 'critical' ? 'ALERT' : 
               alertLevel === 'warning' ? 'Caution' : 'Normal'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="meters">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="meters">Analysis</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>
          
          <TabsContent value="meters" className="space-y-4">
            {!voiceData ? (
              <div className="text-center py-6 text-gray-400">
                <VolumeX className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No voice data available for {vehicleId}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center mb-2 text-xs text-zinc-400">
                  <Volume2 className="mr-1 h-4 w-4" /> 
                  Last updated: {formatTime(voiceData.timestamp)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EmotionIntensityMeter 
                    emotionType="stress"
                    value={voiceData.stressLevel}
                    showLabel
                  />
                  
                  <EmotionIntensityMeter 
                    emotionType="panic"
                    value={voiceData.panicProbability}
                    showLabel
                  />
                </div>
                
                <div className="mt-4">
                  <EmotionIntensityMeter 
                    emotionType={mapEmotionType(voiceData.detectedEmotion)}
                    value={voiceData.detectedEmotion === 'panic' ? 90 : 
                           voiceData.detectedEmotion === 'stressed' ? 75 :
                           voiceData.detectedEmotion === 'angry' ? 80 : 
                           voiceData.detectedEmotion === 'calm' ? 20 : 50}
                    title="Emotional State"
                    showLabel
                  />
                </div>
                
                {voiceData.keywordsDetected.length > 0 && (
                  <div className="mt-4 border-t border-zinc-800 pt-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                      <span className="text-sm font-medium">Detected Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {voiceData.keywordsDetected.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="capitalize bg-amber-950 text-amber-400">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="transcript">
            {!voiceData || !voiceData.speechToText ? (
              <div className="text-center py-6 text-gray-400">
                <Volume1 className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No transcript available</p>
              </div>
            ) : (
              <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm">
                <div className="flex items-center mb-2 text-xs text-zinc-400">
                  <Mic className="mr-1 h-3 w-3" /> 
                  Transcription from {formatTime(voiceData.timestamp)}
                </div>
                <p className="whitespace-pre-wrap">{voiceData.speechToText}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}