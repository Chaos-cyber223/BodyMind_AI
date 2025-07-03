-- BodyMind AI Database Schema
-- This schema is designed for Supabase (PostgreSQL)
-- Includes tables, indexes, constraints, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
-- Note: This table references Supabase's built-in auth.users table
-- We don't create the users table directly, but we can create a view
CREATE OR REPLACE VIEW public.users AS
SELECT 
    id,
    email,
    created_at,
    updated_at
FROM auth.users;

-- Grant permissions on the users view
GRANT SELECT ON public.users TO authenticated;

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    height DECIMAL(5,2) CHECK (height > 0 AND height < 300), -- in cm
    weight DECIMAL(5,2) CHECK (weight > 0 AND weight < 500), -- in kg
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal VARCHAR(20) CHECK (goal IN ('lose_weight', 'maintain_weight', 'gain_muscle')),
    tdee_calories INTEGER CHECK (tdee_calories > 0 AND tdee_calories < 10000),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- WEIGHT_RECORDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.weight_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0 AND weight < 500), -- in kg
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for weight_records
CREATE INDEX idx_weight_records_user_id ON public.weight_records(user_id);
CREATE INDEX idx_weight_records_user_id_recorded_at ON public.weight_records(user_id, recorded_at DESC);

-- =====================================================
-- NUTRITION_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    calories DECIMAL(8,2) CHECK (calories >= 0),
    protein DECIMAL(6,2) CHECK (protein >= 0), -- in grams
    carbs DECIMAL(6,2) CHECK (carbs >= 0), -- in grams
    fat DECIMAL(6,2) CHECK (fat >= 0), -- in grams
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for nutrition_logs
CREATE INDEX idx_nutrition_logs_user_id ON public.nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_user_id_logged_at ON public.nutrition_logs(user_id, logged_at DESC);

-- =====================================================
-- EXERCISE_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exercise_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    duration_minutes INTEGER CHECK (duration_minutes > 0 AND duration_minutes < 1440), -- max 24 hours
    calories_burned DECIMAL(8,2) CHECK (calories_burned >= 0),
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for exercise_logs
CREATE INDEX idx_exercise_logs_user_id ON public.exercise_logs(user_id);
CREATE INDEX idx_exercise_logs_user_id_logged_at ON public.exercise_logs(user_id, logged_at DESC);

-- =====================================================
-- CHAT_HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb, -- Array of source references
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for chat_history
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX idx_chat_history_user_id_created_at ON public.chat_history(user_id, created_at DESC);
-- GIN index for JSONB sources column for efficient querying
CREATE INDEX idx_chat_history_sources ON public.chat_history USING GIN (sources);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Weight records policies
CREATE POLICY "Users can view own weight records" ON public.weight_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight records" ON public.weight_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight records" ON public.weight_records
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight records" ON public.weight_records
    FOR DELETE USING (auth.uid() = user_id);

-- Nutrition logs policies
CREATE POLICY "Users can view own nutrition logs" ON public.nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" ON public.nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" ON public.nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" ON public.nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Exercise logs policies
CREATE POLICY "Users can view own exercise logs" ON public.exercise_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise logs" ON public.exercise_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise logs" ON public.exercise_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise logs" ON public.exercise_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "Users can view own chat history" ON public.chat_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history" ON public.chat_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history" ON public.chat_history
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history" ON public.chat_history
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's latest weight
CREATE OR REPLACE FUNCTION get_latest_weight(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN (
        SELECT weight 
        FROM public.weight_records 
        WHERE user_id = p_user_id 
        ORDER BY recorded_at DESC 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's daily nutrition summary
CREATE OR REPLACE FUNCTION get_daily_nutrition_summary(
    p_user_id UUID,
    p_date DATE
)
RETURNS TABLE(
    total_calories DECIMAL,
    total_protein DECIMAL,
    total_carbs DECIMAL,
    total_fat DECIMAL,
    meal_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(calories), 0) as total_calories,
        COALESCE(SUM(protein), 0) as total_protein,
        COALESCE(SUM(carbs), 0) as total_carbs,
        COALESCE(SUM(fat), 0) as total_fat,
        COUNT(*) as meal_count
    FROM public.nutrition_logs
    WHERE user_id = p_user_id
        AND DATE(logged_at) = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's daily exercise summary
CREATE OR REPLACE FUNCTION get_daily_exercise_summary(
    p_user_id UUID,
    p_date DATE
)
RETURNS TABLE(
    total_minutes INTEGER,
    total_calories_burned DECIMAL,
    session_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(duration_minutes), 0)::INTEGER as total_minutes,
        COALESCE(SUM(calories_burned), 0) as total_calories_burned,
        COUNT(*) as session_count
    FROM public.exercise_logs
    WHERE user_id = p_user_id
        AND DATE(logged_at) = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.weight_records TO authenticated;
GRANT ALL ON public.nutrition_logs TO authenticated;
GRANT ALL ON public.exercise_logs TO authenticated;
GRANT ALL ON public.chat_history TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_latest_weight(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_nutrition_summary(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_exercise_summary(UUID, DATE) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

-- Add table comments
COMMENT ON TABLE public.profiles IS 'User profile information including body metrics and goals';
COMMENT ON TABLE public.weight_records IS 'Historical weight tracking for users';
COMMENT ON TABLE public.nutrition_logs IS 'Food intake logs with nutritional information';
COMMENT ON TABLE public.exercise_logs IS 'Exercise activity logs with duration and calories burned';
COMMENT ON TABLE public.chat_history IS 'AI chat conversation history with source citations';

-- Add column comments
COMMENT ON COLUMN public.profiles.tdee_calories IS 'Total Daily Energy Expenditure calculated based on user metrics';
COMMENT ON COLUMN public.profiles.activity_level IS 'User activity level: sedentary, light, moderate, active, very_active';
COMMENT ON COLUMN public.profiles.goal IS 'User fitness goal: lose_weight, maintain_weight, gain_muscle';
COMMENT ON COLUMN public.chat_history.sources IS 'JSON array of source references from RAG system';