# Finnish Verb Conjugation System

## Overview

This comprehensive Finnish verb conjugation system has been added to the terve Finnish language learning app. It provides:

- **Complete conjugation engine** for all 6 Finnish verb types
- **Interactive exercises** with multiple difficulty levels
- **CEFR-aligned content** (A1-B2 levels)
- **Comprehensive verb library** with search and filtering
- **Real-time conjugation** with detailed explanations

## Backend Architecture

### New Files Added

```
backend/src/conjugation/
├── conjugation.module.ts          # NestJS module configuration
├── conjugation.controller.ts      # REST API endpoints
├── conjugation.service.ts         # Business logic and database operations
├── conjugation.engine.ts          # Core Finnish conjugation algorithms
├── verb.entity.ts                # TypeORM entity for verb storage
└── interfaces/
    └── conjugation.interfaces.ts  # TypeScript interfaces
```

### Key Features

#### 1. Conjugation Engine (`conjugation.engine.ts`)
- **Automatic verb classification** into 6 Finnish conjugation types
- **Stem extraction** with proper vowel harmony handling
- **Full conjugation support** for present, past, conditional, and imperative
- **Active and passive voice** conjugations
- **Vowel harmony rules** applied automatically

#### 2. Verb Database (`verb.entity.ts`)
- Pre-seeded with **14 common Finnish verbs**
- **CEFR level classification** (A1-B2)
- **Frequency rankings** for prioritized learning
- **Example sentences** for context
- **Automatic type detection** for new verbs

#### 3. Exercise Generation (`conjugation.service.ts`)
- **Adaptive difficulty** based on CEFR level
- **Multiple choice** for easy/medium exercises
- **Text input** for hard exercises  
- **Smart wrong answer generation** using similar verbs
- **Detailed explanations** for incorrect answers

### API Endpoints

```
GET /api/conjugation/verbs               # List all verbs
GET /api/conjugation/verb/:infinitive    # Get specific verb info
GET /api/conjugation/conjugate/:verb     # Conjugate a verb
GET /api/conjugation/types               # Get conjugation metadata
GET /api/conjugation/exercise            # Generate practice exercise
GET /api/conjugation/exercises           # Generate multiple exercises
POST /api/conjugation/exercise/check     # Check exercise answers
POST /api/conjugation/verb               # Add new verb
```

## Frontend Architecture

### New Components

```
frontend/src/
├── app/conjugation/page.tsx                    # Main conjugation page
└── components/conjugation/
    └── VerbLibrary.tsx                         # Searchable verb library
```

### Key Features

#### 1. Dual Mode Interface
- **Learn Mode**: Interactive conjugation tables with verb library
- **Practice Mode**: Gamified exercises with instant feedback

#### 2. Verb Library Component
- **Real-time search** by verb or translation
- **Filter by CEFR level** and verb type
- **Frequency indicators** for common verbs
- **One-click conjugation** integration

#### 3. Exercise System
- **Progressive difficulty** (easy → medium → hard)
- **Multiple choice** with plausible wrong answers
- **Text input** for advanced learners
- **Instant feedback** with detailed explanations
- **Visual feedback** (green/red highlighting)

## Finnish Linguistic Features

### Verb Types Supported

1. **Type I** (-a/-ä verbs): sanoa, puhua, antaa
   - Simple vowel endings
   - Most common verb type

2. **Type II** (-da/-dä verbs): syödä, juoda, tehdä
   - Consonant + da/dä endings
   - Stem changes in conjugation

3. **Type III** (-la/-lä, -na/-nä, -ra/-rä, -ta/-tä): tulla, mennä, purra, haluta
   - Complex consonant patterns
   - Often involve consonant gradation

4. **Type IV** (-ata/-ätä verbs): tavata, hypätä
   - Frequentative verbs
   - Regular pattern with 'a' insertion

5. **Type V** (-ita/-itä verbs): tarvita, valita
   - Causative/factitive verbs
   - Stem becomes -tse/-tse-

6. **Type VI** (-eta/-etä verbs): vanheta, kylmetä
   - Inchoative verbs (becoming/getting)
   - Stem becomes -ne/-ne-

### Tenses Implemented

- **Present tense** (preesens): Basic present actions
- **Imperfect/Past tense** (imperfekti): Completed past actions
- **Conditional mood** (konditionaali): Hypothetical situations
- **Imperative mood** (imperatiivi): Commands (2nd person only)

### Voices Supported

- **Active voice**: Standard conjugations for all persons
- **Passive voice**: Finnish passive construction (impersonal)

### Vowel Harmony

