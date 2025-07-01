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
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Help us understand your current situation</Text>
      
      {/* Unit System Selection */}
      <View style={styles.unitSelector}>
        <Text style={styles.sectionLabel}>Unit System</Text>
        <View style={styles.unitButtons}>
          <TouchableOpacity
            style={[styles.unitButton, unitSystem === 'metric' && styles.unitButtonActive]}
            onPress={() => setUnitSystem('metric')}
          >
            <Text style={[styles.unitButtonText, unitSystem === 'metric' && styles.unitButtonTextActive]}>
              Metric (cm/kg)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unitSystem === 'imperial' && styles.unitButtonActive]}
            onPress={() => setUnitSystem('imperial')}
          >
            <Text style={[styles.unitButtonText, unitSystem === 'imperial' && styles.unitButtonTextActive]}>
              Imperial (in/lbs)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Age */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Age</Text>
        <TextInput
          style={styles.textInput}
          value={profile.age}
          onChangeText={(text) => setProfile({...profile, age: text})}
          placeholder="Enter your age"
          keyboardType="numeric"
          maxLength={3}
        />
      </View>

      {/* Gender */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Gender</Text>
        <View style={styles.genderButtons}>
          {['male', 'female', 'other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={[styles.genderButton, profile.gender === gender && styles.genderButtonActive]}
              onPress={() => setProfile({...profile, gender: gender as any})}
            >
              <Text style={[styles.genderButtonText, profile.gender === gender && styles.genderButtonTextActive]}>
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Height */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Height ({unitSystem === 'metric' ? 'cm' : 'inches'})</Text>
        <TextInput
          style={styles.textInput}
          value={profile.height}
          onChangeText={(text) => setProfile({...profile, height: text})}
          placeholder={unitSystem === 'metric' ? 'e.g., 170' : 'e.g., 67'}
          keyboardType="numeric"
        />
      </View>

      {/* Weight */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Current Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Text>
        <TextInput
          style={styles.textInput}
          value={profile.currentWeight}
          onChangeText={(text) => setProfile({...profile, currentWeight: text})}
          placeholder={unitSystem === 'metric' ? 'e.g., 70' : 'e.g., 154'}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Target Weight ({unitSystem === 'metric' ? 'kg' : 'lbs'})</Text>
        <TextInput
          style={styles.textInput}
          value={profile.targetWeight}
          onChangeText={(text) => setProfile({...profile, targetWeight: text})}
          placeholder={unitSystem === 'metric' ? 'e.g., 65' : 'e.g., 143'}
          keyboardType="numeric"
        />
      </View>

      {/* Activity Level */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Activity Level</Text>
        {[
          {key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise'},
          {key: 'light', label: 'Light', desc: 'Light exercise 1-3 days/week'},
          {key: 'moderate', label: 'Moderate', desc: 'Moderate exercise 3-5 days/week'},
          {key: 'very_active', label: 'Very Active', desc: 'Hard exercise 6-7 days/week'},
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
      <Text style={styles.stepTitle}>Goals & Exercise</Text>
      <Text style={styles.stepSubtitle}>Tell us about your fitness goals and preferences</Text>

      {/* Weight Loss Goal */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Weight Loss Goal</Text>
        {[
          {key: 'slow', label: 'Slow & Steady', desc: '0.25-0.5 kg/week'},
          {key: 'moderate', label: 'Moderate', desc: '0.5-1 kg/week'},
          {key: 'fast', label: 'Faster', desc: '1-1.5 kg/week'},
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
        <Text style={styles.inputLabel}>Exercise Experience</Text>
        {[
          {key: 'beginner', label: 'Beginner', desc: 'New to exercise'},
          {key: 'intermediate', label: 'Intermediate', desc: 'Some experience'},
          {key: 'advanced', label: 'Advanced', desc: 'Regular exerciser'},
          {key: 'expert', label: 'Expert', desc: 'Very experienced'},
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
        <Text style={styles.inputLabel}>Weekly Exercise Frequency</Text>
        {[
          {key: 'never', label: 'Never', desc: 'No exercise'},
          {key: 'occasionally', label: 'Occasionally', desc: '1-2 times/week'},
          {key: 'regular', label: 'Regular', desc: '3-4 times/week'},
          {key: 'frequent', label: 'Frequent', desc: '5-6 times/week'},
          {key: 'daily', label: 'Daily', desc: 'Every day'},
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
        <Text style={styles.inputLabel}>Exercise Duration</Text>
        {[
          {key: '15-30min', label: '15-30 minutes'},
          {key: '30-45min', label: '30-45 minutes'},
          {key: '45-60min', label: '45-60 minutes'},
          {key: '60min+', label: '60+ minutes'},
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
      <Text style={styles.stepTitle}>Health Information</Text>
      <Text style={styles.stepSubtitle}>Optional - Help us provide better recommendations</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Health Conditions (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.healthConditions}
          onChangeText={(text) => setProfile({...profile, healthConditions: text})}
          placeholder="Any health conditions we should know about?"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Food Allergies (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.allergies}
          onChangeText={(text) => setProfile({...profile, allergies: text})}
          placeholder="Any food allergies or intolerances?"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Medications (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={profile.medications}
          onChangeText={(text) => setProfile({...profile, medications: text})}
          placeholder="Any medications you're currently taking?"
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete profile setup
      Alert.alert(
        'Profile Complete!',
        'Your personalized plan is being generated...',
        [
          {
            text: 'Continue',
            onPress: () => navigation.navigate('Chat')
          }
        ]
      );
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
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
        <Text style={styles.headerTitle}>Profile Setup</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Step {currentStep} of 3</Text>
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
            {currentStep === 3 ? 'Complete Setup' : 'Next'}
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
  headerSpacer: {
    width: 40,
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