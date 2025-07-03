# Authentication Setup Guide

This guide explains how to set up Supabase authentication for the BodyMind AI backend service.

## Prerequisites

1. A Supabase account and project
2. Python environment with dependencies installed

## Supabase Configuration

### 1. Get Your Supabase Credentials

From your Supabase project dashboard:
- **URL**: Found in Settings > API > Project URL
- **Anon Key**: Found in Settings > API > Project API keys > anon public
- **JWT Secret**: Found in Settings > API > JWT Settings > JWT Secret

### 2. Set Up Database Tables

Run the SQL migrations in `supabase_migrations.sql` in your Supabase SQL editor:
1. Go to SQL Editor in Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase_migrations.sql`
4. Run the query

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Update `.env` with your values:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## API Authentication

All endpoints except `/health` now require authentication with a valid JWT token.

### Getting a JWT Token

Users must authenticate through Supabase Auth first. The JWT token should be included in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Protected Endpoints

All endpoints now require authentication:
- `POST /api/chat/message` - Send chat messages
- `POST /api/profile/setup` - Set up user profile
- `GET /api/profile/current` - Get current user profile
- `POST /api/analysis/food` - Analyze food intake
- `POST /api/analysis/exercise` - Analyze exercise
- `GET /api/analysis/nutrition-logs` - Get nutrition logs
- `GET /api/analysis/exercise-logs` - Get exercise logs
- `GET /api/analysis/daily-summary` - Get daily summary
- `POST /api/weight/record` - Record weight
- `GET /api/weight/history` - Get weight history
- `GET /api/weight/latest` - Get latest weight
- `GET /api/weight/stats` - Get weight statistics
- `POST /api/documents/upload` - Upload documents
- `GET /api/documents/topics` - Get document topics
- `POST /api/documents/clear-memory` - Clear conversation memory

### Testing with Authentication

Example curl command with authentication:

```bash
# Get a token from Supabase Auth first, then:
curl -X POST "http://localhost:8765/api/profile/setup" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 25,
    "gender": "male",
    "height": 175,
    "weight": 70,
    "activity_level": "moderate",
    "goal": "lose_weight"
  }'
```

## Database Schema

The following tables are created:

1. **user_profiles** - Stores user profile data and TDEE calculations
2. **weight_history** - Tracks weight changes over time
3. **nutrition_logs** - Stores food intake logs
4. **exercise_logs** - Stores exercise activity logs

All tables have Row Level Security (RLS) enabled, ensuring users can only access their own data.

## Development Tips

1. **Testing without Auth**: For local development, you can temporarily disable auth by commenting out the `dependencies=[Depends(auth_bearer)]` in the endpoints.

2. **Mock JWT Secret**: For testing, you can use a simple JWT secret like "your-secret-key" and generate test tokens.

3. **Supabase Local Development**: Consider using Supabase CLI for local development to avoid using production data.

## Security Notes

- Never commit your `.env` file with real credentials
- Use environment-specific credentials (dev, staging, prod)
- Regularly rotate your JWT secret
- Monitor API usage in Supabase dashboard
- Set up proper CORS origins for production