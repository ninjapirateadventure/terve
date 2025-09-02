# Development Documentation

## Stage 1: Foundation & Core Structure

### Database Schema Design

The Terve app uses PostgreSQL with the following core entities:

#### Users
- Basic user profile with OAuth integration
- CEFR level preference
- Learning preferences and settings

#### Words
- Finnish vocabulary with CEFR classifications
- English translations
- Word metadata (frequency, difficulty)

#### User Flashcards
- User-specific word categorization (Well Known, Learning, TODO, Not Interested)
- Learning progress tracking
- Category change history

#### Learning Sessions
- Practice session tracking
- Performance metrics
- Progress over time

### API Design Principles

- RESTful endpoints with consistent naming
- JWT-based authentication after OAuth
- Proper error handling and validation
- Swagger/OpenAPI documentation

### Frontend Architecture

- Next.js with App Router
- TypeScript throughout
- Tailwind CSS for styling
- React Hook Form for form management
- SWR/React Query for data fetching

### Key Design Decisions

1. **Flashcard Categories**: Self-managed by users, not CEFR-based
2. **Story Generation**: Claude API integration for reading comprehension
3. **Word Management**: Automatic refilling of Learning category (90→100 words)
4. **Gamification**: Minimal - only CEFR exam scoring and tracking

## Next Steps

Once Stage 1 is complete:
- Set up basic Next.js and Nest.js applications
- Create database schema and migrations
- Implement basic navigation and routing
- Test the Docker development environment
