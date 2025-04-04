# SecureTransport Platform Installation Guide

## System Requirements

### Software Requirements
- Node.js 20 or higher
- PostgreSQL 14 or higher
- Modern web browser with WebSocket support (Chrome 90+, Firefox 88+, Edge 90+)
- HTTPS certificate for production deployment
- Geospatial extensions for PostgreSQL (PostGIS)

### Hardware Requirements
- Server specifications:
  - 8-core CPU (16-core recommended for high-traffic deployments)
  - 16GB RAM minimum (32GB recommended)
  - 500GB SSD storage for database and application
  - 10TB storage for video archives and analysis (expandable)
  - Gigabit Ethernet connectivity
- Client workstation specifications:
  - 4-core CPU
  - 8GB RAM minimum
  - GPU with hardware acceleration
  - Full HD display (4K recommended for monitoring stations)

### Network Requirements
- Minimum 50Mbps upload/download for central server
- Maximum latency of 100ms between vehicles and central server
- Static IP address for production server
- Open ports for WebSockets (configurable, default 5000)
- VPN access for remote administration

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-organization/secure-transport.git
cd secure-transport
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Install PostgreSQL and PostGIS if not already installed
sudo apt update
sudo apt install postgresql postgresql-contrib postgis

# Create a PostgreSQL database
createdb secure_transport

# Enable PostGIS extension
psql -d secure_transport -c "CREATE EXTENSION postgis;"
psql -d secure_transport -c "CREATE EXTENSION postgis_topology;"

# Run the database migrations
npm run migrate
```

### 4. Environment Configuration

Create a `.env` file in the root directory with the following configurations:

```
# Database
DATABASE_URL=postgres://username:password@localhost:5432/secure_transport

# JWT Auth
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRY=24h

# Email (for notifications and alerts)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
ALERTS_EMAIL=alerts@your-company.com

# SMS notifications (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# Maps and Geolocation
MAPBOX_API_KEY=your_mapbox_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# AI and Machine Learning
OPENAI_API_KEY=your_openai_key
FACIAL_RECOGNITION_API_KEY=your_facial_api_key

# Servers
PORT=5000
HTTPS_PORT=443
NODE_ENV=production
```

### 5. SSL Configuration (Production)

For production environments, configure SSL certificates:

```bash
# Generate SSL certificate (or use Let's Encrypt)
mkdir -p ssl
openssl req -nodes -new -x509 -keyout ssl/server.key -out ssl/server.cert

