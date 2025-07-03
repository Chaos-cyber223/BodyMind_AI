# Authentication Setup Guide

## Overview
The BodyMind AI mobile app now includes a complete authentication system using Supabase. This guide will help you set up and configure the authentication features.

## Features Implemented

### 1. Authentication Screens
- **LoginScreen**: Email/password login with validation
- **RegisterScreen**: New user registration with password confirmation
- **Bilingual Support**: Full English/Chinese support for all auth screens

### 2. Authentication Context
- **AuthContext**: Centralized authentication state management
- **Session Persistence**: Automatic session restoration on app restart
- **Protected Routes**: Automatic navigation based on auth state

### 3. User Experience
- **Form Validation**: Real-time validation with error messages
- **Loading States**: Visual feedback during authentication
- **Error Handling**: User-friendly error messages in both languages
- **Profile Integration**: User email displayed in Settings screen

## Setup Instructions

### 1. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Project Settings > API
3. Create a `.env` file in the mobile directory:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 2. Configure Email Authentication

In your Supabase dashboard:
1. Go to Authentication > Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Set up redirect URLs for email confirmation

### 3. Database Setup (Optional)

If you want to store user profiles:
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

## Usage

### Navigation Flow
1. **Unauthenticated Users**: Welcome → Login/Register
2. **New Users**: Register → Email Confirmation → Profile Setup → Main App
3. **Existing Users**: Login → Main App (or Profile Setup if not completed)

### Testing
1. Start the app: `npm run web`
2. Click "Get Started" to register a new account
3. Or click "Sign In" to login with existing account
4. After authentication, users are directed to Profile Setup or Main App

### Important Notes
- Email confirmation may be required based on Supabase settings
- Sessions persist across app restarts
- Sign out option available in Settings screen
- All error messages are localized (English/Chinese)

## Security Considerations
- Never commit `.env` file to version control
- Use environment variables for all sensitive data
- Enable Row Level Security on all database tables
- Implement proper password policies in production

## Future Enhancements
- Social authentication (Google, Apple)
- Password reset functionality
- Two-factor authentication
- Profile photo upload
- Account deletion