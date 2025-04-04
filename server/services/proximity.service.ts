/**
 * Proximity Detection Service
 * Identifies vehicles near stationary cash-transport vehicles and handles geo-tagging
 */
import { Telemetry, Vehicle } from '@shared/schema';

interface ProximityScan {
  centerId: string;  // Center vehicle ID
  centerCoordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  nearbyVehicles: Array<{
    id: string;
    distance: number; // Distance in meters
    coordinates: {
      latitude: number;
      longitude: number;
    };
    detectedAt: string;
  }>;
  isStationary: boolean;
  stationaryDuration?: number; // Duration in seconds
}

interface RouteSegment {
  startCoordinates: {
    latitude: number;
    longitude: number;
  };
  endCoordinates: {
    latitude: number;
    longitude: number;
  };
  distance: number; // Distance in meters
}

class ProximityService {
  private stationaryThresholdSeconds = 60; // Threshold to consider a vehicle stationary
  private proximityScanHistory: Map<string, ProximityScan[]> = new Map();
  private vehicleStatusHistory: Map<string, Array<{
    timestamp: string;
    coordinates: { latitude: number; longitude: number };
    isMoving: boolean;
  }>> = new Map();
  
  /**
   * Process new telemetry data to update vehicle status history
   * @param telemetry Telemetry data from a vehicle
   * @param allTelemetry All current telemetry to check proximity
   */
  processTelemetryUpdate(telemetry: Telemetry, allTelemetry: Telemetry[]): void {
    const { vehicleId, latitude, longitude, timestamp } = telemetry;
    
    // Determine if vehicle is moving based on speed or comparison with previous position
    const isMoving = this.isVehicleMoving(telemetry);
    
    // Update vehicle status history
    this.updateVehicleStatusHistory(vehicleId, { latitude, longitude }, timestamp, isMoving);
    
    // If vehicle is stationary, perform proximity scan
    if (!isMoving) {
      const stationaryDuration = this.getStationaryDuration(vehicleId);
      
      // Only scan if vehicle has been stationary for the threshold duration
      if (stationaryDuration >= this.stationaryThresholdSeconds) {
        const timestampStr = typeof timestamp === 'string' ? timestamp : timestamp.toISOString();
        this.performProximityScan(vehicleId, { latitude, longitude }, timestampStr, stationaryDuration, allTelemetry);
      }
    }
  }
  
  /**
   * Get nearby vehicles for a specific vehicle
   * @param vehicleId ID of the vehicle to check
   * @param radiusMeters Radius in meters to check for nearby vehicles
   */
  getNearbyVehicles(vehicleId: string, radiusMeters: number = 100): ProximityScan | null {
    const scans = this.proximityScanHistory.get(vehicleId);
    if (!scans || scans.length === 0) {
      return null;
    }
    
    // Get most recent scan
    const latestScan = scans[scans.length - 1];
    
    // Filter nearby vehicles by distance
    const filteredScan = {
      ...latestScan,
      nearbyVehicles: latestScan.nearbyVehicles.filter(v => v.distance <= radiusMeters)
    };
    
    return filteredScan;
  }
  
  /**
   * Generate possible route segments for a vehicle based on current position
   * @param vehicleId ID of the vehicle
   * @param maxDistanceMeters Maximum distance in meters to consider for route segments
   */
  getPossibleRouteSegments(vehicleId: string, maxDistanceMeters: number = 100): RouteSegment[] {
    const history = this.vehicleStatusHistory.get(vehicleId);
    if (!history || history.length === 0) {
      return [];
    }
    
    // Get current position
    const currentPosition = history[history.length - 1].coordinates;
    
    // Generate route segments in 8 directions (N, NE, E, SE, S, SW, W, NW)
    const segments: RouteSegment[] = [];
    
    // Calculate points in different directions
    for (let angle = 0; angle < 360; angle += 45) {
      const endPoint = this.calculateDestinationPoint(
        currentPosition.latitude,
        currentPosition.longitude,
        maxDistanceMeters,
        angle
      );
      
      segments.push({
        startCoordinates: { ...currentPosition },
        endCoordinates: endPoint,
        distance: maxDistanceMeters
      });
    }
    
    return segments;
  }
  
  /**
   * Get stationary vehicles and their duration
   */
  getStationaryVehicles(): Array<{ vehicleId: string, coordinates: { latitude: number, longitude: number }, durationSeconds: number }> {
    const result: Array<{ vehicleId: string, coordinates: { latitude: number, longitude: number }, durationSeconds: number }> = [];
    
    this.vehicleStatusHistory.forEach((history, vehicleId) => {
      if (history.length === 0) return;
      
      const latestStatus = history[history.length - 1];
      if (!latestStatus.isMoving) {
        const durationSeconds = this.getStationaryDuration(vehicleId);
        if (durationSeconds >= this.stationaryThresholdSeconds) {
          result.push({
            vehicleId,
            coordinates: latestStatus.coordinates,
            durationSeconds
          });
        }
      }
    });
    
    return result;
  }
  
  /**
   * Clean up old history data to save memory
   * @param maxAgeHours Maximum age in hours to keep history
   */
  cleanupOldData(maxAgeHours: number = 24): void {
    const timeThreshold = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();
    
    // Clean vehicle status history
    this.vehicleStatusHistory.forEach((history, vehicleId) => {
      const filteredHistory = history.filter(status => status.timestamp >= timeThreshold);
      if (filteredHistory.length === 0) {
        this.vehicleStatusHistory.delete(vehicleId);
      } else {
        this.vehicleStatusHistory.set(vehicleId, filteredHistory);
      }
    });
    
    // Clean proximity scan history
    this.proximityScanHistory.forEach((scans, vehicleId) => {
      const filteredScans = scans.filter(scan => scan.timestamp >= timeThreshold);
      if (filteredScans.length === 0) {
        this.proximityScanHistory.delete(vehicleId);
      } else {
        this.proximityScanHistory.set(vehicleId, filteredScans);
      }
    });
  }
  
