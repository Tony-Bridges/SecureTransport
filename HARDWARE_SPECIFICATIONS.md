# SecureTransport Hardware Specifications

## Sensor Hardware Requirements

### Camera Systems

#### Dual Camera System Configuration
The system utilizes an advanced dual camera setup for comprehensive surveillance and anomaly detection:

1. **Panoramic Camera**
   - **Resolution:** 8MP (4K) minimum
   - **Field of View:** 180° horizontal, 100° vertical
   - **Frame Rate:** 30fps minimum, 60fps in high-risk zones
   - **Night Vision:** IR illumination up to 30m
   - **Housing:** IP67 rated, vandal-proof
   - **Mounting:** Top of vehicle for maximum coverage
   - **Purpose:** Continuous wide-angle monitoring and context awareness
   - **Video Buffer:** Continuous 10-second buffer for incident reconstruction
   - **AI Integration:** Real-time anomaly detection with automated alerting

2. **PTZ Camera with Zoom**
   - **Resolution:** 4K (3840x2160)
   - **Optical Zoom:** 30x minimum
   - **Digital Zoom:** 12x minimum
   - **Pan Range:** 360° continuous
   - **Tilt Range:** -90° to +90°
   - **Presets:** Minimum 256 positions
   - **Control Interface:** ONVIF Profile S compliant
   - **Purpose:** Detailed inspection of detected anomalies
   - **Target Acquisition Time:** <1.5 seconds from anomaly detection
   - **Focus Capabilities:** Auto-focus with manual override option
   - **Remote Control:** Secure remote operation by Incident Management Team

#### Primary Security Cameras
- **Resolution:** 4K (3840x2160)
- **Frame Rate:** 30fps minimum, 60fps recommended
- **Field of View:** 120° horizontal, 90° vertical
- **Night Vision:** IR illumination up to 30m
- **Thermal Capability:** Required
- **Thermal Resolution:** 640x480 minimum
- **Temperature Range:** -40°C to +550°C
- **Housing:** IP67 rated, vandal-proof
- **Certification:** MIL-STD-810G, SABS approved
- **Power:** PoE+ (IEEE 802.3at) or 12V DC
- **Storage:** Local 256GB min (industrial grade SD)
- **Connectivity:** Gigabit Ethernet, optional LTE module
- **Mounting:** Shock-resistant, vibration-dampening
- **Video Buffer:** Continuous 10-second buffer for event reconstruction

#### In-Cabin Monitoring Cameras
- **Resolution:** 1080p minimum
- **Frame Rate:** 30fps
- **Field of View:** 90° horizontal, 65° vertical
- **Low-Light Performance:** 0.01 lux
- **Audio:** Built-in microphone, noise cancellation
- **IR Illumination:** For night monitoring
- **Connectivity:** Ethernet or Wi-Fi
- **Privacy Features:** Encryption, secure firmware
- **Emotion Recognition:** Infrared facial feature monitoring
- **Voice Analysis:** Integrated with audio monitoring system

### FLIR Thermal Imaging Systems
- **Resolution:** 640x480 minimum
- **Sensitivity:** <30mK NETD
- **Temperature Range:** -40°C to +550°C
- **Lens Options:** 13mm (45° FOV), 25mm (25° FOV)
- **Fusion Mode:** MSX® technology (thermal + visual overlay)
- **Video Output:** H.264, H.265
- **Certifications:** MIL-STD-810G, SABS approved
- **Interfaces:** Ethernet/IP, Modbus TCP

### OBD and Vehicle Monitoring
- **OBD Protocol Support:** All OBD-II protocols (SAE J1850 PWM, SAE J1850 VPW, ISO 9141-2, ISO 14230-4, ISO 15765-4)
- **CAN Bus Support:** 250kbit/s, 500kbit/s
- **Data Metrics Monitored:**
  - Engine RPM, temperature, load
  - Vehicle speed, acceleration
  - Fuel level, consumption
  - Battery voltage
  - Doors status
  - Braking system
  - Airbag system status
- **Connectivity:** Bluetooth 5.0, Wi-Fi
- **Data Rate:** 100+ parameters per second
- **Tamper Protection:** Required
- **Housing:** Rugged, concealed installation

### Audio Monitoring System
- **Microphones:** Omnidirectional, high-sensitivity
- **Quantity:** Minimum 4 per vehicle (driver area, guard area, cargo, exterior)
- **Frequency Response:** 20Hz - 20KHz
- **Sensitivity:** -35dB minimum
- **Signal-to-Noise Ratio:** >65dB
- **Noise Cancellation:** Advanced DSP
- **Connection:** Wired, tamper-resistant
- **Processing Capabilities:**
  - Voice stress analysis
  - Gunshot detection
  - Breaking glass detection
  - Panic word recognition

