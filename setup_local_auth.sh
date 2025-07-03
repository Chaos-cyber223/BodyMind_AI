#!/bin/bash

# BodyMind AI Local Authentication Setup Script
# This script sets up local PostgreSQL for development

echo "🚀 Setting up BodyMind AI with Local Authentication..."

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL and try again."
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create database and setup schema
echo "📊 Setting up database..."
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE bodymind_ai;" 2>/dev/null || echo "Database already exists"

# Run setup script
psql -U postgres -h localhost -p 5432 -d bodymind_ai -f backend/database/setup_local_db.sql

# Run main schema
psql -U postgres -h localhost -p 5432 -d bodymind_ai -f backend/database/schema.sql

echo "✅ Database setup complete"

# Copy environment file
if [ ! -f backend/ai-service/.env ]; then
    cp backend/ai-service/.env.local backend/ai-service/.env
    echo "✅ Created .env file from .env.local"
else
    echo "⚠️  .env file already exists"
fi

# Update mobile environment
if [ ! -f mobile/.env ]; then
    cat > mobile/.env << EOF
# Local Development Configuration
EXPO_PUBLIC_API_URL=http://localhost:8765
EXPO_PUBLIC_SUPABASE_URL=http://localhost:5432
EXPO_PUBLIC_SUPABASE_ANON_KEY=local_development_key
EOF
    echo "✅ Created mobile .env file"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Start the AI backend:"
echo "   cd backend/ai-service && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8765"
echo ""
echo "2. Start the mobile app:"
echo "   cd mobile && npm run web"
echo ""
echo "3. Test authentication:"
echo "   - Open http://localhost:19006"
echo "   - Click 'Get Started' to register a new account"
echo "   - Or use test account: test@example.com"
echo ""
echo "Note: You're using local PostgreSQL with the password: zsxklyjwyny"