  /**
   * Determine if a vehicle is moving based on telemetry data
   */
  private isVehicleMoving(telemetry: Telemetry): boolean {
    // If speed is available and greater than threshold, vehicle is moving
    if (telemetry.speed !== undefined && telemetry.speed !== null && telemetry.speed > 3) { // 3 km/h threshold
      return true;
    }
    
    // Otherwise check position change against history
    const history = this.vehicleStatusHistory.get(telemetry.vehicleId);
    if (!history || history.length === 0) {
      return false; // Assume not moving if no history
    }
    
    const prevPosition = history[history.length - 1].coordinates;
    const currentPosition = { latitude: telemetry.latitude, longitude: telemetry.longitude };
    
    // Calculate distance between current and previous position
    const distance = this.calculateDistance(
      prevPosition.latitude, prevPosition.longitude,
      currentPosition.latitude, currentPosition.longitude
    );
    
    // If distance is greater than threshold, vehicle is moving
    return distance > 5; // 5 meters threshold
  }
  
  /**
   * Update the history of a vehicle's status
   */
  private updateVehicleStatusHistory(
    vehicleId: string,
    coordinates: { latitude: number; longitude: number },
    timestamp: string | Date,
    isMoving: boolean
  ): void {
    const timestampStr = timestamp instanceof Date ? timestamp.toISOString() : timestamp;
    
    const historyEntry = {
      timestamp: timestampStr,
      coordinates,
      isMoving
    };
    
    if (this.vehicleStatusHistory.has(vehicleId)) {
      const history = this.vehicleStatusHistory.get(vehicleId)!;
      history.push(historyEntry);
      this.vehicleStatusHistory.set(vehicleId, history);
    } else {
      this.vehicleStatusHistory.set(vehicleId, [historyEntry]);
    }
  }
  
  /**
   * Calculate how long a vehicle has been stationary
   */
  private getStationaryDuration(vehicleId: string): number {
    const history = this.vehicleStatusHistory.get(vehicleId);
    if (!history || history.length === 0) {
      return 0;
    }
    
    // Start from most recent and go backwards
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].isMoving) {
        // Found the last time vehicle was moving
        const movingTime = new Date(history[i].timestamp).getTime();
        const currentTime = Date.now();
        return Math.floor((currentTime - movingTime) / 1000); // Duration in seconds
      }
    }
    
    // If we get here, vehicle has been stationary since first record
    const firstTime = new Date(history[0].timestamp).getTime();
    const currentTime = Date.now();
    return Math.floor((currentTime - firstTime) / 1000); // Duration in seconds
  }
  
  /**
   * Perform a proximity scan around a stationary vehicle
   */
  private performProximityScan(
    vehicleId: string,
    coordinates: { latitude: number; longitude: number },
    timestamp: string | Date,
    stationaryDuration: number,
    allTelemetry: Telemetry[]
  ): void {
    const timestampStr = timestamp instanceof Date ? timestamp.toISOString() : timestamp;
    
    const nearbyVehicles = allTelemetry
      .filter(t => t.vehicleId !== vehicleId) // Exclude self
      .map(t => {
        const distance = this.calculateDistance(
          coordinates.latitude, coordinates.longitude,
          t.latitude, t.longitude
        );
        
        // Ensure timestamp is a string
        const detectedAt = t.timestamp instanceof Date ? t.timestamp.toISOString() : t.timestamp;
        
        return {
          id: t.vehicleId,
          distance, // Distance in meters
          coordinates: {
            latitude: t.latitude,
            longitude: t.longitude
          },
          detectedAt
        };
      })
      .filter(v => v.distance <= 100); // Only include vehicles within 100 meters
    
    const scan: ProximityScan = {
      centerId: vehicleId,
      centerCoordinates: coordinates,
      timestamp: timestampStr,
      nearbyVehicles,
      isStationary: true,
      stationaryDuration
    };
    
    // Store the scan
    if (this.proximityScanHistory.has(vehicleId)) {
      const scans = this.proximityScanHistory.get(vehicleId)!;
      scans.push(scan);
      this.proximityScanHistory.set(vehicleId, scans);
    } else {
      this.proximityScanHistory.set(vehicleId, [scan]);
    }
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
   * Calculate destination point given distance and bearing
   * @param lat Starting latitude
   * @param lon Starting longitude
   * @param distance Distance in meters
   * @param bearing Bearing in degrees (0 = north, 90 = east, etc.)
   */
  private calculateDestinationPoint(lat: number, lon: number, distance: number, bearing: number): { latitude: number, longitude: number } {
    const R = 6371e3; // Earth radius in meters
    const δ = distance / R; // Angular distance
    const θ = this.deg2rad(bearing);
    
    const φ1 = this.deg2rad(lat);
    const λ1 = this.deg2rad(lon);
    
    const φ2 = Math.asin(
      Math.sin(φ1) * Math.cos(δ) +
      Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
    );
    
    const λ2 = λ1 + Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
    
    // Convert back to degrees
    const latDest = this.rad2deg(φ2);
    const lonDest = this.rad2deg(λ2);
    
    return { latitude: latDest, longitude: lonDest };
  }
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  /**
   * Convert radians to degrees
   */
  private rad2deg(rad: number): number {
    return rad * (180/Math.PI);
  }
}

export const proximityService = new ProximityService();