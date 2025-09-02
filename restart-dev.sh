#!/bin/bash
# Quick restart script for development

echo "🔄 Restarting Terve development environment..."

# Stop current containers
docker-compose down

# Remove any cached containers and images
echo "🧹 Cleaning up..."
docker-compose down --volumes --remove-orphans

# Rebuild and start
echo "🚀 Rebuilding and starting..."
docker-compose up --build -d

# Show status
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Services should be starting up!"
echo "📱 Frontend: http://localhost:3000"  
echo "🔗 Backend: http://localhost:3001"
echo ""
echo "To view logs: docker-compose logs -f [service-name]"
echo "To stop: docker-compose down"
