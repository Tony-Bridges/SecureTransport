/**
 * Voice Analysis Service
 * Analyzes cabin audio for signs of distress, panic or keywords indicating a threat
 */

interface VoiceAnalysisResult {
  voiceId: string;
  vehicleId: string;
  timestamp: string;
  detectedEmotion: 'neutral' | 'stressed' | 'panic' | 'calm' | 'angry';
  stressLevel: number; // 0-100 scale
  panicProbability: number; // 0-100 scale
  audioHash: string; // For evidence chain
  speechToText?: string; // Transcription if available
  keywordsDetected: string[]; // Keywords that triggered alerts
}

interface VoiceAlertThresholds {
  panicThreshold: number; // 0-100
  stressThreshold: number; // 0-100
  consecutiveSamplesRequired: number;
}

class VoiceAnalysisService {
  private alertThresholds: VoiceAlertThresholds = {
    panicThreshold: 75,
    stressThreshold: 60,
    consecutiveSamplesRequired: 2
  };
  
  private recentAnalyses: Map<string, VoiceAnalysisResult[]> = new Map(); // vehicleId -> analyses
  private triggerKeywords = [
    'help', 'emergency', 'weapon', 'gun', 'knife', 'bomb', 'threat',
    'robbery', 'attack', 'hostage', 'panic', 'danger', 'security', 'alarm',
    'sos', 'hijack', 'abort', 'mayday', 'code red'
  ];
  
  /**
   * Analyze a voice sample for signs of distress, panic, or security threats
   */
  async analyzeVoiceSample(audioData: string, vehicleId: string): Promise<VoiceAnalysisResult> {
    // In a real implementation, this would use an ML model or API for analysis
    // For demo purposes, we'll simulate the analysis
    
    // Create a deterministic random based on the audio data for consistent simulation
    const randomFactor = this.deterministicRandom(audioData + vehicleId);
    
    // Transcribe the audio (simulated)
    const speechToText = this.simulateTranscription(randomFactor);
    
    // Detect keywords in the transcription
    const keywordsDetected = this.detectKeywords(speechToText);
    
    // Analyze voice patterns for emotional state
    const detectedEmotion = this.analyzeEmotionalState(randomFactor);
    
    // Calculate stress level based on voice patterns
    const stressLevel = this.calculateStressLevel(detectedEmotion, randomFactor);
    
    // Calculate panic probability
    const panicProbability = this.calculatePanicProbability(detectedEmotion, stressLevel, keywordsDetected, randomFactor);
    
    // Generate a hash for the audio chain of evidence
    const audioHash = this.generateHashFromAudio(audioData);
    
    // Create unique voice ID for tracking
    const voiceId = this.generateUniqueId(vehicleId);
    
    // Create result object
    const result: VoiceAnalysisResult = {
      voiceId,
      vehicleId,
      timestamp: new Date().toISOString(),
      detectedEmotion,
      stressLevel,
      panicProbability,
      audioHash,
      speechToText,
      keywordsDetected
    };
    
    // Store the analysis in recent history
    this.addAnalysisToHistory(vehicleId, result);
    
    // Check alert conditions
    const shouldAlert = this.checkForAlertConditions(vehicleId);
    if (shouldAlert) {
      console.log(`Voice alert triggered for vehicle ${vehicleId}: Stress level ${stressLevel}, Panic probability ${panicProbability}`);
    }
    
    return result;
  }
  
  /**
   * Update alert thresholds based on operational needs
   */
  updateAlertThresholds(newThresholds: Partial<VoiceAlertThresholds>): void {
    this.alertThresholds = {
      ...this.alertThresholds,
      ...newThresholds
    };
    
    console.log(`Voice analysis thresholds updated: 
      Panic: ${this.alertThresholds.panicThreshold}, 
      Stress: ${this.alertThresholds.stressThreshold}, 
      Consecutive samples: ${this.alertThresholds.consecutiveSamplesRequired}`
    );
  }
  
  /**
   * Store an analysis in the recent history for the vehicle
   */
  private addAnalysisToHistory(vehicleId: string, analysis: VoiceAnalysisResult): void {
    // Get existing analyses or create a new array
    const vehicleAnalyses = this.recentAnalyses.get(vehicleId) || [];
    
    // Add new analysis
    vehicleAnalyses.push(analysis);
    
    // Keep only the most recent 10 analyses
    if (vehicleAnalyses.length > 10) {
      vehicleAnalyses.shift(); // Remove oldest
    }
    
    // Update the map
    this.recentAnalyses.set(vehicleId, vehicleAnalyses);
  }
  
  /**
   * Check if recent analyses should trigger an alert
   */
  private checkForAlertConditions(vehicleId: string): boolean {
    const analyses = this.recentAnalyses.get(vehicleId) || [];
    
    // Not enough samples yet
    if (analyses.length < this.alertThresholds.consecutiveSamplesRequired) {
      return false;
    }
    
    // Get the most recent N analyses based on consecutive samples requirement
    const recentAnalyses = analyses.slice(-this.alertThresholds.consecutiveSamplesRequired);
    
    // Check for panic conditions
    const panicDetected = recentAnalyses.every(
      analysis => analysis.panicProbability >= this.alertThresholds.panicThreshold
    );
    
    // Check for stress conditions
    const stressDetected = recentAnalyses.every(
      analysis => analysis.stressLevel >= this.alertThresholds.stressThreshold
    );
    
    return panicDetected || stressDetected;
  }
  
