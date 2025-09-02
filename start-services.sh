#!/bin/bash

echo "🔧 Manual Terve Fix - Step by Step"
echo "=================================="
echo ""

echo "Step 1: Starting all services..."
echo "Running: docker-compose up -d"
docker-compose up -d

echo ""
echo "Step 2: Waiting 20 seconds for database to fully start..."
sleep 20

echo ""
echo "Step 3: Checking which services are running..."
docker-compose ps

echo ""
echo "Step 4: Testing database connection..."
if docker-compose exec -T database psql -U terve_user -d terve -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database connection successful!"
else 
    echo "❌ Database connection failed. Checking logs..."
    docker-compose logs database --tail=10
fi

echo ""
echo "Step 5: Testing backend connection..."
echo "Waiting a bit more for backend to start..."
sleep 10

if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Backend is responding!"
else
    echo "❌ Backend not responding. Checking logs..."
    docker-compose logs backend --tail=15
fi

echo ""
echo "Step 6: Checking frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is responding!"
else
    echo "❌ Frontend not responding. Checking logs..."
    docker-compose logs frontend --tail=10
fi

echo ""
echo "🎯 Next steps:"
echo "1. Wait for all services to fully start (may take 1-2 minutes)"
echo "2. Check http://localhost:3000 in your browser"
echo "3. If still issues, run: docker-compose logs [service-name]"
echo ""
echo "Services should be:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:3001"
echo "- Database: localhost:5432"
