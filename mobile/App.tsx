import 'react-native-url-polyfill/auto';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';

// 导入屏幕
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ChatScreen from './screens/ChatScreen';
import MealPlanScreen from './screens/MealPlanScreen';
import ResearchScreen from './screens/ResearchScreen';
import ProgressScreen from './screens/ProgressScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

// 导入i18n系统
import i18n from './localization/i18n';

// 导入认证上下文
import { AuthProvider, useAuth } from './contexts/AuthContext';

// 导入主题上下文
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 简单的测试组件
function TestScreen({ route }: any) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, color: '#333' }}>Test Screen: {route.name}</Text>
    </View>
  );
}

// 主应用标签导航
function MainTabs() {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>💬</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MealPlanTab"
        component={MealPlanScreen}
        options={{
          tabBarLabel: 'Plan',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>📈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// 认证导航栈
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// 已认证用户导航栈
function AppStack() {
  const { isProfileComplete } = useAuth();
  const { theme } = useTheme();
  
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={isProfileComplete ? "MainApp" : "ProfileSetup"}
    >
      <Stack.Screen 
        name="ProfileSetup" 
        component={ProfileSetupScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="MainApp" 
        component={MainTabs}
        options={{
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

// 根导航组件
function RootNavigator() {
  const { isAuthenticated, loading, session } = useAuth();
  const { theme } = useTheme();
  
  console.log('🔵 RootNavigator: isAuthenticated =', isAuthenticated);
  console.log('🔵 RootNavigator: session =', session);
  console.log('🔵 RootNavigator: loading =', loading);
  
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.colors.background 
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  
  return (
    <NavigationContainer>
      <StatusBar style={theme.colors.statusBarStyle} />
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  // 初始化i18n系统
  useEffect(() => {
    i18n.initialize();
  }, []);
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
} 