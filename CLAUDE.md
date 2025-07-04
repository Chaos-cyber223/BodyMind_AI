# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BodyMind_AI is a full-stack AI-powered fat loss expert application with React Native mobile frontend and Python AI backend. The project provides science-based, personalized fat loss guidance through AI-powered RAG (Retrieval-Augmented Generation) system.

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

#### AI Service (Python FastAPI)
```bash
# Setup AI service environment
cd backend/ai-service
python3 -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements-minimal.txt

# Configure environment
cp .env.example .env
# Edit .env to add required keys:
# - SILICONFLOW_API_KEY (for AI models)
# - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (for auth)
# OR for local PostgreSQL:
# - DATABASE_URL, JWT_SECRET (see SUPABASE_SETUP.md)

# Start AI service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8765
# API docs available at: http://localhost:8765/docs

# From project root
npm run dev:ai
```

#### Database Setup (Supabase or Local PostgreSQL)
```bash
# Option 1: Supabase (Recommended)
# Follow backend/database/SUPABASE_SETUP.md for detailed setup

# Option 2: Local PostgreSQL
# Requires PostgreSQL 14+ installed
psql -U postgres -h localhost -p 5432
# Password: Newbunny_25^+@cool
# Then follow local setup in SUPABASE_SETUP.md
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
```

### Testing and Quality
```bash
npm run test                            # Run all tests
npm run test:mobile                     # React Native tests
npm run test:ai                         # Python pytest

npm run lint                            # Lint all services
npm run lint:mobile                     # Expo lint
npm run lint:ai                         # Python pylint

# Cleanup
npm run clean                           # Clean all services
```

## Architecture Overview

### Tech Stack
- **Mobile**: React Native + TypeScript + Expo + React Navigation
- **Backend**: Python 3.10 + FastAPI + LangChain RAG system
- **Database**: 
  - Chroma vector database for embeddings storage
  - PostgreSQL (via Supabase or local) for user data and logs
- **Authentication**: Supabase Auth with JWT tokens
- **DevOps**: Docker + docker-compose
- **External APIs**: SiliconFlow API (DeepSeek-R1 + BGE-M3 embeddings)

### Service Architecture
1. **Mobile App** (`mobile/`): React Native app with Welcome, Profile Setup, and 4 main tabs (Chat, Plan, Progress, Settings)
2. **AI Service** (`backend/ai-service/`): Python FastAPI service handling AI chat, RAG queries, and personalized recommendations

### Key Components
- **Navigation**: React Navigation v7 with bottom tab navigator and stack navigator
- **AI Chat**: Real-time chat interface with AI-powered responses based on scientific fat loss research
- **Profile Setup**: Multi-step form collecting user body metrics for personalized TDEE calculations
- **Meal Plan**: AI-powered food and exercise logging with natural language processing
- **Progress Tracking**: Visual charts for weight trends, nutrition metrics, and exercise statistics
- **RAG System**: Retrieval-Augmented Generation using scientific papers for evidence-based recommendations
- **Tab Navigation**: Bottom tab bar with Chat, Plan, Progress, and Settings tabs
- **Settings Management**: Language switching, notifications, and app preferences

### Database Schema
- **Chroma Vector Database**: Embedded scientific research papers for RAG system
- **PostgreSQL Database**: User authentication, profiles, weight logs, food logs, exercise logs
  - See `backend/database/schema.sql` for complete schema
  - Row Level Security (RLS) policies for data isolation
- **AsyncStorage**: Local storage for user profiles and language preferences

### Development Environment
- **Monorepo**: Workspaces configured for mobile and ai-service
- **Hot Reload**: All services support hot reloading during development
- **Docker**: Containerized development environment
- **Linting**: ESLint + Pylint for code quality

### Current Implementation Status

**Completed Features:**
- React Native Mobile App with Google Material Design
- Multi-step profile setup with body metrics collection
- Real-time chat screen with LangChain RAG integration
- AI-powered meal plan screen with smart logging
- Complete bilingual support (English/Chinese) with i18n system
- Real-time language switching without app restart
- Backend API integration with error handling
- AsyncStorage for profile and language preference persistence
- Reusable LanguageToggle component
- Full tab navigation implementation (Chat, Plan, Progress, Settings)
- SettingsScreen with language switching and notifications
- ResearchScreen displaying scientific research insights
- ProgressScreen with weight trend charts and nutrition/exercise tracking
- Optimized tab navigation without content overlapping issues

- Python FastAPI Backend
- LangChain RAG System with Chroma vector database
- SiliconFlow API integration (DeepSeek-R1 + BGE-M3 embeddings)
- Document upload pipeline for knowledge base expansion
- Conversational memory with context retention
- TDEE calculation service with Mifflin-St Jeor equation
- Food and exercise parsing from natural language
- Scientific source citation in AI responses
- Comprehensive API documentation (Swagger/OpenAPI)

- Frontend-Backend Integration
- Real-time chat with AI responses from LangChain RAG
- API health checks and error handling
- Profile data synchronization between frontend and backend
- AI-powered food/exercise logging with real parsing
- Source citations displayed in chat responses

- Database and Authentication System
- PostgreSQL database schema with users, weight_logs, food_logs, exercise_logs tables
- Supabase Auth integration with email/password and OAuth support
- Row Level Security (RLS) policies for secure data access
- JWT token-based authentication
- Local PostgreSQL development option

**TODO:**
- Frontend authentication UI (login/signup screens)
- Integrate Supabase client in React Native
- Real-time data sync with Supabase subscriptions
- Performance optimization and comprehensive error handling
- Push notifications for meal and workout reminders
- Export data functionality (PDF reports)

