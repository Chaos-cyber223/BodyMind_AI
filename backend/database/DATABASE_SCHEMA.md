# BodyMind AI Database Schema Documentation

This document provides comprehensive documentation for the BodyMind AI database schema, designed for Supabase (PostgreSQL). The schema includes tables for user profiles, weight tracking, nutrition logging, exercise tracking, and AI chat history with full Row Level Security (RLS) policies.

## Table of Contents
1. [Overview](#overview)
2. [Database Tables](#database-tables)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Row Level Security (RLS) Policies](#row-level-security-rls-policies)
6. [Helper Functions](#helper-functions)
7. [Triggers](#triggers)
8. [Example Queries](#example-queries)

## Overview

The database is designed with the following principles:
- **Security First**: All tables use Row Level Security (RLS) to ensure users can only access their own data
- **Performance Optimized**: Strategic indexes for common query patterns
- **Data Integrity**: Check constraints ensure valid data ranges
- **Audit Trail**: Timestamps track record creation and updates
- **Extensibility**: JSONB fields for flexible data storage

## Database Tables

### 1. users (View)
A view that exposes selected fields from Supabase's built-in `auth.users` table.

**Purpose**: Provides a public interface to user authentication data without exposing sensitive information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique user identifier from auth.users |
| email | TEXT | NOT NULL | User's email address |
| created_at | TIMESTAMPTZ | NOT NULL | Account creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL | Last account update timestamp |

### 2. profiles
Stores user profile information including body metrics and fitness goals.

**Purpose**: Contains personalized user data for TDEE calculations and AI recommendations.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique profile identifier |
| user_id | UUID | NOT NULL, UNIQUE, REFERENCES auth.users(id) ON DELETE CASCADE | Links to auth.users |
| age | INTEGER | CHECK (age >= 13 AND age <= 120) | User's age in years |
| gender | VARCHAR(10) | CHECK (gender IN ('male', 'female', 'other')) | User's gender |
| height | DECIMAL(5,2) | CHECK (height > 0 AND height < 300) | Height in centimeters |
| weight | DECIMAL(5,2) | CHECK (weight > 0 AND weight < 500) | Weight in kilograms |
| activity_level | VARCHAR(20) | CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')) | Physical activity level |
| goal | VARCHAR(20) | CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_muscle')) | Fitness goal |
| tdee_calories | INTEGER | CHECK (tdee_calories > 0 AND tdee_calories < 10000) | Calculated Total Daily Energy Expenditure |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Profile creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last profile update timestamp |

### 3. weight_records
Tracks user weight changes over time.

**Purpose**: Enables progress tracking and trend analysis for weight management.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique record identifier |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Links to auth.users |
| weight | DECIMAL(5,2) | NOT NULL, CHECK (weight > 0 AND weight < 500) | Weight in kilograms |
| recorded_at | TIMESTAMPTZ | DEFAULT NOW() | When the weight was recorded |

### 4. nutrition_logs
Records food intake with nutritional breakdown.

**Purpose**: Tracks daily nutrition for calorie counting and macro tracking.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique log identifier |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Links to auth.users |
| description | TEXT | NOT NULL | Food description (e.g., "2 scrambled eggs with toast") |
| calories | DECIMAL(8,2) | CHECK (calories >= 0) | Total calories |
| protein | DECIMAL(6,2) | CHECK (protein >= 0) | Protein in grams |
| carbs | DECIMAL(6,2) | CHECK (carbs >= 0) | Carbohydrates in grams |
| fat | DECIMAL(6,2) | CHECK (fat >= 0) | Fat in grams |
| logged_at | TIMESTAMPTZ | DEFAULT NOW() | When the food was logged |

### 5. exercise_logs
Records physical activities and workouts.

**Purpose**: Tracks exercise for calorie burn calculations and activity monitoring.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique log identifier |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Links to auth.users |
| description | TEXT | NOT NULL | Exercise description (e.g., "30 minutes running") |
| duration_minutes | INTEGER | CHECK (duration_minutes > 0 AND duration_minutes < 1440) | Exercise duration (max 24 hours) |
| calories_burned | DECIMAL(8,2) | CHECK (calories_burned >= 0) | Estimated calories burned |
| logged_at | TIMESTAMPTZ | DEFAULT NOW() | When the exercise was logged |

### 6. chat_history
Stores AI chat conversations with source citations.

**Purpose**: Maintains conversation history and tracks AI-provided sources for transparency.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique message identifier |
| user_id | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Links to auth.users |
| message | TEXT | NOT NULL | User's message |
| response | TEXT | NOT NULL | AI's response |
| sources | JSONB | DEFAULT '[]'::jsonb | Array of source citations from RAG system |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Message timestamp |

## Relationships

### Foreign Key Relationships
```
auth.users (1) ─┬─── (1) profiles
                ├─── (n) weight_records
                ├─── (n) nutrition_logs
                ├─── (n) exercise_logs
                └─── (n) chat_history
```

All tables (except the users view) have a `user_id` foreign key that references `auth.users(id)` with `ON DELETE CASCADE`, ensuring that when a user account is deleted, all related data is automatically removed.

## Indexes

### Performance Indexes
The schema includes strategic indexes for optimal query performance:

1. **profiles**
   - `idx_profiles_user_id`: B-tree index on `user_id` for fast user profile lookups

2. **weight_records**
   - `idx_weight_records_user_id`: B-tree index on `user_id`
   - `idx_weight_records_user_id_recorded_at`: Composite index on `(user_id, recorded_at DESC)` for efficient time-series queries

3. **nutrition_logs**
   - `idx_nutrition_logs_user_id`: B-tree index on `user_id`
   - `idx_nutrition_logs_user_id_logged_at`: Composite index on `(user_id, logged_at DESC)` for date-based queries

4. **exercise_logs**
   - `idx_exercise_logs_user_id`: B-tree index on `user_id`
   - `idx_exercise_logs_user_id_logged_at`: Composite index on `(user_id, logged_at DESC)` for chronological queries

5. **chat_history**
   - `idx_chat_history_user_id`: B-tree index on `user_id`
   - `idx_chat_history_user_id_created_at`: Composite index on `(user_id, created_at DESC)` for conversation retrieval
   - `idx_chat_history_sources`: GIN index on `sources` JSONB column for efficient source searching

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following policies:

### Policy Pattern
Each table implements four policies following the same pattern:
- **SELECT**: Users can view their own records
- **INSERT**: Users can insert their own records
- **UPDATE**: Users can update their own records
- **DELETE**: Users can delete their own records

### Implementation
```sql
-- Example for profiles table (same pattern for all tables)
"Users can view own profile": FOR SELECT USING (auth.uid() = user_id)
"Users can insert own profile": FOR INSERT WITH CHECK (auth.uid() = user_id)
"Users can update own profile": FOR UPDATE USING (auth.uid() = user_id)
"Users can delete own profile": FOR DELETE USING (auth.uid() = user_id)
```

## Helper Functions

### 1. get_latest_weight(p_user_id UUID)
Returns the user's most recent weight record.

**Returns**: DECIMAL (weight in kg)

**Usage Example**:
```sql
SELECT get_latest_weight('123e4567-e89b-12d3-a456-426614174000');
```

### 2. get_daily_nutrition_summary(p_user_id UUID, p_date DATE)
Calculates daily nutrition totals for a specific date.

**Returns Table**:
- `total_calories`: DECIMAL
- `total_protein`: DECIMAL
- `total_carbs`: DECIMAL
- `total_fat`: DECIMAL
- `meal_count`: BIGINT

**Usage Example**:
```sql
SELECT * FROM get_daily_nutrition_summary('123e4567-e89b-12d3-a456-426614174000', '2024-01-15');
```

### 3. get_daily_exercise_summary(p_user_id UUID, p_date DATE)
Calculates daily exercise totals for a specific date.

**Returns Table**:
- `total_minutes`: INTEGER
- `total_calories_burned`: DECIMAL
- `session_count`: BIGINT

**Usage Example**:
```sql
SELECT * FROM get_daily_exercise_summary('123e4567-e89b-12d3-a456-426614174000', '2024-01-15');
```

## Triggers

### update_updated_at_column()
Automatically updates the `updated_at` timestamp when a record is modified.

**Applied to**: `profiles` table

**Trigger**: `update_profiles_updated_at`

## Example Queries

### 1. Create User Profile
```sql
INSERT INTO profiles (user_id, age, gender, height, weight, activity_level, goal, tdee_calories)
VALUES (
    auth.uid(),
    25,
    'male',
    175.5,
    70.0,
    'moderate',
    'lose_weight',
    2200
);
```

### 2. Log Weight Entry
```sql
INSERT INTO weight_records (user_id, weight)
VALUES (auth.uid(), 69.5);
```

### 3. Log Food Intake
```sql
INSERT INTO nutrition_logs (user_id, description, calories, protein, carbs, fat)
VALUES (
    auth.uid(),
    '2 scrambled eggs with whole wheat toast',
    350,
    20,
    30,
    15
);
```

### 4. Log Exercise
```sql
INSERT INTO exercise_logs (user_id, description, duration_minutes, calories_burned)
VALUES (
    auth.uid(),
    '30 minutes jogging in the park',
    30,
    250
);
```

### 5. Get Weight Trend (Last 30 Days)
```sql
SELECT weight, recorded_at
FROM weight_records
WHERE user_id = auth.uid()
  AND recorded_at >= NOW() - INTERVAL '30 days'
ORDER BY recorded_at DESC;
```

### 6. Get Weekly Nutrition Average
```sql
SELECT 
    AVG(daily.total_calories) as avg_calories,
    AVG(daily.total_protein) as avg_protein,
    AVG(daily.total_carbs) as avg_carbs,
    AVG(daily.total_fat) as avg_fat
FROM (
    SELECT * FROM get_daily_nutrition_summary(
        auth.uid(), 
        generate_series(
            CURRENT_DATE - INTERVAL '7 days',
            CURRENT_DATE,
            '1 day'::interval
        )::date
    )
) as daily;
```

### 7. Get Chat History with Sources
```sql
SELECT message, response, sources, created_at
FROM chat_history
WHERE user_id = auth.uid()
  AND sources != '[]'::jsonb
ORDER BY created_at DESC
LIMIT 10;
```

### 8. Calculate Calorie Balance for Today
```sql
WITH nutrition AS (
    SELECT * FROM get_daily_nutrition_summary(auth.uid(), CURRENT_DATE)
),
exercise AS (
    SELECT * FROM get_daily_exercise_summary(auth.uid(), CURRENT_DATE)
),
profile AS (
    SELECT tdee_calories FROM profiles WHERE user_id = auth.uid()
)
SELECT 
    p.tdee_calories as tdee,
    n.total_calories as consumed,
    e.total_calories_burned as burned,
    (p.tdee_calories - n.total_calories + e.total_calories_burned) as deficit
FROM profile p, nutrition n, exercise e;
```

### 9. Find Days Meeting Protein Goals
```sql
-- Find days where user consumed at least 100g protein
SELECT 
    DATE(logged_at) as date,
    SUM(protein) as total_protein
FROM nutrition_logs
WHERE user_id = auth.uid()
  AND logged_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(logged_at)
HAVING SUM(protein) >= 100
ORDER BY date DESC;
```

### 10. Get Exercise Consistency
```sql
-- Count workout days in the last 4 weeks
SELECT 
    COUNT(DISTINCT DATE(logged_at)) as workout_days,
    SUM(duration_minutes) as total_minutes,
    SUM(calories_burned) as total_calories_burned
FROM exercise_logs
WHERE user_id = auth.uid()
  AND logged_at >= NOW() - INTERVAL '4 weeks';
```

## Security Considerations

1. **Row Level Security**: All data access is restricted to the authenticated user's own records
2. **Input Validation**: Check constraints prevent invalid data entry
3. **Cascade Deletion**: User data is automatically cleaned up when accounts are deleted
4. **Function Security**: Helper functions use `SECURITY DEFINER` to execute with elevated privileges while maintaining user context
5. **JSONB Validation**: The sources field in chat_history uses JSONB for structured data with indexing support

## Performance Optimization Tips

1. **Use Composite Indexes**: Queries filtering by user_id and date should leverage the composite indexes
2. **Batch Operations**: Insert multiple records in a single transaction when possible
3. **Pagination**: Use LIMIT and OFFSET for large result sets
4. **Date Ranges**: Always include date filters to limit result sets
5. **Function Usage**: Use the provided helper functions for common aggregations instead of complex queries

## Migration Notes

When deploying this schema:
1. Ensure UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`
2. Run the schema in order (tables → indexes → RLS → functions → triggers)
3. Grant appropriate permissions to roles (authenticated, anon)
4. Test RLS policies with different user contexts
5. Consider initial data seeding for testing