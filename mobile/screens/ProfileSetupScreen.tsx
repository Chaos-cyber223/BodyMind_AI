import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from '../localization/i18n';
import LanguageToggle from '../components/LanguageToggle';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface ProfileSetupScreenProps {
  navigation: any;
}

interface UserProfile {
  // Step 1: Basic Info
  age: string;
  gender: 'male' | 'female' | 'other';
  height: string;
  currentWeight: string;
  targetWeight: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very_active';
  
  // Step 2: Goals & Preferences
  weightLossGoal: 'slow' | 'moderate' | 'fast';
  exerciseExperience: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  selectedSports: string[];
  exerciseFrequency: 'never' | 'occasionally' | 'regular' | 'frequent' | 'daily';
  exerciseDuration: '15-30min' | '30-45min' | '45-60min' | '60min+';
  
  // Step 3: Health Info (Optional)
  healthConditions: string;
  allergies: string;
  medications: string;
}

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
  const { t } = useTranslation();
  const { setProfileComplete } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    age: '',
    gender: 'male',
    height: '',
    currentWeight: '',
    targetWeight: '',
    activityLevel: 'moderate',
    weightLossGoal: 'moderate',
    exerciseExperience: 'beginner',
    selectedSports: [],
    exerciseFrequency: 'regular',
    exerciseDuration: '30-45min',
    healthConditions: '',
    allergies: '',
    medications: '',
  });

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');

  // Step 1: Basic Information
  const renderBasicInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('profile.step1.title')}</Text>
      <Text style={styles.stepSubtitle}>{t('profile.step1.subtitle')}</Text>
      
      {/* Unit System Selection */}
      <View style={styles.unitSelector}>
        <Text style={styles.sectionLabel}>{t('profile.unitSystem')}</Text>
        <View style={styles.unitButtons}>
          <TouchableOpacity
            style={[styles.unitButton, unitSystem === 'metric' && styles.unitButtonActive]}
            onPress={() => setUnitSystem('metric')}
          >
            <Text style={[styles.unitButtonText, unitSystem === 'metric' && styles.unitButtonTextActive]}>
              {t('profile.metric')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unitSystem === 'imperial' && styles.unitButtonActive]}
            onPress={() => setUnitSystem('imperial')}
          >
            <Text style={[styles.unitButtonText, unitSystem === 'imperial' && styles.unitButtonTextActive]}>
              {t('profile.imperial')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Age */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.age')}</Text>
        <TextInput
          style={styles.textInput}
          value={profile.age}
          onChangeText={(text) => setProfile({...profile, age: text})}
          placeholder={t('profile.agePlaceholder')}
          keyboardType="numeric"
          maxLength={3}
        />
      </View>

      {/* Gender */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.gender')}</Text>
        <View style={styles.genderButtons}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.genderButton, profile.gender === gender && styles.genderButtonActive]}
              onPress={() => setProfile({...profile, gender: gender as any})}
            >
              <Text style={[styles.genderButtonText, profile.gender === gender && styles.genderButtonTextActive]}>
                {t(`profile.${gender}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Height */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.height')} ({unitSystem === 'metric' ? 'cm' : 'inches'})</Text>
        <TextInput
          style={styles.textInput}
          value={profile.height}
          onChangeText={(text) => setProfile({...profile, height: text})}
          placeholder={unitSystem === 'metric' ? t('profile.heightPlaceholderMetric') : t('profile.heightPlaceholderImperial')}
          keyboardType="numeric"
        />
      </View>

      {/* Weight */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.currentWeight')} ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Text>
        <TextInput
          style={styles.textInput}
          value={profile.currentWeight}
          onChangeText={(text) => setProfile({...profile, currentWeight: text})}
          placeholder={unitSystem === 'metric' ? t('profile.weightPlaceholderMetric') : t('profile.weightPlaceholderImperial')}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.targetWeight')} ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Text>
        <TextInput
          style={styles.textInput}
          value={profile.targetWeight}
          onChangeText={(text) => setProfile({...profile, targetWeight: text})}
          placeholder={unitSystem === 'metric' ? t('profile.targetWeightPlaceholderMetric') : t('profile.targetWeightPlaceholderImperial')}
          keyboardType="numeric"
        />
      </View>

      {/* Activity Level */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.activityLevel')}</Text>
        {[
          {key: 'sedentary', label: t('profile.sedentary'), desc: t('profile.sedentaryDesc')},
          {key: 'light', label: t('profile.light'), desc: t('profile.lightDesc')},
          {key: 'moderate', label: t('profile.moderate'), desc: t('profile.moderateDesc')},
          {key: 'very_active', label: t('profile.veryActive'), desc: t('profile.veryActiveDesc')},
        ].map((activity) => (
          <TouchableOpacity
            key={activity.key}
            style={[styles.activityOption, profile.activityLevel === activity.key && styles.activityOptionActive]}
            onPress={() => setProfile({...profile, activityLevel: activity.key as any})}
          >
            <View style={styles.activityContent}>
              <Text style={[styles.activityLabel, profile.activityLevel === activity.key && styles.activityLabelActive]}>
                {activity.label}
              </Text>
              <Text style={[styles.activityDesc, profile.activityLevel === activity.key && styles.activityDescActive]}>
                {activity.desc}
              </Text>
            </View>
            {profile.activityLevel === activity.key && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 2: Goals & Exercise Preferences
  const renderGoalsAndExercise = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('profile.step2.title')}</Text>
      <Text style={styles.stepSubtitle}>{t('profile.step2.subtitle')}</Text>

      {/* Weight Loss Goal */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.weightLossGoal')}</Text>
        {[
          {key: 'slow', label: t('profile.slow'), desc: t('profile.slowDesc')},
          {key: 'moderate', label: t('profile.moderateGoal'), desc: t('profile.moderateGoalDesc')},
          {key: 'fast', label: t('profile.fast'), desc: t('profile.fastDesc')},
        ].map((goal) => (
          <TouchableOpacity
            key={goal.key}
            style={[styles.goalOption, profile.weightLossGoal === goal.key && styles.goalOptionActive]}
            onPress={() => setProfile({...profile, weightLossGoal: goal.key as any})}
          >
            <View style={styles.goalContent}>
              <Text style={[styles.goalLabel, profile.weightLossGoal === goal.key && styles.goalLabelActive]}>
                {goal.label}
              </Text>
              <Text style={[styles.goalDesc, profile.weightLossGoal === goal.key && styles.goalDescActive]}>
                {goal.desc}
              </Text>
            </View>
            {profile.weightLossGoal === goal.key && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Exercise Experience */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.exerciseExperience')}</Text>
        {[
          {key: 'beginner', label: t('profile.beginner'), desc: t('profile.beginnerDesc')},
          {key: 'intermediate', label: t('profile.intermediate'), desc: t('profile.intermediateDesc')},
          {key: 'advanced', label: t('profile.advanced'), desc: t('profile.advancedDesc')},
          {key: 'expert', label: t('profile.expert'), desc: t('profile.expertDesc')},
        ].map((exp) => (
          <TouchableOpacity
            key={exp.key}
            style={[styles.experienceOption, profile.exerciseExperience === exp.key && styles.experienceOptionActive]}
            onPress={() => setProfile({...profile, exerciseExperience: exp.key as any})}
          >
            <View style={styles.experienceContent}>
              <Text style={[styles.experienceLabel, profile.exerciseExperience === exp.key && styles.experienceLabelActive]}>
                {exp.label}
              </Text>
              <Text style={[styles.experienceDesc, profile.exerciseExperience === exp.key && styles.experienceDescActive]}>
                {exp.desc}
              </Text>
            </View>
            {profile.exerciseExperience === exp.key && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Exercise Frequency */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.exerciseFrequency')}</Text>
        {[
          {key: 'never', label: t('profile.never'), desc: t('profile.neverDesc')},
          {key: 'occasionally', label: t('profile.occasionally'), desc: t('profile.occasionallyDesc')},
          {key: 'regular', label: t('profile.regular'), desc: t('profile.regularDesc')},
          {key: 'frequent', label: t('profile.frequent'), desc: t('profile.frequentDesc')},
          {key: 'daily', label: t('profile.daily'), desc: t('profile.dailyDesc')},
        ].map((freq) => (
          <TouchableOpacity
            key={freq.key}
            style={[styles.frequencyOption, profile.exerciseFrequency === freq.key && styles.frequencyOptionActive]}
            onPress={() => setProfile({...profile, exerciseFrequency: freq.key as any})}
          >
            <View style={styles.frequencyContent}>
              <Text style={[styles.frequencyLabel, profile.exerciseFrequency === freq.key && styles.frequencyLabelActive]}>
                {freq.label}
              </Text>
              <Text style={[styles.frequencyDesc, profile.exerciseFrequency === freq.key && styles.frequencyDescActive]}>
                {freq.desc}
              </Text>
            </View>
            {profile.exerciseFrequency === freq.key && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Exercise Duration */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.exerciseDuration')}</Text>
        {[
          {key: '15-30min', label: t('profile.duration15')},
          {key: '30-45min', label: t('profile.duration30')},
          {key: '45-60min', label: t('profile.duration45')},
          {key: '60min+', label: t('profile.duration60')},
        ].map((duration) => (
          <TouchableOpacity
            key={duration.key}
            style={[styles.durationOption, profile.exerciseDuration === duration.key && styles.durationOptionActive]}
            onPress={() => setProfile({...profile, exerciseDuration: duration.key as any})}
          >
            <Text style={[styles.durationLabel, profile.exerciseDuration === duration.key && styles.durationLabelActive]}>
              {duration.label}
            </Text>
            {profile.exerciseDuration === duration.key && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 3: Health Information (Optional)
  const renderHealthInfo = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('profile.step3.title')}</Text>
      <Text style={styles.stepSubtitle}>{t('profile.step3.subtitle')}</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.healthConditions')}</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.healthConditions}
          onChangeText={(text) => setProfile({...profile, healthConditions: text})}
          placeholder={t('profile.healthConditionsPlaceholder')}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.allergies')}</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.allergies}
          onChangeText={(text) => setProfile({...profile, allergies: text})}
          placeholder={t('profile.allergiesPlaceholder')}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{t('profile.medications')}</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.medications}
          onChangeText={(text) => setProfile({...profile, medications: text})}
          placeholder={t('profile.medicationsPlaceholder')}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete profile setup
      try {
        await setProfileComplete(true);
        Alert.alert(
          t('profile.completeTitle'),
          t('profile.completeMessage'),
          [
            {
              text: t('profile.continue'),
              onPress: () => navigation.navigate('MainApp')
            }
          ]
        );
      } catch (error) {
        console.error('Error completing profile:', error);
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // 如果在第一步，提供跳过选项
      Alert.alert(
        t('profile.skipTitle') || 'Skip Profile Setup?',
        t('profile.skipMessage') || 'You can complete your profile later in settings. Continue to main app?',
        [
          {
            text: t('profile.cancel') || 'Cancel',
            style: 'cancel'
          },
          {
            text: t('profile.skipButton') || 'Skip for now',
            onPress: async () => {
              await setProfileComplete(true);
              navigation.navigate('MainApp');
            }
          }
        ]
      );
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderBasicInfo();
      case 2:
        return renderGoalsAndExercise();
      case 3:
        return renderHealthInfo();
      default:
        return renderBasicInfo();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={async () => {
              await setProfileComplete(true);
              navigation.navigate('MainApp');
            }}
          >
            <Text style={styles.skipButtonText}>{t('profile.skip') || 'Skip'}</Text>
          </TouchableOpacity>
          <LanguageToggle size="small" />
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{t('profile.step', { current: currentStep, total: 3 })}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {getStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3 ? t('profile.complete') : t('profile.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#4285f4',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#202124',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(95, 99, 104, 0.1)',
  },
  skipButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#5f6368',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f1f3f4',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4285f4',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#5f6368',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  stepContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#202124',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#5f6368',
    marginBottom: 32,
    lineHeight: 24,
  },
  unitSelector: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 12,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dadce0',
    backgroundColor: '#ffffff',
  },
  unitButtonActive: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5f6368',
    textAlign: 'center',
  },
  unitButtonTextActive: {
    color: '#ffffff',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#202124',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dadce0',
    backgroundColor: '#ffffff',
  },
  genderButtonActive: {
    backgroundColor: '#4285f4',
    borderColor: '#4285f4',
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5f6368',
    textAlign: 'center',
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  activityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f3f4',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  activityOptionActive: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4285f4',
  },
  activityContent: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  activityLabelActive: {
    color: '#4285f4',
  },
  activityDesc: {
    fontSize: 14,
    color: '#5f6368',
  },
  activityDescActive: {
    color: '#4285f4',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f3f4',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  goalOptionActive: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4285f4',
  },
  goalContent: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  goalLabelActive: {
    color: '#4285f4',
  },
  goalDesc: {
    fontSize: 14,
    color: '#5f6368',
  },
  goalDescActive: {
    color: '#4285f4',
  },
  experienceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f3f4',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  experienceOptionActive: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4285f4',
  },
  experienceContent: {
    flex: 1,
  },
  experienceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  experienceLabelActive: {
    color: '#4285f4',
  },
  experienceDesc: {
    fontSize: 14,
    color: '#5f6368',
  },
  experienceDescActive: {
    color: '#4285f4',
  },
  frequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f3f4',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  frequencyOptionActive: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4285f4',
  },
  frequencyContent: {
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 4,
  },
  frequencyLabelActive: {
    color: '#4285f4',
  },
  frequencyDesc: {
    fontSize: 14,
    color: '#5f6368',
  },
  frequencyDescActive: {
    color: '#4285f4',
  },
  durationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f3f4',
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  durationOptionActive: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4285f4',
  },
  durationLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
  },
  durationLabelActive: {
    color: '#4285f4',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285f4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  nextButton: {
    backgroundColor: '#4285f4',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#4285f4',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
}); 