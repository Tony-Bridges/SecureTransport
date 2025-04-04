/**
 * Emotion Detection Service
 * Analyzes facial expressions and body language to detect anomalies in cabin
 */

interface EmotionAnalysisResult {
  detectionId: string;
  vehicleId: string;
  timestamp: string;
  primaryEmotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted';
  confidenceScore: number;
  arousalLevel: number; // 0-100 (calm to highly aroused)
  valenceLevel: number; // 0-100 (negative to positive)
  faceCount: number;
  anomalyScore: number; // 0-100
  anomalyDetected: boolean;
  frameHash: string; // For evidence chain
  personDetails?: {
    position: 'driver' | 'passenger' | 'unspecified';
    faceBoundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }[];
}

interface EmotionAlertThresholds {
  anomalyThreshold: number;
  fearThreshold: number;
  angerThreshold: number;
  consecutiveFramesRequired: number;
}

class EmotionDetectionService {
  private alertThresholds: EmotionAlertThresholds = {
    anomalyThreshold: 70,
    fearThreshold: 75,
    angerThreshold: 80,
    consecutiveFramesRequired: 3
  };
  
  private recentAnalyses: Map<string, EmotionAnalysisResult[]> = new Map(); // vehicleId -> analyses
  
  /**
   * Analyze a frame from the cabin camera for emotions and anomalies
   */
  async analyzeFrame(imageData: string, vehicleId: string): Promise<EmotionAnalysisResult> {
    // In a real implementation, this would use a computer vision API
    // For demo purposes, we'll simulate the analysis
    
    // Create a deterministic random based on the image data for consistent simulation
    const randomFactor = this.deterministicRandom(imageData + vehicleId);
    
    // Determine how many faces were detected
    const faceCount = this.simulateFaceCount(randomFactor);
    
    // Determine the primary emotion detected in the image
    const primaryEmotion = this.simulatePrimaryEmotion(randomFactor);
    
    // Calculate arousal level (intensity of emotion)
    const arousalLevel = this.calculateArousalLevel(primaryEmotion, randomFactor);
    
    // Calculate valence level (positive vs. negative emotion)
    const valenceLevel = this.calculateValenceLevel(primaryEmotion, randomFactor);
    
    // Calculate anomaly score
    const anomalyScore = this.calculateAnomalyScore(primaryEmotion, arousalLevel, valenceLevel, randomFactor);
    
    // Determine if this is considered an anomaly
    const anomalyDetected = anomalyScore > this.alertThresholds.anomalyThreshold;
    
    // Generate person details if faces were detected
    const personDetails = faceCount > 0 ? this.generatePersonDetails(faceCount, randomFactor) : undefined;
    
    // Generate a hash for evidence chain
    const frameHash = this.generateHashFromImage(imageData);
    
    // Create unique detection ID for tracking
    const detectionId = this.generateUniqueId(vehicleId);
    
    // Create result object
    const result: EmotionAnalysisResult = {
      detectionId,
      vehicleId,
      timestamp: new Date().toISOString(),
      primaryEmotion,
      confidenceScore: 0.65 + (randomFactor * 0.3), // 0.65-0.95 range
      arousalLevel,
      valenceLevel,
      faceCount,
      anomalyScore,
      anomalyDetected,
      frameHash,
      personDetails
    };
    
    // Store the analysis in recent history
    this.addAnalysisToHistory(vehicleId, result);
    
    // Check alert conditions
    const shouldAlert = this.checkForAlertConditions(vehicleId);
    if (shouldAlert) {
      console.log(`Emotion alert triggered for vehicle ${vehicleId}: ${primaryEmotion} emotion with ${anomalyScore.toFixed(1)} anomaly score`);
    }
    
    return result;
  }
  
  /**
   * Update alert thresholds based on operational needs
   */
  updateAlertThresholds(newThresholds: Partial<EmotionAlertThresholds>): void {
    this.alertThresholds = {
      ...this.alertThresholds,
      ...newThresholds
    };
    
    console.log(`Emotion detection thresholds updated: 
      Anomaly: ${this.alertThresholds.anomalyThreshold}, 
      Fear: ${this.alertThresholds.fearThreshold}, 
      Anger: ${this.alertThresholds.angerThreshold}, 
      Consecutive frames: ${this.alertThresholds.consecutiveFramesRequired}`
    );
  }
  
