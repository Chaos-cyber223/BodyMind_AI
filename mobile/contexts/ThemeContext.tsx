import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark';

interface Colors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  card: string;
  cardShadow: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  avatarBackground: string;
  avatarText: string;
  profileBackground: string;
  sectionBackground: string;
  buttonBackground: string;
  buttonText: string;
  switchTrackColor: string;
  switchThumbColor: string;
  statusBarStyle: 'light' | 'dark';
}

interface Theme {
  type: ThemeType;
  colors: Colors;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => Promise<void>;
  setTheme: (themeType: ThemeType) => Promise<void>;
}

const lightColors: Colors = {
  primary: '#1976d2',
  background: '#fafafa',
  surface: '#ffffff',
  text: '#212121',
  textSecondary: '#757575',
  textTertiary: '#9e9e9e',
  border: '#e5e7eb',
  borderLight: '#f0f0f0',
  card: '#ffffff',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
  success: '#4caf50',
  warning: '#f57c00',
  error: '#d32f2f',
  info: '#1976d2',
  tabBarBackground: '#ffffff',
  tabBarActive: '#6366F1',
  tabBarInactive: '#9CA3AF',
  avatarBackground: '#1976d2',
  avatarText: '#ffffff',
  profileBackground: '#ffffff',
  sectionBackground: '#ffffff',
  buttonBackground: '#ffebee',
  buttonText: '#d32f2f',
  switchTrackColor: '#e0e0e0',
  switchThumbColor: '#f4f3f4',
  statusBarStyle: 'dark',
};

const darkColors: Colors = {
  primary: '#64b5f6',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  textTertiary: '#666666',
  border: '#333333',
  borderLight: '#2a2a2a',
  card: '#1e1e1e',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  success: '#66bb6a',
  warning: '#ffa726',
  error: '#ef5350',
  info: '#64b5f6',
  tabBarBackground: '#1e1e1e',
  tabBarActive: '#8b9dc3',
  tabBarInactive: '#666666',
  avatarBackground: '#64b5f6',
  avatarText: '#121212',
  profileBackground: '#1e1e1e',
  sectionBackground: '#1e1e1e',
  buttonBackground: '#2a2a2a',
  buttonText: '#ef5350',
  switchTrackColor: '#4a4a4a',
  switchThumbColor: '#ffffff',
  statusBarStyle: 'light',
};

const lightTheme: Theme = {
  type: 'light',
  colors: lightColors,
};

const darkTheme: Theme = {
  type: 'dark',
  colors: darkColors,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);

  useEffect(() => {
    // 从AsyncStorage加载保存的主题设置
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme === 'dark') {
          setCurrentTheme(darkTheme);
        } else {
          setCurrentTheme(lightTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        // 默认使用浅色主题
        setCurrentTheme(lightTheme);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = currentTheme.type === 'light' ? darkTheme : lightTheme;
      setCurrentTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme.type);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const setTheme = async (themeType: ThemeType) => {
    try {
      const newTheme = themeType === 'dark' ? darkTheme : lightTheme;
      setCurrentTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeType);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value: ThemeContextType = {
    theme: currentTheme,
    toggleTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// 工具函数：获取主题样式
export const createThemedStyles = (theme: Theme) => {
  return {
    container: {
      backgroundColor: theme.colors.background,
    },
    surface: {
      backgroundColor: theme.colors.surface,
    },
    text: {
      color: theme.colors.text,
    },
    textSecondary: {
      color: theme.colors.textSecondary,
    },
    textTertiary: {
      color: theme.colors.textTertiary,
    },
    border: {
      borderColor: theme.colors.border,
    },
    borderLight: {
      borderColor: theme.colors.borderLight,
    },
    card: {
      backgroundColor: theme.colors.card,
      shadowColor: theme.colors.cardShadow,
    },
  };
};