  /**
   * Detect keywords in transcribed text that might indicate a security threat
   */
  private detectKeywords(text: string): string[] {
    if (!text) return [];
    
    // Normalize the text for case-insensitive matching
    const normalizedText = text.toLowerCase();
    
    // Find all matching keywords
    return this.triggerKeywords.filter(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );
  }
  
  /**
   * Simulate transcription of audio to text
   */
  private simulateTranscription(randomFactor: number): string {
    // Common phrases that might be said in transportation vehicles
    const commonPhrases = [
      // Neutral phrases
      "Everything is going according to schedule.",
      "We'll be at the next checkpoint in 20 minutes.",
      "The traffic is clear on this route.",
      "Vehicle systems all functioning normally.",
      "We're maintaining regular speed and position.",
      
      // Slightly concerning phrases
      "There's a vehicle that has been following us for a while.",
      "I'm noticing some unusual activity up ahead.",
      "The GPS signal seems to be fluctuating.",
      "We might need to consider an alternate route.",
      "The security system is showing some minor alerts.",
      
      // Stress indicators
      "I'm feeling uncomfortable about that car behind us.",
      "Something doesn't feel right about this situation.",
      "I think we should report this to headquarters.",
      "We might have a security concern developing.",
      "I'm going to increase our security protocols.",
      
      // High stress / panic phrases
      "We have a security breach! Need immediate assistance!",
      "Code red! We're under threat! Send backup!",
      "Weapon spotted! Taking evasive measures!",
      "Security compromised! Mayday! Mayday!",
      "We're being followed by multiple vehicles! This is an emergency!"
    ];
    
    // Select a phrase based on random factor
    // Higher random values select more concerning phrases
    const index = Math.min(
      Math.floor(randomFactor * commonPhrases.length),
      commonPhrases.length - 1
    );
    
    return commonPhrases[index];
  }
  
  /**
   * Analyze voice for emotional state
   */
  private analyzeEmotionalState(randomFactor: number): 'neutral' | 'stressed' | 'panic' | 'calm' | 'angry' {
    if (randomFactor < 0.3) {
      return 'calm';
    } else if (randomFactor < 0.6) {
      return 'neutral';
    } else if (randomFactor < 0.8) {
      return 'stressed';
    } else if (randomFactor < 0.9) {
      return 'angry';
    } else {
      return 'panic';
    }
  }
  
  /**
   * Calculate stress level based on voice patterns
   */
  private calculateStressLevel(emotion: string, randomFactor: number): number {
    let baseStress = 0;
    
    switch (emotion) {
      case 'calm':
        baseStress = 10;
        break;
      case 'neutral':
        baseStress = 30;
        break;
      case 'stressed':
        baseStress = 65;
        break;
      case 'angry':
        baseStress = 75;
        break;
      case 'panic':
        baseStress = 90;
        break;
      default:
        baseStress = 30;
    }
    
    // Add some variation
    const variation = (randomFactor * 20) - 10; // -10 to +10
    
    // Ensure within 0-100 range
    return Math.max(0, Math.min(100, baseStress + variation));
  }
  
  /**
   * Calculate panic probability based on various factors
   */
  private calculatePanicProbability(
    emotion: string, 
    stressLevel: number, 
    keywords: string[], 
    randomFactor: number
  ): number {
    let baseProbability = 0;
    
    // Base probability from emotion
    switch (emotion) {
      case 'calm':
        baseProbability = 5;
        break;
      case 'neutral':
        baseProbability = 15;
        break;
      case 'stressed':
        baseProbability = 45;
        break;
      case 'angry':
        baseProbability = 60;
        break;
      case 'panic':
        baseProbability = 85;
        break;
      default:
        baseProbability = 20;
    }
    
    // Add impact from stress level
    baseProbability += (stressLevel - 50) * 0.3;
    
    // Add impact from keywords
    // Each keyword increases probability
    const keywordImpact = keywords.length * 10;
    baseProbability += keywordImpact;
    
    // Add some variation
    const variation = (randomFactor * 15) - 7.5; // -7.5 to +7.5
    
    // Ensure within 0-100 range
    return Math.max(0, Math.min(100, baseProbability + variation));
  }
  
  /**
   * Generate a hash from the audio data for tamper-evident chain
   */
  private generateHashFromAudio(audioData: string): string {
    // In a real implementation, this would use a proper hashing algorithm
    // For demo purposes, we'll create a simple hash
    let hash = 0;
    for (let i = 0; i < audioData.length; i++) {
      const char = audioData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return 'audio_' + Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  /**
   * Generate a deterministic random number from a string
   */
  private deterministicRandom(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Get a value between 0 and 1
    return (Math.abs(hash) % 1000) / 1000;
  }
  
  /**
   * Generate a unique ID for a voice analysis
   */
  private generateUniqueId(vehicleId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `voice_${vehicleId}_${timestamp}_${random}`;
  }
}

export const voiceAnalysisService = new VoiceAnalysisService();