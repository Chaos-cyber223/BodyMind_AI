import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Auth context types
interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  setProfileComplete: (complete: boolean) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API配置
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8765';

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileCompleteState] = useState(false);

  useEffect(() => {
    // 检查本地存储的token
    const initializeAuth = async () => {
      try {
        console.log('🟢 Auth Init: Starting...');
        const token = await AsyncStorage.getItem('access_token');
        const userData = await AsyncStorage.getItem('user_data');
        const profileComplete = await AsyncStorage.getItem('profile_complete');
        
        console.log('🟢 Auth Init: Token exists?', !!token);
        console.log('🟢 Auth Init: User data exists?', !!userData);
        
        if (token && userData) {
          setSession({ access_token: token });
          setUser(JSON.parse(userData));
          setIsProfileCompleteState(profileComplete === 'true');
          console.log('🟢 Auth Init: User authenticated');
        } else {
          console.log('🟢 Auth Init: No valid session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in function - 调用后端API
  const signIn = async (email: string, password: string) => {
    try {
      console.log('发送登录请求到:', `${API_URL}/api/auth/login`);
      console.log('登录数据:', { email, password });
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('响应状态:', response.status);
      const data = await response.json();
      console.log('响应数据:', data);

      if (!response.ok) {
        return { error: new Error(data.detail || 'Login failed') };
      }

      // 保存token和用户信息
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      
      setSession({ access_token: data.access_token });
      setUser(data.user);

      return { error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { error: error as Error };
    }
  };

  // Sign up function - 调用后端API
  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.detail || 'Signup failed') };
      }

      // 注册成功后自动登录
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(data.user));
      
      setSession({ access_token: data.access_token });
      setUser(data.user);

      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error: error as Error };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log('🔴 SignOut: Starting sign out process...');
      
      // 清除状态（先清除状态，避免异步问题）
      setSession(null);
      setUser(null);
      setIsProfileCompleteState(false);
      console.log('🔴 SignOut: State cleared');
      
      // Web版本：直接使用localStorage（同步操作）
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🔴 SignOut: Clearing localStorage directly...');
        localStorage.clear();
        
        // 立即刷新，不等待
        console.log('🔴 SignOut: Reloading page...');
        window.location.href = 'http://localhost:8081';
        return; // 不执行后续代码
      }
      
      // 原生版本：使用AsyncStorage
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('profile_complete');
      console.log('🔴 SignOut: AsyncStorage cleared');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'An unexpected error occurred while signing out.');
    }
  };

  // Set profile complete function
  const setProfileComplete = async (complete: boolean) => {
    try {
      await AsyncStorage.setItem('profile_complete', complete.toString());
      setIsProfileCompleteState(complete);
    } catch (error) {
      console.error('Error setting profile complete:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!session,
    isProfileComplete,
    setProfileComplete,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}