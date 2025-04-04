# SecureTransport Platform Deployment Guide

## Introduction

This Deployment Guide provides comprehensive instructions for deploying the SecureTransport platform in various environments. It covers deployment architectures, infrastructure requirements, configuration options, and best practices for production-ready installations.

## Table of Contents

1. [Deployment Architectures](#deployment-architectures)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Environment Preparation](#environment-preparation)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [Security Configuration](#security-configuration)
7. [High Availability Setup](#high-availability-setup)
8. [Load Balancing](#load-balancing)
9. [Monitoring Setup](#monitoring-setup)
10. [Backup Configuration](#backup-configuration)
11. [Scaling Guidelines](#scaling-guidelines)
12. [Cloud-Specific Deployments](#cloud-specific-deployments)
13. [Containerized Deployment](#containerized-deployment)
14. [Continuous Deployment](#continuous-deployment)
15. [Post-Deployment Validation](#post-deployment-validation)

## Deployment Architectures

### Single-Server Deployment

Suitable for small deployments or test/development environments:

```
┌─────────────────────────────────────┐
│              Server                 │
│                                     │
│  ┌─────────┐       ┌─────────────┐  │
│  │ Node.js │◄─────►│ PostgreSQL  │  │
│  │ App     │       │ Database    │  │
│  └─────────┘       └─────────────┘  │
│                                     │
│  ┌─────────┐       ┌─────────────┐  │
│  │ Redis   │◄─────►│ File        │  │
│  │ Cache   │       │ Storage     │  │
│  └─────────┘       └─────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Multi-Tier Deployment

Recommended for production environments:

```
┌────────────────┐     ┌────────────────┐
│   Load         │     │  Web Server    │
│   Balancer     │────►│  (NGINX)       │
└────────────────┘     └────────────────┘
        │                      │
        ▼                      ▼
┌────────────────┐     ┌────────────────┐
│   API Server   │     │   API Server   │
│   (Node.js)    │     │   (Node.js)    │
└────────────────┘     └────────────────┘
        │                      │
        ▼                      ▼
┌────────────────┐     ┌────────────────┐
│  WebSocket     │     │  WebSocket     │
│  Server        │     │  Server        │
└────────────────┘     └────────────────┘
        │                      │
        ▼                      ▼
┌────────────────┐     ┌────────────────┐
│   Worker       │     │   Worker       │
│   Processes    │     │   Processes    │
└────────────────┘     └────────────────┘
        │                      │
        └──────────┬───────────┘
                   ▼
        ┌─────────────────────┐
        │      Redis          │
        │   Cache Cluster     │
        └─────────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │    PostgreSQL       │
        │    Database Cluster │
        └─────────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │    Distributed      │
        │    File Storage     │
        └─────────────────────┘
```

### Microservices Architecture

For large-scale deployments with high scalability requirements:

```
┌────────────────┐
│  API Gateway   │
│  (NGINX/Kong)  │
└────────────────┘
        │
        ▼
┌───────────────────────────────────────────────┐
│                 Service Mesh                  │
└───────────────────────────────────────────────┘
        │
        ├─────────────┬─────────────┬─────────────┬─────────────┐
        ▼             ▼             ▼             ▼             ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ Auth       │ │ Vehicle    │ │ Telemetry  │ │ Alert      │ │ Analytics  │
│ Service    │ │ Service    │ │ Service    │ │ Service    │ │ Service    │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
      │              │              │              │              │
      └──────────────┴──────────────┴──────────────┴──────────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │  Message Broker     │
                        │  (Kafka/RabbitMQ)   │
                        └─────────────────────┘
                                   │
                                   ▼
      ┌──────────────┬──────────────┬──────────────┬──────────────┐
      ▼              ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ PostgreSQL │ │ Redis      │ │ Time-Series│ │ Object     │ │ Search     │
│ Cluster    │ │ Cluster    │ │ Database   │ │ Storage    │ │ Engine     │
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

## Infrastructure Requirements

### Hardware Requirements

#### Production Environment

| Component       | CPU Cores | Memory  | Storage          | Network                |
|-----------------|-----------|---------|------------------|------------------------|
| API Servers     | 8-16 cores| 16-32 GB| 100 GB SSD       | 1 Gbps, low latency    |
| Database Servers| 16+ cores | 32-64 GB| 500 GB+ SSD/NVMe | 10 Gbps, low latency   |
| Cache Servers   | 4-8 cores | 16-32 GB| 50 GB SSD        | 1 Gbps, low latency    |
| Worker Servers  | 8-16 cores| 16-32 GB| 100 GB SSD       | 1 Gbps                 |
| Storage Servers | 4-8 cores | 16-32 GB| 10+ TB           | 10 Gbps                |

#### High-Traffic Environment

For environments with 500+ concurrent users and 100+ vehicles:

| Component       | CPU Cores | Memory   | Storage          | Network                |
|-----------------|-----------|----------|------------------|------------------------|
| API Servers     | 32+ cores | 64+ GB   | 200 GB SSD       | 10 Gbps, low latency   |
| Database Servers| 32+ cores | 128+ GB  | 1+ TB SSD/NVMe   | 10 Gbps, low latency   |
| Cache Servers   | 16+ cores | 64+ GB   | 100 GB SSD       | 10 Gbps, low latency   |
| Worker Servers  | 16+ cores | 64+ GB   | 200 GB SSD       | 10 Gbps                |
| Storage Servers | 16+ cores | 64+ GB   | 50+ TB           | 40 Gbps                |

### Software Requirements

- **Operating System**: Ubuntu 20.04 LTS or newer, RHEL 8+, or Amazon Linux 2
- **Database**: PostgreSQL 14+ with PostGIS extensions
- **Node.js**: v18.x or newer
- **Redis**: v6.x or newer
- **Web Server**: NGINX or Apache with HTTP/2 support
- **Container Runtime**: Docker 20.x+ and Docker Compose (for containerized deployment)
- **Orchestration**: Kubernetes 1.23+ (for microservices architecture)

### Network Requirements

- **External Access**:
  - HTTP/HTTPS (ports 80/443)
  - WebSocket (usually port 443 over TLS)
  - SSH for administration (port 22, restricted access)

- **Internal Communication**:
  - PostgreSQL (port 5432)
  - Redis (port 6379)
  - Internal API services (various ports)
  - Message broker (e.g., Kafka: 9092, RabbitMQ: 5672)

- **Network Security**:
  - Firewall rules restricting access by IP and port
  - Network segregation (public/private subnets)
  - VPN for administrative access
  - DDoS protection for public-facing components

## Environment Preparation

### Operating System Setup

1. **Update the system**:

   ```bash
   sudo apt update && sudo apt upgrade -y
   # Or for RHEL/CentOS
   sudo yum update -y
   ```

2. **Install basic dependencies**:

   ```bash
   sudo apt install -y curl wget gnupg2 software-properties-common apt-transport-https ca-certificates
   ```

3. **Set system limits**:

   ```bash
   # Edit /etc/security/limits.conf
   sudo nano /etc/security/limits.conf
   
   # Add the following lines
   *          soft    nofile      65536
   *          hard    nofile      65536
   *          soft    nproc       32768
   *          hard    nproc       32768
   ```

4. **Configure timezone**:

   ```bash
   sudo timedatectl set-timezone UTC
   ```

5. **Install Node.js**:

   ```bash
   # Using NodeSource repository
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Verify installation
   node -v
   npm -v
   ```

6. **Install build tools**:

   ```bash
   sudo apt install -y build-essential python3 make g++
   ```

### User Setup

1. **Create service user**:

   ```bash
   sudo adduser --system --group secureapp
   sudo mkdir -p /var/www/secureapp
   sudo chown -R secureapp:secureapp /var/www/secureapp
   ```

2. **Set up SSH keys** (for deployment):

   ```bash
   sudo mkdir -p /home/secureapp/.ssh
   sudo touch /home/secureapp/.ssh/authorized_keys
   sudo chown -R secureapp:secureapp /home/secureapp/.ssh
   sudo chmod 700 /home/secureapp/.ssh
   sudo chmod 600 /home/secureapp/.ssh/authorized_keys
   
   # Add your public key to authorized_keys
   sudo nano /home/secureapp/.ssh/authorized_keys
   ```

### Firewall Configuration

1. **Install and enable firewall**:

   ```bash
   sudo apt install -y ufw
   
   # Allow SSH
   sudo ufw allow ssh
   
   # Allow HTTP/HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # Enable firewall
   sudo ufw enable
   
   # Check status
   sudo ufw status
   ```

2. **Configure iptables** (alternative to ufw):

   ```bash
   # Allow established connections
   sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
   
   # Allow SSH
   sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
   
   # Allow HTTP/HTTPS
   sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
   
   # Allow loopback
   sudo iptables -A INPUT -i lo -j ACCEPT
   
   # Drop all other incoming traffic
   sudo iptables -A INPUT -j DROP
   
   # Save rules
   sudo apt install -y iptables-persistent
   sudo netfilter-persistent save
   ```

## Database Setup

### PostgreSQL Installation

1. **Install PostgreSQL**:

   ```bash
   # Add PostgreSQL repository
   sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
   wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
   sudo apt update
   
   # Install PostgreSQL
   sudo apt install -y postgresql-14 postgresql-contrib-14 postgresql-14-postgis-3
   
   # Verify installation
   sudo systemctl status postgresql
   ```

2. **Configure PostgreSQL**:

   ```bash
   # Edit postgresql.conf
   sudo nano /etc/postgresql/14/main/postgresql.conf
   
   # Modify these settings according to your server resources
   listen_addresses = '*'
   max_connections = 200
   shared_buffers = 4GB         # 25% of RAM
   effective_cache_size = 12GB  # 75% of RAM
   maintenance_work_mem = 1GB   # For maintenance operations
   work_mem = 50MB              # Per-operation memory
   wal_buffers = 16MB
   checkpoint_completion_target = 0.9
   random_page_cost = 1.1       # For SSD storage
   effective_io_concurrency = 200 # For SSD storage
   ```

3. **Configure client authentication**:

   ```bash
   # Edit pg_hba.conf
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   
   # Add these lines (adjust as needed for security)
   host    securetransport    securetransport    127.0.0.1/32           md5
   host    securetransport    securetransport    ::1/128                md5
   
   # For multi-server setup, allow internal network
   host    securetransport    securetransport    10.0.0.0/24           md5
   ```

4. **Restart PostgreSQL**:

   ```bash
   sudo systemctl restart postgresql
   ```

### Database Creation

1. **Create database and user**:

   ```bash
   sudo -u postgres psql -c "CREATE USER securetransport WITH PASSWORD 'strong_password_here';"
   sudo -u postgres psql -c "CREATE DATABASE securetransport OWNER securetransport;"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE securetransport TO securetransport;"
   ```

2. **Enable PostGIS extension**:

   ```bash
   sudo -u postgres psql -d securetransport -c "CREATE EXTENSION postgis;"
   sudo -u postgres psql -d securetransport -c "CREATE EXTENSION postgis_topology;"
   sudo -u postgres psql -d securetransport -c "CREATE EXTENSION btree_gist;"
   ```

### Database Optimization

1. **Set up connection pooling with PgBouncer**:

   ```bash
   sudo apt install -y pgbouncer
   
   # Configure PgBouncer
   sudo nano /etc/pgbouncer/pgbouncer.ini
   
   # Add database connection
   [databases]
   securetransport = host=127.0.0.1 port=5432 dbname=securetransport user=securetransport
   
   # General settings
   [pgbouncer]
   listen_addr = *
   listen_port = 6432
   auth_type = md5
   auth_file = /etc/pgbouncer/userlist.txt
   pool_mode = transaction
   max_client_conn = 1000
   default_pool_size = 20
   ```

2. **Create auth file for PgBouncer**:

   ```bash
   # Generate MD5 password
   echo "\"securetransport\" \"md5$(echo -n 'strong_password_heresecuretransport' | md5sum | cut -d' ' -f1)\"" | sudo tee /etc/pgbouncer/userlist.txt
   
   # Restart PgBouncer
   sudo systemctl restart pgbouncer
   ```

### Database Backup Configuration

1. **Create backup script**:

   ```bash
   sudo nano /usr/local/bin/backup-postgres.sh
   ```

2. **Add backup logic**:

   ```bash
   #!/bin/bash
   
   BACKUP_DIR="/var/backups/postgresql"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   DB_NAME="securetransport"
   
   # Create backup directory if it doesn't exist
   mkdir -p $BACKUP_DIR
   
   # Create full backup with pg_dump
   pg_dump -U securetransport -h localhost -F c -b -v -f "$BACKUP_DIR/$DB_NAME-$TIMESTAMP.backup" $DB_NAME
   
   # Keep only last 7 daily backups
   find $BACKUP_DIR -name "$DB_NAME-*.backup" -type f -mtime +7 -delete
   ```

3. **Make script executable and schedule with cron**:

   ```bash
   sudo chmod +x /usr/local/bin/backup-postgres.sh
   
   # Add to crontab
   sudo crontab -e
   
   # Add this line for daily backup at 2am
   0 2 * * * /usr/local/bin/backup-postgres.sh > /var/log/postgres-backup.log 2>&1
   ```

## Application Deployment

### Application Directory Structure

Create a consistent directory structure:

```
/var/www/secureapp/
├── releases/             # Contains versioned releases
│   ├── 20230330_123045/  # Release timestamp
│   ├── 20230331_134513/  # Another release
│   └── ...
├── shared/               # Shared files across releases
│   ├── logs/             # Application logs
│   ├── uploads/          # User uploads
│   ├── .env              # Environment configuration
│   └── config/           # Configuration files
└── current -> ./releases/20230331_134513/  # Symbolic link to current release
```

### Application Installation

1. **Prepare application directory**:

   ```bash
   sudo mkdir -p /var/www/secureapp/{releases,shared,shared/logs,shared/uploads,shared/config}
   sudo chown -R secureapp:secureapp /var/www/secureapp
   ```

2. **Deploy application code**:

   ```bash
   # Set timestamp for release
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   RELEASE_DIR="/var/www/secureapp/releases/$TIMESTAMP"
   
   # Create release directory
   sudo mkdir -p $RELEASE_DIR
   sudo chown secureapp:secureapp $RELEASE_DIR
   
   # Deploy code (as secureapp user)
   sudo -u secureapp git clone https://github.com/your-organization/secure-transport.git $RELEASE_DIR
   
   # Navigate to release directory
   cd $RELEASE_DIR
   
   # Install dependencies
   sudo -u secureapp npm ci --production
   
   # Build application
   sudo -u secureapp npm run build
   
   # Create symbolic links to shared directories
   sudo -u secureapp ln -sf /var/www/secureapp/shared/logs logs
   sudo -u secureapp ln -sf /var/www/secureapp/shared/uploads uploads
   sudo -u secureapp ln -sf /var/www/secureapp/shared/.env .env
   sudo -u secureapp ln -sf /var/www/secureapp/shared/config config
   
   # Update "current" symlink
   sudo -u secureapp ln -sfn $RELEASE_DIR /var/www/secureapp/current
   ```

3. **Create environment configuration**:

   ```bash
   sudo -u secureapp nano /var/www/secureapp/shared/.env
   ```

4. **Add environment variables**:

   ```
   # Server
   NODE_ENV=production
   PORT=5000
   HTTPS_PORT=443
   
   # Database
   DATABASE_URL=postgres://securetransport:strong_password_here@localhost:6432/securetransport
   
   # JWT Authentication
   JWT_SECRET=your_secure_jwt_secret_here
   JWT_EXPIRY=24h
   
   # Email Configuration
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   
   # API Keys for External Services
   MAPS_API_KEY=your_maps_api_key
   
   # Redis Cache
   REDIS_URL=redis://localhost:6379
   
   # Logging
   LOG_LEVEL=info
   ```

### Process Management

1. **Install PM2**:

   ```bash
   sudo npm install -g pm2
   ```

2. **Create PM2 configuration file**:

   ```bash
   sudo -u secureapp nano /var/www/secureapp/ecosystem.config.js
   ```

3. **Add configuration**:

   ```javascript
   module.exports = {
     apps: [
       {
         name: "secure-transport-api",
         script: "/var/www/secureapp/current/dist/server/index.js",
         instances: "max",
         exec_mode: "cluster",
         autorestart: true,
         watch: false,
         max_memory_restart: "1G",
         env: {
           NODE_ENV: "production"
         },
         log_date_format: "YYYY-MM-DD HH:mm:ss",
         error_file: "/var/www/secureapp/shared/logs/error.log",
         out_file: "/var/www/secureapp/shared/logs/out.log"
       },
       {
         name: "secure-transport-worker",
         script: "/var/www/secureapp/current/dist/worker/index.js",
         instances: 2,
         exec_mode: "cluster",
         autorestart: true,
         watch: false,
         max_memory_restart: "1G",
         env: {
           NODE_ENV: "production"
         },
         log_date_format: "YYYY-MM-DD HH:mm:ss",
         error_file: "/var/www/secureapp/shared/logs/worker-error.log",
         out_file: "/var/www/secureapp/shared/logs/worker-out.log"
       }
     ]
   };
   ```

4. **Start the application**:

   ```bash
   sudo -u secureapp PM2_HOME=/var/www/secureapp/.pm2 pm2 start /var/www/secureapp/ecosystem.config.js
   ```

5. **Configure PM2 to start on boot**:

   ```bash
   sudo -u secureapp PM2_HOME=/var/www/secureapp/.pm2 pm2 startup -u secureapp
   
   # Run the generated command
   # Save current process list
   sudo -u secureapp PM2_HOME=/var/www/secureapp/.pm2 pm2 save
   ```

### Web Server Configuration

1. **Install NGINX**:

   ```bash
   sudo apt install -y nginx
   ```

2. **Configure NGINX for the application**:

   ```bash
   sudo nano /etc/nginx/sites-available/securetransport
   ```

3. **Add configuration**:

   ```nginx
   upstream api_servers {
       server 127.0.0.1:5000;
       # For multiple API servers
       # server 10.0.0.2:5000;
       # server 10.0.0.3:5000;
       keepalive 64;
   }
   
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Redirect HTTP to HTTPS
       location / {
           return 301 https://$host$request_uri;
       }
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;
       
       # SSL Configuration
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_prefer_server_ciphers on;
       ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 10m;
       ssl_session_tickets off;
       
       # HSTS Configuration
       add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
       
       # Other security headers
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Referrer-Policy "strict-origin-when-cross-origin" always;
       
       # Root directory
       root /var/www/secureapp/current/dist/public;
       
       # Serve static files directly
       location /assets/ {
           expires 30d;
           add_header Cache-Control "public, max-age=2592000";
           access_log off;
       }
       
       # API proxy
       location /api/ {
           proxy_pass http://api_servers;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           proxy_buffering off;
           proxy_read_timeout 300;
           proxy_connect_timeout 300;
           proxy_send_timeout 300;
       }
       
       # WebSocket proxy
       location /ws {
           proxy_pass http://api_servers;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_read_timeout 86400; # 24 hours
       }
       
       # Everything else goes to the frontend
       location / {
           try_files $uri /index.html;
           expires -1;
           add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
       }
       
       # Error logs
       error_log /var/log/nginx/securetransport-error.log error;
       access_log /var/log/nginx/securetransport-access.log;
   }
   ```

4. **Enable the site**:

   ```bash
   sudo ln -s /etc/nginx/sites-available/securetransport /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl reload nginx
   ```

5. **Set up SSL with Let's Encrypt**:

   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   
   # Auto-renewal
   sudo systemctl status certbot.timer  # Verify timer is active
   ```

### Redis Installation

1. **Install Redis**:

   ```bash
   sudo apt install -y redis-server
   ```

2. **Configure Redis**:

   ```bash
   sudo nano /etc/redis/redis.conf
   ```

3. **Update Redis configuration**:

   ```
   # Bind to localhost only (or to internal network for multiple servers)
   bind 127.0.0.1
   
   # Set password (optional but recommended)
   requirepass your_secure_redis_password
   
   # Performance optimizations
   maxmemory 2gb
   maxmemory-policy allkeys-lru
   
   # Persistence configuration
   appendonly yes
   appendfsync everysec
   
   # Enable basic monitoring
   protected-mode yes
   ```

4. **Restart Redis**:

   ```bash
   sudo systemctl restart redis-server
   ```

## Security Configuration

### SSL/TLS Configuration

1. **Generate strong Diffie-Hellman parameters**:

   ```bash
   sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048
   ```

2. **Update NGINX SSL configuration**:

   ```bash
   sudo nano /etc/nginx/sites-available/securetransport
   ```

3. **Add the following to the SSL section**:

   ```nginx
   ssl_dhparam /etc/nginx/dhparam.pem;
   ssl_ecdh_curve secp384r1;
   ```

### Firewall Configuration for Production

1. **Configure firewall to allow only necessary services**:

   ```bash
   # Allow SSH (restrict to your IP if possible)
   sudo ufw allow from your.ip.address.here to any port 22
   
   # Allow HTTP and HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # Deny all other incoming traffic
   sudo ufw default deny incoming
   
   # Allow all outgoing traffic
   sudo ufw default allow outgoing
   
   # Enable firewall
   sudo ufw enable
   ```

### Fail2ban Setup

1. **Install Fail2ban**:

   ```bash
   sudo apt install -y fail2ban
   ```

2. **Configure Fail2ban**:

   ```bash
   sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
   sudo nano /etc/fail2ban/jail.local
   ```

3. **Update configuration**:

   ```
   [DEFAULT]
   bantime = 3600
   findtime = 600
   maxretry = 5
   
   [sshd]
   enabled = true
   port = ssh
   filter = sshd
   logpath = /var/log/auth.log
   
   [nginx-http-auth]
   enabled = true
   filter = nginx-http-auth
   port = http,https
   logpath = /var/log/nginx/error.log
   ```

4. **Restart Fail2ban**:

   ```bash
   sudo systemctl restart fail2ban
   ```

### Security Auditing

1. **Install Lynis for security auditing**:

   ```bash
   sudo apt install -y lynis
   ```

2. **Run a security audit**:

   ```bash
   sudo lynis audit system
   ```

3. **Review the recommendations and apply appropriate fixes**

## High Availability Setup

### Database High Availability

1. **Set up PostgreSQL streaming replication**:

   On the primary server:

   ```bash
   sudo nano /etc/postgresql/14/main/postgresql.conf
   
   # Update these settings
   listen_addresses = '*'
   wal_level = replica
   max_wal_senders = 10
   wal_keep_segments = 64
   hot_standby = on
   ```

2. **Configure authentication for replication**:

   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   
   # Add this line (replace with actual replica IP)
   host    replication     replicator      replica_server_ip/32        md5
   ```

3. **Create replication user**:

   ```bash
   sudo -u postgres psql -c "CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'strong_replication_password';"
   ```

4. **Restart PostgreSQL on primary**:

   ```bash
   sudo systemctl restart postgresql
   ```

5. **On the replica server, initialize from primary**:

   ```bash
   # Stop PostgreSQL
   sudo systemctl stop postgresql
   
   # Backup original data directory
   sudo mv /var/lib/postgresql/14/main /var/lib/postgresql/14/main_orig
   
   # Create new data directory
   sudo mkdir -p /var/lib/postgresql/14/main
   sudo chown postgres:postgres /var/lib/postgresql/14/main
   
   # Initialize from primary
   sudo -u postgres pg_basebackup -h primary_server_ip -D /var/lib/postgresql/14/main -P -U replicator -X stream -C -S replslot1
   ```

6. **Configure replica as standby**:

   ```bash
   sudo -u postgres touch /var/lib/postgresql/14/main/standby.signal
   
   sudo nano /var/lib/postgresql/14/main/postgresql.auto.conf
   
   # Add these lines
   primary_conninfo = 'host=primary_server_ip port=5432 user=replicator password=strong_replication_password application_name=replica1'
   restore_command = 'cp /var/lib/postgresql/14/main/archive/%f %p'
   ```

7. **Start PostgreSQL on replica**:

   ```bash
   sudo systemctl start postgresql
   ```

### Redis High Availability

1. **Set up Redis Sentinel for high availability**:

   Install Redis on at least 3 servers (1 master, 2 replicas)

2. **Configure Redis master**:

   ```bash
   sudo nano /etc/redis/redis.conf
   
   # Update with these settings
   bind 0.0.0.0
   requirepass "strong_redis_password"
   masterauth "strong_redis_password"
   ```

3. **Configure Redis replicas**:

   ```bash
   sudo nano /etc/redis/redis.conf
   
   # Add these settings
   replicaof master_ip 6379
   masterauth "strong_redis_password"
   requirepass "strong_redis_password"
   ```

4. **Install Redis Sentinel on all nodes**:

   ```bash
   sudo nano /etc/redis/sentinel.conf
   
   # Configure Sentinel
   sentinel monitor mymaster master_ip 6379 2
   sentinel auth-pass mymaster strong_redis_password
   sentinel down-after-milliseconds mymaster 5000
   sentinel failover-timeout mymaster 60000
   sentinel parallel-syncs mymaster 1
   ```

5. **Start Sentinel on all nodes**:

   ```bash
   sudo systemctl enable redis-sentinel
   sudo systemctl start redis-sentinel
   ```

### Application High Availability

1. **Deploy application to multiple servers**

2. **Update load balancer configuration**:

   ```nginx
   upstream api_servers {
       server api_server1_ip:5000 max_fails=3 fail_timeout=30s;
       server api_server2_ip:5000 max_fails=3 fail_timeout=30s;
       server api_server3_ip:5000 max_fails=3 fail_timeout=30s backup;
       keepalive 64;
   }
   ```

3. **Implement application health checks**:

   ```bash
   # Create a health check endpoint in your application
   # Monitor health with a separate service
   
   sudo apt install -y monit
   
   sudo nano /etc/monit/conf.d/secureapp
   
   # Add monitoring configuration
   check host secureapp with address 127.0.0.1
       if failed port 5000 protocol http
           request "/api/health"
           with timeout 10 seconds
           then restart
       if 5 restarts within 15 cycles then timeout
   ```

## Load Balancing

### NGINX Load Balancer Setup

1. **Install NGINX**:

   ```bash
   sudo apt install -y nginx
   ```

2. **Configure NGINX as a load balancer**:

   ```bash
   sudo nano /etc/nginx/conf.d/load-balancer.conf
   ```

3. **Add load balancing configuration**:

   ```nginx
   upstream backend_servers {
       least_conn;
       server backend1_ip:5000 weight=5 max_fails=3 fail_timeout=30s;
       server backend2_ip:5000 weight=5 max_fails=3 fail_timeout=30s;
       server backend3_ip:5000 weight=3 max_fails=3 fail_timeout=30s;
       server backup_server_ip:5000 backup;
   }
   
   upstream websocket_servers {
       hash $remote_addr consistent;
       server websocket1_ip:5000 max_fails=3 fail_timeout=30s;
       server websocket2_ip:5000 max_fails=3 fail_timeout=30s;
   }
   
   server {
       listen 80;
       server_name yourdomain.com;
       return 301 https://$host$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       # SSL Configuration
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       # ... other SSL settings ...
       
       # API endpoints
       location /api/ {
           proxy_pass http://backend_servers;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Health checks
           health_check interval=10 fails=3 passes=2;
       }
       
       # WebSocket endpoints
       location /ws {
           proxy_pass http://websocket_servers;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           # ... other headers ...
           
           # Longer timeouts for WebSockets
           proxy_read_timeout 3600s;
           proxy_send_timeout 3600s;
       }
       
       # Static content
       location / {
           proxy_pass http://backend_servers;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # Cache static content
           proxy_cache my_cache;
           proxy_cache_valid 200 302 10m;
           proxy_cache_valid 404 1m;
       }
   }
   ```

4. **Configure NGINX cache**:

   ```bash
   sudo nano /etc/nginx/nginx.conf
   
   # Add inside the http section
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
   ```

5. **Restart NGINX**:

   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### HAProxy Load Balancer (Alternative)

1. **Install HAProxy**:

   ```bash
   sudo apt install -y haproxy
   ```

2. **Configure HAProxy**:

   ```bash
   sudo nano /etc/haproxy/haproxy.cfg
   ```

3. **Add configuration**:

   ```
   global
       log /dev/log local0
       log /dev/log local1 notice
       chroot /var/lib/haproxy
       stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
       stats timeout 30s
       user haproxy
       group haproxy
       daemon
   
       # Default SSL material locations
       ca-base /etc/ssl/certs
       crt-base /etc/ssl/private
   
       # SSL configuration
       ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
       ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11 no-tls-tickets
   
   defaults
       log     global
       mode    http
       option  httplog
       option  dontlognull
       timeout connect 5000
       timeout client  50000
       timeout server  50000
       errorfile 400 /etc/haproxy/errors/400.http
       errorfile 403 /etc/haproxy/errors/403.http
       errorfile 408 /etc/haproxy/errors/408.http
       errorfile 500 /etc/haproxy/errors/500.http
       errorfile 502 /etc/haproxy/errors/502.http
       errorfile 503 /etc/haproxy/errors/503.http
       errorfile 504 /etc/haproxy/errors/504.http
   
   frontend http-in
       bind *:80
       mode http
       option forwardfor
       http-request redirect scheme https code 301 unless { ssl_fc }
   
   frontend https-in
       bind *:443 ssl crt /etc/haproxy/certs/yourdomain.pem
       mode http
       option forwardfor
       
       # ACLs for routing
       acl is_api path_beg /api/
       acl is_websocket path_beg /ws
       
       # Use different backends based on path
       use_backend api_servers if is_api
       use_backend websocket_servers if is_websocket
       default_backend web_servers
   
   backend api_servers
       mode http
       balance roundrobin
       option httpchk GET /api/health
       http-check expect status 200
       server api1 api_server1_ip:5000 check
       server api2 api_server2_ip:5000 check
       server api3 api_server3_ip:5000 check backup
   
   backend websocket_servers
       mode http
       balance source
       option httpchk GET /api/health
       http-check expect status 200
       server ws1 websocket_server1_ip:5000 check
       server ws2 websocket_server2_ip:5000 check
   
   backend web_servers
       mode http
       balance roundrobin
       option httpchk GET /
       http-check expect status 200
       server web1 web_server1_ip:5000 check
       server web2 web_server2_ip:5000 check
   
   listen stats
       bind *:8404
       stats enable
       stats uri /stats
       stats refresh 10s
       stats auth admin:your_secure_password
   ```

4. **Prepare SSL certificate for HAProxy**:

   ```bash
   sudo mkdir -p /etc/haproxy/certs
   sudo cat /etc/letsencrypt/live/yourdomain.com/fullchain.pem /etc/letsencrypt/live/yourdomain.com/privkey.pem > /etc/haproxy/certs/yourdomain.pem
   sudo chmod 600 /etc/haproxy/certs/yourdomain.pem
   ```

5. **Restart HAProxy**:

   ```bash
   sudo systemctl restart haproxy
   ```

## Monitoring Setup

### Prometheus Installation

1. **Install Prometheus**:

   ```bash
   # Create user for Prometheus
   sudo useradd --no-create-home --shell /bin/false prometheus
   
   # Create directories
   sudo mkdir -p /etc/prometheus /var/lib/prometheus
   
   # Download Prometheus
   cd /tmp
   wget https://github.com/prometheus/prometheus/releases/download/v2.37.0/prometheus-2.37.0.linux-amd64.tar.gz
   tar -xvf prometheus-2.37.0.linux-amd64.tar.gz
   
   # Copy binaries
   sudo cp prometheus-2.37.0.linux-amd64/prometheus /usr/local/bin/
   sudo cp prometheus-2.37.0.linux-amd64/promtool /usr/local/bin/
   
   # Copy config files
   sudo cp -r prometheus-2.37.0.linux-amd64/consoles /etc/prometheus
   sudo cp -r prometheus-2.37.0.linux-amd64/console_libraries /etc/prometheus
   
   # Set ownership
   sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
   sudo chown prometheus:prometheus /usr/local/bin/prometheus
   sudo chown prometheus:prometheus /usr/local/bin/promtool
   ```

2. **Configure Prometheus**:

   ```bash
   sudo nano /etc/prometheus/prometheus.yml
   ```

3. **Add configuration**:

   ```yaml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s
   
   alerting:
     alertmanagers:
     - static_configs:
       - targets:
         # - alertmanager:9093
   
   rule_files:
     # - "first_rules.yml"
   
   scrape_configs:
     - job_name: 'prometheus'
       static_configs:
         - targets: ['localhost:9090']
     
     - job_name: 'node_exporter'
       static_configs:
         - targets: ['localhost:9100', 'server2_ip:9100', 'server3_ip:9100']
     
     - job_name: 'securetransport_api'
       metrics_path: '/api/metrics'
       static_configs:
         - targets: ['api_server1_ip:5000', 'api_server2_ip:5000']
   ```

4. **Create a systemd service for Prometheus**:

   ```bash
   sudo nano /etc/systemd/system/prometheus.service
   ```

5. **Add service configuration**:

   ```
   [Unit]
   Description=Prometheus
   Wants=network-online.target
   After=network-online.target
   
   [Service]
   User=prometheus
   Group=prometheus
   Type=simple
   ExecStart=/usr/local/bin/prometheus \
       --config.file /etc/prometheus/prometheus.yml \
       --storage.tsdb.path /var/lib/prometheus/ \
       --web.console.templates=/etc/prometheus/consoles \
       --web.console.libraries=/etc/prometheus/console_libraries
   
   [Install]
   WantedBy=multi-user.target
   ```

6. **Start Prometheus**:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start prometheus
   sudo systemctl enable prometheus
   ```

### Node Exporter Installation

1. **Install Node Exporter on all servers**:

   ```bash
   # Create user
   sudo useradd --no-create-home --shell /bin/false node_exporter
   
   # Download and install
   cd /tmp
   wget https://github.com/prometheus/node_exporter/releases/download/v1.3.1/node_exporter-1.3.1.linux-amd64.tar.gz
   tar -xvf node_exporter-1.3.1.linux-amd64.tar.gz
   
   sudo cp node_exporter-1.3.1.linux-amd64/node_exporter /usr/local/bin/
   sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter
   ```

2. **Create a systemd service**:

   ```bash
   sudo nano /etc/systemd/system/node_exporter.service
   ```

3. **Add service configuration**:

   ```
   [Unit]
   Description=Node Exporter
   Wants=network-online.target
   After=network-online.target
   
   [Service]
   User=node_exporter
   Group=node_exporter
   Type=simple
   ExecStart=/usr/local/bin/node_exporter
   
   [Install]
   WantedBy=multi-user.target
   ```

4. **Start Node Exporter**:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start node_exporter
   sudo systemctl enable node_exporter
   ```

### Grafana Installation

1. **Install Grafana**:

   ```bash
   # Add Grafana repository
   wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -
   echo "deb https://packages.grafana.com/oss/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
   
   # Update and install
   sudo apt update
   sudo apt install -y grafana
   ```

2. **Start Grafana**:

   ```bash
   sudo systemctl start grafana-server
   sudo systemctl enable grafana-server
   ```

3. **Access Grafana**:

   Open `http://your_server_ip:3000` in a browser
   
   Default login:
   - Username: admin
   - Password: admin
   
   You'll be prompted to change the password on first login.

4. **Configure Grafana**:

   - Add Prometheus as a data source
   - Import dashboards for Node Exporter and application metrics
   - Set up alerting

### Application Metrics

1. **Add Prometheus client to the application**:

   ```bash
   # Install required packages
   npm install prom-client

   # Create metrics endpoint in your application
   ```

2. **Create metrics endpoint in the application**:

   ```javascript
   // Example implementation in Node.js
   const express = require('express');
   const promClient = require('prom-client');
   
   // Create a Registry to register metrics
   const register = new promClient.Registry();
   
   // Add default metrics (CPU, memory, event loop, etc.)
   promClient.collectDefaultMetrics({ register });
   
   // Create custom metrics
   const httpRequestDurationMicroseconds = new promClient.Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status_code'],
     buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
   });
   
   const apiCallCounter = new promClient.Counter({
     name: 'api_calls_total',
     help: 'Total count of API calls',
     labelNames: ['method', 'endpoint']
   });
   
   // Register the metrics
   register.registerMetric(httpRequestDurationMicroseconds);
   register.registerMetric(apiCallCounter);
   
   // Add metrics endpoint to your Express app
   app.get('/api/metrics', async (req, res) => {
     res.set('Content-Type', register.contentType);
     res.end(await register.metrics());
   });
   ```

## Backup Configuration

### Comprehensive Backup Strategy

1. **Database backups**:

   ```bash
   # Create backup script
   sudo nano /usr/local/bin/backup-system.sh
   ```

2. **Add backup script content**:

   ```bash
   #!/bin/bash
   
   # Configuration
   BACKUP_DIR="/var/backups/securetransport"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   DB_NAME="securetransport"
   DB_USER="securetransport"
   APP_DIR="/var/www/secureapp"
   RETENTION_DAYS=7
   
   # Ensure backup directory exists
   mkdir -p $BACKUP_DIR/{database,files,config}
   
   # Database backup
   echo "Starting database backup..."
   pg_dump -U $DB_USER -h localhost -F c -b -v -f "$BACKUP_DIR/database/$DB_NAME-$TIMESTAMP.backup" $DB_NAME
   
   # Application files backup
   echo "Starting application files backup..."
   tar -czf "$BACKUP_DIR/files/app-$TIMESTAMP.tar.gz" -C $APP_DIR/shared logs uploads
   
   # Configuration backup
   echo "Starting configuration backup..."
   tar -czf "$BACKUP_DIR/config/config-$TIMESTAMP.tar.gz" /etc/nginx/sites-available /etc/postgresql/14/main/*.conf /etc/redis/redis.conf $APP_DIR/shared/.env $APP_DIR/shared/config
   
   # Cleanup old backups
   echo "Cleaning up old backups..."
   find $BACKUP_DIR/database -name "*.backup" -type f -mtime +$RETENTION_DAYS -delete
   find $BACKUP_DIR/files -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
   find $BACKUP_DIR/config -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
   
   echo "Backup completed at $(date)"
   ```

3. **Make script executable and schedule with cron**:

   ```bash
   sudo chmod +x /usr/local/bin/backup-system.sh
   
   # Add to crontab
   sudo crontab -e
   
   # Add this line for daily backup at 2am
   0 2 * * * /usr/local/bin/backup-system.sh > /var/log/backup.log 2>&1
   ```

### Remote Backup Storage

1. **Set up remote backup storage**:

   ```bash
   # Install rclone
   curl https://rclone.org/install.sh | sudo bash
   
   # Configure rclone (follow interactive prompts)
   rclone config
   
   # Create script for remote backup sync
   sudo nano /usr/local/bin/sync-backups.sh
   ```

2. **Add remote sync script**:

   ```bash
   #!/bin/bash
   
   # Sync to your configured remote (e.g., AWS S3, Google Drive, etc.)
   rclone sync /var/backups/securetransport remote:securetransport-backups --progress
   
   echo "Backup sync completed at $(date)"
   ```

3. **Make script executable and schedule**:

   ```bash
   sudo chmod +x /usr/local/bin/sync-backups.sh
   
   # Add to crontab - run 30 minutes after the backup
   sudo crontab -e
   
   # Add this line
   30 2 * * * /usr/local/bin/sync-backups.sh > /var/log/backup-sync.log 2>&1
   ```

### Testing Backup Restoration

Regularly test backup restoration to ensure backups are valid:

1. **Create a backup restoration test script**:

   ```bash
   sudo nano /usr/local/bin/test-backup-restore.sh
   ```

2. **Add script content**:

   ```bash
   #!/bin/bash
   
   # Configuration
   BACKUP_DIR="/var/backups/securetransport"
   TEST_DIR="/tmp/backup-test"
   DB_NAME="securetransport_test"
   DB_USER="securetransport"
   
   # Get the most recent database backup
   LATEST_DB_BACKUP=$(ls -t $BACKUP_DIR/database/*.backup | head -1)
   
   # Test database restore
   echo "Testing database backup restoration..."
   sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DB_NAME;"
   sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;"
   pg_restore -U postgres -d $DB_NAME $LATEST_DB_BACKUP
   
   # Check if the restore was successful
   TABLES=$(sudo -u postgres psql -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
   if [ $TABLES -gt 0 ]; then
     echo "Database restoration successful. Found $TABLES tables."
   else
     echo "Database restoration failed!"
     exit 1
   fi
   
   # Clean up
   sudo -u postgres psql -c "DROP DATABASE $DB_NAME;"
   
   echo "Backup restoration test completed successfully at $(date)"
   ```

3. **Make script executable and schedule monthly**:

   ```bash
   sudo chmod +x /usr/local/bin/test-backup-restore.sh
   
   # Add to crontab
   sudo crontab -e
   
   # Add this line for monthly backup test on the 1st at 3am
   0 3 1 * * /usr/local/bin/test-backup-restore.sh > /var/log/backup-test.log 2>&1
   ```

## Scaling Guidelines

### Vertical Scaling

1. **Increase resources on existing servers**:
   - Upgrade CPU, memory, and disk as needed
   - Optimize server configurations for the new resources

2. **Database scaling**:
   ```bash
   # Update PostgreSQL configuration for larger servers
   sudo nano /etc/postgresql/14/main/postgresql.conf
   
   # For a server with 32GB RAM
   shared_buffers = 8GB         # 25% of RAM
   effective_cache_size = 24GB  # 75% of RAM
   maintenance_work_mem = 2GB   # For maintenance operations
   work_mem = 100MB             # Per-operation memory
   ```

3. **Application scaling**:
   ```bash
   # Update Node.js application to use more workers
   sudo nano /var/www/secureapp/ecosystem.config.js
   
   # Increase worker count
   instances: "max"  # Uses all available CPU cores
   max_memory_restart: "2G"  # Restart if memory exceeds 2GB
   ```

### Horizontal Scaling

1. **Add more application servers**:
   - Deploy the application to new servers
   - Update load balancer configuration to include new servers

2. **Database read replicas**:
   - Set up additional PostgreSQL read replicas
   - Update application to distribute read queries across replicas

3. **Implement caching layers**:
   - Add Redis caching for frequently accessed data
   - Implement CDN for static assets

4. **Load testing**:
   - Use tools like k6, JMeter, or Locust to test scalability
   - Identify bottlenecks and optimize before adding more resources

## Cloud-Specific Deployments

### AWS Deployment

1. **Infrastructure as Code with CloudFormation**:

   ```yaml
   # Example CloudFormation template snippet
   Resources:
     ApplicationLoadBalancer:
       Type: AWS::ElasticLoadBalancingV2::LoadBalancer
       Properties:
         Subnets:
           - !Ref PublicSubnet1
           - !Ref PublicSubnet2
         SecurityGroups:
           - !Ref LoadBalancerSecurityGroup
     
     WebServerGroup:
       Type: AWS::AutoScaling::AutoScalingGroup
       Properties:
         VPCZoneIdentifier:
           - !Ref PrivateSubnet1
           - !Ref PrivateSubnet2
         LaunchConfigurationName: !Ref WebServerLaunchConfig
         MinSize: 2
         MaxSize: 10
         DesiredCapacity: 2
         TargetGroupARNs:
           - !Ref WebServerTargetGroup
   ```

2. **RDS for PostgreSQL**:

   ```yaml
   RDSDBInstance:
     Type: AWS::RDS::DBInstance
     Properties:
       Engine: postgres
       EngineVersion: "14.4"
       DBInstanceClass: db.m5.large
       AllocatedStorage: 100
       StorageType: gp3
       MultiAZ: true
       MasterUsername: !Ref DBUsername
       MasterUserPassword: !Ref DBPassword
       DBName: securetransport
       VPCSecurityGroups:
         - !Ref DBSecurityGroup
       DBSubnetGroupName: !Ref DBSubnetGroup
   ```

3. **ElastiCache for Redis**:

   ```yaml
   RedisCluster:
     Type: AWS::ElastiCache::ReplicationGroup
     Properties:
       ReplicationGroupDescription: SecureTransport Redis Cluster
       CacheNodeType: cache.m5.large
       Engine: redis
       NumCacheClusters: 2
       AutomaticFailoverEnabled: true
       SecurityGroupIds:
         - !Ref RedisSecurityGroup
       CacheSubnetGroupName: !Ref RedisSubnetGroup
   ```

### Azure Deployment

1. **Azure Resource Manager (ARM) template**:

   ```json
   {
     "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
     "contentVersion": "1.0.0.0",
     "resources": [
       {
         "type": "Microsoft.Web/serverfarms",
         "apiVersion": "2020-06-01",
         "name": "securetransport-appservice-plan",
         "location": "[resourceGroup().location]",
         "sku": {
           "name": "P2v2",
           "tier": "PremiumV2",
           "size": "P2v2",
           "family": "Pv2",
           "capacity": 2
         }
       },
       {
         "type": "Microsoft.Web/sites",
         "apiVersion": "2020-06-01",
         "name": "securetransport-webapp",
         "location": "[resourceGroup().location]",
         "dependsOn": [
           "[resourceId('Microsoft.Web/serverfarms', 'securetransport-appservice-plan')]"
         ],
         "properties": {
           "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', 'securetransport-appservice-plan')]",
           "siteConfig": {
             "appSettings": [
               {
                 "name": "NODE_ENV",
                 "value": "production"
               }
             ]
           }
         }
       }
     ]
   }
   ```

2. **Azure Database for PostgreSQL**:

   ```json
   {
     "type": "Microsoft.DBforPostgreSQL/servers",
     "apiVersion": "2017-12-01",
     "name": "securetransport-db",
     "location": "[resourceGroup().location]",
     "properties": {
       "administratorLogin": "[parameters('administratorLogin')]",
       "administratorLoginPassword": "[parameters('administratorLoginPassword')]",
       "version": "14",
       "sslEnforcement": "Enabled",
       "minimalTlsVersion": "TLS1_2",
       "storageProfile": {
         "storageMB": 102400,
         "backupRetentionDays": 7,
         "geoRedundantBackup": "Enabled",
         "storageAutogrow": "Enabled"
       }
     }
   }
   ```

### Google Cloud Platform Deployment

1. **GCP Deployment Manager template**:

   ```yaml
   resources:
   - name: securetransport-instance-template
     type: compute.v1.instanceTemplate
     properties:
       properties:
         machineType: n2-standard-4
         disks:
         - deviceName: boot
           type: PERSISTENT
           boot: true
           autoDelete: true
           initializeParams:
             sourceImage: projects/debian-cloud/global/images/family/debian-11
             diskSizeGb: 50
             diskType: pd-ssd
         networkInterfaces:
         - network: global/networks/default
           accessConfigs:
           - name: External NAT
             type: ONE_TO_ONE_NAT
   
   - name: securetransport-instance-group
     type: compute.v1.instanceGroupManager
     properties:
       zone: us-central1-a
       targetSize: 3
       baseInstanceName: securetransport
       instanceTemplate: $(ref.securetransport-instance-template.selfLink)
   ```

2. **Cloud SQL for PostgreSQL**:

   ```yaml
   - name: securetransport-db
     type: sqladmin.v1beta4.instance
     properties:
       databaseVersion: POSTGRES_14
       settings:
         tier: db-custom-4-16384
         availabilityType: REGIONAL
         backupConfiguration:
           enabled: true
           startTime: "00:00"
           pointInTimeRecoveryEnabled: true
         dataDiskSizeGb: 100
         dataDiskType: PD_SSD
   ```

## Containerized Deployment

### Docker Compose Deployment

1. **Create Docker Compose configuration**:

   ```bash
   sudo nano /var/www/secureapp/docker-compose.yml
   ```

2. **Add configuration**:

   ```yaml
   version: '3.8'
   
   services:
     app:
       image: securetransport/app:latest
       restart: always
       depends_on:
         - postgres
         - redis
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgres://securetransport:${DB_PASSWORD}@postgres:5432/securetransport
         - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
         - JWT_SECRET=${JWT_SECRET}
       ports:
         - "5000:5000"
       volumes:
         - ./shared/uploads:/app/uploads
         - ./shared/logs:/app/logs
         - ./shared/.env:/app/.env
       networks:
         - app-network
   
     worker:
       image: securetransport/worker:latest
       restart: always
       depends_on:
         - postgres
         - redis
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgres://securetransport:${DB_PASSWORD}@postgres:5432/securetransport
         - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
         - JWT_SECRET=${JWT_SECRET}
       volumes:
         - ./shared/uploads:/app/uploads
         - ./shared/logs:/app/logs
         - ./shared/.env:/app/.env
       networks:
         - app-network
   
     postgres:
       image: postgres:14
       restart: always
       environment:
         - POSTGRES_USER=securetransport
         - POSTGRES_PASSWORD=${DB_PASSWORD}
         - POSTGRES_DB=securetransport
       volumes:
         - postgres-data:/var/lib/postgresql/data
       networks:
         - app-network
       command: postgres -c shared_buffers=2GB -c max_connections=200
   
     redis:
       image: redis:6
       restart: always
       command: redis-server --requirepass ${REDIS_PASSWORD}
       volumes:
         - redis-data:/data
       networks:
         - app-network
   
     nginx:
       image: nginx:latest
       restart: always
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx/conf.d:/etc/nginx/conf.d
         - ./nginx/ssl:/etc/nginx/ssl
         - ./shared/logs/nginx:/var/log/nginx
       depends_on:
         - app
       networks:
         - app-network
   
   networks:
     app-network:
       driver: bridge
   
   volumes:
     postgres-data:
     redis-data:
   ```

3. **Create environment file**:

   ```bash
   sudo nano /var/www/secureapp/.env
   ```

4. **Add environment variables**:

   ```
   DB_PASSWORD=your_secure_db_password
   REDIS_PASSWORD=your_secure_redis_password
   JWT_SECRET=your_secure_jwt_secret
   ```

5. **Start the containers**:

   ```bash
   cd /var/www/secureapp
   sudo docker-compose up -d
   ```

### Kubernetes Deployment

1. **Create Kubernetes namespace**:

   ```bash
   kubectl create namespace securetransport
   ```

2. **Create ConfigMap for application configuration**:

   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: securetransport-config
     namespace: securetransport
   data:
     NODE_ENV: "production"
     PORT: "5000"
     LOG_LEVEL: "info"
   ```

3. **Create Secrets for sensitive information**:

   ```bash
   kubectl create secret generic securetransport-secrets \
     --namespace=securetransport \
     --from-literal=database-password=your_secure_db_password \
     --from-literal=redis-password=your_secure_redis_password \
     --from-literal=jwt-secret=your_secure_jwt_secret
   ```

4. **Create PostgreSQL StatefulSet**:

   ```yaml
   apiVersion: apps/v1
   kind: StatefulSet
   metadata:
     name: postgres
     namespace: securetransport
   spec:
     serviceName: postgres
     replicas: 1
     selector:
       matchLabels:
         app: postgres
     template:
       metadata:
         labels:
           app: postgres
       spec:
         containers:
         - name: postgres
           image: postgres:14
           ports:
           - containerPort: 5432
           env:
           - name: POSTGRES_USER
             value: securetransport
           - name: POSTGRES_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: securetransport-secrets
                 key: database-password
           - name: POSTGRES_DB
             value: securetransport
           volumeMounts:
           - name: postgres-data
             mountPath: /var/lib/postgresql/data
     volumeClaimTemplates:
     - metadata:
         name: postgres-data
       spec:
         accessModes: [ "ReadWriteOnce" ]
         resources:
           requests:
             storage: 50Gi
   ```

5. **Create Application Deployment**:

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: securetransport-api
     namespace: securetransport
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: securetransport-api
     template:
       metadata:
         labels:
           app: securetransport-api
       spec:
         containers:
         - name: api
           image: securetransport/api:latest
           ports:
           - containerPort: 5000
           env:
           - name: NODE_ENV
             valueFrom:
               configMapKeyRef:
                 name: securetransport-config
                 key: NODE_ENV
           - name: PORT
             valueFrom:
               configMapKeyRef:
                 name: securetransport-config
                 key: PORT
           - name: DATABASE_URL
             value: postgres://securetransport:$(DATABASE_PASSWORD)@postgres:5432/securetransport
           - name: DATABASE_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: securetransport-secrets
                 key: database-password
           - name: REDIS_URL
             value: redis://:$(REDIS_PASSWORD)@redis:6379
           - name: REDIS_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: securetransport-secrets
                 key: redis-password
           - name: JWT_SECRET
             valueFrom:
               secretKeyRef:
                 name: securetransport-secrets
                 key: jwt-secret
           livenessProbe:
             httpGet:
               path: /api/health
               port: 5000
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /api/ready
               port: 5000
             initialDelaySeconds: 5
             periodSeconds: 5
           resources:
             limits:
               cpu: "1"
               memory: "1Gi"
             requests:
               cpu: "500m"
               memory: "512Mi"
   ```

6. **Create Services**:

   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: postgres
     namespace: securetransport
   spec:
     selector:
       app: postgres
     ports:
     - port: 5432
       targetPort: 5432
     clusterIP: None
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: securetransport-api
     namespace: securetransport
   spec:
     selector:
       app: securetransport-api
     ports:
     - port: 80
       targetPort: 5000
     type: ClusterIP
   ```

7. **Create Ingress**:

   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: securetransport-ingress
     namespace: securetransport
     annotations:
       kubernetes.io/ingress.class: nginx
       cert-manager.io/cluster-issuer: letsencrypt-prod
   spec:
     tls:
     - hosts:
       - securetransport.yourdomain.com
       secretName: securetransport-tls
     rules:
     - host: securetransport.yourdomain.com
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: securetransport-api
               port:
                 number: 80
   ```

## Continuous Deployment

### CI/CD Pipeline with GitHub Actions

1. **Create GitHub Actions workflow file**:

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Production
   
   on:
     push:
       branches: [main]
   
   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - name: Install dependencies
           run: npm ci
         - name: Run tests
           run: npm test
         - name: Run linting
           run: npm run lint
   
     build:
       needs: test
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             cache: 'npm'
         - name: Install dependencies
           run: npm ci
         - name: Build application
           run: npm run build
         - name: Upload build artifacts
           uses: actions/upload-artifact@v3
           with:
             name: build-artifacts
             path: dist
   
     deploy:
       needs: build
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Download build artifacts
           uses: actions/download-artifact@v3
           with:
             name: build-artifacts
             path: dist
         - name: Create release package
           run: |
             tar -czf release.tar.gz dist package.json package-lock.json
         - name: Deploy to Production Server
           uses: appleboy/scp-action@master
           with:
             host: ${{ secrets.PROD_HOST }}
             username: ${{ secrets.PROD_USERNAME }}
             key: ${{ secrets.PROD_SSH_KEY }}
             source: "release.tar.gz"
             target: "/tmp"
         - name: Install on Production Server
           uses: appleboy/ssh-action@master
           with:
             host: ${{ secrets.PROD_HOST }}
             username: ${{ secrets.PROD_USERNAME }}
             key: ${{ secrets.PROD_SSH_KEY }}
             script: |
               TIMESTAMP=$(date +%Y%m%d_%H%M%S)
               RELEASE_DIR="/var/www/secureapp/releases/$TIMESTAMP"
               
               # Create release directory
               mkdir -p $RELEASE_DIR
               
               # Extract release package
               tar -xzf /tmp/release.tar.gz -C $RELEASE_DIR
               
               # Create symbolic links to shared resources
               ln -sf /var/www/secureapp/shared/logs $RELEASE_DIR/logs
               ln -sf /var/www/secureapp/shared/uploads $RELEASE_DIR/uploads
               ln -sf /var/www/secureapp/shared/.env $RELEASE_DIR/.env
               
               # Install production dependencies
               cd $RELEASE_DIR
               npm ci --production
               
               # Update "current" symlink
               ln -sfn $RELEASE_DIR /var/www/secureapp/current
               
               # Restart the application
               PM2_HOME=/var/www/secureapp/.pm2 pm2 reload securetransport-api
               
               # Clean up old releases (keep last 5)
               cd /var/www/secureapp/releases
               ls -t | tail -n +6 | xargs -r rm -rf
               
               # Remove temporary files
               rm /tmp/release.tar.gz
   ```

### Rollback Procedure

1. **Create a rollback script**:

   ```bash
   sudo nano /usr/local/bin/rollback.sh
   ```

2. **Add rollback logic**:

   ```bash
   #!/bin/bash
   
   # Usage: rollback.sh [release_timestamp]
   
   # Configuration
   APP_DIR="/var/www/secureapp"
   RELEASES_DIR="$APP_DIR/releases"
   CURRENT_LINK="$APP_DIR/current"
   
   # Get current release
   CURRENT_RELEASE=$(readlink $CURRENT_LINK)
   CURRENT_TIMESTAMP=$(basename $CURRENT_RELEASE)
   
   if [ -n "$1" ]; then
     # Use specified release timestamp
     TARGET_TIMESTAMP=$1
     TARGET_RELEASE="$RELEASES_DIR/$TARGET_TIMESTAMP"
     
     if [ ! -d "$TARGET_RELEASE" ]; then
       echo "Error: Release $TARGET_TIMESTAMP does not exist"
       exit 1
     fi
   else
     # Get previous release (second most recent)
     PREVIOUS_RELEASE=$(ls -t $RELEASES_DIR | sed -n 2p)
     TARGET_TIMESTAMP=$PREVIOUS_RELEASE
     TARGET_RELEASE="$RELEASES_DIR/$TARGET_TIMESTAMP"
     
     if [ ! -d "$TARGET_RELEASE" ]; then
       echo "Error: No previous release found"
       exit 1
     fi
   fi
   
   echo "Rolling back from $CURRENT_TIMESTAMP to $TARGET_TIMESTAMP"
   
   # Update current symlink
   ln -sfn $TARGET_RELEASE $CURRENT_LINK
   
   # Restart the application
   PM2_HOME=/var/www/secureapp/.pm2 pm2 reload all
   
   echo "Rollback completed successfully"
   ```

3. **Make script executable**:

   ```bash
   sudo chmod +x /usr/local/bin/rollback.sh
   ```

## Post-Deployment Validation

### Health Check Script

1. **Create health check script**:

   ```bash
   sudo nano /usr/local/bin/health-check.sh
   ```

2. **Add health check logic**:

   ```bash
   #!/bin/bash
   
   # Configuration
   APP_URL="https://yourdomain.com"
   API_ENDPOINT="$APP_URL/api/health"
   DB_HOST="localhost"
   DB_PORT="5432"
   DB_USER="securetransport"
   DB_NAME="securetransport"
   REDIS_HOST="localhost"
   REDIS_PORT="6379"
   REDIS_PASSWORD="your_secure_redis_password"
   
   # Check API health
   echo "Checking API health..."
   API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_ENDPOINT)
   
   if [ $API_RESPONSE -eq 200 ]; then
     echo "✅ API is healthy"
   else
     echo "❌ API returned status code: $API_RESPONSE"
   fi
   
   # Check database connection
   echo "Checking database connection..."
   DB_CHECK=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1" 2>&1)
   
   if [[ $DB_CHECK == *"1 row"* ]]; then
     echo "✅ Database connection successful"
   else
     echo "❌ Database connection failed: $DB_CHECK"
   fi
   
   # Check Redis connection
   echo "Checking Redis connection..."
   REDIS_CHECK=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping 2>&1)
   
   if [[ $REDIS_CHECK == "PONG" ]]; then
     echo "✅ Redis connection successful"
   else
     echo "❌ Redis connection failed: $REDIS_CHECK"
   fi
   
   # Check disk space
   echo "Checking disk space..."
   DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
   
   if [ $DISK_USAGE -lt 90 ]; then
     echo "✅ Disk space is sufficient: $DISK_USAGE%"
   else
     echo "❌ Disk space is critical: $DISK_USAGE%"
   fi
   
   # Check memory usage
   echo "Checking memory usage..."
   MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
   
   if [ $MEM_USAGE -lt 90 ]; then
     echo "✅ Memory usage is acceptable: $MEM_USAGE%"
   else
     echo "❌ Memory usage is high: $MEM_USAGE%"
   fi
   
   # Check CPU load
   echo "Checking CPU load..."
   CPU_LOAD=$(uptime | awk '{print $(NF-2)}' | sed 's/,//')
   CPU_CORES=$(nproc)
   CPU_THRESHOLD=$(echo "scale=1; $CPU_CORES * 0.8" | bc)
   
   if (( $(echo "$CPU_LOAD < $CPU_THRESHOLD" | bc -l) )); then
     echo "✅ CPU load is acceptable: $CPU_LOAD (threshold: $CPU_THRESHOLD)"
   else
     echo "❌ CPU load is high: $CPU_LOAD (threshold: $CPU_THRESHOLD)"
   fi
   
   echo "Health check completed at $(date)"
   ```

3. **Make script executable**:

   ```bash
   sudo chmod +x /usr/local/bin/health-check.sh
   ```

4. **Create a cron job to run health checks regularly**:

   ```bash
   sudo crontab -e
   
   # Add this line for checks every 5 minutes
   */5 * * * * /usr/local/bin/health-check.sh > /var/log/health-check.log 2>&1
   ```

### Load Testing

1. **Install k6 for load testing**:

   ```bash
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt update
   sudo apt install -y k6
   ```

2. **Create a load test script**:

   ```bash
   sudo nano /usr/local/bin/load-test.js
   ```

3. **Add load test scenario**:

   ```javascript
   import http from 'k6/http';
   import { check, sleep } from 'k6';
   
   export const options = {
     stages: [
       { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
       { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
       { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
       { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
       { duration: '2m', target: 0 },   // Ramp down to 0 users over 2 minutes
     ],
     thresholds: {
       http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
       'http_req_duration{name:get-vehicles}': ['p(95)<400'],
       'http_req_duration{name:get-telemetry}': ['p(95)<600'],
     },
   };
   
   const BASE_URL = 'https://yourdomain.com';
   
   // Simulate user behavior
   export default function() {
     const params = {
       headers: {
         'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
         'Content-Type': 'application/json',
       },
     };
     
     // Home page
     let res = http.get(`${BASE_URL}/`, params);
     check(res, {
       'homepage status is 200': (r) => r.status === 200,
     });
     sleep(1);
     
     // Get vehicles
     res = http.get(`${BASE_URL}/api/vehicles`, params, {
       tags: { name: 'get-vehicles' },
     });
     check(res, {
       'get vehicles status is 200': (r) => r.status === 200,
       'get vehicles has data': (r) => {
         const data = JSON.parse(r.body);
         return Array.isArray(data.data) && data.data.length > 0;
       },
     });
     sleep(2);
     
     // Get telemetry for a specific vehicle
     // In a real test, you would get the vehicleId from the previous request
     res = http.get(`${BASE_URL}/api/telemetry/V-123456`, params, {
       tags: { name: 'get-telemetry' },
     });
     check(res, {
       'get telemetry status is 200': (r) => r.status === 200,
     });
     sleep(3);
   }
   ```

4. **Run the load test**:

   ```bash
   AUTH_TOKEN=your_auth_token k6 run /usr/local/bin/load-test.js
   ```

### Security Scan

1. **Install OWASP ZAP for security scanning**:

   ```bash
   sudo apt install -y default-jre
   wget https://github.com/zaproxy/zaproxy/releases/download/v2.12.0/ZAP_2.12.0_Linux.tar.gz
   tar -xzf ZAP_2.12.0_Linux.tar.gz
   ```

2. **Create security scan script**:

   ```bash
   sudo nano /usr/local/bin/security-scan.sh
   ```

3. **Add security scan logic**:

   ```bash
   #!/bin/bash
   
   # Configuration
   ZAP_PATH="./ZAP_2.12.0"
   TARGET_URL="https://yourdomain.com"
   REPORT_DIR="/var/reports/security"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   
   # Ensure report directory exists
   mkdir -p $REPORT_DIR
   
   # Run ZAP scan
   echo "Starting security scan of $TARGET_URL..."
   $ZAP_PATH/zap.sh -cmd -quickurl $TARGET_URL -quickout $REPORT_DIR/zap-report-$TIMESTAMP.html
   
   echo "Security scan completed. Report saved to $REPORT_DIR/zap-report-$TIMESTAMP.html"
   ```

4. **Make script executable**:

   ```bash
   sudo chmod +x /usr/local/bin/security-scan.sh
   ```

5. **Schedule monthly security scan**:

   ```bash
   sudo crontab -e
   
   # Add this line for monthly scan on the 1st at 1am
   0 1 1 * * /usr/local/bin/security-scan.sh > /var/log/security-scan.log 2>&1
   ```

---

*This deployment guide is confidential and proprietary to SecureTransport Systems. Unauthorized distribution or reproduction is prohibited.*

*Last updated: March 30, 2023 - Version 2.1*