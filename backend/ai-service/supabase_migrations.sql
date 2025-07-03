-- Supabase Database Migrations for BodyMind AI

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    height DECIMAL(5,2) NOT NULL CHECK (height > 0), -- in cm
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0), -- in kg
    body_fat_percentage DECIMAL(4,2) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
    activity_level VARCHAR(20) NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    goal VARCHAR(20) NOT NULL CHECK (goal IN ('lose_weight', 'maintain', 'gain_muscle')),
    goal_weight DECIMAL(5,2) CHECK (goal_weight > 0),
    bmr DECIMAL(7,2),
    tdee DECIMAL(7,2),
    target_calories DECIMAL(7,2),
    target_protein DECIMAL(5,2),
    target_fat DECIMAL(5,2),
    target_carbs DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weight History Table
CREATE TABLE IF NOT EXISTS weight_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    weight DECIMAL(5,2) NOT NULL CHECK (weight > 0), -- in kg
    unit VARCHAR(5) DEFAULT 'kg' CHECK (unit IN ('kg', 'lbs')),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition Logs Table
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    food_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(6,2),
    unit VARCHAR(50),
    calories DECIMAL(7,2) NOT NULL CHECK (calories >= 0),
    protein DECIMAL(5,2) CHECK (protein >= 0),
    carbs DECIMAL(5,2) CHECK (carbs >= 0),
    fat DECIMAL(5,2) CHECK (fat >= 0),
    fiber DECIMAL(5,2) CHECK (fiber >= 0),
    meal_type VARCHAR(20) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise Logs Table
CREATE TABLE IF NOT EXISTS exercise_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    duration_minutes INTEGER CHECK (duration_minutes > 0),
    intensity VARCHAR(20) CHECK (intensity IN ('low', 'moderate', 'high', 'very_high')),
    calories_burned DECIMAL(6,2) CHECK (calories_burned >= 0),
    exercise_type VARCHAR(50),
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_weight_history_user_id ON weight_history(user_id);
CREATE INDEX idx_weight_history_recorded_at ON weight_history(user_id, recorded_at DESC);
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_logged_at ON nutrition_logs(user_id, logged_at DESC);
CREATE INDEX idx_exercise_logs_user_id ON exercise_logs(user_id);
CREATE INDEX idx_exercise_logs_logged_at ON exercise_logs(user_id, logged_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles RLS
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weight History RLS
CREATE POLICY "Users can view own weight history" ON weight_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight records" ON weight_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Nutrition Logs RLS
CREATE POLICY "Users can view own nutrition logs" ON nutrition_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" ON nutrition_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" ON nutrition_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" ON nutrition_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Exercise Logs RLS
CREATE POLICY "Users can view own exercise logs" ON exercise_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exercise logs" ON exercise_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise logs" ON exercise_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exercise logs" ON exercise_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();