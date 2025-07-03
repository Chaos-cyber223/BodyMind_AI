# Supabase Setup Guide for BodyMind AI

This guide provides step-by-step instructions for setting up Supabase as the authentication and database backend for BodyMind AI.

## Option 1: Supabase Cloud (Recommended for Production)

### Step 1: Create a Free Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and click "Start your project"
2. Sign up with GitHub, GitLab, or email
3. Click "New project" and fill in:
   - **Organization**: Select your organization or create a new one
   - **Project name**: `bodymind-ai` (or your preferred name)
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier (includes 500MB database, 50,000 monthly active users)
4. Click "Create new project" and wait for provisioning (usually 1-2 minutes)

### Step 2: Get API Keys and Configuration

1. Once your project is ready, go to **Settings** → **API**
2. Copy and save the following values:
   ```
   Project URL: https://[YOUR-PROJECT-REF].supabase.co
   Anon (public) key: eyJhbGciOiJS...
   Service Role key: eyJhbGciOiJS... (keep this secret!)
   JWT Secret: your-super-secret-jwt-token (under Settings → API → JWT Settings)
   ```

3. Create `.env` file in `backend/ai-service/`:
   ```bash
   # Supabase Configuration
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJS...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJS...
   SUPABASE_JWT_SECRET=your-super-secret-jwt-token
   
   # Keep your existing AI service config
   SILICONFLOW_API_KEY=your-existing-key
   ```

### Step 3: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `backend/database/schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute all SQL commands
6. You should see success messages for each table and policy created

### Step 4: Configure Authentication Settings

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (enabled by default)
3. Configure email settings:
   - **Enable email confirmations**: Toggle ON for production
   - **Enable email change confirmations**: Toggle ON
   - **Minimum password length**: 8 (or your preference)

4. (Optional) Enable OAuth providers:
   - **Google**: Add Client ID and Secret from Google Cloud Console
   - **Apple**: Add Service ID, Team ID, and Key ID
   - **GitHub**: Add Client ID and Secret

5. Go to **Authentication** → **URL Configuration**:
   ```
   Site URL: http://localhost:19006 (for development)
   Redirect URLs: 
   - http://localhost:19006/*
   - exp://localhost:19006/*
   - bodymindai://auth-callback (for mobile deep linking)
   ```

### Step 5: Configure Row Level Security (RLS) Policies

The schema.sql file already includes RLS policies, but verify they're active:

1. Go to **Table Editor**
2. For each table (users, weight_logs, food_logs, exercise_logs), click the table
3. Click **RLS** → Ensure "RLS enabled" is ON
4. Review policies:
   - `Users can view own profile`
   - `Users can update own profile`
   - `Users can view own logs`
   - `Users can create own logs`
   - `Users can update own logs`
   - `Users can delete own logs`

### Step 6: Test Your Setup

1. Test authentication endpoint:
   ```bash
   curl -X POST https://[YOUR-PROJECT-REF].supabase.co/auth/v1/signup \
     -H "apikey: YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpassword123"
     }'
   ```

2. Check database connection in SQL Editor:
   ```sql
   SELECT count(*) FROM users;
   ```

## Option 2: Local PostgreSQL Development

### Prerequisites
- PostgreSQL 14+ installed locally
- psql command-line tool

### Step 1: Create Local Database

1. Connect to PostgreSQL as superuser:
   ```bash
   psql -U postgres -h localhost -p 5432
   # Password: Newbunny_25^+@cool
   ```

2. Create database and user:
   ```sql
   -- Create database
   CREATE DATABASE bodymind_ai;
   
   -- Create user with password
   CREATE USER bodymind_user WITH PASSWORD 'bodymind_dev_password';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE bodymind_ai TO bodymind_user;
   
   -- Connect to the new database
   \c bodymind_ai
   
   -- Grant schema privileges
   GRANT ALL ON SCHEMA public TO bodymind_user;
   ```

### Step 2: Run Schema

1. Connect to the bodymind_ai database:
   ```bash
   psql -U postgres -h localhost -p 5432 -d bodymind_ai
   ```

2. Run the schema file:
   ```bash
   \i /Users/chaos/Documents/Portfolio/BodyMind_AI/backend/database/schema.sql
   ```

### Step 3: Configure Backend for Local PostgreSQL

1. Update `backend/ai-service/.env`:
   ```bash
   # Local PostgreSQL Configuration
   DATABASE_URL=postgresql://bodymind_user:bodymind_dev_password@localhost:5432/bodymind_ai
   USE_SUPABASE=false
   
   # JWT Configuration for local auth
   JWT_SECRET=your-local-jwt-secret-at-least-32-chars-long
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
   
   # Keep your AI service config
   SILICONFLOW_API_KEY=your-existing-key
   ```

2. Install additional Python dependencies:
   ```bash
   cd backend/ai-service
   source venv/bin/activate
   pip install asyncpg psycopg2-binary python-jose[cryptography] passlib[bcrypt]
   ```

3. Create local auth implementation in `backend/ai-service/app/services/local_auth.py`:
   ```python
   from datetime import datetime, timedelta
   from typing import Optional
   from jose import JWTError, jwt
   from passlib.context import CryptContext
   import asyncpg
   from ..config import settings
   
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   
   class LocalAuthService:
       def __init__(self, db_url: str):
           self.db_url = db_url
       
       async def create_user(self, email: str, password: str):
           hashed_password = pwd_context.hash(password)
           async with asyncpg.connect(self.db_url) as conn:
               user = await conn.fetchrow(
                   """
                   INSERT INTO users (email, password_hash, created_at)
                   VALUES ($1, $2, $3)
                   RETURNING id, email, created_at
                   """,
                   email, hashed_password, datetime.utcnow()
               )
               return self._create_token(str(user['id']))
       
       def _create_token(self, user_id: str):
           expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
           token = jwt.encode(
               {"sub": user_id, "exp": expire},
               settings.JWT_SECRET,
               algorithm=settings.JWT_ALGORITHM
           )
           return {"access_token": token, "token_type": "bearer"}
   ```

## Migration Between Environments

### From Local to Supabase
1. Export local data:
   ```bash
   pg_dump -U bodymind_user -h localhost -p 5432 bodymind_ai > backup.sql
   ```

2. Import to Supabase via SQL Editor (remove CREATE DATABASE commands first)

### From Supabase to Local
1. Use Supabase dashboard to export data
2. Import using psql:
   ```bash
   psql -U bodymind_user -h localhost -p 5432 -d bodymind_ai < supabase_export.sql
   ```

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**
   - Ensure RLS is enabled on all tables
   - Check that policies use `auth.uid()` correctly
   - Verify JWT token is being sent in requests

2. **Connection Timeouts**
   - Check firewall settings
   - Verify Supabase project is active (free tier pauses after 1 week of inactivity)
   - For local: ensure PostgreSQL is running

3. **Authentication Failures**
   - Verify API keys are correct
   - Check JWT secret matches between frontend and backend
   - Ensure email confirmations are disabled for development

### Debug Commands

```bash
# Test Supabase connection
curl https://[YOUR-PROJECT-REF].supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"

# Check PostgreSQL local connection
psql -U bodymind_user -h localhost -p 5432 -d bodymind_ai -c "SELECT version();"
```

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use Service Role key only on backend** - Never expose to frontend
3. **Enable RLS on all tables** - Prevents unauthorized access
4. **Rotate JWT secrets regularly** in production
5. **Use environment-specific API keys** for dev/staging/production
6. **Enable 2FA on Supabase account** for production projects