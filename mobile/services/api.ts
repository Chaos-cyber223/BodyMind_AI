import axios from 'axios';
import { Platform } from 'react-native';

// API Base URL configuration
const API_BASE_URL = Platform.select({
  ios: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000', // Android emulator
  default: 'http://localhost:8000',
});

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface UserProfile {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
}

export interface ChatMessage {
  message: string;
  user_profile?: UserProfile;
  conversation_id?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  sources?: string[];
  timestamp: string;
}

export interface ProfileSetupRequest {
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'very_active';
  goal: 'lose_weight' | 'maintain' | 'gain_muscle';
  target_weight?: number;
}

export interface TDEEResponse {
  tdee: number;
  bmr: number;
  daily_calorie_target: number;
  weekly_weight_change_target: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  recommendations: string[];
}

export interface FoodAnalysis {
  description: string;
}

export interface FoodAnalysisResponse {
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;
  total_calories: number;
  total_macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
}

export interface ExerciseAnalysis {
  description: string;
}

export interface ExerciseAnalysisResponse {
  exercises: Array<{
    activity: string;
    duration_minutes: number;
    calories_burned: number;
    intensity: string;
  }>;
  total_calories_burned: number;
  total_duration_minutes: number;
  recommendations: string[];
}

// API Methods
const apiService = {
  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },

  // Chat API
  async sendMessage(data: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await api.post('/api/chat/message', data);
      return response.data;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  },

  async startNewConversation(): Promise<{ conversation_id: string; message: string }> {
    try {
      const response = await api.post('/api/chat/conversation/new');
      return response.data;
    } catch (error) {
      console.error('Start conversation failed:', error);
      throw error;
    }
  },

  // Profile API
  async setupProfile(data: ProfileSetupRequest): Promise<TDEEResponse> {
    try {
      const response = await api.post('/api/profile/setup', data);
      return response.data;
    } catch (error) {
      console.error('Profile setup failed:', error);
      throw error;
    }
  },

  // Analysis API
  async analyzeFood(data: FoodAnalysis): Promise<FoodAnalysisResponse> {
    try {
      const response = await api.post('/api/analysis/food', data);
      return response.data;
    } catch (error) {
      console.error('Food analysis failed:', error);
      throw error;
    }
  },

  async analyzeExercise(data: ExerciseAnalysis): Promise<ExerciseAnalysisResponse> {
    try {
      const response = await api.post('/api/analysis/exercise', data);
      return response.data;
    } catch (error) {
      console.error('Exercise analysis failed:', error);
      throw error;
    }
  },

  // Document API (for future knowledge base updates)
  async getKnowledgeTopics(): Promise<{ topics: string[] }> {
    try {
      const response = await api.get('/api/documents/topics');
      return response.data;
    } catch (error) {
      console.error('Get topics failed:', error);
      throw error;
    }
  },

  async clearConversationMemory(): Promise<{ message: string }> {
    try {
      const response = await api.post('/api/documents/clear-memory');
      return response.data;
    } catch (error) {
      console.error('Clear memory failed:', error);
      throw error;
    }
  },
};

// Request interceptor for auth (future use)
api.interceptors.request.use(
  (config) => {
    // Add auth token when implemented
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          break;
        case 404:
          // Handle not found
          break;
        case 500:
          // Handle server error
          break;
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.request);
    } else {
      // Request setup error
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiService;