import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

export type Language = 'en' | 'zh';

const STORAGE_KEY = 'user_language';

// Get device language
const getDeviceLanguage = (): Language => {
  const deviceLanguage = Platform.OS === 'ios'
    ? NativeModules.SettingsManager?.settings?.AppleLocale || 
      NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
    : NativeModules.I18nManager?.localeIdentifier;
  
  if (deviceLanguage?.includes('zh') || deviceLanguage?.includes('cn')) {
    return 'zh';
  }
  return 'en';
};

class I18nManager {
  private currentLanguage: Language = 'en';
  private listeners: Array<(language: Language) => void> = [];

  async initialize() {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        this.currentLanguage = savedLanguage as Language;
      } else {
        this.currentLanguage = getDeviceLanguage();
        await this.setLanguage(this.currentLanguage);
      }
    } catch (error) {
      console.error('Failed to initialize language:', error);
      this.currentLanguage = getDeviceLanguage();
    }
  }

  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  async setLanguage(language: Language) {
    try {
      this.currentLanguage = language;
      await AsyncStorage.setItem(STORAGE_KEY, language);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }

  subscribe(listener: (language: Language) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  t(key: string): string {
    return (translations[this.currentLanguage] as any)[key] || (translations.en as any)[key] || key;
  }
}

export const i18n = new I18nManager();

// Translations
const translations = {
  en: {
    // Welcome Screen
    'welcome.title': 'BodyMind AI',
    'welcome.subtitle': 'Smarter Fat Loss, Backed by Science.',
    'welcome.description': 'Personalized, sustainable results—powered by AI.',
    'welcome.getStarted': 'Get Started',
    'welcome.features.science': 'Science-Based',
    'welcome.features.scienceDesc': 'Evidence-backed recommendations',
    'welcome.features.personalized': 'Personalized',
    'welcome.features.personalizedDesc': 'Tailored to your unique needs',
    'welcome.features.ai': 'AI-Powered',
    'welcome.features.aiDesc': 'Advanced machine learning',

    // Profile Setup Screen
    'profile.title': 'Profile Setup',
    'profile.step': 'Step {{current}} of {{total}}',
    'profile.next': 'Next',
    'profile.complete': 'Complete Setup',
    'profile.back': 'Back',

    // Step 1: Basic Info
    'profile.step1.title': 'Basic Information',
    'profile.step1.subtitle': 'Help us understand your current situation',
    'profile.unitSystem': 'Unit System',
    'profile.metric': 'Metric (cm/kg)',
    'profile.imperial': 'Imperial (in/lbs)',
    'profile.age': 'Age',
    'profile.agePlaceholder': 'Enter your age',
    'profile.gender': 'Gender',
    'profile.male': 'Male',
    'profile.female': 'Female',
    'profile.other': 'Other',
    'profile.height': 'Height',
    'profile.heightPlaceholderMetric': 'e.g., 170',
    'profile.heightPlaceholderImperial': 'e.g., 67',
    'profile.currentWeight': 'Current Weight',
    'profile.weightPlaceholderMetric': 'e.g., 70',
    'profile.weightPlaceholderImperial': 'e.g., 154',
    'profile.targetWeight': 'Target Weight',
    'profile.targetWeightPlaceholderMetric': 'e.g., 65',
    'profile.targetWeightPlaceholderImperial': 'e.g., 143',
    'profile.activityLevel': 'Activity Level',
    'profile.sedentary': 'Sedentary',
    'profile.sedentaryDesc': 'Little or no exercise',
    'profile.light': 'Light',
    'profile.lightDesc': 'Light exercise 1-3 days/week',
    'profile.moderate': 'Moderate',
    'profile.moderateDesc': 'Moderate exercise 3-5 days/week',
    'profile.veryActive': 'Very Active',
    'profile.veryActiveDesc': 'Hard exercise 6-7 days/week',

    // Step 2: Goals & Exercise
    'profile.step2.title': 'Goals & Exercise',
    'profile.step2.subtitle': 'Tell us about your fitness goals and preferences',
    'profile.weightLossGoal': 'Weight Loss Goal',
    'profile.slow': 'Slow & Steady',
    'profile.slowDesc': '0.25-0.5 kg/week',
    'profile.moderateGoal': 'Moderate',
    'profile.moderateGoalDesc': '0.5-1 kg/week',
    'profile.fast': 'Faster',
    'profile.fastDesc': '1-1.5 kg/week',
    'profile.exerciseExperience': 'Exercise Experience',
    'profile.beginner': 'Beginner',
    'profile.beginnerDesc': 'New to exercise',
    'profile.intermediate': 'Intermediate',
    'profile.intermediateDesc': 'Some experience',
    'profile.advanced': 'Advanced',
    'profile.advancedDesc': 'Regular exerciser',
    'profile.expert': 'Expert',
    'profile.expertDesc': 'Very experienced',
    'profile.exerciseFrequency': 'Weekly Exercise Frequency',
    'profile.never': 'Never',
    'profile.neverDesc': 'No exercise',
    'profile.occasionally': 'Occasionally',
    'profile.occasionallyDesc': '1-2 times/week',
    'profile.regular': 'Regular',
    'profile.regularDesc': '3-4 times/week',
    'profile.frequent': 'Frequent',
    'profile.frequentDesc': '5-6 times/week',
    'profile.daily': 'Daily',
    'profile.dailyDesc': 'Every day',
    'profile.exerciseDuration': 'Exercise Duration',
    'profile.duration15': '15-30 minutes',
    'profile.duration30': '30-45 minutes',
    'profile.duration45': '45-60 minutes',
    'profile.duration60': '60+ minutes',

    // Step 3: Health Info
    'profile.step3.title': 'Health Information',
    'profile.step3.subtitle': 'Optional - Help us provide better recommendations',
    'profile.healthConditions': 'Health Conditions (Optional)',
    'profile.healthConditionsPlaceholder': 'Any health conditions we should know about?',
    'profile.allergies': 'Food Allergies (Optional)',
    'profile.allergiesPlaceholder': 'Any food allergies or intolerances?',
    'profile.medications': 'Medications (Optional)',
    'profile.medicationsPlaceholder': 'Any medications you\'re currently taking?',
    'profile.completeTitle': 'Profile Complete!',
    'profile.completeMessage': 'Your personalized plan is being generated...',
    'profile.continue': 'Continue',

    // Chat Screen
    'chat.title': 'AI Fat Loss Expert',
    'chat.subtitle': 'Powered by LangChain RAG',
    'chat.analyzing': 'Analyzing...',
    'chat.placeholder': 'Ask about diet, exercise, or fat loss...',
    'chat.voiceInput': 'Voice Input',
    'chat.voiceInputSoon': 'Voice input coming soon!',
    'chat.typingIndicator': 'AI is analyzing scientific research...',
    'chat.connectionError': 'Connection Error',
    'chat.connectionErrorMessage': 'Unable to send message. Please check your internet connection and try again.',
    'chat.retry': 'Retry',
    'chat.ok': 'OK',
    'chat.sources': 'Sources:',
    'chat.quickActions.protein': 'How much protein should I eat?',
    'chat.quickActions.exercise': 'Best exercises for fat loss',
    'chat.quickActions.plateau': 'Why am I not losing weight?',
    'chat.quickActions.hiit': 'HIIT vs cardio',
    'chat.welcome': 'Welcome to BodyMind AI! I\'m your science-based fat loss expert. How can I help you today?',
    'chat.serviceOffline': 'AI service is currently offline. Please try again later.',
    'chat.errorSending': 'Failed to send message. Please try again.',

    // Meal Plan Screen
    'mealPlan.title': 'Your Personal Plan',
    'mealPlan.subtitle': 'Science-backed strategy',
    'mealPlan.goalProgress': 'Goal Progress',
    'mealPlan.week': 'Week {{current}} of {{total}}',
    'mealPlan.current': 'Current: {{weight}}kg',
    'mealPlan.target': 'Target: {{weight}}kg',
    'mealPlan.kgLost': 'kg lost',
    'mealPlan.aiLogging': 'AI Smart Logging',
    'mealPlan.aiPowered': '🧠 AI Powered',
    'mealPlan.recentEntries': 'Recent entries:',
    'mealPlan.aiPlaceholder': 'Tell AI what you ate or exercised...',
    'mealPlan.aiTipsTitle': '💡 AI Logging Tips',
    'mealPlan.aiTip1': '• "Had oatmeal for breakfast"',
    'mealPlan.aiTip2': '• "Ran for 30 minutes"',
    'mealPlan.aiTip3': '• "Ate a chicken salad and went to gym"',
    'mealPlan.nutrition': 'Today\'s Nutrition',
    'mealPlan.chatToUpdate': '💬 Chat to Update',
    'mealPlan.calories': 'Calories',
    'mealPlan.caloriesFormat': '{{current}} / {{target}} kcal',
    'mealPlan.protein': 'Protein',
    'mealPlan.carbs': 'Carbs',
    'mealPlan.fats': 'Fats',
    'mealPlan.workout': 'Today\'s Workout',
    'mealPlan.aiGenerated': '🧠 AI Generated',
    'mealPlan.aiSuggestion': 'AI Suggestion: Complete the Plank exercise for a balanced workout!',
    'mealPlan.latestResearch': 'Latest Research',
    'mealPlan.researchText': 'Combined strength + cardio training increases fat loss by 28% compared to cardio alone',
    'mealPlan.foodLoggedSuccess': 'Food Logged Successfully!',
    'mealPlan.foodLoggedMessage': 'Added {{calories}} calories from: {{description}}',
    'mealPlan.exerciseLoggedSuccess': 'Exercise Logged Successfully!',
    'mealPlan.exerciseLoggedMessage': 'Burned {{calories}} calories from {{duration}} minutes of exercise',
    'mealPlan.processingError': 'Processing Error',
    'mealPlan.processingErrorMessage': 'Unable to process your input. Please try again or be more specific.',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.settings': 'Settings',
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.language.en': 'English',
    'settings.language.zh': 'Chinese',
    'settings.theme': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.auto': 'Auto',
    'settings.appearance.title': 'Appearance',
    'settings.account': 'Account',
    'settings.account.guest': 'Guest',
    'settings.about': 'About',
    'settings.privacy': 'Privacy Policy',
    'settings.version': 'Version',
    'settings.logout': 'Log out',
    'settings.login': 'Log in',
    'settings.profile.name': 'Qin',
    'settings.profile.email': 'qinw.official@gmail.com',
    'settings.profile.activePlan': 'Active Plan',
    'settings.profile.edit': 'Edit',
    'settings.healthGoals.title': 'Health & Goals',
    'settings.healthGoals.personalInfo': 'Personal Information',
    'settings.healthGoals.goalsTargets': 'Goals & Targets',
    'settings.healthGoals.healthMetrics': 'Health Metrics',
    'settings.notifications.title': 'Notifications',
    'settings.notifications.dailyReminders': 'Daily Reminders',
    'settings.notifications.workoutReminders': 'Workout Reminders',
    'settings.notifications.scienceTips': 'Science Tips',
    'settings.appInfo.title': 'App Information',
    'settings.appInfo.scientificSources': 'Scientific Sources',
    'settings.appInfo.privacyPolicy': 'Privacy Policy',
    'settings.appInfo.helpSupport': 'Help & Support',
    'settings.appInfo.version': 'Version',
    'settings.appInfo.versionNumber': 'v1.0.0 (Beta)',
    'settings.signOut': 'Sign Out',
    'settings.language.title': 'Language',
    'settings.language.english': 'English',
    'settings.language.chinese': 'Chinese',
    'settings.theme.title': 'Theme',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
    'settings.theme.auto': 'Auto',
    'settings.appearance.title': 'Appearance',
    'settings.signOut.confirm': 'Are you sure you want to sign out?',
    'settings.signOut.cancel': 'Cancel',
    'settings.signOut.confirmButton': 'Sign Out',
    
    // Progress Screen
    'progress.title': 'Progress',
    'progress.subtitle': 'Track your fat loss journey',
    'progress.overall': 'Overall Progress',
    'progress.stats': 'Lost {{lost}}kg • Current: {{current}}kg • Target: {{target}}kg',
    'progress.motivation.justStarted': '🚀 Great start! Keep going!',
    'progress.motivation.keepGoing': '💪 You\'re doing amazing! Stay consistent!',
    'progress.motivation.halfwayThere': '🎯 Halfway there! You\'ve got this!',
    'progress.motivation.almostThere': '🔥 So close! Final push!',
    'progress.motivation.goalReached': '🎉 Goal achieved! Time to celebrate!',
    'progress.weightTrend': 'Weight Trend',
    'progress.todayNutrition': 'Today\'s Nutrition',
    'progress.nutrition.calories': 'Calories',
    'progress.nutrition.protein': 'Protein',
    'progress.nutrition.carbs': 'Carbs',
    'progress.nutrition.fat': 'Fat',
    'progress.nutrition.targetValue': 'Target: {{value}}{{unit}}',
    'progress.weeklyExercise': 'Weekly Exercise',
    'progress.exercise.minutes': 'Minutes',
    'progress.exercise.calories': 'Calories',
    'progress.exercise.days': 'Days',
    'progress.exercise.min': 'min',
    'progress.exercise.cardio': 'Cardio',
    'progress.exercise.strength': 'Strength',
    'progress.exercise.flexibility': 'Flexibility',
    
    // Authentication
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitle': 'Sign in to continue your fat loss journey',
    'auth.login.email': 'Email',
    'auth.login.emailPlaceholder': 'your@email.com',
    'auth.login.password': 'Password',
    'auth.login.passwordPlaceholder': 'Enter your password',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.loginButton': 'Sign In',
    'auth.login.noAccount': 'Don\'t have an account?',
    'auth.login.register': 'Sign up',
    'auth.login.orContinueWith': 'or continue with',
    'auth.login.google': 'Continue with Google',
    'auth.login.apple': 'Continue with Apple',
    
    'auth.register.title': 'Create Account',
    'auth.register.subtitle': 'Start your personalized fat loss journey',
    'auth.register.email': 'Email',
    'auth.register.emailPlaceholder': 'your@email.com',
    'auth.register.password': 'Password',
    'auth.register.passwordPlaceholder': 'Create a password',
    'auth.register.confirmPassword': 'Confirm Password',
    'auth.register.confirmPasswordPlaceholder': 'Re-enter your password',
    'auth.register.registerButton': 'Create Account',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.register.login': 'Sign in',
    'auth.register.terms': 'By creating an account, you agree to our',
    'auth.register.termsLink': 'Terms of Service',
    'auth.register.and': 'and',
    'auth.register.privacyLink': 'Privacy Policy',
    
    'auth.error.invalidEmail': 'Please enter a valid email address',
    'auth.error.weakPassword': 'Password must be at least 6 characters',
    'auth.error.passwordMismatch': 'Passwords do not match',
    'auth.error.emailInUse': 'This email is already registered',
    'auth.error.invalidCredentials': 'Invalid email or password',
    'auth.error.networkError': 'Network error. Please check your connection',
    'auth.error.generic': 'Something went wrong. Please try again',
  },
  zh: {
    // Welcome Screen
    'welcome.title': 'BodyMind AI',
    'welcome.subtitle': '智能减脂，科学为本。',
    'welcome.description': 'AI赋能，专属你的健康方案。',
    'welcome.getStarted': '开始使用',
    'welcome.features.science': '科学依据',
    'welcome.features.scienceDesc': '基于证据的建议',
    'welcome.features.personalized': '个性化',
    'welcome.features.personalizedDesc': '量身定制您的独特需求',
    'welcome.features.ai': 'AI驱动',
    'welcome.features.aiDesc': '先进的机器学习',

    // Profile Setup Screen
    'profile.title': '个人资料设置',
    'profile.step': '第{{current}}步，共{{total}}步',
    'profile.next': '下一步',
    'profile.complete': '完成设置',
    'profile.back': '返回',

    // Step 1: Basic Info
    'profile.step1.title': '基本信息',
    'profile.step1.subtitle': '帮助我们了解您的当前情况',
    'profile.unitSystem': '单位制',
    'profile.metric': '公制 (厘米/公斤)',
    'profile.imperial': '英制 (英寸/磅)',
    'profile.age': '年龄',
    'profile.agePlaceholder': '请输入您的年龄',
    'profile.gender': '性别',
    'profile.male': '男性',
    'profile.female': '女性',
    'profile.other': '其他',
    'profile.height': '身高',
    'profile.heightPlaceholderMetric': '例如：170',
    'profile.heightPlaceholderImperial': '例如：67',
    'profile.currentWeight': '当前体重',
    'profile.weightPlaceholderMetric': '例如：70',
    'profile.weightPlaceholderImperial': '例如：154',
    'profile.targetWeight': '目标体重',
    'profile.targetWeightPlaceholderMetric': '例如：65',
    'profile.targetWeightPlaceholderImperial': '例如：143',
    'profile.activityLevel': '活动水平',
    'profile.sedentary': '久坐不动',
    'profile.sedentaryDesc': '很少或不运动',
    'profile.light': '轻度活动',
    'profile.lightDesc': '每周轻度运动1-3天',
    'profile.moderate': '中度活动',
    'profile.moderateDesc': '每周中度运动3-5天',
    'profile.veryActive': '高度活跃',
    'profile.veryActiveDesc': '每周剧烈运动6-7天',

    // Step 2: Goals & Exercise
    'profile.step2.title': '目标与运动',
    'profile.step2.subtitle': '告诉我们您的健身目标和偏好',
    'profile.weightLossGoal': '减重目标',
    'profile.slow': '缓慢稳定',
    'profile.slowDesc': '每周0.25-0.5公斤',
    'profile.moderateGoal': '中等速度',
    'profile.moderateGoalDesc': '每周0.5-1公斤',
    'profile.fast': '较快',
    'profile.fastDesc': '每周1-1.5公斤',
    'profile.exerciseExperience': '运动经验',
    'profile.beginner': '初学者',
    'profile.beginnerDesc': '运动新手',
    'profile.intermediate': '中级',
    'profile.intermediateDesc': '有一些经验',
    'profile.advanced': '高级',
    'profile.advancedDesc': '经常运动',
    'profile.expert': '专家',
    'profile.expertDesc': '非常有经验',
    'profile.exerciseFrequency': '每周运动频率',
    'profile.never': '从不',
    'profile.neverDesc': '不运动',
    'profile.occasionally': '偶尔',
    'profile.occasionallyDesc': '每周1-2次',
    'profile.regular': '经常',
    'profile.regularDesc': '每周3-4次',
    'profile.frequent': '频繁',
    'profile.frequentDesc': '每周5-6次',
    'profile.daily': '每天',
    'profile.dailyDesc': '每天都运动',
    'profile.exerciseDuration': '运动时长',
    'profile.duration15': '15-30分钟',
    'profile.duration30': '30-45分钟',
    'profile.duration45': '45-60分钟',
    'profile.duration60': '60分钟以上',

    // Step 3: Health Info
    'profile.step3.title': '健康信息',
    'profile.step3.subtitle': '可选 - 帮助我们提供更好的建议',
    'profile.healthConditions': '健康状况（可选）',
    'profile.healthConditionsPlaceholder': '有什么健康状况需要我们了解的吗？',
    'profile.allergies': '食物过敏（可选）',
    'profile.allergiesPlaceholder': '有什么食物过敏或不耐受吗？',
    'profile.medications': '药物（可选）',
    'profile.medicationsPlaceholder': '目前正在服用什么药物吗？',
    'profile.completeTitle': '资料完成！',
    'profile.completeMessage': '正在生成您的个性化计划...',
    'profile.continue': '继续',

    // Chat Screen
    'chat.title': 'AI减脂专家',
    'chat.subtitle': '由LangChain RAG驱动',
    'chat.analyzing': '分析中...',
    'chat.placeholder': '询问饮食、运动或减脂相关问题...',
    'chat.voiceInput': '语音输入',
    'chat.voiceInputSoon': '语音输入即将推出！',
    'chat.typingIndicator': 'AI正在分析科学研究...',
    'chat.connectionError': '连接错误',
    'chat.connectionErrorMessage': '无法发送消息。请检查您的网络连接并重试。',
    'chat.retry': '重试',
    'chat.ok': '确定',
    'chat.sources': '来源：',
    'chat.quickActions.protein': '我应该吃多少蛋白质？',
    'chat.quickActions.exercise': '减脂最佳运动',
    'chat.quickActions.plateau': '为什么我不减重了？',
    'chat.quickActions.hiit': 'HIIT与有氧运动',
    'chat.welcome': '欢迎使用BodyMind AI！我是您的科学减脂专家。今天我能为您做些什么？',
    'chat.serviceOffline': 'AI服务当前离线。请稍后再试。',
    'chat.errorSending': '发送消息失败。请重试。',

    // Meal Plan Screen
    'mealPlan.title': '个人计划',
    'mealPlan.subtitle': '科学定制，持续进步',
    'mealPlan.goalProgress': '目标进度',
    'mealPlan.week': '第{{current}}周，共{{total}}周',
    'mealPlan.current': '当前：{{weight}}公斤',
    'mealPlan.target': '目标：{{weight}}公斤',
    'mealPlan.kgLost': '公斤已减',
    'mealPlan.aiLogging': 'AI智能记录',
    'mealPlan.aiPowered': 'AI驱动',
    'mealPlan.recentEntries': '最近记录：',
    'mealPlan.aiPlaceholder': '告诉AI你今天吃了什么或做了什么运动...',
    'mealPlan.aiTipsTitle': '💡 AI记录小贴士',
    'mealPlan.aiTip1': '• "早餐吃了燕麦"',
    'mealPlan.aiTip2': '• "跑步30分钟"',
    'mealPlan.aiTip3': '• "吃了鸡肉沙拉，去健身房"',
    'mealPlan.nutrition': '营养进度',
    'mealPlan.calories': '卡路里',
    'mealPlan.caloriesFormat': '{{current}} / {{target}} 千卡',
    'mealPlan.protein': '蛋白质',
    'mealPlan.carbs': '碳水',
    'mealPlan.fats': '脂肪',
    'mealPlan.workout': '今日锻炼',
    'mealPlan.aiSuggestion': '建议：今天完成平板支撑，均衡锻炼！',
    'mealPlan.latestResearch': '最新科学研究',
    'mealPlan.researchText': '力量+有氧训练比单独有氧多减脂28%',
    'mealPlan.foodLoggedSuccess': '食物记录成功！',
    'mealPlan.foodLoggedMessage': '已添加{{calories}}卡路里：{{description}}',
    'mealPlan.exerciseLoggedSuccess': '运动记录成功！',
    'mealPlan.exerciseLoggedMessage': '{{duration}}分钟运动消耗了{{calories}}卡路里',
    'mealPlan.processingError': '处理错误',
    'mealPlan.processingErrorMessage': '无法处理您的输入。请重试或提供更具体的信息。',

    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.settings': '设置',
    'settings.title': '设置',
    'settings.language.title': '语言',
    'settings.language.english': '英文',
    'settings.language.chinese': '中文',
    'settings.theme.title': '主题',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.auto': '自动',
    'settings.appearance.title': '外观',
    'settings.account': '账号',
    'settings.account.guest': '游客',
    'settings.about': '关于',
    'settings.privacy': '隐私政策',
    'settings.version': '版本',
    'settings.logout': '退出登录',
    'settings.login': '登录',
    'settings.profile.name': '秦',
    'settings.profile.email': 'qinw.official@gmail.com',
    'settings.profile.activePlan': '活跃计划',
    'settings.profile.edit': '编辑',
    'settings.healthGoals.title': '健康与目标',
    'settings.healthGoals.personalInfo': '个人信息',
    'settings.healthGoals.goalsTargets': '目标与指标',
    'settings.healthGoals.healthMetrics': '健康指标',
    'settings.notifications.title': '通知',
    'settings.notifications.dailyReminders': '每日提醒',
    'settings.notifications.workoutReminders': '运动提醒',
    'settings.notifications.scienceTips': '科学提示',
    'settings.appInfo.title': '应用信息',
    'settings.appInfo.scientificSources': '科学来源',
    'settings.appInfo.privacyPolicy': '隐私政策',
    'settings.appInfo.helpSupport': '帮助与支持',
    'settings.appInfo.version': '版本',
    'settings.appInfo.versionNumber': 'v1.0.0 (测试版)',
    'settings.signOut': '退出登录',
    'settings.language.title': '语言',
    'settings.language.english': '英文',
    'settings.language.chinese': '中文',
    'settings.theme.title': '主题',
    'settings.theme.light': '浅色',
    'settings.theme.dark': '深色',
    'settings.theme.auto': '自动',
    'settings.appearance.title': '外观',
    'settings.signOut.confirm': '确定要退出登录吗？',
    'settings.signOut.cancel': '取消',
    'settings.signOut.confirmButton': '退出登录',
    
    // Progress Screen
    'progress.title': '进度',
    'progress.subtitle': '追踪您的减脂旅程',
    'progress.overall': '整体进度',
    'progress.stats': '已减{{lost}}kg • 当前：{{current}}kg • 目标：{{target}}kg',
    'progress.motivation.justStarted': '🚀 很好的开始！继续加油！',
    'progress.motivation.keepGoing': '💪 你做得很棒！保持下去！',
    'progress.motivation.halfwayThere': '🎯 已经完成一半了！你可以的！',
    'progress.motivation.almostThere': '🔥 就快到了！最后冲刺！',
    'progress.motivation.goalReached': '🎉 目标达成！是时候庆祝了！',
    'progress.weightTrend': '体重趋势',
    'progress.todayNutrition': '今日营养',
    'progress.nutrition.calories': '卡路里',
    'progress.nutrition.protein': '蛋白质',
    'progress.nutrition.carbs': '碳水',
    'progress.nutrition.fat': '脂肪',
    'progress.nutrition.targetValue': '目标：{{value}}{{unit}}',
    'progress.weeklyExercise': '本周运动',
    'progress.exercise.minutes': '分钟',
    'progress.exercise.calories': '卡路里',
    'progress.exercise.days': '天',
    'progress.exercise.min': '分钟',
    'progress.exercise.cardio': '有氧运动',
    'progress.exercise.strength': '力量训练',
    'progress.exercise.flexibility': '柔韧训练',
    
    // Authentication
    'auth.login.title': '欢迎回来',
    'auth.login.subtitle': '登录以继续您的减脂之旅',
    'auth.login.email': '邮箱',
    'auth.login.emailPlaceholder': 'your@email.com',
    'auth.login.password': '密码',
    'auth.login.passwordPlaceholder': '输入您的密码',
    'auth.login.forgotPassword': '忘记密码？',
    'auth.login.loginButton': '登录',
    'auth.login.noAccount': '还没有账号？',
    'auth.login.register': '注册',
    'auth.login.orContinueWith': '或继续使用',
    'auth.login.google': '使用Google继续',
    'auth.login.apple': '使用Apple继续',
    
    'auth.register.title': '创建账号',
    'auth.register.subtitle': '开始您的个性化减脂之旅',
    'auth.register.email': '邮箱',
    'auth.register.emailPlaceholder': 'your@email.com',
    'auth.register.password': '密码',
    'auth.register.passwordPlaceholder': '创建密码',
    'auth.register.confirmPassword': '确认密码',
    'auth.register.confirmPasswordPlaceholder': '再次输入密码',
    'auth.register.registerButton': '创建账号',
    'auth.register.hasAccount': '已有账号？',
    'auth.register.login': '登录',
    'auth.register.terms': '创建账号即表示您同意我们的',
    'auth.register.termsLink': '服务条款',
    'auth.register.and': '和',
    'auth.register.privacyLink': '隐私政策',
    
    'auth.error.invalidEmail': '请输入有效的邮箱地址',
    'auth.error.weakPassword': '密码至少需要6个字符',
    'auth.error.passwordMismatch': '密码不匹配',
    'auth.error.emailInUse': '该邮箱已被注册',
    'auth.error.invalidCredentials': '邮箱或密码无效',
    'auth.error.networkError': '网络错误，请检查您的连接',
    'auth.error.generic': '出现问题，请重试',
  }
};

// Hook for React components
import { useState, useEffect } from 'react';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(i18n.getCurrentLanguage());

  useEffect(() => {
    const unsubscribe = i18n.subscribe(setLanguage);
    return unsubscribe;
  }, []);

  return {
    t: (key: string, params?: Record<string, string | number>) => {
      let text = i18n.t(key);
      if (params) {
        Object.entries(params).forEach(([param, value]) => {
          text = text.replace(new RegExp(`{{${param}}}`, 'g'), String(value));
        });
      }
      return text;
    },
    language,
    setLanguage: i18n.setLanguage.bind(i18n),
    isZh: language === 'zh',
    isEn: language === 'en',
  };
};

export default i18n;