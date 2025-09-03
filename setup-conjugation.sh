#!/bin/bash

# Setup script for Finnish verb conjugation development environment

set -e

echo "🚀 Setting up Finnish Verb Conjugation system..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Backend dependencies already installed"
fi
cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..

# Check if .env exists, if not create from example
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
    else
        echo "📝 Creating default .env file..."
        cat > .env << EOF
# Database Configuration
DB_HOST=database
DB_PORT=5432
DB_USERNAME=terve_user
DB_PASSWORD=terve_password
DB_NAME=terve

# JWT Configuration  
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Environment
NODE_ENV=development

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
    fi
    echo "⚠️  Please update .env with your actual configuration values"
fi

# Start the services
echo "🐳 Starting Docker services..."
docker-compose up -d database

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
cd backend
npm run migration:run || echo "ℹ️  No migrations to run or already applied"
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Update your .env file with proper configuration values"
echo "2. Start the development servers:"
echo "   Backend:  cd backend && npm run start:dev"
echo "   Frontend: cd frontend && npm run dev"
echo "3. Visit http://localhost:3000/conjugation to test the verb conjugation system"
echo ""
echo "🔧 Available npm scripts in backend:"
echo "   npm run start:dev  - Start backend in development mode"
echo "   npm run build      - Build for production"
echo "   npm run test       - Run tests"
echo ""
echo "🔧 Available npm scripts in frontend:"
echo "   npm run dev        - Start frontend development server"
echo "   npm run build      - Build for production"
echo "   npm run start      - Start production server"
echo ""
echo "📚 Finnish Verb Conjugation Features:"
echo "   • Comprehensive conjugation engine for all 6 Finnish verb types"
echo "   • Interactive exercises with multiple difficulty levels"
echo "   • CEFR-aligned vocabulary (A1-B2)"
echo "   • Multiple choice and text input exercises"
echo "   • Verb library with search and filtering"
echo "   • Real-time conjugation with explanations"
echo ""
echo "Happy coding! 🇫🇮"
