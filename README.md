# Terve - Finnish Learning App

Terve (Finnish for "hello") is a comprehensive Finnish language learning application built with Next.js and Nest.js.

## Features

- **Flashcards**: Smart categorization system with automatic word management
- **Verb Conjugation**: Interactive conjugation practice with CEFR difficulty scaling
- **Noun Declension**: Finnish noun case practice exercises  
- **Reading Comprehension**: AI-generated stories tailored to user level and interests
- **CEFR Mock Exams**: Standardized testing with progress tracking

## Architecture

- **Frontend**: Next.js with TypeScript
- **Backend**: Nest.js with TypeScript
- **Database**: PostgreSQL
- **Authentication**: OAuth (Google/GitHub)
- **Deployment**: AWS-ready with local Docker development

## Development Stages

- [x] Stage 1: Foundation & Core Structure
- [ ] Stage 2: Authentication & User Management  
- [ ] Stage 3: Flashcards System
- [ ] Stage 4: CEFR-based Learning Modules
- [ ] Stage 5: Reading Comprehension
- [ ] Stage 6: CEFR Mock Exams

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (for local development without Docker)

### Local Development with Docker

```bash
# Clone and setup
git clone <repository-url>
cd terve

# Start all services
docker-compose up -d

# The app will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database: localhost:5432
```

### Manual Setup

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev # in both frontend and backend directories
```

## Project Structure

```
terve/
├── frontend/          # Next.js application
├── backend/           # Nest.js API server  
├── docs/             # Documentation
├── docker-compose.yml # Docker development setup
└── README.md
```

## Contributing

This project is built incrementally with careful testing at each stage. See the docs/ directory for detailed development guides.
