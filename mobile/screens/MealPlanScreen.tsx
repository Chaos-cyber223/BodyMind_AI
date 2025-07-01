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
          'Food Logged Successfully!',
          `Added ${foodResponse.total_calories} calories from: ${entry.description}`,
          [{ text: 'OK' }]
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
          'Exercise Logged Successfully!',
          `Burned ${exerciseResponse.total_calories_burned} calories from ${exerciseResponse.total_duration_minutes} minutes of exercise`,
          [{ text: 'OK' }]
        );
      }

      setAiInput('');
    } catch (error) {
      console.error('AI logging failed:', error);
      Alert.alert(
        'Processing Error',
        'Unable to process your input. Please try again or be more specific.',
        [{ text: 'OK' }]
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />

      {/* Header with Progress */}
      <View style={styles.headerContainer}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Your Personal Plan</Text>
            <Text style={styles.headerSubtitle}>Science-backed strategy</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Text style={styles.profileInitial}>
              {userProfile?.name ? userProfile.name[0].toUpperCase() : 'U'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Goal Progress */}
        <View style={styles.goalProgress}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalLabel}>Goal Progress</Text>
            <Text style={styles.goalWeek}>Week 2 of 12</Text>
          </View>
          <View style={styles.progressInfo}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Current: 68.5kg</Text>
                <Text style={styles.progressText}>Target: 65kg</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '43%' }]} />
              </View>
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressNumber}>-1.5</Text>
              <Text style={styles.progressUnit}>kg lost</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* AI Smart Logging */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI Smart Logging</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>🧠 AI Powered</Text>
            </View>
          </View>

          {/* Recent AI Entries */}
          {recentEntries.length > 0 && (
            <View style={styles.recentEntries}>
              <Text style={styles.recentTitle}>Recent entries:</Text>
              {recentEntries.map(entry => (
                <View key={entry.id} style={styles.recentEntry}>
                  <Text style={styles.recentEntryText}>
                    {entry.description} - {entry.calories} cal
                  </Text>
                  <Text style={styles.recentEntryTime}>
                    {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* AI Input */}
          <View style={styles.aiInputContainer}>
            <TextInput
              style={styles.aiInput}
              placeholder="Tell AI what you ate or exercised..."
              placeholderTextColor="#9ca3af"
              value={aiInput}
              onChangeText={setAiInput}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              style={[styles.aiSendButton, isProcessing && styles.aiSendButtonDisabled]}
              onPress={handleAILogging}
              disabled={!aiInput.trim() || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.aiSendIcon}>→</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Tips */}
          <View style={styles.aiTips}>
            <Text style={styles.aiTipsTitle}>💡 AI Logging Tips</Text>
            <Text style={styles.aiTip}>• "Had oatmeal for breakfast"</Text>
            <Text style={styles.aiTip}>• "Ran for 30 minutes"</Text>
            <Text style={styles.aiTip}>• "Ate a chicken salad and went to gym"</Text>
          </View>
        </View>

        {/* Today's Nutrition */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Nutrition</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Chat')}>
              <Text style={styles.linkText}>💬 Chat to Update</Text>
            </TouchableOpacity>
          </View>

          {/* Calorie Progress */}
          <View style={styles.calorieProgress}>
            <View style={styles.calorieHeader}>
              <Text style={styles.calorieLabel}>Calories</Text>
              <Text style={styles.calorieNumbers}>
                {nutritionData.calories} / {nutritionData.targetCalories} kcal
              </Text>
            </View>
            <View style={styles.calorieBar}>
              <View 
                style={[
                  styles.calorieFill, 
                  { width: `${calculatePercentage(nutritionData.calories, nutritionData.targetCalories)}%` }
                ]} 
              />
            </View>
          </View>

          {/* Macronutrients */}
          <View style={styles.macros}>
            {/* Protein */}
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <View style={styles.macroProgress}>
                  <Text style={styles.macroPercentage}>
                    {Math.round(calculatePercentage(nutritionData.protein.current, nutritionData.protein.target))}%
                  </Text>
                </View>
              </View>
              <Text style={styles.macroName}>Protein</Text>
              <Text style={styles.macroAmount}>
                {nutritionData.protein.current}/{nutritionData.protein.target}g
              </Text>
            </View>

            {/* Carbs */}
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <View style={styles.macroProgress}>
                  <Text style={styles.macroPercentage}>
                    {Math.round(calculatePercentage(nutritionData.carbs.current, nutritionData.carbs.target))}%
                  </Text>
                </View>
              </View>
              <Text style={styles.macroName}>Carbs</Text>
              <Text style={styles.macroAmount}>
                {nutritionData.carbs.current}/{nutritionData.carbs.target}g
              </Text>
            </View>

            {/* Fats */}
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <View style={styles.macroProgress}>
                  <Text style={styles.macroPercentage}>
                    {Math.round(calculatePercentage(nutritionData.fats.current, nutritionData.fats.target))}%
                  </Text>
                </View>
              </View>
              <Text style={styles.macroName}>Fats</Text>
              <Text style={styles.macroAmount}>
                {nutritionData.fats.current}/{nutritionData.fats.target}g
              </Text>
            </View>
          </View>
        </View>

        {/* Today's Workout */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            <View style={styles.workoutBadges}>
              <View style={styles.workoutBadge}>
                <Text style={styles.workoutBadgeText}>🧠 AI Generated</Text>
              </View>
            </View>
          </View>

          {/* Exercise List */}
          <View style={styles.exerciseList}>
            {exercises.map(exercise => (
              <TouchableOpacity
                key={exercise.id}
                style={styles.exerciseItem}
                onPress={() => toggleExercise(exercise.id)}
              >
                <View style={[
                  styles.exerciseIcon,
                  exercise.type === 'cardio' && styles.cardioIcon,
                  exercise.type === 'strength' && styles.strengthIcon,
                ]}>
                  <Text style={styles.exerciseEmoji}>
                    {exercise.type === 'cardio' ? '🏃' : '💪'}
                  </Text>
                </View>
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
                </View>
                <View style={styles.exerciseCheck}>
                  {exercise.completed ? (
                    <Text style={styles.checkIcon}>✓</Text>
                  ) : (
                    <View style={styles.checkEmpty} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Suggestion */}
          <View style={styles.aiSuggestion}>
            <Text style={styles.suggestionIcon}>✨</Text>
            <Text style={styles.suggestionText}>
              AI Suggestion: Complete the Plank exercise for a balanced workout!
            </Text>
          </View>
        </View>

        {/* Science Tip */}
        <View style={[styles.section, styles.lastSection]}>
          <View style={styles.scienceTip}>
            <Text style={styles.scienceIcon}>🔬</Text>
            <View style={styles.scienceContent}>
              <Text style={styles.scienceTitle}>Latest Research</Text>
              <Text style={styles.scienceText}>
                Combined strength + cardio training increases fat loss by 28% compared to cardio alone
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerContainer: {
    backgroundColor: '#6366f1',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  goalProgress: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalLabel: {
    fontSize: 14,
    color: '#e0e7ff',
  },
  goalWeek: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  progressInfo: {
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
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  lastSection: {
    marginBottom: 100,
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
  recentEntries: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  recentEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  recentEntryText: {
    fontSize: 13,
    color: '#374151',
  },
  recentEntryTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  aiInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  aiInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    maxHeight: 80,
  },
  aiSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  aiSendButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  aiSendIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  aiTips: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  aiTipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  aiTip: {
    fontSize: 12,
    color: '#92400e',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  calorieProgress: {
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
  calorieNumbers: {
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
  macros: {
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
  macroName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  macroAmount: {
    fontSize: 12,
    color: '#6b7280',
  },
  workoutBadges: {
    flexDirection: 'row',
  },
  workoutBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  workoutBadgeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
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
  exerciseIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardioIcon: {
    backgroundColor: '#ddd6fe',
  },
  strengthIcon: {
    backgroundColor: '#fed7aa',
  },
  exerciseEmoji: {
    fontSize: 18,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  exerciseDuration: {
    fontSize: 13,
    color: '#6b7280',
  },
  exerciseCheck: {
    width: 24,
    height: 24,
  },
  checkIcon: {
    fontSize: 18,
    color: '#10b981',
  },
  checkEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9d5ff',
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
  scienceTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  scienceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  scienceContent: {
    flex: 1,
  },
  scienceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  scienceText: {
    fontSize: 13,
    color: '#3730a3',
    lineHeight: 18,
  },
});