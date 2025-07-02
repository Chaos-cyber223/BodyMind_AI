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
# Edit .env to add SILICONFLOW_API_KEY

# Start AI service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8765
# API docs available at: http://localhost:8765/docs

# From project root
npm run dev:ai
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
- **Database**: Chroma vector database for embeddings storage
- **DevOps**: Docker + docker-compose
- **External APIs**: SiliconFlow API (DeepSeek-R1 + BGE-M3 embeddings)

### Service Architecture
1. **Mobile App** (`mobile/`): React Native app with Welcome, Profile Setup, Chat, and Meal Plan screens
2. **AI Service** (`backend/ai-service/`): Python FastAPI service handling AI chat, RAG queries, and personalized recommendations

### Key Components
- **Navigation**: React Navigation v7 with stack navigator for screen transitions
- **AI Chat**: Real-time chat interface with AI-powered responses based on scientific fat loss research
- **Profile Setup**: Multi-step form collecting user body metrics for personalized TDEE calculations
- **RAG System**: Retrieval-Augmented Generation using scientific papers for evidence-based recommendations

### Database Schema
- **Chroma Vector Database**: Embedded scientific research papers for RAG system
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

**TODO:**
- SettingsScreen implementation
- ProgressScreen with data visualization
- Tab navigation implementation

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
POST /api/chat/message          # AI chat with LangChain RAG-enhanced responses
POST /api/profile/setup         # User profile setup with TDEE calculation  
POST /api/analysis/food         # Parse food descriptions ("I ate an apple")
POST /api/analysis/exercise     # Parse exercise descriptions ("I ran 30 minutes")
POST /api/documents/upload      # Upload PDF/TXT documents to knowledge base
GET  /api/documents/topics      # Get available knowledge topics
POST /api/documents/clear-memory # Clear conversation memory
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
# 2. Chat with AI (real LangChain responses) [Bilingual support]
# 3. Meal Plan screen (AI food/exercise logging) [Localized]
# 4. All screens have backend integration
# 5. Language switching: Toggle between English/Chinese in real-time
# 6. Language persistence: Settings saved and restored on app restart

# Test Bilingual Features:
# - Click language toggle button (🌐 EN/中) on any screen
# - All text updates instantly without app restart
# - Language preference persists across sessions
# - Device language auto-detection on first launch
```