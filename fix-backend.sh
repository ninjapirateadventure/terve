#!/bin/bash
echo "🛠️  Fixing Backend Issues..."

echo "1. Stopping all containers..."
docker-compose down

echo "2. Removing volumes to reset database..."
docker-compose down --volumes

echo "3. Cleaning up any orphaned containers..."
docker-compose down --remove-orphans

echo "4. Pruning Docker system..."
docker system prune -f

echo "5. Starting fresh..."
docker-compose up --build -d

echo ""
echo "6. Waiting for services to start..."
sleep 10

echo ""
echo "7. Checking container status:"
docker-compose ps

echo ""
echo "8. Backend logs:"
docker-compose logs --tail=15 backend

echo ""
echo "9. Database logs:"
docker-compose logs --tail=10 database

echo ""
echo "✅ Backend should now be accessible at http://localhost:3001"
echo "✅ Frontend should be accessible at http://localhost:3000"
