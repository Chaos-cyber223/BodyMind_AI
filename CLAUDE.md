# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BodyMind_AI is a full-stack AI-powered fat loss expert application combining React Native mobile frontend, Python AI services, and Java Spring Boot backend services in a microservices architecture. The project aims to provide science-based, personalized fat loss guidance through AI-powered RAG (Retrieval-Augmented Generation) system.

## Development Commands

### Mobile Development (React Native + Expo)
```bash
# Start mobile development
cd mobile && npm run web                # Web development at http://localhost:19006
cd mobile && npm start                  # Expo development server
cd mobile && npm run android            # Android emulator
cd mobile && npm run ios                # iOS simulator

# Root-level mobile commands
npm run dev:mobile                      # From project root
```

### Backend Services

#### AI Service (Python FastAPI) - ✅ READY
```bash
# Setup AI service environment
cd backend/ai-service
python3 -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements-minimal.txt

# Configure environment
cp .env.example .env
# Edit .env to add OPENAI_API_KEY if available

# Start AI service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# API docs available at: http://localhost:8000/docs

# From project root (future)
npm run dev:ai
```

#### API Service (Java Spring Boot) - ⏳ PLANNED
```bash
cd backend/api-service && ./mvnw spring-boot:run
npm run dev:api                         # From project root

# Start all services simultaneously (when Java service is ready)
npm run dev                             # Runs mobile, AI service, and API service concurrently
```

### Docker Development
```bash
# Full stack with Docker
docker-compose up -d                    # Start all services
docker-compose down                     # Stop all services
npm run docker:up                       # Shorthand for docker-compose up
npm run docker:down                     # Shorthand for docker-compose down
```

### Build Commands
```bash
npm run build                           # Build all services
npm run build:mobile                    # Expo web build
npm run build:ai                        # Docker image for AI service
npm run build:api                       # Maven package for API service
```

### Testing and Quality
```bash
npm run test                            # Run all tests
npm run test:mobile                     # React Native tests
npm run test:ai                         # Python pytest
npm run test:api                        # Java Maven tests

npm run lint                            # Lint all services
npm run lint:mobile                     # Expo lint
npm run lint:ai                         # Python pylint

# Cleanup
npm run clean                           # Clean all services
```

## Architecture Overview

### Tech Stack
- **Mobile**: React Native + TypeScript + Expo + React Navigation
- **AI Backend**: Python 3.10 + FastAPI + OpenAI API + Custom RAG system
- **Business Backend**: Java 17 + Spring Boot 3 + gRPC (planned)
- **Databases**: In-memory knowledge base (current), PostgreSQL + ChromaDB/FAISS (planned)
- **DevOps**: Docker + docker-compose + GitHub Actions
- **External APIs**: OpenAI API for AI responses

### Service Architecture
1. **Mobile App** (`mobile/`): React Native app with screens for Welcome, Profile Setup, and AI Chat
2. **AI Service** (`backend/ai-service/`): Python FastAPI service handling AI chat, RAG queries, and personalized recommendations
3. **API Service** (`backend/api-service/`): Java Spring Boot service managing user data, profiles, and business logic
4. **Shared Types** (`shared/`): Common TypeScript/Python types and utilities

### Key Components
- **Navigation**: React Navigation v7 with stack navigator for screen transitions
- **AI Chat**: Real-time chat interface with AI-powered responses based on scientific fat loss research
- **Profile Setup**: Multi-step form collecting user body metrics for personalized TDEE calculations
- **RAG System**: Retrieval-Augmented Generation using scientific papers for evidence-based recommendations

### Database Schema
- **PostgreSQL**: User accounts, profiles, chat history, and meal/workout plans
- **Vector Database**: Embedded scientific research papers for RAG system
- **Redis**: Session management and caching layer

### Development Environment
- **Monorepo**: Workspaces configured for mobile, ai-service, api-service, and shared modules
- **Hot Reload**: All services support hot reloading during development
- **Docker**: Full containerized development environment with service orchestration
- **Pre-commit**: Husky + lint-staged for code quality enforcement

### Current Implementation Status
- ✅ React Native mobile app with Google Material Design welcome screen
- ✅ Multi-step profile setup with body metrics collection  
- ✅ Complete chat screen UI with message handling
- ✅ **AI Service Backend READY** - FastAPI with full endpoint structure
- ✅ TDEE calculation service with Mifflin-St Jeor equation
- ✅ Food and exercise parsing from natural language
- ✅ Basic RAG system with fat loss knowledge base
- ✅ OpenAI API integration for intelligent responses
- ✅ Comprehensive API documentation (Swagger/OpenAPI)
- ⏳ Frontend-backend integration (next step)
- ⏳ Java backend services (planned for enterprise features)
- ⏳ Vector database integration (enhancement)

### Development Notes
- Mobile app runs on port 19006 for web development
- **AI service runs on port 8000** - ✅ Fully functional FastAPI server
- API service will run on port 8080 (when implemented)
- PostgreSQL on port 5432, Redis on port 6379 (future)
- AI service ready for immediate testing at `http://localhost:8000/docs`
- TypeScript strict mode enabled with comprehensive linting
- Expo Go compatible for mobile testing

### AI Service Features (Ready to Use)
```bash
# Available API endpoints:
POST /api/chat/message          # AI chat with RAG-enhanced responses
POST /api/profile/setup         # User profile setup with TDEE calculation  
POST /api/analysis/food         # Parse food descriptions ("I ate an apple")
POST /api/analysis/exercise     # Parse exercise descriptions ("I ran 30 minutes")
GET  /health                    # Service health check
GET  /docs                      # Interactive API documentation
```

### Quick Test Commands
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test chat (without OpenAI key - will use fallback)
curl -X POST "http://localhost:8000/api/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message": "How do I lose weight?", "user_profile": {"age": 25, "weight": 70}}'

# Test TDEE calculation
curl -X POST "http://localhost:8000/api/profile/setup" \
  -H "Content-Type: application/json" \
  -d '{"age": 25, "gender": "male", "height": 175, "weight": 70, "activity_level": "moderate", "goal": "lose_weight"}'
```