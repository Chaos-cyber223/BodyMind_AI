import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiService from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../localization/i18n';
import LanguageToggle from '../components/LanguageToggle';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface MealPlanScreenProps {
  navigation: any;
}

interface NutritionData {
  calories: number;
  targetCalories: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
}

interface Exercise {
  id: string;
  name: string;
  duration: string;
  calories: number;
  completed: boolean;
  type: 'cardio' | 'strength' | 'flexibility';
}

interface FoodEntry {
  id: string;
  description: string;
  calories: number;
  timestamp: Date;
}

export default function MealPlanScreen({ navigation }: MealPlanScreenProps) {
  const { t } = useTranslation();
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 1240,
    targetCalories: 1650,
    protein: { current: 84, target: 120 },
    carbs: { current: 84, target: 140 },
    fats: { current: 34, target: 68 },
  });

  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Morning Run', duration: '30 min', calories: 240, completed: true, type: 'cardio' },
    { id: '2', name: 'Push-ups', duration: '3x15', calories: 50, completed: true, type: 'strength' },
    { id: '3', name: 'Planks', duration: '3x45s', calories: 30, completed: false, type: 'strength' },
  ]);

  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentEntries, setRecentEntries] = useState<FoodEntry[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
        
        // Update target calories based on profile
        if (profile.tdee && profile.daily_calorie_target) {
          setNutritionData(prev => ({
            ...prev,
            targetCalories: profile.daily_calorie_target,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const handleAILogging = async () => {
    if (!aiInput.trim()) return;

    setIsProcessing(true);
    
    try {
      // Parse food if it looks like food description
      const foodKeywords = ['ate', 'had', 'breakfast', 'lunch', 'dinner', 'snack', 'drank'];
      const exerciseKeywords = ['ran', 'walked', 'workout', 'exercise', 'gym', 'lifted'];
      
      const lowerInput = aiInput.toLowerCase();
      const isFood = foodKeywords.some(keyword => lowerInput.includes(keyword));
      const isExercise = exerciseKeywords.some(keyword => lowerInput.includes(keyword));

      if (isFood || (!isFood && !isExercise)) {
        // Analyze as food
        const foodResponse = await apiService.analyzeFood({ description: aiInput });
        
        // Update nutrition data
        setNutritionData(prev => ({
          ...prev,
          calories: prev.calories + foodResponse.total_calories,
          protein: {
            ...prev.protein,
            current: prev.protein.current + foodResponse.total_macros.protein_g,
          },
          carbs: {
            ...prev.carbs,
            current: prev.carbs.current + foodResponse.total_macros.carbs_g,
          },
          fats: {
            ...prev.fats,
            current: prev.fats.current + foodResponse.total_macros.fat_g,
          },
        }));

        // Add to recent entries
        const entry: FoodEntry = {
          id: Date.now().toString(),
          description: foodResponse.foods.map(f => `${f.name} (${f.quantity})`).join(', '),
          calories: foodResponse.total_calories,
          timestamp: new Date(),
        };
        setRecentEntries(prev => [entry, ...prev].slice(0, 5));

        Alert.alert(
          t('mealPlan.foodLoggedSuccess'),
          t('mealPlan.foodLoggedMessage', { calories: foodResponse.total_calories, description: entry.description }),
          [{ text: t('chat.ok') }]
        );
      }

      if (isExercise) {
        // Analyze as exercise
        const exerciseResponse = await apiService.analyzeExercise({ description: aiInput });
        
        // Add to exercises
        exerciseResponse.exercises.forEach(ex => {
          const newExercise: Exercise = {
            id: Date.now().toString() + Math.random(),
            name: ex.activity,
            duration: `${ex.duration_minutes} min`,
            calories: ex.calories_burned,
            completed: true,
            type: ex.intensity === 'high' ? 'cardio' : 'strength',
          };
          setExercises(prev => [...prev, newExercise]);
        });

        Alert.alert(
          t('mealPlan.exerciseLoggedSuccess'),
          t('mealPlan.exerciseLoggedMessage', { calories: exerciseResponse.total_calories_burned, duration: exerciseResponse.total_duration_minutes }),
          [{ text: t('chat.ok') }]
        );
      }

      setAiInput('');
    } catch (error) {
      console.error('AI logging failed:', error);
      Alert.alert(
        t('mealPlan.processingError'),
        t('mealPlan.processingErrorMessage'),
        [{ text: t('chat.ok') }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatePercentage = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  const toggleExercise = (id: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === id ? { ...ex, completed: !ex.completed } : ex
      )
    );
  };

  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'cardio': return '🏃‍♂️';
      case 'strength': return '💪';
      case 'flexibility': return '🧘‍♀️';
      default: return '⚡';
    }
  };

  const getExerciseColor = (type: string) => {
    switch (type) {
      case 'cardio': return '#8B5CF6';
      case 'strength': return '#3B82F6';
      case 'flexibility': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: '#fff', padding: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginBottom: 16, elevation: 2 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#22223b', marginBottom: 8 }}>{t('mealPlan.title')}</Text>
          <Text style={{ fontSize: 15, color: '#4a4e69', marginBottom: 16 }}>{t('mealPlan.subtitle')}</Text>
          <View style={{ backgroundColor: '#e0f2fe', borderRadius: 16, padding: 16, marginBottom: 8 }}>
            <Text style={{ color: '#0369a1', fontWeight: '600', marginBottom: 4 }}>{t('mealPlan.goalProgress')}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>{t('mealPlan.current', { weight: 68.5 })}</Text>
              <Text style={{ color: '#64748b' }}>{t('mealPlan.target', { weight: 65 })}</Text>
            </View>
            <View style={{ height: 8, backgroundColor: '#bae6fd', borderRadius: 4, marginVertical: 8 }}>
              <View style={{ height: 8, backgroundColor: '#0ea5e9', borderRadius: 4, width: '43%' }} />
            </View>
            <Text style={{ color: '#059669', fontWeight: '700' }}>-1.5 {t('mealPlan.kgLost')}</Text>
          </View>
        </View>

        {/* AI Smart Logging Section */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 20, elevation: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#22223b', marginBottom: 8 }}>{t('mealPlan.aiLogging')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, marginRight: 8 }}>🧠</Text>
            <Text style={{ color: '#059669', fontWeight: '500' }}>{t('mealPlan.aiPowered')}</Text>
          </View>
          <View style={{ backgroundColor: '#f1f5f9', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <Text style={{ color: '#334155', fontSize: 13 }}>
              "Had scrambled eggs, toast and milk for breakfast. Did a 30-minute run in the afternoon, really sweaty!"
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <TextInput
              style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb', padding: 10, fontSize: 15, color: '#22223b' }}
              placeholder={t('mealPlan.aiPlaceholder')}
              value={aiInput}
              onChangeText={setAiInput}
              multiline
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={handleAILogging} disabled={isProcessing}>
              <Text style={{ fontSize: 22, color: isProcessing ? '#cbd5e1' : '#6366f1' }}>➤</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: '#fef9c3', borderRadius: 8, padding: 10 }}>
            <Text style={{ color: '#b45309', fontWeight: '500', marginBottom: 4 }}>{t('mealPlan.aiTipsTitle')}</Text>
            <Text style={{ color: '#b45309', fontSize: 12 }}>• {t('mealPlan.aiTip1')}</Text>
            <Text style={{ color: '#b45309', fontSize: 12 }}>• {t('mealPlan.aiTip2')}</Text>
            <Text style={{ color: '#b45309', fontSize: 12 }}>• {t('mealPlan.aiTip3')}</Text>
          </View>
        </View>

        {/* Nutrition Progress */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 20, elevation: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#22223b', marginBottom: 8 }}>{t('mealPlan.nutrition')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: '#64748b' }}>{t('mealPlan.calories')}</Text>
            <Text style={{ color: '#0ea5e9', fontWeight: '700' }}>{t('mealPlan.caloriesFormat', { current: nutritionData.calories, target: nutritionData.targetCalories })}</Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#e0e7ef', borderRadius: 4, marginBottom: 12 }}>
            <View style={{ height: 8, backgroundColor: '#6366f1', borderRadius: 4, width: `${Math.min((nutritionData.calories / nutritionData.targetCalories) * 100, 100)}%` }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#059669', fontWeight: '600' }}>{t('mealPlan.protein')}</Text>
              <Text style={{ color: '#22223b', fontWeight: '700' }}>{nutritionData.protein.current}/{nutritionData.protein.target}g</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#f59e0b', fontWeight: '600' }}>{t('mealPlan.carbs')}</Text>
              <Text style={{ color: '#22223b', fontWeight: '700' }}>{nutritionData.carbs.current}/{nutritionData.carbs.target}g</Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ color: '#ef4444', fontWeight: '600' }}>{t('mealPlan.fats')}</Text>
              <Text style={{ color: '#22223b', fontWeight: '700' }}>{nutritionData.fats.current}/{nutritionData.fats.target}g</Text>
            </View>
          </View>
        </View>

        {/* Today's Workout Section */}
        <View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 20, elevation: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#22223b', marginBottom: 8 }}>{t('mealPlan.workout')}</Text>
          {exercises.map((exercise) => (
            <View key={exercise.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>{getExerciseIcon(exercise.type)}</Text>
              <Text style={{ color: '#22223b', fontWeight: '500', flex: 1 }}>{exercise.name} <Text style={{ color: '#64748b', fontWeight: '400' }}>{exercise.duration}</Text></Text>
              <TouchableOpacity onPress={() => toggleExercise(exercise.id)}>
                <Text style={{ fontSize: 18, color: exercise.completed ? '#059669' : '#d1d5db' }}>{exercise.completed ? '✓' : '○'}</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ backgroundColor: '#e0f2fe', borderRadius: 8, padding: 10, marginTop: 8 }}>
            <Text style={{ color: '#0369a1', fontWeight: '500' }}>{t('mealPlan.aiSuggestion')}</Text>
          </View>
          <View style={{ backgroundColor: '#f1f5f9', borderRadius: 8, padding: 10, marginTop: 8 }}>
            <Text style={{ color: '#6366f1', fontWeight: '500' }}>💡 Science Tip: Strength training boosts metabolism for up to 24 hours post-workout</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerContainer: {
    backgroundColor: '#6366F1',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  progressWeek: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#e0e7ff',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressStats: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressUnit: {
    fontSize: 12,
    color: '#e0e7ff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  aiBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  aiInputContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  aiInputBox: {
    flexDirection: 'column',
    flex: 1,
  },
  aiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  aiMessage: {
    flex: 1,
  },
  aiMessageText: {
    fontSize: 13,
    color: '#374151',
  },
  aiResponseBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  aiResponseAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aiResponseAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  aiResponseMessage: {
    flex: 1,
  },
  aiResponseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  aiResponseText: {
    fontSize: 13,
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    maxHeight: 80,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  voiceIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  sendIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  tipsContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
  },
  tipsContent: {
    flexDirection: 'column',
  },
  tipText: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
  calorieContainer: {
    marginBottom: 20,
  },
  calorieHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calorieLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  calorieValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  calorieBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  calorieFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  macroProgress: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutBadges: {
    flexDirection: 'row',
  },
  aiGeneratedBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiGeneratedBadgeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  strengthBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  strengthBadgeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  aiCompletedBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  aiCompletedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiCompletedIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  aiCompletedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  aiCompletedText: {
    fontSize: 13,
    color: '#374151',
  },
  exerciseList: {
    marginBottom: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseIconText: {
    fontSize: 18,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  exerciseDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
  exerciseToggle: {
    width: 24,
    height: 24,
  },
  exerciseToggleIcon: {
    fontSize: 18,
    color: '#6b7280',
  },
  exerciseToggleCompleted: {
    color: '#10b981',
  },
  exerciseToggleIncomplete: {
    color: '#d1d5db',
  },
  suggestionBox: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 13,
    color: '#6b21a8',
  },
  suggestionBold: {
    fontWeight: '600',
  },
  scienceTipBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  scienceTipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scienceTipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  scienceTipText: {
    flex: 1,
    fontSize: 13,
    color: '#3730a3',
    lineHeight: 18,
  },
  scienceTipBold: {
    fontWeight: '600',
  },
  researchBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  researchContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  researchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  researchInfo: {
    flex: 1,
  },
  researchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  researchText: {
    fontSize: 13,
    color: '#3730a3',
    lineHeight: 18,
  },
  researchLink: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  researchLinkIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  languageToggleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
});