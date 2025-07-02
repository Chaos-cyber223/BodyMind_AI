import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

// 导入屏幕
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import ChatScreen from './screens/ChatScreen';
import MealPlanScreen from './screens/MealPlanScreen';
import ResearchScreen from './screens/ResearchScreen';

// 导入i18n系统
import i18n from './localization/i18n';

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
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
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
        name="ResearchTab"
        component={ResearchScreen}
        options={{
          tabBarLabel: 'Research',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size }}>🔬</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  // 初始化i18n系统
  useEffect(() => {
    i18n.initialize();
  }, []);
  
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          component={WelcomeScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetupScreen}
          options={{
            headerShown: true,
            title: 'Profile Setup',
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="MainApp" 
          component={MainTabs}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="Test" 
          component={TestScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 