# Configure your reverse proxy (NGINX recommended) or update server settings
```

### 6. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

Deployment with PM2 (recommended for production):
```bash
npm install -g pm2
pm2 start npm --name "secure-transport" -- start
pm2 save
pm2 startup
```

### 7. Access the Platform

Development:
```
http://localhost:5000
```

Production:
```
https://your-domain.com
```

Default admin credentials:
- Username: admin
- Password: secure_transport_admin (Change this immediately after first login)

### 8. Initial System Configuration

After first login, complete these essential setup steps:

1. Change default admin password
2. Configure system settings in Admin → Settings
3. Set up email notifications
4. Configure risk zone parameters
5. Set up user roles and permissions
6. Configure alert thresholds
7. Set up vehicle profiles
8. Test camera connections

## Hardware Integration

### Raspberry Pi Setup for Edge Computing

The Raspberry Pi units serve as edge computing devices for preliminary processing, camera control, and sensor integration.

#### Hardware Requirements
- Raspberry Pi 4 Model B with minimum 4GB RAM (8GB recommended)
- High-quality camera module or USB camera (minimum 1080p)
- Thermal camera module (for critical installations)
- GPS module (Neo-6M or better)
- OBD-II to USB adapter
- GPIO sensors as required
- 128GB Class 10 microSD card minimum
- Dedicated power supply with backup
- Weatherproof casing for external installation

#### Setup Instructions

1. Flash Raspberry Pi OS (64-bit Bullseye or newer) to your SD card:
   ```bash
   # On your workstation, download Raspberry Pi Imager and flash the SD card
   # Enable SSH and configure Wi-Fi during the imaging process
   ```

2. Initial system setup:
   ```bash
   # Update the system
   sudo apt update
   sudo apt upgrade -y
   
   # Set GPU memory to at least 128MB
   sudo raspi-config # Navigate to Performance Options > GPU Memory
   
   # Enable camera and I2C interfaces
   sudo raspi-config # Navigate to Interface Options
   ```

3. Install required dependencies:
   ```bash
   sudo apt install -y nodejs npm build-essential python3-pip python3-opencv 
   sudo apt install -y libgstreamer1.0-dev libopenssl-dev libatlas-base-dev
   sudo apt install -y libhdf5-dev libhdf5-serial-dev libopenjp2-7 libtiff5
   
   # Install Node.js 18 or higher
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Python dependencies for AI processing
   pip3 install numpy tensorflow-lite requests pillow paho-mqtt
   ```

4. Install the edge computing client software:
   ```bash
   git clone https://github.com/your-organization/secure-transport-edge.git
   cd secure-transport-edge
   npm install
   ```

5. Configure the client:
   ```bash
   # Copy the example configuration file
   cp config.example.json config.json
   
   # Edit with your specific settings
   nano config.json
   ```

6. Configure the security settings:
   ```bash
   # Generate client certificates for mTLS
   ./scripts/generate-certs.sh
   
   # Set up encrypted storage
   sudo ./scripts/setup-encrypted-storage.sh
   ```

7. Set up autostart services:
   ```bash
   # Install the service
   sudo ./scripts/install-service.sh
   
   # Enable and start the service
   sudo systemctl enable secure-transport-edge
   sudo systemctl start secure-transport-edge
   ```

8. Verify installation and test connectivity:
   ```bash
   # Check service status
   sudo systemctl status secure-transport-edge
   
   # Test connectivity to the main server
   ./scripts/test-connection.sh
   
   # Test camera operation
   ./scripts/test-camera.sh
   ```

#### Configuration Options

Edit `config.json` with the following settings:

```json
{
  "server": {
    "url": "https://your-server-domain.com",
    "apiKey": "your-edge-device-api-key",
    "reconnectInterval": 5000
  },
  "device": {
    "id": "unique-device-id",
    "name": "Vehicle Name/Number",
    "location": "Vehicle Identifier",
    "role": "vehicle-edge-device"
  },
  "camera": {
    "enabled": true,
    "primarySource": "raspberrypi",  // or "usb", "ip"
    "secondarySource": "thermal",
    "resolution": "1920x1080",
    "framerate": 30,
    "rotation": 0
  },
  "sensors": {
    "gps": {
      "enabled": true,
      "port": "/dev/ttyAMA0",
      "baudRate": 9600
    },
    "obd": {
      "enabled": true,
      "port": "/dev/ttyUSB0",
      "protocol": "auto"
    },
    "microphone": {
      "enabled": true,
      "device": "plughw:1,0",
      "sampleRate": 16000
    }
  },
  "ai": {
    "faceDetection": {
      "enabled": true,
      "modelPath": "./models/face_detection.tflite",
      "confidence": 0.7
    },
    "objectDetection": {
      "enabled": true,
      "modelPath": "./models/object_detection.tflite",
      "confidence": 0.6
    },
    "voiceAnalysis": {
      "enabled": true,
      "modelPath": "./models/voice_stress.tflite",
      "threshold": 0.75
    }
  },
  "storage": {
    "localBufferSize": 500,  // MB
    "videoRetention": 3600,  // seconds
    "encryptionEnabled": true
  },
  "network": {
    "primaryInterface": "wlan0",
    "fallbackInterface": "eth0",
    "offlineMode": {
      "enabled": true,
      "syncInterval": 300  // seconds
    }
  }
}
```

## Sensor Hardware Suppliers

### Certification Requirements
- MIL-STD-810G certification for rugged environments
- Integrated thermal + visual fusion capabilities
- South African Bureau of Standards (SABS) certification

### Recommended Vendors
- FLIR Systems (thermal cameras)
- Teledyne FLIR (integrated systems)
- Axis Communications (IP cameras)
- Local South African defense contractors

### Hardware Specifications

#### Camera Systems
- Minimum Resolution: 1080p
- Frame Rate: 30fps minimum
- Night Vision: Required
- Thermal Capability: Required for primary security cameras
- Storage: Local 128GB min + cloud backup
- Connectivity: Wi-Fi, Ethernet, LTE backup

#### OBD Scanners
- Protocol Support: OBD-II with CAN bus
- Bluetooth Connectivity: 5.0 or higher
- Data Rate: 50+ parameters per second
- Advanced Parameters: Engine diagnostics, fuel, battery

#### Microphones
- Type: Omnidirectional
- Frequency Response: 20Hz - 20KHz
- Sensitivity: -30dB minimum
- Noise Cancellation: Required
- Multiple Units: Minimum 2 per vehicle (cabin + cargo area)

## Security Considerations

### Critical Security Requirements

#### Network Security
- All communications between server and clients must use TLS 1.3
- Implement secure WebSockets (WSS) for real-time communications
- Use a VPN for remote administrative access
- Configure firewall rules to allow only necessary traffic
- Implement network segmentation to isolate security components
- Use intrusion detection systems to monitor for suspicious traffic

#### Authentication & Authorization
- Implement multi-factor authentication (MFA) for all administrative access
- Use role-based access control (RBAC) for granular permissions
- Admin sessions must time out after 15 minutes of inactivity
- Failed login attempts must be limited and logged
- Implement OAuth 2.0 or similar for API access
- Audit all authentication events and store logs securely

#### Cryptography & Key Management
- API keys must be rotated every 30 days
- JWT tokens must expire after 24 hours maximum
- Use strong password policies (minimum 12 characters, complexity requirements)
- Implement hardware security modules (HSMs) for critical key storage
- Encryption keys must never be stored in plaintext
- Use AES-256 for symmetric encryption and RSA-2048 or ECC for asymmetric

#### Data Protection
- Enable hardware encryption for all storage devices
- Implement database encryption for sensitive fields
- Implement proper data classification and handling procedures
- Regular security scans to detect exposed sensitive information
- Regular backup procedures with encrypted backups
- Implement data loss prevention (DLP) controls

#### Physical Security
- Use physical security measures for server access (card readers, biometrics)
- Equipment must be housed in secure, monitored facilities
- Implement environmental controls (temperature, humidity, fire suppression)
- Maintain visitor logs and escort policies for server rooms
- Use tamper-evident seals on hardware components
- Implement an asset management system for all hardware

#### Monitoring & Incident Response
- Implement comprehensive security logging and monitoring
- Security events must trigger automated alerts
- Establish an incident response plan and test regularly
- Conduct regular security audits and penetration testing
- Implement automated vulnerability scanning
- Have a documented security breach notification process

#### Edge Device Security
- Edge devices must operate with least privilege principles
- Local storage on edge devices must be encrypted
- Edge devices must authenticate to the central server using certificates
- Edge devices must receive regular security updates
- Implement secure boot procedures where possible
- Remote device wipe capabilities for compromised edge devices

## Troubleshooting

### Common Issues

1. Connection Problems:
   - Verify network connectivity
   - Check firewall settings
   - Ensure PostgreSQL is running

2. Camera Issues:
   - Verify USB/IP connections
   - Check driver installation
   - Test with simple applications like VLC

3. Database Connection:
   - Verify PostgreSQL service is running
   - Check credentials in .env file
   - Test connection with psql command line tool

## Support

For technical support, contact:
- Email: support@securetransport.com
- Phone: +27 11 000 0000
- Hours: Monday-Friday, 8am-6pm SAST