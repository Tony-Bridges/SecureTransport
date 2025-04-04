/**
 * Analytics Service
 * Provides crime hotspot analysis, risk scoring, and spatial analytics
 */

import { Alert, RiskZone } from '@shared/schema';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface AlertCluster {
  centroid: Coordinate;
  radius: number;
  alertCount: number;
  alertIds: number[];
  riskScore: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  lastIncident: string;
}

interface HotspotAnalysisResult {
  clusters: AlertCluster[];
  analysisTimestamp: string;
  totalAlertsAnalyzed: number;
  highRiskClusters: number;
}

class AnalyticsService {
  // DBSCAN parameters
  private readonly EPSILON = 0.01; // Roughly 1km in decimal degrees
  private readonly MIN_POINTS = 3; // Minimum points to form a cluster
  
  /**
   * Performs DBSCAN clustering on alert data to identify crime hotspots
   */
  async analyzeHotspots(alerts: Alert[]): Promise<HotspotAnalysisResult> {
    // Convert alerts to points for DBSCAN
    const points = alerts.map(alert => ({
      id: alert.id,
      latitude: alert.metadata.latitude || 0,
      longitude: alert.metadata.longitude || 0, 
      timestamp: alert.timestamp,
      severity: alert.severity,
      type: alert.type
    }));
    
    // Only process points with valid coordinates
    const validPoints = points.filter(p => p.latitude !== 0 && p.longitude !== 0);
    
    // Run simplified DBSCAN algorithm
    const clusters = this.runDBSCAN(validPoints);
    
    // Convert raw clusters to AlertCluster format with risk scoring
    const alertClusters = clusters.map(cluster => {
      // Calculate centroid
      const centroid = this.calculateCentroid(cluster);
      
      // Calculate radius (maximum distance from centroid to any point)
      const radius = this.calculateClusterRadius(cluster, centroid);
      
      // Calculate risk score based on incident types, severity, and recency
      const riskScore = this.calculateRiskScore(cluster);
      
      // Determine severity category based on risk score
      const severity = this.getSeverityCategory(riskScore);
      
      // Find the most recent incident
      const lastIncident = this.getLastIncidentDate(cluster);
      
      return {
        centroid,
        radius,
        alertCount: cluster.length,
        alertIds: cluster.map(p => p.id),
        riskScore,
        severity,
        lastIncident
      };
    });
    
    // Return the complete analysis result
    return {
      clusters: alertClusters,
      analysisTimestamp: new Date().toISOString(),
      totalAlertsAnalyzed: validPoints.length,
      highRiskClusters: alertClusters.filter(c => 
        c.severity === 'high' || c.severity === 'critical'
      ).length
    };
  }
  
  /**
   * Generates risk zones based on hotspot analysis
   */
  async generateRiskZones(hotspots: HotspotAnalysisResult): Promise<RiskZone[]> {
    return hotspots.clusters
      .filter(cluster => cluster.alertCount >= 2) // Only create risk zones for significant clusters
      .map((cluster, index) => ({
        id: index + 1, // This would be properly generated in a database
        name: `Risk Zone ${index + 1}`,
        latitude: cluster.centroid.latitude,
        longitude: cluster.centroid.longitude,
        radius: Math.max(cluster.radius * 1000, 500), // Convert to meters, minimum 500m
        riskLevel: cluster.severity,
        description: `Auto-generated risk zone based on ${cluster.alertCount} incidents. Last incident: ${new Date(cluster.lastIncident).toLocaleDateString()}`
      }));
  }
  
  /**
   * Dynamic risk scoring algorithm
   * Determines the risk level of a route based on proximity to hotspots
   */
  calculateRouteRiskScore(routePoints: Coordinate[], riskZones: RiskZone[]): number {
    let totalRisk = 0;
    
    // For each point in the route, check proximity to risk zones
    routePoints.forEach(point => {
      riskZones.forEach(zone => {
        // Calculate distance to risk zone center
        const distance = this.calculateDistance(
          point.latitude, point.longitude,
          zone.latitude, zone.longitude
        );
        
        // If point is within the risk zone radius
        if (distance <= zone.radius / 1000) { // Convert radius from meters to km
          // Add risk based on zone risk level and proximity
          const riskFactor = this.getRiskFactorForLevel(zone.riskLevel);
          const proximityFactor = 1 - (distance / (zone.radius / 1000));
          totalRisk += riskFactor * proximityFactor;
        }
      });
    });
    
    // Normalize the risk score to a 0-100 scale
    return Math.min(Math.round(totalRisk / routePoints.length * 10), 100);
  }
  
