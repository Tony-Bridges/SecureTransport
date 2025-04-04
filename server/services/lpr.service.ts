/**
 * License Plate Recognition Service optimized for South African license plates
 * Integrates with detection system to identify vehicles by their plates
 */

interface LPRAnalysisResult {
  licensePlate: string;
  confidence: number;
  province?: string;
  timestamp: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageHash: string; // For tamper-evident metadata
}

class LPRService {
  /**
   * Analyzes an image and extracts license plate information
   * Would integrate with actual LPR API in production
   */
  async analyzePlate(imageData: string, coordinates: { latitude: number; longitude: number }): Promise<LPRAnalysisResult | null> {
    // In production, this would call a proper LPR API or ML model
    // For demo purposes, we'll return simulated results
    
    try {
      // Simple detection simulation (just to demonstrate the structure)
      // In production this would be replaced with actual plate detection
      const plateData = this.simulatePlateDetection(imageData);
      
      if (!plateData) {
        console.log('No license plate detected in image');
        return null;
      }
      
      // Validate if the detected plate is in South African format
      if (!this.validateSouthAfricanPlate(plateData.licensePlate)) {
        console.log(`Detected plate ${plateData.licensePlate} is not a valid South African format`);
        return null;
      }
      
      // In production, the province would be detected from the plate format
      // For now, we'll extract it from the simulated data
      const province = this.extractProvinceFromPlate(plateData.licensePlate);
      
      return {
        licensePlate: plateData.licensePlate,
        confidence: plateData.confidence,
        province,
        timestamp: new Date().toISOString(),
        coordinates,
        imageHash: this.calculateImageHash(imageData)
      };
    } catch (error) {
      console.error('LPR analysis failed:', error);
      return null;
    }
  }
  
  /**
   * Validates if a license plate matches South African format
   */
  validateSouthAfricanPlate(plate: string): boolean {
    // Common South African license plate formats:
    // CA 123-456 (Western Cape)
    // GP ABC 123 (Gauteng)
    // ND 123-456 (KwaZulu-Natal)
    // EC 123-456 (Eastern Cape)
    // etc.
    
    // Simplified validation for demo purposes
    // Would be more comprehensive in production
    const saPlateRegex = /^[A-Z]{2}(\s|-)?[A-Z0-9]{3}(\s|-)?[0-9]{3}$/;
    return saPlateRegex.test(plate);
  }
  
  /**
   * Extract province code from plate number
   * In production, would be more sophisticated
   */
  private extractProvinceFromPlate(plate: string): string {
    const provinceCode = plate.substring(0, 2);
    const provinces: { [key: string]: string } = {
      'CA': 'Western Cape',
      'GP': 'Gauteng',
      'ND': 'KwaZulu-Natal',
      'EC': 'Eastern Cape',
      'MP': 'Mpumalanga',
      'NW': 'North West',
      'LP': 'Limpopo',
      'FS': 'Free State',
      'NC': 'Northern Cape',
    };
    
    return provinces[provinceCode] || 'Unknown';
  }
  
  /**
   * Simulate LPR detection for demo purposes
   * In production, this would be a real ML model or API call
   */
  private simulatePlateDetection(imageData: string): { licensePlate: string, confidence: number } | null {
    // Use part of the image data hash to generate a consistent but simulated plate number
    const hash = this.calculateImageHash(imageData);
    const platePrefix = hash.substring(0, 2).toUpperCase();
    
    // Simple pattern to generate randomized but valid-looking plate
    // In production this would be the result of the LPR detection
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const letterPart = letters[Math.floor(Math.random() * letters.length)] + 
                      letters[Math.floor(Math.random() * letters.length)] +
                      letters[Math.floor(Math.random() * letters.length)];
                      
    const numberPart = Math.floor(Math.random() * 900 + 100);
    
    // If we have GP as prefix (Gauteng), use the GP ABC 123 format
    if (platePrefix === 'GP') {
      return {
        licensePlate: `GP ${letterPart} ${numberPart}`,
        confidence: 0.85 + (Math.random() * 0.15) // Between 0.85 and 1.0
      };
    }
    
    // Otherwise use the CA 123-456 format common in other provinces
    return {
      licensePlate: `${platePrefix} ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}`,
      confidence: 0.85 + (Math.random() * 0.15) // Between 0.85 and 1.0
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
}

export const lprService = new LPRService();