### Development Notes
- **Mobile app runs on port 19006** - React Native app with backend integration
- **AI service runs on port 8765** - FastAPI server with LangChain RAG
- SiliconFlow API configured with DeepSeek-R1 model (requires API key)
- Chroma vector database persists at `./chroma_db/`
- TypeScript strict mode enabled with linting
- Expo Go compatible for mobile testing
- AsyncStorage handles user profile and language preference persistence
- Bilingual support (English/Chinese) with instant language switching
- Professional i18n system with 99+ translations covering all UI elements

### AI Service Features
```bash
# Available API endpoints:

# Authentication endpoints
POST /api/auth/signup           # Create new user account
POST /api/auth/login            # Login with email/password
POST /api/auth/logout           # Logout current user
GET  /api/auth/me               # Get current user profile
POST /api/auth/refresh          # Refresh JWT token

# AI-powered endpoints
POST /api/chat/message          # AI chat with LangChain RAG-enhanced responses
POST /api/profile/setup         # User profile setup with TDEE calculation  
POST /api/analysis/food         # Parse food descriptions ("I ate an apple")
POST /api/analysis/exercise     # Parse exercise descriptions ("I ran 30 minutes")

# Data logging endpoints (requires authentication)
POST /api/logs/weight           # Log weight entry
GET  /api/logs/weight           # Get weight history
POST /api/logs/food             # Log food entry
GET  /api/logs/food             # Get food logs
POST /api/logs/exercise         # Log exercise entry
GET  /api/logs/exercise         # Get exercise logs

# Knowledge base management
POST /api/documents/upload      # Upload PDF/TXT documents to knowledge base
GET  /api/documents/topics      # Get available knowledge topics
POST /api/documents/clear-memory # Clear conversation memory

# System endpoints
GET  /health                    # Service health check
GET  /docs                      # Interactive API documentation
```

### LangChain RAG Architecture
- **Vector Store**: Chroma for persistent embeddings storage
- **Embeddings**: BGE-M3 model via SiliconFlow API
- **LLM**: DeepSeek-R1-Qwen3-8B via SiliconFlow API
- **Memory**: ConversationalRetrievalChain with buffer memory
- **Document Processing**: Automatic chunking with RecursiveCharacterTextSplitter
- **Retrieval**: Semantic search with top-5 relevant chunks

### Quick Test Commands
```bash
# Test health endpoint
curl http://localhost:8765/health

# Authentication Tests
# Create new user account
curl -X POST "http://localhost:8765/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepassword123", "full_name": "Test User"}'

# Login to get JWT token
curl -X POST "http://localhost:8765/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepassword123"}'
# Save the returned access_token for authenticated requests

# Get current user profile (authenticated)
curl -X GET "http://localhost:8765/api/auth/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Test LangChain RAG chat with SiliconFlow API
curl -X POST "http://localhost:8765/api/chat/message" \
  -H "Content-Type: application/json" \
  -d '{"message": "How much protein should I eat for fat loss?", "user_profile": {"age": 25, "weight": 70}}'

# Test TDEE calculation with personalized recommendations
curl -X POST "http://localhost:8765/api/profile/setup" \
  -H "Content-Type: application/json" \
  -d '{"age": 25, "gender": "male", "height": 175, "weight": 70, "activity_level": "moderate", "goal": "lose_weight"}'

# Test AI food analysis
curl -X POST "http://localhost:8765/api/analysis/food" \
  -H "Content-Type: application/json" \
  -d '{"description": "I had scrambled eggs and toast for breakfast"}'

# Test AI exercise analysis  
curl -X POST "http://localhost:8765/api/analysis/exercise" \
  -H "Content-Type: application/json" \
  -d '{"description": "I ran for 30 minutes in the park"}'

# Log weight entry (authenticated)
curl -X POST "http://localhost:8765/api/logs/weight" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight": 70.5, "unit": "kg", "notes": "Morning weight after workout"}'

# Get weight history (authenticated)
curl -X GET "http://localhost:8765/api/logs/weight?limit=30" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Log food entry (authenticated)
curl -X POST "http://localhost:8765/api/logs/food" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description": "Grilled chicken salad", "meal_type": "lunch", "calories": 450, "protein": 35, "carbs": 20, "fat": 25}'

# Upload document to knowledge base
curl -X POST "http://localhost:8765/api/documents/upload" \
  -F "file=@research_paper.pdf" \
  -F "topic=nutrition" \
  -F "source=Journal of Nutrition"
```

### Mobile App Testing
```bash
# Start mobile development
cd mobile && npm run web
# Open http://localhost:19006 in browser
# Set browser to mobile view (iPhone 14 Pro recommended)

# Test complete user flow:
# 1. Welcome screen → Profile Setup (3 steps) [English/Chinese]
# 2. Tab navigation: Chat, Plan, Progress, Settings
# 3. Chat with AI (real LangChain responses) [Bilingual support]
# 4. Meal Plan screen (AI food/exercise logging) [Localized]
# 5. Progress screen (weight charts, nutrition tracking) [Bilingual]
# 6. Settings screen (language, notifications) [Full localization]
# 7. All screens have backend integration
# 8. Language switching: Toggle between English/Chinese in real-time
# 9. Language persistence: Settings saved and restored on app restart

# Test Tab Navigation:
# - Bottom tab bar with Chat, Plan, Progress, Settings (4 tabs)
# - Smooth transitions between tabs
# - No content overlapping with tab bar (80px padding)
# - Proper SafeAreaView configuration (edges: top, left, right)

# Test Bilingual Features:
# - Click language toggle button (🌐 EN/中) on any screen
# - All text updates instantly without app restart
# - Language preference persists across sessions
# - Device language auto-detection on first launch
```