### Millimeter-Wave Weapon Detection System
- **Frequency Range:** 70-80 GHz
- **Scanning Resolution:** 1.5cm at 3 meters
- **Detection Range:** Up to 10 meters
- **Scan Rate:** 10 frames/second minimum
- **Detection Capabilities:**
  - Metallic and non-metallic weapons
  - Concealed firearms (handguns, rifles)
  - Knives and bladed weapons
  - Explosive devices and components
  - Improvised threat devices
- **False Alarm Rate:** <2%
- **Operating Temperature:** -20°C to +55°C
- **Environmental Protection:** IP65 rated
- **Integration:** API for detection alert system
- **ML Integration:** Continuous learning from detection events
- **Processing:** Edge AI with local threat database
- **Power Consumption:** <35W
- **Deployment Locations:**
  - Vehicle entry points
  - Cargo access doors
  - Driver cabin barriers
  - External perimeter (during stops)
- **Image Processing:**
  - 3D reconstruction of detected objects
  - Multiple angle simultaneous scanning
  - Material differentiation capabilities
  - Integrated with facial recognition system
- **Alert System:**
  - Real-time alerts to security personnel
  - Threat level classification (1-5 scale)
  - Automatic PTZ camera targeting of threats
  - Integration with central monitoring system

### Connectivity and Integration
- **Primary Connection:** 4G/LTE with automatic failover
- **Backup Connection:** Satellite communication (Inmarsat/Iridium)
- **Local Networking:** Gigabit Ethernet, Wi-Fi 6
- **Data Encryption:** AES-256
- **VPN Support:** Required for all transmissions
- **Bandwidth Management:** Prioritized for alerts and critical data
- **Offline Mode:** Local storage and processing

## Recommended Vendors and Products

### Thermal Imaging
- **FLIR Systems:**
  - FLIR PT-Series Pan/Tilt
  - FLIR A700-EST Thermal Camera
  - FLIR Duo Pro R Dual Sensor
- **Teledyne FLIR:**
  - Teledyne FLIR Quasar 4K
  - FLIR M364C Marine Camera

### Security Cameras
- **Axis Communications:**
  - AXIS Q1798-LE 4K Camera
  - AXIS Q6215-LE PTZ Network Camera
- **Bosch Security:**
  - DINION IP starlight 8000 MP
  - MIC IP fusion 9000i

### OBD Systems
- **Flight Systems Electronics Group:**
  - OBD-HHTII Pro Heavy Duty Diagnostic Tool
- **Launch Tech:**
  - X-431 PRO5

### Environmental Monitors
- **MSA Safety:**
  - ALTAIR 5X Multigas Detector
  - ALTAIR 4XR Multigas Detector

### Millimeter-Wave Scanning Systems
- **Smiths Detection:**
  - eqo-mmw Personnel Scanner
  - CIP-300 Concealed Items Detector
- **Rohde & Schwarz:**
  - QPS Active Millimeter Wave Scanner
  - QPS201 Security Scanner
- **Liberty Defense:**
  - HEXWAVE Weapon Detection System
- **Thruvision:**
  - TAC Mobile Concealed Threat Detector

### South African Certified Suppliers
- **Saab Grintek Defence:** Integrated security systems
- **Reutech Solutions:** Communication and surveillance
- **Thales South Africa:** Security and monitoring solutions
- **Denel Dynamics:** Specialized monitoring equipment

## Installation Requirements

### Vehicle Installation
- All wiring must be concealed and tamper-resistant
- Primary systems require backup power supply (min 2 hours)
- Camera positioning must eliminate blind spots
- Thermal camera must have clear line of sight
- All systems must be vibration-isolated
- External components must be IP67 rated or higher
- Internal components minimum IP54 rated

#### Dual Camera System Installation
- Panoramic camera must be mounted at highest point of vehicle
- PTZ camera must have 360° unobstructed field of view
- Camera calibration required for accurate zoom targeting
- Both cameras must share unified timestamp system
- Communication latency between cameras <100ms
- Automatic failover between cameras if one malfunctions

#### Millimeter-Wave Scanner Installation
- Scanner units installed at vehicle entry points
- Calibration required for vehicle interior dimensions
- Shielding installed to prevent interference with other systems
- Multiple scanners for complete vehicle coverage
- Integration with alert system required
- Regular scanning pattern programmed and automated

### Maintenance Access
- Service panels must be secured with tamper-evident seals
- Diagnostic ports must be password protected
- All firmware updates must be cryptographically signed
- Regular recalibration schedule for thermal cameras (6 months)

## Certification Requirements
- MIL-STD-810G for environmental durability
- South African Bureau of Standards (SABS) certification required for all components
- CISPR 22/EN 55022 Class B for EMC compliance
- IEC 60950-1 for electrical safety
- FIPS 140-2 Level 2 for cryptographic modules

## Integration Support

Custom integration solutions are available for:
- Command center integration
- Police/emergency services direct feeds
- Insurance company monitoring
- Fleet management systems

For technical specifications or integration questions, contact our hardware integration team at hardware@securetransport.com