  /**
   * Implementation of DBSCAN clustering algorithm
   * Simplified version for demonstration
   */
  private runDBSCAN(points: any[]): any[][] {
    const clusters: any[][] = [];
    const visited = new Set<number>();
    
    points.forEach((point, index) => {
      if (visited.has(index)) return;
      
      visited.add(index);
      
      // Find neighbors
      const neighbors = this.getNeighbors(points, point, index);
      
      if (neighbors.length < this.MIN_POINTS) {
        // This is noise (for now)
        return;
      }
      
      // Start a new cluster
      const cluster: any[] = [point];
      
      // Process all neighbors
      let i = 0;
      while (i < neighbors.length) {
        const neighborIndex = neighbors[i];
        
        if (!visited.has(neighborIndex)) {
          visited.add(neighborIndex);
          
          // Find neighbors of this neighbor
          const neighborNeighbors = this.getNeighbors(points, points[neighborIndex], neighborIndex);
          
          if (neighborNeighbors.length >= this.MIN_POINTS) {
            // Add new neighbors to the list to process
            neighbors.push(...neighborNeighbors.filter(nn => !neighbors.includes(nn)));
          }
        }
        
        // Add the neighbor to this cluster if not already in a cluster
        if (!clusters.flat().includes(points[neighborIndex])) {
          cluster.push(points[neighborIndex]);
        }
        
        i++;
      }
      
      clusters.push(cluster);
    });
    
    return clusters;
  }
  
  /**
   * Find neighbors within EPSILON distance
   */
  private getNeighbors(points: any[], point: any, pointIndex: number): number[] {
    const neighbors: number[] = [];
    
    points.forEach((p, index) => {
      if (index === pointIndex) return;
      
      const distance = this.calculateDistance(
        point.latitude, point.longitude, 
        p.latitude, p.longitude
      );
      
      if (distance <= this.EPSILON) {
        neighbors.push(index);
      }
    });
    
    return neighbors;
  }
  
  /**
   * Calculate the centroid of a cluster
   */
  private calculateCentroid(cluster: any[]): Coordinate {
    const latSum = cluster.reduce((sum, p) => sum + p.latitude, 0);
    const lngSum = cluster.reduce((sum, p) => sum + p.longitude, 0);
    
    return {
      latitude: latSum / cluster.length,
      longitude: lngSum / cluster.length
    };
  }
  
  /**
   * Calculate the radius of a cluster
   */
  private calculateClusterRadius(cluster: any[], centroid: Coordinate): number {
    let maxDistance = 0;
    
    cluster.forEach(point => {
      const distance = this.calculateDistance(
        centroid.latitude, centroid.longitude,
        point.latitude, point.longitude
      );
      
      maxDistance = Math.max(maxDistance, distance);
    });
    
    return maxDistance;
  }
  
  /**
   * Calculate the risk score for a cluster
   */
  private calculateRiskScore(cluster: any[]): number {
    let score = 0;
    
    // Base score from number of incidents
    score += Math.min(cluster.length * 5, 50);
    
    // Add points for severity
    cluster.forEach(point => {
      switch (point.severity) {
        case 'critical':
          score += 20;
          break;
        case 'high':
          score += 10;
          break;
        case 'medium':
          score += 5;
          break;
        default:
          score += 1;
      }
      
      // Add points for specific incident types
      if (point.type === 'weapon_detected') {
        score += 15;
      } else if (point.type.includes('tamper')) {
        score += 8;
      }
      
      // Recency factor (more recent = higher score)
      const daysSinceIncident = this.getDaysSince(point.timestamp);
      if (daysSinceIncident < 7) {
        score += 10;
      } else if (daysSinceIncident < 30) {
        score += 5;
      } else if (daysSinceIncident < 90) {
        score += 2;
      }
    });
    
    return Math.min(score, 100);
  }
  
  /**
   * Determine severity category based on risk score
   */
  private getSeverityCategory(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }
  
  /**
   * Get the date of the most recent incident
   */
  private getLastIncidentDate(cluster: any[]): string {
    const sortedByDate = [...cluster].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedByDate[0].timestamp;
  }
  
  /**
   * Calculate days since a given timestamp
   */
  private getDaysSince(timestamp: string): number {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Get risk factor based on risk level
   */
  private getRiskFactorForLevel(level: string): number {
    switch (level) {
      case 'critical':
        return 10;
      case 'high':
        return 7;
      case 'medium':
        return 4;
      case 'low':
        return 1;
      default:
        return 0;
    }
  }
  
  /**
   * Calculate distance between two coordinates in kilometers
   * Uses Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * Convert degrees to radians
   */
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const analyticsService = new AnalyticsService();