  /**
   * Store an analysis in the recent history for the vehicle
   */
  private addAnalysisToHistory(vehicleId: string, analysis: EmotionAnalysisResult): void {
    // Get existing analyses or create a new array
    const vehicleAnalyses = this.recentAnalyses.get(vehicleId) || [];
    
    // Add new analysis
    vehicleAnalyses.push(analysis);
    
    // Keep only the most recent 20 analyses
    if (vehicleAnalyses.length > 20) {
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
    if (analyses.length < this.alertThresholds.consecutiveFramesRequired) {
      return false;
    }
    
    // Get the most recent N analyses based on consecutive frames requirement
    const recentAnalyses = analyses.slice(-this.alertThresholds.consecutiveFramesRequired);
    
    // Check for anomaly conditions
    const anomalyDetected = recentAnalyses.every(
      analysis => analysis.anomalyScore >= this.alertThresholds.anomalyThreshold
    );
    
    // Check for fear conditions
    const fearDetected = recentAnalyses.every(
      analysis => analysis.primaryEmotion === 'fearful' && analysis.arousalLevel >= this.alertThresholds.fearThreshold
    );
    
    // Check for anger conditions
    const angerDetected = recentAnalyses.every(
      analysis => analysis.primaryEmotion === 'angry' && analysis.arousalLevel >= this.alertThresholds.angerThreshold
    );
    
    return anomalyDetected || fearDetected || angerDetected;
  }
  
  /**
   * Simulate number of faces detected
   */
  private simulateFaceCount(randomValue: number): number {
    // 70% chance of 1-2 faces, 30% chance of 0 or 3+ faces
    if (randomValue < 0.1) {
      return 0; // No faces detected
    } else if (randomValue < 0.7) {
      return 1; // Driver only
    } else if (randomValue < 0.9) {
      return 2; // Driver and passenger
    } else {
      return 3; // Multiple people
    }
  }
  
  /**
   * Simulate primary emotion for the frame
   */
  private simulatePrimaryEmotion(randomValue: number): 'neutral' | 'happy' | 'sad' | 'angry' | 'fearful' | 'surprised' | 'disgusted' {
    // Distribution of emotions with neutral and happy being most common
    if (randomValue < 0.4) {
      return 'neutral';
    } else if (randomValue < 0.6) {
      return 'happy';
    } else if (randomValue < 0.7) {
      return 'sad';
    } else if (randomValue < 0.8) {
      return 'surprised';
    } else if (randomValue < 0.9) {
      return 'angry';
    } else if (randomValue < 0.95) {
      return 'fearful';
    } else {
      return 'disgusted';
    }
  }
  
  /**
   * Calculate arousal level based on emotion and random factor
   * Arousal: level of activation/intensity (calm vs. excited)
   */
  private calculateArousalLevel(emotion: string, randomFactor: number): number {
    let baseArousal: number;
    
    switch (emotion) {
      case 'neutral':
        baseArousal = 20;
        break;
      case 'happy':
        baseArousal = 50;
        break;
      case 'sad':
        baseArousal = 40;
        break;
      case 'angry':
        baseArousal = 80;
        break;
      case 'fearful':
        baseArousal = 85;
        break;
      case 'surprised':
        baseArousal = 70;
        break;
      case 'disgusted':
        baseArousal = 60;
        break;
      default:
        baseArousal = 30;
    }
    
    // Add some variation (±15)
    const variation = (randomFactor * 30) - 15;
    
    // Ensure within 0-100 range
    return Math.max(0, Math.min(100, baseArousal + variation));
  }
  
  /**
   * Calculate valence level based on emotion and random factor
   * Valence: positive vs. negative sentiment
   */
  private calculateValenceLevel(emotion: string, randomFactor: number): number {
    let baseValence: number;
    
    switch (emotion) {
      case 'neutral':
        baseValence = 50;
        break;
      case 'happy':
        baseValence = 85;
        break;
      case 'sad':
        baseValence = 15;
        break;
      case 'angry':
        baseValence = 10;
        break;
      case 'fearful':
        baseValence = 15;
        break;
      case 'surprised':
        baseValence = 60; // surprise can be positive or negative
        break;
      case 'disgusted':
        baseValence = 20;
        break;
      default:
        baseValence = 50;
    }
    
    // Add some variation (±15)
    const variation = (randomFactor * 30) - 15;
    
    // Ensure within 0-100 range
    return Math.max(0, Math.min(100, baseValence + variation));
  }
  
  /**
   * Calculate an anomaly score based on emotional state
   */
  private calculateAnomalyScore(emotion: string, arousal: number, valence: number, randomFactor: number): number {
    let baseScore = 0;
    
    // High arousal + negative emotions = higher anomaly score
    if (arousal > 70 && (emotion === 'angry' || emotion === 'fearful' || emotion === 'disgusted')) {
      baseScore = 80;
    } 
    // High arousal + surprise = moderate anomaly score
    else if (arousal > 70 && emotion === 'surprised') {
      baseScore = 60;
    }
    // High arousal + positive emotions = low anomaly score
    else if (arousal > 70 && (emotion === 'happy')) {
      baseScore = 30;
    }
    // Low arousal + negative emotions = moderate anomaly score
    else if (arousal <= 70 && (emotion === 'angry' || emotion === 'fearful' || emotion === 'disgusted' || emotion === 'sad')) {
      baseScore = 50;
    }
    // Everything else = low anomaly score
    else {
      baseScore = 20;
    }
    
    // Adjust score based on valence (more negative = more anomalous)
    const valenceAdjustment = (50 - valence) * 0.3;
    
    // Add some random variation (±10)
    const variation = (randomFactor * 20) - 10;
    
    // Ensure within 0-100 range
    return Math.max(0, Math.min(100, baseScore + valenceAdjustment + variation));
  }
  
  /**
   * Generate details about detected persons
   */
  private generatePersonDetails(faceCount: number, randomFactor: number): { position: 'driver' | 'passenger' | 'unspecified'; faceBoundingBox: { x: number; y: number; width: number; height: number; } }[] {
    const result = [];
    
    // Always include driver if at least one face
    if (faceCount >= 1) {
      result.push({
        position: 'driver',
        faceBoundingBox: {
          x: 0.2 + (randomFactor * 0.1), // 0.2-0.3
          y: 0.3 + (randomFactor * 0.1), // 0.3-0.4
          width: 0.15 + (randomFactor * 0.05), // 0.15-0.2
          height: 0.2 + (randomFactor * 0.05) // 0.2-0.25
        }
      });
    }
    
    // Add passenger if more than one face
    if (faceCount >= 2) {
      result.push({
        position: 'passenger',
        faceBoundingBox: {
          x: 0.6 + (randomFactor * 0.1), // 0.6-0.7
          y: 0.3 + (randomFactor * 0.1), // 0.3-0.4
          width: 0.15 + (randomFactor * 0.05), // 0.15-0.2
          height: 0.2 + (randomFactor * 0.05) // 0.2-0.25
        }
      });
    }
    
    // Add additional unspecified faces if more than two
    for (let i = 2; i < faceCount; i++) {
      const extraRandomFactor = this.deterministicRandom(i.toString() + randomFactor.toString());
      result.push({
        position: 'unspecified',
        faceBoundingBox: {
          x: 0.1 + (extraRandomFactor * 0.8), // 0.1-0.9
          y: 0.1 + (extraRandomFactor * 0.5), // 0.1-0.6
          width: 0.1 + (extraRandomFactor * 0.1), // 0.1-0.2
          height: 0.1 + (extraRandomFactor * 0.15) // 0.1-0.25
        }
      });
    }
    
    return result;
  }
  
  /**
   * Generate a hash from the image data for tamper-evident chain
   */
  private generateHashFromImage(imageData: string): string {
    // In a real implementation, this would use a proper hashing algorithm
    // For demo purposes, we'll create a simple hash
    let hash = 0;
    // Use only a sample of the image data to save processing time
    const sampleSize = Math.min(1000, imageData.length);
    const step = Math.max(1, Math.floor(imageData.length / sampleSize));
    
    for (let i = 0; i < imageData.length; i += step) {
      const char = imageData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return 'frame_' + Math.abs(hash).toString(16).padStart(8, '0');
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
   * Generate a unique ID for an emotion detection
   */
  private generateUniqueId(vehicleId: string): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `emotion_${vehicleId}_${timestamp}_${random}`;
  }
}

export const emotionDetectionService = new EmotionDetectionService();