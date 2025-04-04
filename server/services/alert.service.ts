/**
 * Alert Service
 * Handles alert distribution through multiple channels and alert prioritization
 */

import { emailService } from './email.service';
import { Alert } from '@shared/schema';

interface AlertResult {
  success: boolean;
  message: string;
  distributionChannels: string[];
}

class AlertService {
  // Track alerts to prevent duplicates
  private recentAlerts: Map<string, number> = new Map(); // vehicleId_type -> timestamp
  
  /**
   * Distribute an alert through multiple channels based on severity
   */
  async distributeAlert(alert: Alert, highPriority: boolean = false): Promise<AlertResult> {
    const channels: string[] = ['system'];
    const distributionResults: boolean[] = [true]; // System notification is always successful
    
    // Deduplicate alerts (prevent spamming)
    const alertKey = `${alert.vehicleId}_${alert.type}`;
    const now = Date.now();
    const lastAlertTime = this.recentAlerts.get(alertKey) || 0;
    
    // Only send alerts if we haven't sent one in the last 5 minutes (unless high priority)
    if (!highPriority && lastAlertTime > 0 && now - lastAlertTime < 5 * 60 * 1000) {
      return {
        success: true,
        message: 'Alert suppressed (duplicate within 5 minutes)',
        distributionChannels: ['system_deduplicated']
      };
    }
    
    // Update the last alert time
    this.recentAlerts.set(alertKey, now);
    
    // Email notifications for critical alerts
    if (alert.severity === 'critical' || highPriority) {
      try {
        const emailSubject = `🚨 CRITICAL ALERT: ${alert.message}`;
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e00; border-radius: 5px;">
            <h2 style="color: #e00;">CRITICAL SECURITY ALERT</h2>
            <p><strong>Vehicle:</strong> ${alert.vehicleId}</p>
            <p><strong>Alert Type:</strong> ${alert.type}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${new Date(alert.timestamp).toLocaleString()}</p>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            
            <div style="margin-top: 20px; padding: 15px; background-color: #fff4f4; border-radius: 4px;">
              <p><strong>IMMEDIATE ACTION REQUIRED</strong></p>
              <p>Please log in to the system immediately to review and respond to this alert.</p>
              <p>If this is an emergency situation, contact the security response team.</p>
            </div>
            
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
              <p>This is an automated message from the SecureTransport Security System. Do not reply to this email.</p>
            </div>
          </div>
        `;
        
        // In a real implementation, we would get this list from a database
        const notificationList = [
          'security@securetransport.com',
          'dispatch@securetransport.com'
        ];
        
        // Send email to each recipient
        for (const email of notificationList) {
          const result = await emailService.sendEmail({
            to: email,
            subject: emailSubject,
            html: emailHtml,
            text: `CRITICAL ALERT: ${alert.message}\nVehicle: ${alert.vehicleId}\nAlert Type: ${alert.type}\nTime: ${new Date(alert.timestamp).toLocaleString()}\nSeverity: ${alert.severity.toUpperCase()}\n\nIMMEDIATE ACTION REQUIRED\nPlease log in to the system immediately to review and respond to this alert.`
          });
          
          if (result.success) {
            channels.push(`email:${email}`);
            distributionResults.push(true);
          } else {
            console.error(`Failed to send alert email to ${email}: ${result.error}`);
            distributionResults.push(false);
          }
        }
      } catch (error) {
        console.error('Error sending alert emails:', error);
      }
      
      // SMS notifications for critical alerts would be added here
      // In a real implementation, this would use a service like Twilio
      
      // In a real implementation, additional channels could include:
      // - Push notifications
      // - Integration with external security systems
      // - Automated calls to security personnel
    }
    
    return {
      success: distributionResults.every(Boolean),
      message: 'Alert distributed through available channels',
      distributionChannels: channels
    };
  }
  
  /**
   * Process incoming alerts and determine appropriate responses
   */
  async processAlert(alert: Alert): Promise<void> {
    // Determine if this is a high-priority alert
    const highPriority = 
      alert.severity === 'critical' || 
      alert.type === 'weapon_detected' ||
      alert.type === 'panic_detected' ||
      alert.type === 'tamper_detected';
    
    // Distribute the alert
    await this.distributeAlert(alert, highPriority);
    
    // Log the alert processing
    console.log(`Processed alert: ${alert.type} for vehicle ${alert.vehicleId} (${alert.severity})`);
  }
}

export const alertService = new AlertService();