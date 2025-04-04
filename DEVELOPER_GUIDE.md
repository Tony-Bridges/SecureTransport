# SecureTransport Platform Developer Guide

## Introduction

This Developer Guide provides comprehensive information for software engineers, system integrators, and technical teams who need to extend, customize, or integrate with the SecureTransport platform. It covers API usage, event system integration, plugin development, custom module creation, and advanced technical details of the platform architecture.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Environment Setup](#development-environment-setup)
3. [API Reference](#api-reference)
4. [Event System](#event-system)
5. [Plugin Development](#plugin-development)
6. [Custom Module Development](#custom-module-development)
7. [Frontend Customization](#frontend-customization)
8. [Database Schema](#database-schema)
9. [Testing Framework](#testing-framework)
10. [Security Requirements](#security-requirements)
11. [Performance Optimization](#performance-optimization)
12. [DevOps Integration](#devops-integration)
13. [Localization](#localization)
14. [Troubleshooting Development Issues](#troubleshooting-development-issues)
15. [Best Practices](#best-practices)

## Architecture Overview

### System Architecture

The SecureTransport platform is built as a modern, scalable application with the following architectural components:

1. **Frontend Layer**
   - React-based SPA using modern JavaScript (ES6+)
   - Redux for state management
   - TanStack Query for data fetching and caching
   - WebSocket connections for real-time updates
   - Modular component architecture

2. **API Layer**
   - RESTful API for CRUD operations
   - GraphQL API for complex data requests
   - WebSocket API for real-time data exchange
   - JWT-based authentication
   - Role-based authorization

3. **Business Logic Layer**
   - Modular service architecture
   - Event-driven communication
   - Pluggable processing pipeline
   - Extensible business rules engine
   - Queue-based task processing

4. **Data Layer**
   - PostgreSQL database with PostGIS extensions
   - Redis for caching and real-time data
   - Distributed file storage for media
   - Time-series database for telemetry data
   - Encryption for sensitive data

5. **Integration Layer**
   - Webhook support for external triggers
   - Messaging queues for asynchronous processing
   - SAML/OAuth for identity federation
   - Standard protocol adapters (MQTT, REST, GraphQL)
   - Custom integration plugins

### Component Dependencies

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │   API Gateway   │      │ Authentication  │
│   Application   │─────▶│   & Services    │─────▶│   Service       │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                        │                        │
        │                        ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  WebSocket      │      │  Core Services  │      │  User Service   │
│  Server         │◀────▶│  & Business     │─────▶│  & Permissions  │
└─────────────────┘      │  Logic          │      └─────────────────┘
                         └─────────────────┘              │
                                  │                        │
                                  ▼                        ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  File Storage   │◀────▶│  Database       │◀────▶│  Cache          │
│  Service        │      │  Layer          │      │  Service        │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Integration    │
                         │  Services       │
                         └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  External       │
                         │  Systems        │
                         └─────────────────┘
```

### Technology Stack

- **Frontend**: React, Redux, TanStack Query, WebSockets, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Redis, WebSockets
- **AI Processing**: TensorFlow, PyTorch, OpenCV (via dedicated services)
- **Geospatial**: PostGIS, Mapbox/Leaflet, GeoJSON
- **DevOps**: Docker, Kubernetes, CI/CD pipelines, Prometheus, Grafana
- **Security**: JWT, OAuth 2.0, TLS 1.3, AES-256 encryption

## Development Environment Setup

### Prerequisites

- Node.js v18.x or higher
- PostgreSQL 14 or higher with PostGIS extensions
- Redis 6.x or higher
- Git
- Docker and Docker Compose (for containerized development)
- Python 3.9+ (for AI service development)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-organization/secure-transport.git
   cd secure-transport
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create local environment configuration:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   ```

4. **Set up the database:**
   ```bash
   # Create local database
   createdb secure_transport_dev
   
   # Enable PostGIS extension
   psql -d secure_transport_dev -c "CREATE EXTENSION postgis;"
   
   # Run migrations
   npm run migrate
   
   # Seed development data
   npm run seed:dev
   ```

5. **Start the development server:**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individual components
   npm run dev:api     # API services only
   npm run dev:client  # Frontend only
   npm run dev:worker  # Background workers only
   ```

6. **Access the application:**
   - Frontend: http://localhost:5000
   - API documentation: http://localhost:5000/api-docs
   - GraphQL playground: http://localhost:5000/graphql

### Docker Development Environment

For containerized development:

1. **Build and start containers:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. **Initialize database:**
   ```bash
   docker-compose -f docker-compose.dev.yml exec api npm run migrate
   docker-compose -f docker-compose.dev.yml exec api npm run seed:dev
   ```

3. **Access services:**
   - Frontend: http://localhost:5000
   - API documentation: http://localhost:5000/api-docs
   - PostgreSQL: localhost:5432 (username: postgres, password: defined in docker-compose.dev.yml)
   - Redis: localhost:6379

## API Reference

### REST API

The SecureTransport platform provides a comprehensive REST API for CRUD operations and system integration.

#### Authentication

All API requests (except public endpoints) require authentication:

```
Authorization: Bearer <jwt_token>
```

To obtain a token:

```
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "secure_password"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": 123,
    "username": "user@example.com",
    "role": "security_manager",
    "permissions": [...]
  }
}
```

#### API Resource Categories

1. **Authentication & Users**
   - `/api/auth/login`
   - `/api/auth/refresh`
   - `/api/auth/me`
   - `/api/users`
   - `/api/users/:id`

2. **Vehicles & Assignments**
   - `/api/vehicles`
   - `/api/vehicles/:id`
   - `/api/vehicles/:id/status`
   - `/api/vehicle-assignments`
   - `/api/vehicle-assignments/:id`

3. **Telemetry & Tracking**
   - `/api/telemetry`
   - `/api/telemetry/:vehicleId`
   - `/api/routes`
   - `/api/routes/:id`

4. **Alerts & Detections**
   - `/api/alerts`
   - `/api/alerts/:id`
   - `/api/alerts/:id/acknowledge`
   - `/api/alerts/escalate`
   - `/api/detections`
   - `/api/detections/:id`

5. **Risk Analysis**
   - `/api/risk-zones`
   - `/api/risk-zones/:id`
   - `/api/analytics/hotspots`
   - `/api/analytics/predictions`

6. **Voice & Emotion Analysis**
   - `/api/voice/analyze`
   - `/api/voice/thresholds`
   - `/api/emotion/analyze`
   - `/api/emotion/thresholds`

7. **System Administration**
   - `/api/system/health`
   - `/api/system/logs`
   - `/api/system/settings`
   - `/api/system/backup`

#### API Request Examples

**Creating a new vehicle:**

```http
POST /api/vehicles
Content-Type: application/json
Authorization: Bearer <token>

{
  "vehicleId": "V-123456",
  "name": "Transport Van 1",
  "type": "armored_van",
  "status": "active",
  "licensePlate": "ABC-123",
  "capacity": 2500,
  "manufacturer": "Mercedes-Benz",
  "model": "Sprinter",
  "year": 2023,
  "vin": "1HGCM82633A123456"
}
```

**Retrieving alerts:**

```http
GET /api/alerts?vehicleId=V-123456&status=active&limit=10
Authorization: Bearer <token>
```

**Updating vehicle status:**

```http
PATCH /api/vehicles/5/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "maintenance",
  "reason": "Scheduled service"
}
```

### GraphQL API

For complex data requirements, use the GraphQL API endpoint at `/graphql`.

**Example queries:**

```graphql
# Get vehicle with assignments and recent alerts
query GetVehicleDetails($id: ID!) {
  vehicle(id: $id) {
    id
    vehicleId
    name
    status
    licensePlate
    location {
      latitude
      longitude
      timestamp
    }
    assignments {
      id
      userId
      user {
        id
        name
        role
      }
      isActive
      assignedAt
    }
    alerts(limit: 5, status: "active") {
      id
      type
      severity
      createdAt
      location {
        latitude
        longitude
      }
      acknowledged
    }
  }
}

# Get risk zones with metadata
query GetRiskZones($severity: [String!]) {
  riskZones(severity: $severity) {
    id
    centroid {
      latitude
      longitude
    }
    radius
    severity
    riskScore
    metadata {
      incidentCount
      lastIncidentDate
      crimeTypes
      timeOfDayAnalysis {
        morning
        afternoon
        evening
        night
      }
    }
  }
}
```

**Example mutations:**

```graphql
# Acknowledge an alert
mutation AcknowledgeAlert($id: ID!, $notes: String) {
  acknowledgeAlert(id: $id, notes: $notes) {
    id
    acknowledged
    acknowledgedAt
    acknowledgedBy {
      id
      name
    }
    notes
  }
}

# Create a vehicle assignment
mutation CreateAssignment($input: AssignmentInput!) {
  createVehicleAssignment(input: $input) {
    id
    vehicle {
      id
      name
    }
    user {
      id
      name
    }
    isActive
    assignedAt
  }
}
```

### WebSocket API

The WebSocket API provides real-time updates for critical system events.

#### Connection

Connect to the WebSocket endpoint with authentication:

```javascript
const socket = new WebSocket('wss://your-server/ws');

// Authentication after connection
socket.onopen = () => {
  socket.send(JSON.stringify({
    type: 'authenticate',
    token: 'your-jwt-token'
  }));
};
```

#### Message Types

1. **Client to Server**
   - `authenticate`: Send authentication token
   - `subscribe`: Subscribe to specific channels
   - `unsubscribe`: Unsubscribe from channels
   - `ping`: Connection keepalive

2. **Server to Client**
   - `authentication_result`: Authentication success/failure
   - `subscription_result`: Subscription success/failure
   - `vehicle_update`: Vehicle status or location change
   - `alert`: New alert created
   - `detection`: New detection event
   - `telemetry`: Telemetry data update
   - `system`: System status messages

#### Subscription Example

```javascript
// Subscribe to vehicle updates and alerts
socket.send(JSON.stringify({
  type: 'subscribe',
  channels: [
    'vehicle:V-123456',
    'alerts:all',
    'system:health'
  ]
}));

// Handle incoming messages
socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'vehicle_update':
      // Update vehicle on map
      updateVehicleMarker(data.payload);
      break;
    case 'alert':
      // Display new alert
      showAlertNotification(data.payload);
      break;
    case 'system':
      // Handle system message
      updateSystemStatus(data.payload);
      break;
  }
};
```

## Event System

The SecureTransport platform uses an event-driven architecture for loosely coupled communication between system components.

### Event Types

1. **Domain Events**: Represent business domain changes
   - `vehicle.created`
   - `vehicle.status_changed`
   - `alert.created`
   - `alert.acknowledged`
   - `detection.created`
   - `route.created`
   - `assignment.created`

2. **Integration Events**: For cross-service communication
   - `telemetry.updated`
   - `risk_zone.updated`
   - `system.health_changed`
   - `analysis.completed`

3. **User Events**: Related to user actions
   - `user.logged_in`
   - `user.created`
   - `user.permission_changed`
   - `user.action_performed`

### Event Structure

Events follow a standard structure:

```typescript
interface Event<T> {
  id: string;           // Unique event identifier
  type: string;         // Event type
  timestamp: string;    // ISO timestamp
  version: number;      // Event schema version
  source: string;       // Source service
  payload: T;           // Event data
  metadata?: {          // Optional metadata
    correlationId?: string;
    userId?: number;
    ip?: string;
  };
}
```

### Publishing Events

Using the event service:

```typescript
import { eventService } from '@services/event.service';

// Publish a domain event
await eventService.publish({
  type: 'alert.created',
  source: 'alert-service',
  payload: {
    id: alert.id,
    vehicleId: alert.vehicleId,
    type: alert.type,
    severity: alert.severity,
    location: alert.location,
    timestamp: alert.createdAt
  }
});
```

### Subscribing to Events

```typescript
import { eventService } from '@services/event.service';

// Subscribe to events
eventService.subscribe('alert.created', async (event) => {
  // Process the alert creation event
  await notificationService.sendAlertNotification(event.payload);
  await analyticsService.processNewAlert(event.payload);
});

// Subscribe with pattern matching
eventService.subscribe('vehicle.*', async (event) => {
  // Handle all vehicle events
  console.log(`Vehicle event received: ${event.type}`);
});
```

### Event Persistence

Events are persisted for:
- Audit trail
- Event sourcing capabilities
- Replay and recovery
- Analytics and reporting

## Plugin Development

The SecureTransport platform supports a plugin architecture for extending functionality without modifying core code.

### Plugin Structure

A typical plugin follows this structure:

```
my-plugin/
├── package.json
├── src/
│   ├── index.ts         # Main plugin entry point
│   ├── handlers/        # Event handlers
│   ├── services/        # Plugin-specific services
│   ├── models/          # Data models
│   ├── api/             # API endpoints
│   │   ├── routes.ts    # Route definitions
│   │   └── controllers/ # API controllers
│   └── ui/              # Frontend components (if applicable)
│       ├── components/  # React components
│       ├── pages/       # Page definitions
│       └── index.ts     # UI entry point
└── README.md            # Plugin documentation
```

### Plugin Registration

Plugins must export a registration function:

```typescript
// src/index.ts
import { PluginContext, Plugin } from '@types/plugin';
import { routes } from './api/routes';
import { registerEventHandlers } from './handlers';
import { registerServices } from './services';
import { registerUiComponents } from './ui';

const myPlugin: Plugin = {
  id: 'my-custom-plugin',
  name: 'My Custom Plugin',
  version: '1.0.0',
  description: 'Extends SecureTransport with custom functionality',
  register: async (context: PluginContext) => {
    // Register API routes
    context.api.registerRoutes(routes);
    
    // Register event handlers
    registerEventHandlers(context.events);
    
    // Register services
    registerServices(context.container);
    
    // Register UI components (if applicable)
    if (context.ui) {
      registerUiComponents(context.ui);
    }
    
    return { status: 'registered' };
  }
};

export default myPlugin;
```

### Plugin Configuration

Configure plugins in the system settings:

```json
{
  "plugins": [
    {
      "id": "my-custom-plugin",
      "enabled": true,
      "config": {
        "option1": "value1",
        "option2": true,
        "apiKey": "env:MY_PLUGIN_API_KEY"
      }
    }
  ]
}
```

### API Extension

Extend the API with custom endpoints:

```typescript
// src/api/routes.ts
import { Router } from 'express';
import { authMiddleware } from '@middleware/auth';
import * as controllers from './controllers';

export const routes = (router: Router) => {
  // Add plugin-specific routes
  router.get(
    '/api/my-plugin/data',
    authMiddleware.authenticate,
    authMiddleware.requirePermission('my_plugin:read'),
    controllers.getData
  );
  
  router.post(
    '/api/my-plugin/process',
    authMiddleware.authenticate,
    authMiddleware.requirePermission('my_plugin:write'),
    controllers.processData
  );
};
```

### UI Extension

Extend the frontend with custom components:

```typescript
// src/ui/index.ts
import { UiExtensionContext } from '@types/ui-extension';
import { CustomDashboardWidget } from './components/CustomDashboardWidget';
import { CustomSettingsPage } from './pages/CustomSettingsPage';

export function registerUiComponents(context: UiExtensionContext) {
  // Register a dashboard widget
  context.registerDashboardWidget({
    id: 'custom-widget',
    title: 'Custom Data',
    component: CustomDashboardWidget,
    defaultPosition: { x: 0, y: 0, w: 2, h: 2 },
    permissions: ['my_plugin:read']
  });
  
  // Register a settings page
  context.registerSettingsPage({
    id: 'custom-settings',
    title: 'My Plugin Settings',
    component: CustomSettingsPage,
    permissions: ['my_plugin:admin']
  });
  
  // Register a menu item
  context.registerMenuItem({
    id: 'custom-menu-item',
    title: 'Custom Feature',
    icon: 'CustomIcon',
    path: '/custom-feature',
    permissions: ['my_plugin:read']
  });
}
```

## Custom Module Development

For more extensive customizations, developers can create custom modules that integrate deeply with the platform.

### Module Structure

A custom module has more integration points than a plugin:

```
custom-module/
├── package.json
├── src/
│   ├── index.ts              # Module entry point
│   ├── config/               # Module configuration
│   ├── services/             # Business logic services
│   ├── models/               # Data models and schemas
│   ├── repositories/         # Data access layer
│   ├── api/                  # API endpoints
│   │   ├── routes.ts         # Route definitions
│   │   ├── controllers/      # API controllers
│   │   ├── validators/       # Request validation
│   │   └── middleware/       # Custom middleware
│   ├── jobs/                 # Background jobs
│   ├── events/               # Event handlers
│   │   ├── subscribers/      # Event subscribers
│   │   └── publishers/       # Event publishers
│   ├── ui/                   # Frontend components
│   │   ├── components/       # React components
│   │   ├── pages/            # Page definitions
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # State management
│   │   └── index.ts          # UI entry point
│   └── utils/                # Utility functions
├── migrations/               # Database migrations
├── test/                     # Test suite
└── README.md                 # Module documentation
```

### Database Extensions

Extend the database schema with custom tables:

```typescript
// migrations/20230401000000_create_custom_tables.ts
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('custom_data', (table) => {
    table.increments('id').primary();
    table.integer('vehicle_id').references('id').inTable('vehicles').onDelete('CASCADE');
    table.string('data_type').notNullable();
    table.jsonb('data_content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index(['vehicle_id', 'data_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('custom_data');
}
```

### Service Integration

Create custom services that integrate with core platform services:

```typescript
// src/services/customAnalytics.service.ts
import { injectable, inject } from 'inversify';
import { VehicleService, AlertService, TelemetryService } from '@services/index';
import { CustomDataRepository } from '../repositories/customData.repository';
import { logger } from '@utils/logger';

@injectable()
export class CustomAnalyticsService {
  constructor(
    @inject(VehicleService) private vehicleService: VehicleService,
    @inject(AlertService) private alertService: AlertService,
    @inject(TelemetryService) private telemetryService: TelemetryService,
    @inject(CustomDataRepository) private customDataRepo: CustomDataRepository
  ) {}
  
  async analyzeVehicleRisk(vehicleId: string): Promise<{riskScore: number, factors: any[]}> {
    try {
      // Get data from core services
      const vehicle = await this.vehicleService.getByVehicleId(vehicleId);
      const recentAlerts = await this.alertService.getByVehicleId(vehicleId, { limit: 20 });
      const telemetry = await this.telemetryService.getLatest(vehicleId);
      
      // Get custom data
      const customData = await this.customDataRepo.findByVehicleId(vehicleId);
      
      // Perform custom analysis
      const analysisResult = this.performRiskAnalysis(vehicle, recentAlerts, telemetry, customData);
      
      // Store analysis result
      await this.customDataRepo.create({
        vehicleId: vehicle.id,
        dataType: 'risk_analysis',
        dataContent: analysisResult
      });
      
      return analysisResult;
    } catch (error) {
      logger.error('Failed to analyze vehicle risk', { error, vehicleId });
      throw error;
    }
  }
  
  private performRiskAnalysis(vehicle, alerts, telemetry, customData) {
    // Custom risk analysis algorithm
    // ...implementation...
    return { riskScore: 75, factors: [...] };
  }
}
```

### API Extensions

Create custom API endpoints:

```typescript
// src/api/controllers/customAnalytics.controller.ts
import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { CustomAnalyticsService } from '../../services/customAnalytics.service';
import { logger } from '@utils/logger';

export class CustomAnalyticsController {
  constructor(
    @inject(CustomAnalyticsService) private analyticsService: CustomAnalyticsService
  ) {}
  
  async getVehicleRiskAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { vehicleId } = req.params;
      
      const analysis = await this.analyticsService.analyzeVehicleRisk(vehicleId);
      
      return res.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      logger.error('Failed to get vehicle risk analysis', { 
        error, 
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }
}
```

### Background Jobs

Create custom scheduled or triggered jobs:

```typescript
// src/jobs/dailyRiskAnalysis.job.ts
import { injectable, inject } from 'inversify';
import { CronJob } from 'cron';
import { Job, JobScheduler } from '@services/job';
import { VehicleService } from '@services/vehicle.service';
import { CustomAnalyticsService } from '../services/customAnalytics.service';
import { logger } from '@utils/logger';

@injectable()
export class DailyRiskAnalysisJob implements Job {
  public readonly name = 'daily-risk-analysis';
  public readonly schedule = '0 0 * * *'; // Run at midnight
  
  constructor(
    @inject(VehicleService) private vehicleService: VehicleService,
    @inject(CustomAnalyticsService) private analyticsService: CustomAnalyticsService
  ) {}
  
  async register(scheduler: JobScheduler) {
    scheduler.registerJob(this.name, new CronJob(
      this.schedule,
      () => this.execute(),
      null,
      true
    ));
  }
  
  async execute() {
    try {
      logger.info('Starting daily risk analysis job');
      
      // Get all active vehicles
      const vehicles = await this.vehicleService.getAll({ status: 'active' });
      
      // Process each vehicle
      let successCount = 0;
      for (const vehicle of vehicles) {
        try {
          await this.analyticsService.analyzeVehicleRisk(vehicle.vehicleId);
          successCount++;
        } catch (error) {
          logger.error('Failed to analyze vehicle', { vehicleId: vehicle.vehicleId, error });
        }
      }
      
      logger.info('Completed daily risk analysis job', { 
        total: vehicles.length, 
        successful: successCount,
        failed: vehicles.length - successCount
      });
    } catch (error) {
      logger.error('Failed to execute daily risk analysis job', { error });
    }
  }
}
```

## Frontend Customization

The SecureTransport frontend can be customized and extended in various ways.

### Component Hierarchy

Understanding the component hierarchy is essential for effective customization:

```
App
├── AuthProvider
│   └── Layout
│       ├── Header
│       │   ├── HeaderLogo
│       │   ├── MainNav
│       │   ├── UserMenu
│       │   └── NotificationsMenu
│       ├── Sidebar
│       │   ├── MainMenu
│       │   └── QuickActions
│       ├── Content
│       │   └── [Page Components]
│       └── Footer
└── Modals
    ├── AlertModal
    ├── ConfirmationModal
    └── CustomModals
```

### Theme Customization

Customize the application theme in the ThemeProvider:

```typescript
// src/ui/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1565c0',
      light: '#5e92f3',
      dark: '#003c8f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff6f00',
      light: '#ffa040',
      dark: '#c43e00',
      contrastText: '#000000',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ffa000',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#388e3c',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    // ... other typography settings
  },
  shape: {
    borderRadius: 8,
  },
  // Custom theme extensions
  custom: {
    mapStyles: {
      standard: [...],
      satellite: [...],
      night: [...]
    },
    dashboardCardShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  },
});
```

### Custom Components

Create custom components that integrate with the platform:

```tsx
// src/ui/components/CustomRiskWidget.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CircularProgress, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@lib/api';
import { RiskChart } from './RiskChart';
import { useToast } from '@hooks/use-toast';

interface CustomRiskWidgetProps {
  vehicleId: string;
}

export const CustomRiskWidget: React.FC<CustomRiskWidgetProps> = ({ vehicleId }) => {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/my-module/vehicle-risk', vehicleId],
    enabled: !!vehicleId
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error loading risk data',
        description: 'Failed to load vehicle risk analysis',
        variant: 'destructive'
      });
    }
  }, [error, toast]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader title="Risk Analysis" />
        <CardContent sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }
  
  if (!data) {
    return (
      <Card>
        <CardHeader title="Risk Analysis" />
        <CardContent>
          <Typography>No risk data available</Typography>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader 
        title="Risk Analysis" 
        subheader={`Risk Score: ${data.riskScore}/100`} 
      />
      <CardContent>
        <RiskChart data={data.factors} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Analysis generated at: {new Date(data.timestamp).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};
```

### Custom Pages

Create custom pages that integrate with the platform's routing:

```tsx
// src/ui/pages/CustomAnalyticsPage.tsx
import React from 'react';
import { useParams } from 'wouter';
import { Container, Grid, Typography, Box, Breadcrumbs, Link } from '@mui/material';
import { CustomRiskWidget } from '../components/CustomRiskWidget';
import { HistoricalRiskChart } from '../components/HistoricalRiskChart';
import { RiskFactorsTable } from '../components/RiskFactorsTable';
import { MapRiskOverlay } from '../components/MapRiskOverlay';

export const CustomAnalyticsPage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  
  return (
    <Container maxWidth="xl">
      <Box mb={4}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">Dashboard</Link>
          <Link color="inherit" href="/vehicles">Vehicles</Link>
          <Link color="inherit" href={`/vehicles/${vehicleId}`}>{vehicleId}</Link>
          <Typography color="textPrimary">Risk Analysis</Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" component="h1" mt={2}>
          Risk Analysis for Vehicle {vehicleId}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <CustomRiskWidget vehicleId={vehicleId} />
        </Grid>
        <Grid item xs={12} md={8}>
          <HistoricalRiskChart vehicleId={vehicleId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RiskFactorsTable vehicleId={vehicleId} />
        </Grid>
        <Grid item xs={12} md={6}>
          <MapRiskOverlay vehicleId={vehicleId} />
        </Grid>
      </Grid>
    </Container>
  );
};
```

### Custom Hooks

Create custom hooks for reusable logic:

```typescript
// src/ui/hooks/useVehicleRisk.ts
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@lib/api';
import { useToast } from '@hooks/use-toast';

export function useVehicleRisk(vehicleId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get current risk data
  const {
    data: riskData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['/api/my-module/vehicle-risk', vehicleId],
    enabled: !!vehicleId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
  
  // Get historical risk data
  const {
    data: historicalData,
    isLoading: historicalLoading
  } = useQuery({
    queryKey: ['/api/my-module/vehicle-risk/history', vehicleId],
    enabled: !!vehicleId
  });
  
  // Trigger a new risk analysis
  const {
    mutate: refreshAnalysis,
    isPending: isRefreshing
  } = useMutation({
    mutationFn: () => apiRequest(`/api/my-module/vehicle-risk/${vehicleId}/analyze`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/my-module/vehicle-risk', vehicleId]
      });
      toast({
        title: 'Analysis Refreshed',
        description: 'Risk analysis has been updated with latest data',
        variant: 'success'
      });
    },
    onError: (error) => {
      toast({
        title: 'Refresh Failed',
        description: 'Could not update risk analysis',
        variant: 'destructive'
      });
    }
  });
  
  // Alert if risk score increases significantly
  useEffect(() => {
    if (riskData && historicalData?.length > 0) {
      const previousScore = historicalData[0].riskScore;
      const currentScore = riskData.riskScore;
      
      if (currentScore > previousScore + 15) {
        toast({
          title: 'Risk Score Increased',
          description: `Risk score increased from ${previousScore} to ${currentScore}`,
          variant: 'warning'
        });
      }
    }
  }, [riskData, historicalData, toast]);
  
  return {
    riskData,
    historicalData,
    isLoading: isLoading || historicalLoading,
    isRefreshing,
    error,
    refreshAnalysis
  };
}
```

## Database Schema

Understanding the database schema is essential for custom module development.

### Core Tables

The core database schema includes the following main tables:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     users       │     │    vehicles     │     │ vehicle_assign. │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ username        │     │ vehicle_id      │     │ user_id         │
│ password_hash   │     │ name            │     │ vehicle_id      │
│ email           │     │ type            │     │ is_active       │
│ role            │     │ status          │     │ assigned_at     │
│ permissions     │     │ license_plate   │     │ expires_at      │
│ created_at      │     │ manufacturer    │     │ created_at      │
│ updated_at      │     │ model           │     │ updated_at      │
└─────────────────┘     │ year            │     └─────────────────┘
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   telemetry     │     │     alerts      │     │   detections    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ vehicle_id      │     │ vehicle_id      │     │ vehicle_id      │
│ latitude        │     │ type            │     │ type            │
│ longitude       │     │ severity        │     │ confidence      │
│ speed           │     │ location        │     │ location        │
│ direction       │     │ metadata        │     │ metadata        │
│ engine_status   │     │ acknowledged    │     │ created_at      │
│ fuel_level      │     │ acknowledged_by │     └─────────────────┘
│ temperature     │     │ acknowledged_at │
│ metadata        │     │ created_at      │
│ timestamp       │     └─────────────────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     routes      │     │   risk_zones    │     │ system_settings │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ name            │     │ centroid        │     │ category        │
│ start_location  │     │ radius          │     │ key             │
│ end_location    │     │ severity        │     │ value           │
│ waypoints       │     │ risk_score      │     │ description     │
│ metadata        │     │ metadata        │     │ created_at      │
│ created_at      │     │ created_at      │     │ updated_at      │
│ updated_at      │     │ updated_at      │     └─────────────────┘
└─────────────────┘     └─────────────────┘
```

### Schema Details

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Vehicles Table

```sql
CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  vehicle_id VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  license_plate VARCHAR(50),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  vin VARCHAR(50),
  capacity DECIMAL,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### Telemetry Table

```sql
CREATE TABLE telemetry_data (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  speed DECIMAL,
  direction INTEGER,
  engine_status VARCHAR(50),
  fuel_level DECIMAL,
  temperature DECIMAL,
  metadata JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Create spatial index
  CONSTRAINT valid_coordinates CHECK (
    latitude BETWEEN -90 AND 90 AND
    longitude BETWEEN -180 AND 180
  )
);

-- Add PostGIS spatial index
SELECT AddGeometryColumn('telemetry_data', 'location', 4326, 'POINT', 2);
CREATE INDEX telemetry_location_idx ON telemetry_data USING GIST(location);
```

#### Detections Table

```sql
CREATE TABLE detections (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  confidence DECIMAL NOT NULL,
  location GEOMETRY(POINT, 4326),
  metadata JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_detection_type (type),
  INDEX idx_detection_vehicle (vehicle_id),
  INDEX idx_detection_created (created_at)
);
```

#### Alerts Table

```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  location GEOMETRY(POINT, 4326),
  metadata JSONB NOT NULL,
  acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  acknowledged_by INTEGER REFERENCES users(id),
  acknowledged_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_alert_vehicle (vehicle_id),
  INDEX idx_alert_type (type),
  INDEX idx_alert_severity (severity),
  INDEX idx_alert_acknowledged (acknowledged),
  INDEX idx_alert_created (created_at)
);
```

#### Risk Zones Table

```sql
CREATE TABLE risk_zones (
  id SERIAL PRIMARY KEY,
  centroid GEOMETRY(POINT, 4326) NOT NULL,
  radius DECIMAL NOT NULL,
  severity VARCHAR(20) NOT NULL,
  risk_score INTEGER NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_risk_severity (severity),
  INDEX idx_risk_score (risk_score)
);
```

## Testing Framework

The SecureTransport platform includes comprehensive testing tools and frameworks.

### Test Structure

Tests are organized by type and component:

```
test/
├── unit/                   # Unit tests
│   ├── services/           # Service tests
│   ├── models/             # Model tests
│   ├── utils/              # Utility function tests
│   └── controllers/        # Controller tests
├── integration/            # Integration tests
│   ├── api/                # API endpoint tests
│   ├── database/           # Database interaction tests
│   └── services/           # Cross-service tests
├── e2e/                    # End-to-end tests
│   ├── flows/              # User flow tests
│   ├── api/                # API workflow tests
│   └── ui/                 # UI tests
├── performance/            # Performance tests
│   ├── load/               # Load testing scripts
│   ├── stress/             # Stress testing scripts
│   └── endurance/          # Endurance testing scripts
└── fixtures/               # Test data fixtures
    ├── users.json          # User test data
    ├── vehicles.json       # Vehicle test data
    └── alerts.json         # Alert test data
```

### Unit Testing

Using Jest for unit tests:

```typescript
// test/unit/services/alert.service.test.ts
import { AlertService } from '@services/alert.service';
import { MockStorage } from '@test/mocks/storage.mock';
import { mockAlert, mockVehicle } from '@test/fixtures';

describe('AlertService', () => {
  let alertService: AlertService;
  let mockStorage: MockStorage;
  
  beforeEach(() => {
    mockStorage = new MockStorage();
    alertService = new AlertService(mockStorage);
  });
  
  describe('processAlert', () => {
    it('should distribute high-priority alerts immediately', async () => {
      // Arrange
      const alert = { ...mockAlert, severity: 'critical' };
      const spy = jest.spyOn(alertService, 'distributeAlert');
      mockStorage.getVehicle.mockResolvedValue(mockVehicle);
      
      // Act
      await alertService.processAlert(alert);
      
      // Assert
      expect(spy).toHaveBeenCalledWith(alert, true);
    });
    
    it('should not distribute duplicate alerts within cooldown period', async () => {
      // Arrange
      const alert1 = { ...mockAlert, vehicleId: 'V1', type: 'weapon_detected' };
      const alert2 = { ...mockAlert, vehicleId: 'V1', type: 'weapon_detected' };
      mockStorage.getVehicle.mockResolvedValue(mockVehicle);
      const spy = jest.spyOn(alertService, 'distributeAlert');
      
      // Act
      await alertService.processAlert(alert1);
      await alertService.processAlert(alert2);
      
      // Assert
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
```

### API Testing

Using Supertest for API endpoint testing:

```typescript
// test/integration/api/alerts.test.ts
import request from 'supertest';
import { app } from '@server/app';
import { generateToken } from '@middleware/auth';
import { mockAlert, mockUser } from '@test/fixtures';
import { storage } from '@server/storage';

describe('Alerts API', () => {
  let authToken: string;
  
  beforeAll(() => {
    // Create auth token for testing
    authToken = generateToken(mockUser.id);
    
    // Seed test data
    return storage.createAlert(mockAlert);
  });
  
  describe('GET /api/alerts', () => {
    it('should return a list of alerts', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    
    it('should filter alerts by vehicleId', async () => {
      const response = await request(app)
        .get(`/api/alerts?vehicleId=${mockAlert.vehicleId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.every(alert => alert.vehicleId === mockAlert.vehicleId)).toBe(true);
    });
  });
  
  describe('POST /api/alerts/acknowledge/:id', () => {
    it('should acknowledge an alert', async () => {
      // Get an alert to acknowledge
      const alertsResponse = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);
      
      const alertId = alertsResponse.body.data[0].id;
      
      const response = await request(app)
        .patch(`/api/alerts/${alertId}/acknowledge`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ notes: 'Acknowledged for testing' });
      
      expect(response.status).toBe(200);
      expect(response.body.data.acknowledged).toBe(true);
      expect(response.body.data.acknowledgedBy).toBe(mockUser.id);
    });
  });
});
```

### End-to-End Testing

Using Playwright for browser-based testing:

```typescript
// test/e2e/flows/alert-management.test.ts
import { test, expect } from '@playwright/test';
import { loginAs } from '@test/utils/auth';
import { createTestAlert } from '@test/utils/alerts';

test.describe('Alert Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');
  });
  
  test('should display alerts on dashboard', async ({ page }) => {
    // Create a test alert
    const alert = await createTestAlert({
      type: 'suspicious_behavior',
      severity: 'high'
    });
    
    // Navigate to dashboard
    await page.goto('/');
    
    // Check if alert appears in recent alerts panel
    const alertPanel = page.locator('[data-testid="recent-alerts-panel"]');
    await expect(alertPanel).toBeVisible();
    
    const alertItem = alertPanel.locator(`[data-alert-id="${alert.id}"]`);
    await expect(alertItem).toBeVisible();
    await expect(alertItem.locator('.alert-type')).toHaveText('Suspicious Behavior');
    await expect(alertItem.locator('.alert-severity')).toHaveText('High');
  });
  
  test('should acknowledge an alert', async ({ page }) => {
    // Create a test alert
    const alert = await createTestAlert({
      type: 'route_deviation',
      severity: 'medium'
    });
    
    // Navigate to alerts page
    await page.goto('/alerts');
    
    // Find and click the alert
    const alertRow = page.locator(`[data-alert-id="${alert.id}"]`);
    await alertRow.click();
    
    // Alert detail modal should appear
    const modal = page.locator('[data-testid="alert-detail-modal"]');
    await expect(modal).toBeVisible();
    
    // Acknowledge the alert
    const acknowledgeButton = modal.locator('button:has-text("Acknowledge")');
    await acknowledgeButton.click();
    
    // Fill in acknowledgment notes
    await page.locator('#acknowledgment-notes').fill('Test acknowledgment');
    await page.locator('button:has-text("Confirm")').click();
    
    // Verify acknowledgment
    await expect(page.locator('[data-testid="acknowledged-badge"]')).toBeVisible();
    await expect(page.locator('[data-testid="acknowledged-by"]')).toContainText('admin');
  });
});
```

### Performance Testing

Using k6 for performance testing:

```javascript
// test/performance/load/api-endpoints.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// Custom metrics
const alertRequests = new Counter('alert_requests');
const vehicleRequests = new Counter('vehicle_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users for 3 minutes
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests must complete below 500ms
    'http_req_duration{name:get-alerts}': ['p(95)<300'], // 95% of alert requests must complete below 300ms
    'http_req_duration{name:get-vehicles}': ['p(95)<200'], // 95% of vehicle requests must complete below 200ms
  },
};

// Test data
const API_BASE_URL = 'https://test.securetransport.com/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Test JWT token

export default function() {
  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };
  
  // Test GET /api/alerts
  const alertsResponse = http.get(`${API_BASE_URL}/alerts?limit=20`, params, {
    tags: { name: 'get-alerts' },
  });
  
  check(alertsResponse, {
    'alerts status is 200': (r) => r.status === 200,
    'alerts response has data': (r) => JSON.parse(r.body).data.length > 0,
  });
  
  alertRequests.add(1);
  sleep(1);
  
  // Test GET /api/vehicles
  const vehiclesResponse = http.get(`${API_BASE_URL}/vehicles`, params, {
    tags: { name: 'get-vehicles' },
  });
  
  check(vehiclesResponse, {
    'vehicles status is 200': (r) => r.status === 200,
    'vehicles response has data': (r) => JSON.parse(r.body).data.length > 0,
  });
  
  vehicleRequests.add(1);
  sleep(2);
}
```

## Security Requirements

When developing extensions or customizations, adhere to these security requirements.

### Authentication & Authorization

- All custom API endpoints must enforce authentication via the `authMiddleware.authenticate` middleware
- Role-based authorization must be implemented using `authMiddleware.requirePermission` or `authMiddleware.requireRole`
- Custom permissions must be defined in a permission manifest file and properly registered
- All authentication tokens must be handled securely and never logged or exposed

### Data Security

- All sensitive data must be encrypted at rest using the platform's encryption services
- Personal identifiable information (PII) must be handled according to data protection policies
- Data retention policies must be implemented for all custom data storage
- Input validation must be applied to all user inputs to prevent injection attacks

### API Security

- All custom API endpoints must implement rate limiting
- CSRF protection must be implemented for form submissions
- Security headers must be properly set for all responses
- API responses must not leak sensitive information in error messages

### Secure Coding Practices

- All dependencies must be regularly updated and scanned for vulnerabilities
- Code must be reviewed for security issues before deployment
- Static code analysis must be performed as part of the CI/CD pipeline
- Secrets and credentials must never be hardcoded in source code

### Example: Secure API Endpoint

```typescript
// src/api/controllers/secureData.controller.ts
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest, requirePermission } from '@middleware/auth';
import { rateLimiter } from '@middleware/rate-limit';
import { encryptionService } from '@services/encryption.service';
import { logger } from '@utils/logger';

export const createSecureData = [
  // Authentication middleware
  authMiddleware.authenticate,
  
  // Authorization middleware
  requirePermission('secure_data:write'),
  
  // Rate limiting
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later' }
  }),
  
  // Input validation
  body('title').isString().trim().isLength({ min: 1, max: 100 }),
  body('content').isString().trim().isLength({ min: 1, max: 10000 }),
  body('sensitivity').isIn(['low', 'medium', 'high']),
  
  // Request handler
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Process request
      const { title, content, sensitivity } = req.body;
      
      // Encrypt sensitive data
      const encryptedContent = sensitivity !== 'low' 
        ? await encryptionService.encrypt(content)
        : content;
      
      // Create record
      const secureData = await secureDataService.create({
        title,
        content: encryptedContent,
        sensitivity,
        createdBy: req.user.id
      });
      
      // Audit log
      logger.info('Secure data created', {
        userId: req.user.id,
        dataId: secureData.id,
        sensitivity,
        action: 'create'
      });
      
      // Return response
      return res.status(201).json({
        success: true,
        data: {
          id: secureData.id,
          title: secureData.title,
          sensitivity: secureData.sensitivity,
          createdAt: secureData.createdAt
        }
      });
    } catch (error) {
      logger.error('Failed to create secure data', { 
        error,
        userId: req.user?.id
      });
      next(error);
    }
  }
];
```

## Performance Optimization

When developing extensions, follow these performance best practices.

### Database Optimization

- Use efficient query patterns and avoid N+1 query problems
- Implement appropriate indexes for query patterns
- Use pagination for large result sets
- Optimize JOIN operations and prefer selective queries
- Use database transactions appropriately

```typescript
// Inefficient approach (N+1 problem)
const vehicles = await vehicleRepository.findAll();
for (const vehicle of vehicles) {
  vehicle.telemetry = await telemetryRepository.findLatestByVehicleId(vehicle.id);
}

// Optimized approach
const vehicles = await vehicleRepository.findAllWithLatestTelemetry();
```

### Caching Strategies

- Use Redis for distributed caching of frequently accessed data
- Implement tiered caching (memory, distributed, persistence)
- Use cache invalidation strategies that align with data update patterns
- Consider time-to-live (TTL) values based on data volatility

```typescript
// Caching implementation example
export async function getVehicleDetails(vehicleId: string) {
  const cacheKey = `vehicle:${vehicleId}:details`;
  
  // Try cache first
  const cachedData = await cacheService.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  // Cache miss, get from database
  const vehicle = await vehicleRepository.findByIdWithAssociations(vehicleId);
  
  // Store in cache with TTL
  await cacheService.set(cacheKey, JSON.stringify(vehicle), 60 * 5); // 5 minutes
  
  return vehicle;
}
```

### Frontend Optimization

- Implement efficient React rendering patterns
- Use memoization for expensive calculations
- Optimize bundle size with code splitting and lazy loading
- Minimize component re-renders

```typescript
// Inefficient component (rerenders too often)
const VehicleList = ({ vehicles }) => {
  const [filter, setFilter] = useState('');
  
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <div>
      <input type="text" onChange={e => setFilter(e.target.value)} />
      <ul>
        {filteredVehicles.map(vehicle => (
          <VehicleItem key={vehicle.id} vehicle={vehicle} />
        ))}
      </ul>
    </div>
  );
};

// Optimized component
const VehicleList = ({ vehicles }) => {
  const [filter, setFilter] = useState('');
  
  // Memoize expensive filtering operation
  const filteredVehicles = useMemo(() => 
    vehicles.filter(vehicle => 
      vehicle.name.toLowerCase().includes(filter.toLowerCase())
    ),
    [vehicles, filter]
  );
  
  return (
    <div>
      <input type="text" onChange={e => setFilter(e.target.value)} />
      <ul>
        {filteredVehicles.map(vehicle => (
          <MemoizedVehicleItem key={vehicle.id} vehicle={vehicle} />
        ))}
      </ul>
    </div>
  );
};

// Prevent unnecessary rerenders
const VehicleItem = memo(({ vehicle }) => (
  <li>{vehicle.name} - {vehicle.status}</li>
));
```

### Real-time Data Optimization

- Implement message batching for WebSocket communications
- Use differential updates to send only changed data
- Implement throttling and debouncing for frequent updates
- Consider using binary protocols for data-intensive applications

```typescript
// Optimized WebSocket message handler
class OptimizedWebSocketHandler {
  private batchedMessages = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_INTERVAL = 500; // ms
  
  constructor(private wss: WebSocket.Server) {}
  
  // Queue message for batched delivery
  queueMessage(clientId: string, channel: string, data: any) {
    if (!this.batchedMessages.has(clientId)) {
      this.batchedMessages.set(clientId, new Map());
    }
    
    const clientMessages = this.batchedMessages.get(clientId);
    
    if (!clientMessages.has(channel)) {
      clientMessages.set(channel, []);
    }
    
    clientMessages.get(channel).push(data);
    
    this.scheduleBatch();
  }
  
  // Schedule batch sending
  private scheduleBatch() {
    if (this.batchTimeout === null) {
      this.batchTimeout = setTimeout(() => {
        this.sendBatchedMessages();
        this.batchTimeout = null;
      }, this.BATCH_INTERVAL);
    }
  }
  
  // Send batched messages
  private sendBatchedMessages() {
    for (const [clientId, channels] of this.batchedMessages.entries()) {
      const client = this.getClient(clientId);
      if (client && client.readyState === WebSocket.OPEN) {
        const payload = {
          type: 'batch',
          timestamp: new Date().toISOString(),
          channels: {}
        };
        
        for (const [channel, messages] of channels.entries()) {
          payload.channels[channel] = messages;
        }
        
        client.send(JSON.stringify(payload));
      }
    }
    
    this.batchedMessages.clear();
  }
  
  private getClient(clientId: string) {
    // Implementation to find client by ID
  }
}
```

## DevOps Integration

Integrate your custom development with the platform's DevOps practices.

### CI/CD Pipeline

Custom modules should include CI/CD pipeline configuration:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Lint
        run: npm run lint
      - name: Type Check
        run: npm run type-check
      - name: Unit Tests
        run: npm run test:unit
      - name: Integration Tests
        run: npm run test:integration
      - name: Build
        run: npm run build
      - name: Code Coverage
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security Scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          ignore-unfixed: true
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload Scan Results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
          
  deploy:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Package Module
        run: npm run package
      - name: Publish Module
        run: npm run publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Docker Configuration

Custom modules should include Docker configuration:

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

RUN npm ci --production

# Set environment variables
ENV NODE_ENV=production

# Expose ports
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
```

### Kubernetes Configuration

For deployment in Kubernetes environments:

```yaml
# k8s/deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: custom-module
  labels:
    app: custom-module
spec:
  replicas: 2
  selector:
    matchLabels:
      app: custom-module
  template:
    metadata:
      labels:
        app: custom-module
    spec:
      containers:
      - name: custom-module
        image: securetransport/custom-module:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        resources:
          limits:
            cpu: "500m"
            memory: "512Mi"
          requests:
            cpu: "100m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: custom-module-service
spec:
  selector:
    app: custom-module
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

## Localization

Support for internationalization and localization.

### Internationalization Setup

The platform uses i18next for internationalization:

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['common', 'alerts', 'vehicles', 'settings'],
    defaultNS: 'common',
  });

export default i18n;
```

### Translation Files

Organize translation files by language and namespace:

```json
// public/locales/en/alerts.json
{
  "title": "Security Alerts",
  "filter": "Filter Alerts",
  "severity": {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "critical": "Critical"
  },
  "status": {
    "active": "Active",
    "acknowledged": "Acknowledged",
    "resolved": "Resolved"
  },
  "types": {
    "facial_recognition": "Facial Recognition Match",
    "license_plate": "License Plate Detection",
    "route_deviation": "Route Deviation",
    "suspicious_behavior": "Suspicious Behavior",
    "weapon_detected": "Weapon Detection"
  },
  "actions": {
    "acknowledge": "Acknowledge",
    "escalate": "Escalate",
    "dismiss": "Dismiss",
    "view_details": "View Details"
  }
}
```

### Using Translations in Components

```tsx
// src/components/AlertsList.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AlertsListProps {
  alerts: Alert[];
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  const { t } = useTranslation(['alerts', 'common']);
  
  return (
    <div>
      <h2>{t('alerts:title')}</h2>
      <div className="filters">
        <label>{t('alerts:filter')}</label>
        {/* Filter controls */}
      </div>
      <ul className="alerts-list">
        {alerts.map(alert => (
          <li key={alert.id} className={`alert-${alert.severity}`}>
            <div className="alert-type">
              {t(`alerts:types.${alert.type}`)}
            </div>
            <div className="alert-severity">
              {t(`alerts:severity.${alert.severity}`)}
            </div>
            <div className="alert-status">
              {t(`alerts:status.${alert.status}`)}
            </div>
            <div className="alert-actions">
              <button>{t('alerts:actions.view_details')}</button>
              {alert.status === 'active' && (
                <button>{t('alerts:actions.acknowledge')}</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {alerts.length === 0 && (
        <p className="no-data">{t('common:no_data_available')}</p>
      )}
    </div>
  );
};
```

### Formatted Messages with Variables

```tsx
// Using variables in translations
const { t } = useTranslation('alerts');

// Translation: "Alert {{id}} was created at {{time}}"
const message = t('alert_created', { 
  id: alert.id, 
  time: new Date(alert.createdAt).toLocaleTimeString() 
});
```

### Date and Number Formatting

```tsx
// Date formatting with i18next
const { t, i18n } = useTranslation();

const formattedDate = new Date(timestamp).toLocaleDateString(i18n.language, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

// Number formatting with i18next
const formattedNumber = new Intl.NumberFormat(i18n.language, {
  style: 'currency',
  currency: 'USD'
}).format(value);
```

## Troubleshooting Development Issues

### Debugging Tools

The platform provides several debugging tools:

1. **API Debug Mode**
   - Set `DEBUG=api:*` environment variable
   - Provides detailed logging of API requests and responses
   - Shows query execution and performance metrics

2. **React Developer Tools**
   - Install browser extension for React debugging
   - Inspect component hierarchy and props
   - Monitor component re-renders

3. **Redux DevTools**
   - Install browser extension for Redux debugging
   - Track state changes and action dispatches
   - Time-travel debugging

4. **Database Query Analyzer**
   - Access at `Administration` → `Tools` → `Query Analyzer`
   - View slow queries and execution plans
   - Analyze query performance

### Common Issues and Solutions

#### API Connection Issues

```
Problem: API calls failing with connection errors
Solutions:
1. Check API endpoint configuration in .env
2. Verify network connectivity and firewall rules
3. Check for CORS issues in browser console
4. Verify that the API service is running
5. Check authentication token validity
```

#### Database Errors

```
Problem: Database queries failing or returning unexpected results
Solutions:
1. Verify database connection parameters
2. Check SQL syntax and query structure
3. Verify table schema and index existence
4. Check for database constraint violations
5. Monitor database server load and performance
```

#### React Component Issues

```
Problem: React components not rendering or updating as expected
Solutions:
1. Check component props and state with React DevTools
2. Verify that conditional rendering conditions are correct
3. Check for missing key props in lists
4. Monitor for unnecessary re-renders
5. Verify that data fetching is complete before rendering
```

#### WebSocket Connection Issues

```
Problem: WebSocket connections failing or disconnecting
Solutions:
1. Verify WebSocket server URL and connection parameters
2. Check authentication token for WebSocket connection
3. Monitor network stability and latency
4. Implement reconnection logic with exponential backoff
5. Check server-side WebSocket connection limits
```

## Best Practices

### Code Quality

- Follow the platform's coding style guide
- Use TypeScript for type safety
- Write comprehensive unit tests
- Use ESLint and Prettier for code quality
- Document all public APIs and interfaces

### Performance

- Optimize database queries and use appropriate indexes
- Implement caching for frequently accessed data
- Minimize component re-renders in React
- Use lazy loading and code splitting for large applications
- Optimize bundle size with tree shaking and dependency management

### Security

- Validate all user inputs
- Implement proper authentication and authorization
- Use parameterized queries to prevent SQL injection
- Keep dependencies updated to avoid security vulnerabilities
- Follow the principle of least privilege

### Architecture

- Follow the separation of concerns principle
- Use the repository pattern for data access
- Implement service-oriented architecture
- Use dependency injection for better testability
- Apply the SOLID principles

### Developer Experience

- Document all APIs and interfaces
- Provide examples and usage guides
- Create comprehensive error messages
- Implement proper logging for debugging
- Maintain consistent naming conventions

---

*This developer guide is confidential and proprietary to SecureTransport Systems. Unauthorized distribution or reproduction is prohibited.*

*Last updated: March 30, 2023 - Version 2.1*