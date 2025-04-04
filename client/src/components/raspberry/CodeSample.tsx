import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CodeSample() {
  return (
    <Tabs defaultValue="main">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="main">main.py</TabsTrigger>
        <TabsTrigger value="camera">camera.py</TabsTrigger>
        <TabsTrigger value="obd">obd_scanner.py</TabsTrigger>
        <TabsTrigger value="facial">facial_recognition.py</TabsTrigger>
      </TabsList>
      
      <TabsContent value="main">
        <ScrollArea className="h-96 w-full rounded-md border bg-muted p-4">
          <pre className="font-mono text-sm">
{`#!/usr/bin/env python3
# SecureTransport Raspberry Pi Control System
# Main controller for vehicle security monitoring

import time
import json
import logging
import threading
import requests
import argparse
from datetime import datetime
from camera import CameraSystem
from obd_scanner import OBDScanner
from facial_recognition import FacialRecognition
from voice_analysis import VoiceAnalyzer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("secure_transport.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("SecureTransport")

class SecureTransportSystem:
    def __init__(self, vehicle_id, server_url):
        self.vehicle_id = vehicle_id
        self.server_url = server_url
        self.running = False
        self.api_key = None
        self.heartbeat_interval = 30  # seconds
        
        # Initialize subsystems
        logger.info(f"Initializing SecureTransport system for vehicle {vehicle_id}")
        self.camera_system = CameraSystem(vehicle_id)
        self.obd_scanner = OBDScanner(vehicle_id)
        self.facial_recognition = FacialRecognition(vehicle_id)
        self.voice_analyzer = VoiceAnalyzer(vehicle_id)
        
        # System status
        self.system_status = {
            "vehicle_id": vehicle_id,
            "camera_status": "initializing",
            "obd_status": "initializing",
            "facial_status": "initializing",
            "voice_status": "initializing",
            "last_update": datetime.now().isoformat()
        }
        
    def authenticate(self):
        """Authenticate with the central server"""
        try:
            logger.info("Authenticating with central server")
            response = requests.post(
                f"{self.server_url}/api/devices/authenticate",
                json={"vehicle_id": self.vehicle_id}
            )
            if response.status_code == 200:
                data = response.json()
                self.api_key = data.get("api_key")
                logger.info("Authentication successful")
                return True
            else:
                logger.error(f"Authentication failed: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return False
    
    def start(self):
        """Start all monitoring systems"""
        if not self.authenticate():
            logger.error("Cannot start without authentication")
            return False
        
        logger.info("Starting SecureTransport monitoring systems")
        self.running = True
        
        # Start subsystems
        self.camera_system.start()
        self.obd_scanner.start()
        self.facial_recognition.start()
        self.voice_analyzer.start()
        
        # Start monitoring threads
        threading.Thread(target=self._heartbeat_thread, daemon=True).start()
        threading.Thread(target=self._data_upload_thread, daemon=True).start()
        
        logger.info("All systems started successfully")
        return True
    
    def stop(self):
        """Stop all monitoring systems"""
        logger.info("Stopping SecureTransport monitoring systems")
        self.running = False
        
        # Stop subsystems
        self.camera_system.stop()
        self.obd_scanner.stop()
        self.facial_recognition.stop()
        self.voice_analyzer.stop()
        
        logger.info("All systems stopped")
    
    def _heartbeat_thread(self):
        """Send regular heartbeats to the central server"""
        while self.running:
            try:
                self._update_status()
                requests.post(
                    f"{self.server_url}/api/devices/heartbeat",
                    json=self.system_status,
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                logger.debug("Heartbeat sent")
            except Exception as e:
                logger.error(f"Heartbeat error: {str(e)}")
            
            time.sleep(self.heartbeat_interval)
    
    def _data_upload_thread(self):
        """Upload detection data to the central server"""
        while self.running:
            try:
                # Get data from subsystems
                camera_data = self.camera_system.get_latest_data()
                obd_data = self.obd_scanner.get_latest_data()
                facial_data = self.facial_recognition.get_latest_data()
                voice_data = self.voice_analyzer.get_latest_data()
                
                # Combine data
                payload = {
                    "vehicle_id": self.vehicle_id,
                    "timestamp": datetime.now().isoformat(),
                    "camera_data": camera_data,
                    "obd_data": obd_data,
                    "facial_data": facial_data,
                    "voice_data": voice_data
                }
                
                # Send data to server
                response = requests.post(
                    f"{self.server_url}/api/telemetry",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                
                if response.status_code != 200:
                    logger.warning(f"Data upload failed: {response.text}")
                    
            except Exception as e:
                logger.error(f"Data upload error: {str(e)}")
                
            # Upload every 5 seconds
            time.sleep(5)
    
    def _update_status(self):
        """Update system status from all subsystems"""
        self.system_status = {
            "vehicle_id": self.vehicle_id,
            "camera_status": self.camera_system.get_status(),
            "obd_status": self.obd_scanner.get_status(),
            "facial_status": self.facial_recognition.get_status(),
            "voice_status": self.voice_analyzer.get_status(),
            "last_update": datetime.now().isoformat()
        }
        
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='SecureTransport Monitoring System')
    parser.add_argument('--vehicle-id', required=True, help='Vehicle ID')
    parser.add_argument('--server', default='https://api.securetransport.com', help='Server URL')
    
    args = parser.parse_args()
    
    system = SecureTransportSystem(args.vehicle_id, args.server)
    
    try:
        if system.start():
            logger.info("System running. Press CTRL+C to stop.")
            # Keep the main thread alive
            while system.running:
                time.sleep(1)
        else:
            logger.error("Failed to start the system")
    except KeyboardInterrupt:
        logger.info("Shutdown requested")
    finally:
        system.stop()
        logger.info("System shutdown complete")
`}</pre>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="camera">
        <ScrollArea className="h-96 w-full rounded-md border bg-muted p-4">
          <pre className="font-mono text-sm">
{`#!/usr/bin/env python3
# Camera monitoring system for SecureTransport

import cv2
import time
import logging
import threading
import numpy as np
from queue import Queue
from datetime import datetime

logger = logging.getLogger("SecureTransport.Camera")

class CameraSystem:
    def __init__(self, vehicle_id):
        self.vehicle_id = vehicle_id
        self.running = False
        self.status = "initializing"
        
        # Camera settings
        self.panoramic_camera_index = 0  # Panoramic camera
        self.zoom_camera_index = 1       # Zoom camera
        
        # Detection queues
        self.detection_queue = Queue(maxsize=100)
        self.latest_data = {
            "timestamp": datetime.now().isoformat(),
            "detections": [],
            "anomalies_detected": False
        }
        
        # Initialize weapon detection model
        self.load_detection_models()
        
        logger.info("Camera system initialized")
        
    def load_detection_models(self):
        """Load ML models for object detection"""
        try:
            # In a real implementation, load actual ML models here
            # For this example, we'll simulate model loading
            logger.info("Loading weapon detection models")
            time.sleep(2)  # Simulate loading time
            self.detection_model_loaded = True
            logger.info("Weapon detection models loaded successfully")
        except Exception as e:
            logger.error(f"Error loading detection models: {str(e)}")
            self.detection_model_loaded = False
            
    def start(self):
        """Start the camera monitoring system"""
        if self.running:
            return
            
        logger.info("Starting camera system")
        self.running = True
        
        # Start camera threads
        threading.Thread(target=self._panoramic_camera_thread, daemon=True).start()
        threading.Thread(target=self._zoom_camera_thread, daemon=True).start()
        threading.Thread(target=self._detection_processor_thread, daemon=True).start()
        
        self.status = "active"
        logger.info("Camera system started")
        
    def stop(self):
        """Stop the camera monitoring system"""
        logger.info("Stopping camera system")
        self.running = False
        self.status = "inactive"
        # Allow threads time to clean up
        time.sleep(1)
        logger.info("Camera system stopped")
        
    def get_status(self):
        """Get the current status of the camera system"""
        return self.status
        
    def get_latest_data(self):
        """Get the latest detection data"""
        return self.latest_data
        
    def _panoramic_camera_thread(self):
        """Thread to process panoramic camera feed"""
        logger.info("Starting panoramic camera thread")
        
        try:
            # In a real implementation, connect to actual camera here
            # For simulation, we'll just generate dummy frames
            frame_count = 0
            
            while self.running:
                # Simulate capturing a frame
                frame_count += 1
                
                # Every 30 frames, detect something interesting
                if frame_count % 30 == 0:
                    # Simulate detection of something interesting
                    detection = {
                        "type": "movement",
                        "confidence": 0.85,
                        "bounding_box": [0.2, 0.3, 0.4, 0.5],
                        "timestamp": datetime.now().isoformat(),
                        "camera": "panoramic"
                    }
                    self.detection_queue.put(detection)
                
                # Process at 10 FPS (simulate)
                time.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Panoramic camera error: {str(e)}")
            self.status = "error"
        finally:
            logger.info("Panoramic camera thread stopped")
            
    def _zoom_camera_thread(self):
        """Thread to process zoom camera feed"""
        logger.info("Starting zoom camera thread")
        
        try:
            # In a real implementation, connect to actual camera here
            # For simulation, we'll just generate dummy frames
            frame_count = 0
            
            while self.running:
                # Simulate capturing a frame
                frame_count += 1
                
                # Every 50 frames, detect a weapon
                if frame_count % 50 == 0:
                    # Simulate weapon detection
                    detection = {
                        "type": "weapon",
                        "confidence": 0.92,
                        "bounding_box": [0.4, 0.4, 0.6, 0.7],
                        "timestamp": datetime.now().isoformat(),
                        "camera": "zoom",
                        "weapon_type": "handgun"
                    }
                    self.detection_queue.put(detection)
                
                # Process at 10 FPS (simulate)
                time.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Zoom camera error: {str(e)}")
            self.status = "error"
        finally:
            logger.info("Zoom camera thread stopped")
            
    def _detection_processor_thread(self):
        """Process detections from the queue"""
        logger.info("Starting detection processor thread")
        
        detections_buffer = []
        last_update_time = time.time()
        
        try:
            while self.running:
                # Process detections from the queue
                try:
                    # Non-blocking get with timeout
                    detection = self.detection_queue.get(timeout=0.5)
                    detections_buffer.append(detection)
                    
                    # Log high-confidence weapon detections
                    if detection.get("type") == "weapon" and detection.get("confidence", 0) > 0.8:
                        logger.warning(f"HIGH CONFIDENCE WEAPON DETECTED: {detection}")
                    
                    self.detection_queue.task_done()
                except Exception:
                    # Queue empty or timeout, continue
                    pass
                
                # Update latest data every second
                current_time = time.time()
                if current_time - last_update_time >= 1.0:
                    # Check for serious anomalies (weapons)
                    anomalies_detected = any(
                        d.get("type") == "weapon" and d.get("confidence", 0) > 0.7 
                        for d in detections_buffer
                    )
                    
                    # Update latest data
                    self.latest_data = {
                        "timestamp": datetime.now().isoformat(),
                        "detections": detections_buffer.copy(),
                        "anomalies_detected": anomalies_detected
                    }
                    
                    # Clear buffer after updating
                    detections_buffer = []
                    last_update_time = current_time
                
        except Exception as e:
            logger.error(f"Detection processor error: {str(e)}")
        finally:
            logger.info("Detection processor thread stopped")
`}</pre>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="obd">
        <ScrollArea className="h-96 w-full rounded-md border bg-muted p-4">
          <pre className="font-mono text-sm">
{`#!/usr/bin/env python3
# OBD Scanner for SecureTransport

import time
import random
import logging
import threading
from datetime import datetime

# In a real implementation, you would use:
# import obd
# from obd import OBDCommand, OBDStatus

logger = logging.getLogger("SecureTransport.OBD")

class OBDScanner:
    def __init__(self, vehicle_id):
        self.vehicle_id = vehicle_id
        self.running = False
        self.status = "initializing"
        self.connection = None
        
        # Data storage
        self.latest_data = {
            "timestamp": datetime.now().isoformat(),
            "engine_status": "Unknown",
            "speed": 0,
            "rpm": 0,
            "fuel_level": 0,
            "temperature": 0,
            "door_status": {
                "driver": "closed",
                "passenger": "closed",
                "rear_left": "closed",
                "rear_right": "closed"
            },
            "location": {
                "latitude": 0,
                "longitude": 0,
                "accuracy": 0
            }
        }
        
        logger.info("OBD scanner initialized")
        
    def connect(self):
        """Connect to OBD scanner"""
        try:
            # In a real implementation, connect to actual OBD interface
            # connection = obd.OBD() # auto-connects to USB or RF port
            
            # For this example, we'll simulate a connection
            logger.info("Connecting to OBD interface")
            time.sleep(1)  # Simulate connection time
            self.connection = "SIMULATED"
            logger.info("Connected to OBD interface")
            return True
        except Exception as e:
            logger.error(f"Error connecting to OBD interface: {str(e)}")
            return False
            
    def start(self):
        """Start the OBD scanner"""
        if self.running:
            return
            
        logger.info("Starting OBD scanner")
        if not self.connect():
            self.status = "error"
            logger.error("Failed to start OBD scanner: Connection failed")
            return
        
        self.running = True
        
        # Start OBD data thread
        threading.Thread(target=self._obd_data_thread, daemon=True).start()
        
        self.status = "connected"
        logger.info("OBD scanner started")
        
    def stop(self):
        """Stop the OBD scanner"""
        logger.info("Stopping OBD scanner")
        self.running = False
        self.status = "disconnected"
        
        # In a real implementation:
        # if self.connection:
        #     self.connection.close()
        
        logger.info("OBD scanner stopped")
        
    def get_status(self):
        """Get the current status of the OBD scanner"""
        return self.status
        
    def get_latest_data(self):
        """Get the latest OBD data"""
        return self.latest_data
        
    def _obd_data_thread(self):
        """Thread to gather OBD data"""
        logger.info("Starting OBD data thread")
        
        try:
            # Simulate initial vehicle state
            engine_running = True
            speed = 0
            rpm = 800
            fuel_level = 75
            engine_temp = 90
            latitude = -26.1052
            longitude = 28.0560
            
            while self.running:
                # Simulate engine running, change values realistically
                if engine_running:
                    # Randomly adjust speed (with limits)
                    speed_change = random.uniform(-5, 5)
                    speed = max(0, min(120, speed + speed_change))
                    
                    # RPM correlates somewhat with speed
                    if speed == 0:
                        rpm = random.uniform(750, 850)
                    else:
                        rpm = 800 + (speed * 25) + random.uniform(-200, 200)
                    
                    # Slowly decrease fuel
                    fuel_level = max(0, fuel_level - random.uniform(0, 0.1))
                    
                    # Engine temp varies slightly
                    engine_temp = min(110, engine_temp + random.uniform(-1, 1))
                    
                    # Update location (simulate moving)
                    latitude += random.uniform(-0.0001, 0.0001)
                    longitude += random.uniform(-0.0001, 0.0001)
                
                # 0.1% chance to simulate door opening
                door_event = random.random() < 0.001
                door_status = dict(self.latest_data["door_status"])
                if door_event:
                    doors = ["driver", "passenger", "rear_left", "rear_right"]
                    random_door = random.choice(doors)
                    door_status[random_door] = "open" if door_status[random_door] == "closed" else "closed"
                
                # Update latest data
                self.latest_data = {
                    "timestamp": datetime.now().isoformat(),
                    "engine_status": "Running" if engine_running else "Off",
                    "speed": round(speed, 1),
                    "rpm": round(rpm),
                    "fuel_level": round(fuel_level, 1),
                    "temperature": round(engine_temp, 1),
                    "door_status": door_status,
                    "location": {
                        "latitude": round(latitude, 6),
                        "longitude": round(longitude, 6),
                        "accuracy": 5.0
                    }
                }
                
                # Randomly shut off engine (0.5% chance each iteration)
                if random.random() < 0.005:
                    engine_running = not engine_running
                    if engine_running:
                        logger.info("Engine started")
                    else:
                        logger.info("Engine stopped")
                        speed = 0
                        rpm = 0
                
                # Update every 1 second
                time.sleep(1)
                
        except Exception as e:
            logger.error(f"OBD data thread error: {str(e)}")
            self.status = "error"
        finally:
            logger.info("OBD data thread stopped")
`}</pre>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="facial">
        <ScrollArea className="h-96 w-full rounded-md border bg-muted p-4">
          <pre className="font-mono text-sm">
{`#!/usr/bin/env python3
# Facial Recognition System for SecureTransport

import time
import random
import logging
import threading
import numpy as np
from datetime import datetime
from collections import defaultdict

logger = logging.getLogger("SecureTransport.Facial")

class FacialRecognition:
    def __init__(self, vehicle_id):
        self.vehicle_id = vehicle_id
        self.running = False
        self.status = "initializing"
        
        # Model settings
        self.detection_confidence_threshold = 0.7
        self.recognition_confidence_threshold = 0.8
        
        # Face database (in production this would be loaded from a file or server)
        self.known_faces = {
            "authorized": [  # Authorized personnel
                {"id": "auth1", "name": "Driver 1", "role": "driver"},
                {"id": "auth2", "name": "Guard 1", "role": "guard"},
                {"id": "auth3", "name": "Security Officer", "role": "supervisor"}
            ],
            "flagged": [  # Persons of interest, security risks
                {"id": "flag1", "name": "Suspect 1", "threat_level": "high"},
                {"id": "flag2", "name": "Suspect 2", "threat_level": "medium"}
            ]
        }
        
        # Face tracking across location/time
        self.face_location_history = defaultdict(list)
        
        # Latest data storage
        self.latest_data = {
            "timestamp": datetime.now().isoformat(),
            "faces_detected": 0,
            "authorized_personnel": [],
            "unknown_faces": 0,
            "flagged_faces": [],
            "multiple_location_faces": []
        }
        
        # Load ML models
        self._load_models()
        
        logger.info("Facial recognition system initialized")
        
    def _load_models(self):
        """Load facial detection and recognition models"""
        try:
            # In a real implementation, load actual ML models here
            # For this example, we'll simulate model loading
            logger.info("Loading facial recognition models")
            time.sleep(2)  # Simulate loading time
            self.models_loaded = True
            logger.info("Facial recognition models loaded successfully")
        except Exception as e:
            logger.error(f"Error loading facial recognition models: {str(e)}")
            self.models_loaded = False
        
    def start(self):
        """Start the facial recognition system"""
        if self.running:
            return
            
        if not self.models_loaded:
            logger.error("Cannot start facial recognition: Models not loaded")
            self.status = "error"
            return
            
        logger.info("Starting facial recognition system")
        self.running = True
        
        # Start processing threads
        threading.Thread(target=self._facial_processing_thread, daemon=True).start()
        threading.Thread(target=self._location_tracking_thread, daemon=True).start()
        
        self.status = "active"
        logger.info("Facial recognition system started")
        
    def stop(self):
        """Stop the facial recognition system"""
        logger.info("Stopping facial recognition system")
        self.running = False
        self.status = "inactive"
        logger.info("Facial recognition system stopped")
        
    def get_status(self):
        """Get the current status of the facial recognition system"""
        return self.status
        
    def get_latest_data(self):
        """Get the latest facial recognition data"""
        return self.latest_data
        
    def _facial_processing_thread(self):
        """Thread to process facial recognition data"""
        logger.info("Starting facial processing thread")
        
        try:
            # In a real implementation, this would process camera frames
            # For simulation, we'll generate mock detections
            
            while self.running:
                # Simulate processing camera frames
                
                # 20% chance to detect faces in a frame
                if random.random() < 0.2:
                    # Simulate detecting 0-3 faces
                    num_faces = random.randint(0, 3)
                    
                    authorized_personnel = []
                    unknown_count = 0
                    flagged_faces = []
                    
                    # Process each detected face
                    for i in range(num_faces):
                        # Generate a random face ID for tracking
                        face_id = f"face_{random.randint(1, 100)}"
                        
                        # 60% chance it's an authorized person
                        if random.random() < 0.6 and self.known_faces["authorized"]:
                            person = random.choice(self.known_faces["authorized"])
                            authorized_personnel.append({
                                "id": person["id"],
                                "name": person["name"],
                                "role": person["role"],
                                "confidence": round(random.uniform(0.8, 0.99), 2)
                            })
                            
                            # Track this face's location
                            self._record_face_location(person["id"])
                            
                        # 10% chance it's a flagged person    
                        elif random.random() < 0.1 and self.known_faces["flagged"]:
                            person = random.choice(self.known_faces["flagged"])
                            flagged_faces.append({
                                "id": person["id"],
                                "name": person["name"],
                                "threat_level": person["threat_level"],
                                "confidence": round(random.uniform(0.75, 0.95), 2)
                            })
                            
                            # Track this face's location
                            self._record_face_location(person["id"])
                            
                            # Log flagged face detection
                            logger.warning(f"Flagged face detected: {person['name']}, threat level: {person['threat_level']}")
                            
                        # Otherwise it's unknown
                        else:
                            unknown_count += 1
                            
                            # Track this unknown face
                            self._record_face_location(face_id)
                    
                    # Update latest data with this frame's detections
                    self.latest_data.update({
                        "timestamp": datetime.now().isoformat(),
                        "faces_detected": num_faces,
                        "authorized_personnel": authorized_personnel,
                        "unknown_faces": unknown_count,
                        "flagged_faces": flagged_faces
                    })
                
                # Process at 5 FPS (simulate)
                time.sleep(0.2)
                
        except Exception as e:
            logger.error(f"Facial processing error: {str(e)}")
            self.status = "error"
        finally:
            logger.info("Facial processing thread stopped")
    
    def _record_face_location(self, face_id):
        """Record a face being detected at the current location"""
        # In a real implementation, we would get actual GPS coordinates
        # For simulation, we'll generate random coordinates near Johannesburg
        
        # Generate random coordinates (roughly Johannesburg area)
        latitude = -26.2041 + random.uniform(-0.2, 0.2)
        longitude = 28.0473 + random.uniform(-0.2, 0.2)
        
        # Record timestamp and location
        self.face_location_history[face_id].append({
            "timestamp": datetime.now().isoformat(),
            "location": {
                "latitude": round(latitude, 6),
                "longitude": round(longitude, 6)
            }
        })
        
        # Keep only last 10 sightings per face
        if len(self.face_location_history[face_id]) > 10:
            self.face_location_history[face_id].pop(0)
    
    def _location_tracking_thread(self):
        """Thread to track faces across multiple locations"""
        logger.info("Starting location tracking thread")
        
        try:
            while self.running:
                # Find faces that have been seen in multiple locations
                multi_location_faces = []
                
                for face_id, locations in self.face_location_history.items():
                    if len(locations) >= 2:
                        # Check if locations are sufficiently different
                        # (In a real implementation, use proper distance calculation)
                        unique_locations = set()
                        for loc in locations:
                            lat = round(loc["location"]["latitude"], 2)
                            lon = round(loc["location"]["longitude"], 2)
                            unique_locations.add((lat, lon))
                        
                        if len(unique_locations) >= 2:
                            # This face has been seen in multiple distinct locations
                            
                            # Find name if it's a known face
                            name = "Unknown"
                            face_type = "unknown"
                            
                            # Check authorized people
                            for person in self.known_faces["authorized"]:
                                if person["id"] == face_id:
                                    name = person["name"]
                                    face_type = "authorized"
                                    break
                                    
                            # Check flagged people
                            for person in self.known_faces["flagged"]:
                                if person["id"] == face_id:
                                    name = person["name"]
                                    face_type = "flagged"
                                    break
                            
                            multi_location_faces.append({
                                "id": face_id,
                                "name": name,
                                "type": face_type,
                                "location_count": len(unique_locations),
                                "last_seen": locations[-1]["timestamp"]
                            })
                
                # Update latest data with multi-location faces
                self.latest_data.update({
                    "multiple_location_faces": multi_location_faces
                })
                
                # Check every 10 seconds
                time.sleep(10)
                
        except Exception as e:
            logger.error(f"Location tracking error: {str(e)}")
        finally:
            logger.info("Location tracking thread stopped")
`}</pre>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}