The system automatically applies Finnish vowel harmony rules:
- **Back vowels**: a, o, u (endings: -a, -o, -u)
- **Front vowels**: ä, ö, y (endings: -ä, -ö, -y)
- **Neutral vowels**: e, i (don't affect harmony)

## Pre-seeded Verbs

The system includes these essential Finnish verbs:

| Verb | Type | Translation | CEFR Level | Frequency |
|------|------|-------------|------------|-----------|
| olla | III | to be | A1 | 1 |
| sanoa | I | to say | A1 | 2 |
| tehdä | II | to do/make | A1 | 3 |
| mennä | III | to go | A1 | 4 |
| tulla | III | to come | A1 | 5 |
| antaa | I | to give | A1 | 6 |
| ottaa | I | to take | A1 | 7 |
| nähdä | II | to see | A1 | 8 |
| tietää | I | to know | A2 | 9 |
| voida | II | can/be able | A2 | 10 |
| haluta | III | to want | A2 | 11 |
| tavata | IV | to meet | A2 | 15 |
| tarvita | V | to need | A2 | 20 |
| vanheta | VI | to age | B1 | 50 |

## Setup Instructions

### Quick Start

1. **Run setup script**:
   ```bash
   chmod +x setup-conjugation.sh
   ./setup-conjugation.sh
   ```

2. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run start:dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm run dev
   ```

3. **Visit**: http://localhost:3000/conjugation

### Manual Setup

1. **Backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Database setup**:
   ```bash
   docker-compose up -d database
   npm run migration:run
   ```

3. **Frontend dependencies**:
   ```bash
   cd frontend
   npm install
   ```

4. **Environment variables**:
   ```bash
   # Copy .env.example to .env and configure
   cp .env.example .env
   ```

## Usage Examples

### Basic Conjugation

```bash
# Get present tense conjugations for "olla"
curl "http://localhost:3001/api/conjugation/conjugate/olla?tense=1&voice=1"

# Response:
{
  "verb": "olla",
  "verbType": 3,
  "stem": "ol",
  "conjugations": {
    "1s": "olen",
    "2s": "olet", 
    "3s": "on",
    "1p": "olemme",
    "2p": "olette",
    "3p": "ovat"
  },
  "translation": "to be",
  "examples": ["Minä olen suomalainen", "Sinä olet kaunis"]
}
```

### Generate Exercise

```bash
# Get an A1-level easy exercise
curl "http://localhost:3001/api/conjugation/exercise?cefrLevel=A1&difficulty=easy"

# Response:
{
  "id": "1-1-3-1-1672934400000",
  "verb": "olla",
  "person": 3,
  "tense": 1,
  "voice": 1,
  "expectedAnswer": "on",
  "options": ["on", "olen", "olet", "oli"],
  "difficulty": "easy",
  "cefrLevel": "A1"
}
```

## Development Notes

### Adding New Verbs

Verbs are automatically classified, but you can add them manually:

```typescript
// Backend - via API
POST /api/conjugation/verb
{
  "infinitive": "oppia",
  "translation": "to learn",
  "examples": ["Haluan oppia suomea"],
  "cefrLevel": "A2",
  "frequency": 30
}
```

### Extending Tenses

To add new tenses (perfect, pluperfect), extend:

1. `Tense` enum in `verb.entity.ts`
2. `conjugateForPerson()` method in `conjugation.engine.ts`
3. Frontend tense selector options

### Improving Accuracy

The conjugation engine handles most regular verbs automatically, but some irregular verbs may need manual stem corrections or special handling.

## Testing

### Backend Tests

```bash
cd backend
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Coverage report
```

### Frontend Tests

```bash
cd frontend  
npm run test             # Jest tests
npm run test:watch      # Watch mode
```

### Manual Testing Checklist

- [ ] Verb classification works for all 6 types
- [ ] Vowel harmony applied correctly
- [ ] Exercise generation provides varied content
- [ ] Multiple choice has plausible wrong answers
- [ ] Text input accepts correct variations
- [ ] Verb library search and filtering work
- [ ] CEFR level filtering shows appropriate verbs
- [ ] Passive voice conjugations are correct

## Performance Considerations

- **Verb database**: Limited to 50 most common verbs initially
- **Exercise caching**: Could cache generated exercises
- **Conjugation caching**: Results cached in memory
- **Search optimization**: Verb library uses client-side filtering

## Future Enhancements

1. **Additional Tenses**:
   - Perfect (perfekti)
   - Pluperfect (pluskvamperfekti)  
   - Potential mood (potentiaali)

2. **Advanced Features**:
   - Consonant gradation rules
   - Participle forms
   - Infinitive forms (-maan, -massa, etc.)

3. **Learning Features**:
   - Progress tracking
   - Spaced repetition
   - Difficulty adaptation based on performance

4. **Content Expansion**:
   - 100+ most common verbs
   - Audio pronunciations
   - More example sentences

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running
2. **CORS Errors**: Check API_URL in frontend .env
3. **Missing Verbs**: Run database seeding
4. **Wrong Conjugations**: Check vowel harmony implementation

### Debug Mode

Enable debug logging:

```bash
# Backend
NODE_ENV=development npm run start:dev

# Frontend  
NEXT_PUBLIC_DEBUG=true npm run dev
```

This comprehensive Finnish verb conjugation system provides a solid foundation for learning Finnish verb forms with proper linguistic rules and engaging interactive exercises.
