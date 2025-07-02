import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../localization/i18n';
import LanguageToggle from '../components/LanguageToggle';

const { width, height } = Dimensions.get('window');

interface ProgressScreenProps {
  navigation: any;
}

interface WeightData {
  date: string;
  weight: number;
}

interface NutritionSummary {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

interface ExerciseSummary {
  totalMinutes: number;
  caloriesBurned: number;
  daysActive: number;
  activities: { type: string; minutes: number; count: number }[];
}

export default function ProgressScreen({ navigation }: ProgressScreenProps) {
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weightHistory, setWeightHistory] = useState<WeightData[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionSummary>({
    calories: { current: 1850, target: 2000 },
    protein: { current: 125, target: 140 },
    carbs: { current: 220, target: 250 },
    fat: { current: 65, target: 70 },
  });
  const [exerciseData, setExerciseData] = useState<ExerciseSummary>({
    totalMinutes: 180,
    caloriesBurned: 1200,
    daysActive: 4,
    activities: [
      { type: 'cardio', minutes: 90, count: 3 },
      { type: 'strength', minutes: 60, count: 2 },
      { type: 'flexibility', minutes: 30, count: 2 },
    ],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
    loadProgressData();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  };

  const loadProgressData = async () => {
    try {
      const profile = await AsyncStorage.getItem('userProfile');
      if (profile) {
        const userData = JSON.parse(profile);
        const currentWeight = userData.weight || 70;
        
        // Generate realistic weight history based on user's current weight
        const weeklyLoss = 0.5; // Average 0.5kg loss per week
        const mockWeightHistory: WeightData[] = [];
        const today = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - (i * 7)); // Weekly intervals
          mockWeightHistory.push({
            date: date.toISOString().split('T')[0],
            weight: currentWeight + (i * weeklyLoss),
          });
        }
        
        setWeightHistory(mockWeightHistory);
        
        // Update nutrition data based on user's TDEE
        if (userData.tdee) {
          const targetCalories = userData.daily_calorie_target || userData.tdee - 500;
          const targetProtein = Math.round(userData.weight * 2.2); // 2.2g per kg
          const targetFat = Math.round(targetCalories * 0.25 / 9); // 25% of calories from fat
          const targetCarbs = Math.round((targetCalories - (targetProtein * 4) - (targetFat * 9)) / 4);
          
          setNutritionData({
            calories: { current: targetCalories - 150, target: targetCalories },
            protein: { current: targetProtein - 15, target: targetProtein },
            carbs: { current: targetCarbs - 30, target: targetCarbs },
            fat: { current: targetFat - 5, target: targetFat },
          });
        }
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
    setIsLoading(false);
  };

  const calculateProgress = () => {
    if (!userProfile || weightHistory.length === 0) return { percentage: 0, lost: 0 };
    
    const startWeight = weightHistory[0].weight;
    const currentWeight = weightHistory[weightHistory.length - 1].weight;
    const targetWeight = userProfile.targetWeight || 65;
    
    const totalToLose = startWeight - targetWeight;
    const alreadyLost = startWeight - currentWeight;
    const percentage = totalToLose > 0 ? (alreadyLost / totalToLose) * 100 : 0;
    
    return {
      percentage: Math.min(Math.max(percentage, 0), 100),
      lost: alreadyLost,
    };
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage < 25) return t('progress.motivation.justStarted');
    if (percentage < 50) return t('progress.motivation.keepGoing');
    if (percentage < 75) return t('progress.motivation.halfwayThere');
    if (percentage < 100) return t('progress.motivation.almostThere');
    return t('progress.motivation.goalReached');
  };

  const renderWeightChart = () => {
    const maxWeight = Math.max(...weightHistory.map(w => w.weight)) + 1;
    const minWeight = Math.min(...weightHistory.map(w => w.weight)) - 1;
    const chartHeight = 200;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{t('progress.weightTrend')}</Text>
        <View style={styles.chart}>
          {/* Simple line chart representation */}
          <View style={styles.chartGrid}>
            {weightHistory.map((data, index) => {
              const barHeight = ((data.weight - minWeight) / (maxWeight - minWeight)) * chartHeight;
              const isLast = index === weightHistory.length - 1;
              
              return (
                <View key={index} style={styles.chartBar}>
                  <View style={[styles.bar, { height: barHeight }]}>
                    {isLast && (
                      <View style={styles.currentWeightBadge}>
                        <Text style={styles.currentWeightText}>{data.weight}kg</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.chartLabel}>
                    {new Date(data.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderNutritionCard = () => {
    const nutrients = [
      { key: 'calories', label: t('progress.nutrition.calories'), unit: 'kcal', color: '#4285F4' },
      { key: 'protein', label: t('progress.nutrition.protein'), unit: 'g', color: '#34A853' },
      { key: 'carbs', label: t('progress.nutrition.carbs'), unit: 'g', color: '#FBBC04' },
      { key: 'fat', label: t('progress.nutrition.fat'), unit: 'g', color: '#EA4335' },
    ];

    return (
      <View style={styles.nutritionCard}>
        <Text style={styles.sectionTitle}>{t('progress.todayNutrition')}</Text>
        <View style={styles.nutritionGrid}>
          {nutrients.map((nutrient) => {
            const data = nutritionData[nutrient.key as keyof NutritionSummary];
            const percentage = (data.current / data.target) * 100;
            
            return (
              <View key={nutrient.key} style={styles.nutritionItem}>
                <View style={[styles.nutritionIcon, { backgroundColor: nutrient.color + '20' }]}>
                  <Text style={[styles.nutritionIconText, { color: nutrient.color }]}>
                    {nutrient.key === 'calories' ? '🔥' : nutrient.key === 'protein' ? '🥩' : nutrient.key === 'carbs' ? '🌾' : '🥑'}
                  </Text>
                </View>
                <Text style={styles.nutritionLabel}>{nutrient.label}</Text>
                <Text style={styles.nutritionValue}>
                  {data.current}{nutrient.unit}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min(percentage, 100)}%`, backgroundColor: nutrient.color }
                    ]} 
                  />
                </View>
                <Text style={styles.nutritionTarget}>
                  {t('progress.nutrition.targetValue', { value: data.target, unit: nutrient.unit })}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderExerciseCard = () => {
    return (
      <View style={styles.exerciseCard}>
        <Text style={styles.sectionTitle}>{t('progress.weeklyExercise')}</Text>
        
        <View style={styles.exerciseStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exerciseData.totalMinutes}</Text>
            <Text style={styles.statLabel}>{t('progress.exercise.minutes')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exerciseData.caloriesBurned}</Text>
            <Text style={styles.statLabel}>{t('progress.exercise.calories')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{exerciseData.daysActive}</Text>
            <Text style={styles.statLabel}>{t('progress.exercise.days')}</Text>
          </View>
        </View>

        <View style={styles.activityBreakdown}>
          {exerciseData.activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
                <Text style={styles.activityEmoji}>{getActivityEmoji(activity.type)}</Text>
              </View>
              <Text style={styles.activityName}>{t(`progress.exercise.${activity.type}`)}</Text>
              <Text style={styles.activityTime}>{activity.minutes} {t('progress.exercise.min')}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getActivityEmoji = (type: string) => {
    switch (type) {
      case 'cardio': return '🏃';
      case 'strength': return '💪';
      case 'flexibility': return '🧘';
      default: return '⚡';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'cardio': return '#8B5CF6';
      case 'strength': return '#3B82F6';
      case 'flexibility': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const progress = calculateProgress();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('progress.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('progress.subtitle')}</Text>
        </View>
        <LanguageToggle size="small" />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview Card */}
        <View style={styles.progressOverview}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{t('progress.overall')}</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress.percentage)}%</Text>
          </View>
          
          <View style={styles.progressBarLarge}>
            <View 
              style={[
                styles.progressFillLarge, 
                { width: `${progress.percentage}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.progressStats}>
            {t('progress.stats', { 
              lost: progress.lost.toFixed(1), 
              current: weightHistory[weightHistory.length - 1]?.weight || userProfile?.weight || 0,
              target: userProfile?.targetWeight || 65 
            })}
          </Text>
          
          <View style={styles.motivationBadge}>
            <Text style={styles.motivationText}>{getMotivationalMessage(progress.percentage)}</Text>
          </View>
        </View>

        {/* Weight Trend Chart */}
        {renderWeightChart()}

        {/* Nutrition Summary */}
        {renderNutritionCard()}

        {/* Exercise Summary */}
        {renderExerciseCard()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5f6368',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  progressOverview: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4285F4',
  },
  progressBarLarge: {
    height: 12,
    backgroundColor: '#e8eaed',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: '#4285F4',
    borderRadius: 6,
  },
  progressStats: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 16,
  },
  motivationBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  motivationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1967d2',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 16,
  },
  chart: {
    height: 250,
  },
  chartGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 10,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 30,
    backgroundColor: '#4285F4',
    borderRadius: 4,
    marginBottom: 8,
    position: 'relative',
  },
  currentWeightBadge: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#34A853',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentWeightText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  chartLabel: {
    fontSize: 10,
    color: '#5f6368',
    transform: [{ rotate: '-45deg' }],
  },
  nutritionCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    marginBottom: 20,
  },
  nutritionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionIconText: {
    fontSize: 20,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#5f6368',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e8eaed',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nutritionTarget: {
    fontSize: 12,
    color: '#5f6368',
  },
  exerciseCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eaed',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#5f6368',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e8eaed',
  },
  activityBreakdown: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 18,
  },
  activityName: {
    flex: 1,
    fontSize: 16,
    color: '#202124',
  },
  activityTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5f6368',
  },
});