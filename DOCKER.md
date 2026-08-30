# Docker Deployment

This document explains how to deploy the AI-Powered Real-Time Chat Translation App using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose (usually comes with Docker Desktop)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Powered-Real-Time-Chat-Translation-App
   ```

2. **Configure environment variables**
   
   Create/update `Server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://mongodb:27017/chat-translation-app
   JWT_SECRET=your_secret_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   NODE_ENV=production
   FRONTEND_URL=http://localhost
   ```
   
   Create/update `Client/.env`:
   ```env
   VITE_SERVER_API_URL=http://localhost:5000
   ```

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │────▶│   MongoDB   │
│   (Nginx)   │     │  (Node.js)  │     │             │
│   Port: 80  │     │ Port: 5000  │     │ Port: 27017 │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Services

| Service | Description | Port |
|---------|-------------|------|
| client | React frontend served by Nginx | 80 |
| server | Express.js backend with Socket.io | 5000 |
| mongodb | MongoDB database | 27017 |

## Useful Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v

# Rebuild specific service
docker-compose build client
docker-compose up -d client
```

## Production Considerations

1. **HTTPS**: Use a reverse proxy like Traefik or Nginx with SSL certificates
2. **Environment Variables**: Use Docker secrets or environment files for sensitive data
3. **Scaling**: Use Docker Swarm or Kubernetes for horizontal scaling
4. **Monitoring**: Add monitoring with Prometheus and Grafana
5. **Backups**: Configure MongoDB backup strategy
