#!/bin/bash
# Development setup script for Terve

echo "🇫🇮 Setting up Terve - Finnish Learning App"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ Please edit .env with your configuration before continuing"
fi

# Clean up any previous failed builds
echo "🧹 Cleaning up previous builds..."
docker-compose down 2>/dev/null || true
docker system prune -f --volumes 2>/dev/null || true

# Build and start the development environment
echo "🚀 Starting development environment..."
docker-compose up --build -d

echo ""
echo "✅ Terve development environment is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔗 Backend API: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/api/docs"
echo "🗄️  Database: localhost:5432"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "To rebuild: docker-compose up --build"
