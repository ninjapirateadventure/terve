#!/bin/bash
echo "🔍 Debugging Terve Backend"
echo ""

echo "1. Checking container status:"
docker-compose ps

echo ""
echo "2. Backend logs (last 20 lines):"
docker-compose logs --tail=20 backend

echo ""
echo "3. Database logs (last 10 lines):"
docker-compose logs --tail=10 database

echo ""
echo "4. Trying to connect to backend container:"
docker-compose exec backend echo "Backend container is running"

echo ""
echo "5. Checking if Node.js process is running in backend:"
docker-compose exec backend ps aux | grep node || echo "No Node.js process found"
