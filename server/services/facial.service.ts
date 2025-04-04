/**
 * Facial Recognition Service
 * Identifies and tracks faces across multiple camera feeds
 */

interface FacialAnalysisResult {
  faceId: string;  // Unique identifier for the face
  confidence: number;
  knownPerson: boolean;
  personName?: string;
  personCategory?: 'civilian' | 'suspect' | 'known_criminal' | 'security_personnel';
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageHash: string; // For tamper-evident metadata
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface FaceHistoryEntry {
  faceId: string;
  locations: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    vehicleId?: string;
  }>;
  lastSeen: string;
  appearanceCount: number;
}

class FacialRecognitionService {
  private faceHistory: Map<string, FaceHistoryEntry> = new Map();
  
  /**
   * Analyzes an image and extracts facial information
   * Would integrate with actual facial recognition API in production
   */
  async analyzeFace(imageData: string, coordinates: { latitude: number; longitude: number }, vehicleId?: string): Promise<FacialAnalysisResult | null> {
    try {
      // In production, this would call a proper facial recognition API or ML model
      // For demo purposes, we'll return simulated results
      const faceData = this.simulateFaceDetection(imageData);
      
      if (!faceData) {
        console.log('No face detected in image');
        return null;
      }
      
      // Record this face in history for tracking across locations
      this.recordFaceLocation(faceData.faceId, coordinates, vehicleId);
      
      return {
        faceId: faceData.faceId,
        confidence: faceData.confidence,
        knownPerson: faceData.knownPerson,
        personName: faceData.personName,
        personCategory: faceData.personCategory,
        timestamp: new Date().toISOString(),
        coordinates,
        imageHash: this.calculateImageHash(imageData),
        boundingBox: faceData.boundingBox
      };
    } catch (error) {
      console.error('Facial analysis failed:', error);
      return null;
    }
  }
  
  /**
   * Records face location for historical tracking
   */
  private recordFaceLocation(faceId: string, coordinates: { latitude: number; longitude: number }, vehicleId?: string): void {
    const now = new Date().toISOString();
    const locationEntry = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timestamp: now,
      vehicleId
    };
    
    if (this.faceHistory.has(faceId)) {
      const historyEntry = this.faceHistory.get(faceId)!;
      historyEntry.locations.push(locationEntry);
      historyEntry.lastSeen = now;
      historyEntry.appearanceCount += 1;
      this.faceHistory.set(faceId, historyEntry);
    } else {
      this.faceHistory.set(faceId, {
        faceId,
        locations: [locationEntry],
        lastSeen: now,
        appearanceCount: 1
      });
    }
  }
  
  /**
   * Get faces that have appeared in multiple locations within a specific time window
   * Useful for tracking suspicious movement patterns
   */
  getFacesWithMultipleLocations(timeWindowMinutes: number = 60, minLocations: number = 2): FaceHistoryEntry[] {
    const result: FaceHistoryEntry[] = [];
    const timeThreshold = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();
    
    this.faceHistory.forEach(historyEntry => {
      const recentLocations = historyEntry.locations.filter(loc => loc.timestamp >= timeThreshold);
      
      if (recentLocations.length >= minLocations) {
        // Create a copy with only the recent locations
        const entryCopy = {
          ...historyEntry,
          locations: recentLocations
        };
        result.push(entryCopy);
      }
    });
    
    return result;
  }
  
  /**
   * Find faces detected near a specific location
   * @param center Center coordinates
   * @param radiusMeters Radius in meters
   * @param timeWindowMinutes Time window in minutes to consider
   */
  getFacesNearLocation(
    center: { latitude: number; longitude: number },
    radiusMeters: number = 100,
    timeWindowMinutes: number = 60
  ): FaceHistoryEntry[] {
    const result: FaceHistoryEntry[] = [];
    const timeThreshold = new Date(Date.now() - timeWindowMinutes * 60 * 1000).toISOString();
    
    this.faceHistory.forEach(historyEntry => {
      // Filter locations by time and proximity
      const nearbyLocations = historyEntry.locations.filter(loc => {
        if (loc.timestamp < timeThreshold) return false;
        
        // Calculate distance to this location
        const distance = this.calculateDistance(
          center.latitude, center.longitude,
          loc.latitude, loc.longitude
        );
        
        return distance <= radiusMeters;
      });
      
      if (nearbyLocations.length > 0) {
        // Create a copy with only the nearby locations
        const entryCopy = {
          ...historyEntry,
          locations: nearbyLocations
        };
        result.push(entryCopy);
      }
    });
    
    return result;
  }
  
  /**
   * Clear old face history entries to manage memory
   * @param maxAgeHours Maximum age in hours to keep entries
   */
  cleanupOldEntries(maxAgeHours: number = 24): void {
    const timeThreshold = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
    
    this.faceHistory.forEach((entry, faceId) => {
      if (entry.lastSeen < timeThreshold) {
        this.faceHistory.delete(faceId);
      }
    });
  }
  
  /**
   * Simulate face detection for demo purposes
   * In production, this would be a real ML model or API call
   */
  private simulateFaceDetection(imageData: string): {
    faceId: string,
    confidence: number,
    knownPerson: boolean,
    personName?: string,
    personCategory?: 'civilian' | 'suspect' | 'known_criminal' | 'security_personnel',
    boundingBox?: {
      x: number,
      y: number,
      width: number,
      height: number
    }
  } | null {
    // Use image hash to create a deterministic but unique ID
    const hash = this.calculateImageHash(imageData);
    const faceId = hash;
    
    // Simulate detection confidence between 85-100%
    const confidence = 0.85 + (Math.random() * 0.15);
    
    // Simulate 20% chance of known person
    const knownPerson = Math.random() < 0.2;
    
    // Simulate sample data for known persons
    let personName, personCategory;
    if (knownPerson) {
      const knownPersons = [
        { name: 'John Smith', category: 'known_criminal' },
        { name: 'Alex Robertson', category: 'suspect' },
        { name: 'James Wilson', category: 'security_personnel' },
        { name: 'Maria Gonzalez', category: 'security_personnel' },
      ];
      
      const selectedPerson = knownPersons[Math.floor(Math.random() * knownPersons.length)];
      personName = selectedPerson.name;
      personCategory = selectedPerson.category as any;
    } else {
      personName = 'Unknown Person';
      personCategory = 'civilian';
    }
    
    // Simulate bounding box for the face
    const boundingBox = {
      x: Math.random() * 0.5 + 0.25, // 25-75% of image width
      y: Math.random() * 0.5 + 0.25, // 25-75% of image height
      width: Math.random() * 0.2 + 0.1, // 10-30% of image width
      height: Math.random() * 0.2 + 0.1 // 10-30% of image height
    };
    
    return {
      faceId,
      confidence,
      knownPerson,
      personName,
      personCategory,
      boundingBox
    };
  }
  
  /**
   * Generates a hash of the image data for tamper evidence
   * In production, would use a proper cryptographic hash function
   */
  private calculateImageHash(imageData: string): string {
    // Simplified hash for demo purposes
    // In production, would use SHA-256 or similar
    let hash = 0;
    
    // Take a small sample from the imageData to keep performance reasonable
    const sample = imageData.substring(0, 1000);
    
    for (let i = 0; i < sample.length; i++) {
      const char = sample.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  /**
   * Calculate distance between two coordinates in meters using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = this.deg2rad(lat1);
    const φ2 = this.deg2rad(lat2);
    const Δφ = this.deg2rad(lat2 - lat1);
    const Δλ = this.deg2rad(lon2 - lon1);
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance in meters
  }
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const facialRecognitionService = new FacialRecognitionService();