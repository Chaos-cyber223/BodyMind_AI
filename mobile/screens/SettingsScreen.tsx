import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../localization/i18n';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useTranslation();
  const { signOut, user } = useAuth();
  const { theme, setTheme, toggleTheme } = useTheme();
  
  // Notification states
  const [dailyReminders, setDailyReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [scienceTips, setScienceTips] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOut.confirm'),
      [
        { text: t('settings.signOut.cancel'), style: 'cancel' },
        { text: t('settings.signOut.confirmButton'), style: 'destructive', onPress: async () => {
          await signOut();
        }}
      ]
    );
  };

  const renderProfileSection = () => {
    const userEmail = user?.email || 'guest@bodymind.ai';
    const userName = userEmail.split('@')[0];
    const firstLetter = userName[0].toUpperCase();
    
    return (
      <View style={styles.profileSection}>
        <View style={styles.profileContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstLetter}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            <View style={styles.activePlanRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activePlanText}>{t('settings.profile.activePlan')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLanguageSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{language === 'zh' ? '语言' : 'Language'}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => setLanguage('en')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#e3f2fd' }]}>
            <Text style={[styles.menuIconText, { color: '#1976d2' }]}>🇺🇸</Text>
          </View>
          <Text style={styles.menuItemText}>English</Text>
        </View>
        {language === 'en' && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.menuItem, styles.menuItemBorder]}
        onPress={() => setLanguage('zh')}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#e8f5e8' }]}>
            <Text style={[styles.menuIconText, { color: '#2e7d32' }]}>🇨🇳</Text>
          </View>
          <Text style={styles.menuItemText}>中文</Text>
        </View>
        {language === 'zh' && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderThemeSection = () => {
    const isDark = theme.type === 'dark';
    const themeText = language === 'zh' 
      ? (isDark ? '深色' : '浅色')
      : (isDark ? 'Dark' : 'Light');
    const themeIcon = isDark ? '🌙' : '☀️';
    const iconBackgroundColor = isDark ? '#1a1a2e' : '#fff3e0';
    const iconColor = isDark ? '#bb86fc' : '#f57c00';
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{language === 'zh' ? '主题' : 'Theme'}</Text>
        </View>
        
        <View style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={[styles.menuIcon, { backgroundColor: iconBackgroundColor }]}>
              <Text style={[styles.menuIconText, { color: iconColor }]}>{themeIcon}</Text>
            </View>
            <Text style={styles.menuItemText}>{themeText}</Text>
          </View>
          <Switch
            value={theme.type === 'dark'}
            onValueChange={(value) => setTheme(value ? 'dark' : 'light')}
            trackColor={{ false: theme.colors.switchTrackColor, true: theme.colors.primary }}
            thumbColor={theme.type === 'dark' ? theme.colors.switchThumbColor : '#f4f3f4'}
          />
        </View>
      </View>
    );
  };

  const renderHealthGoals = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('settings.healthGoals.title')}</Text>
      </View>
      
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#e3f2fd' }]}>
            <Text style={[styles.menuIconText, { color: '#1976d2' }]}>👤</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.healthGoals.personalInfo')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#e8f5e8' }]}>
            <Text style={[styles.menuIconText, { color: '#2e7d32' }]}>🎯</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.healthGoals.goalsTargets')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#fff3e0' }]}>
            <Text style={[styles.menuIconText, { color: '#f57c00' }]}>❤️</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.healthGoals.healthMetrics')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNotifications = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('settings.notifications.title')}</Text>
      </View>
      
      <View style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#fff3e0' }]}>
            <Text style={[styles.menuIconText, { color: '#f57c00' }]}>🔔</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.notifications.dailyReminders')}</Text>
        </View>
        <Switch
          value={dailyReminders}
          onValueChange={setDailyReminders}
          trackColor={{ false: '#e0e0e0', true: '#1976d2' }}
          thumbColor={dailyReminders ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <View style={[styles.menuItem, styles.menuItemBorder]}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#ffebee' }]}>
            <Text style={[styles.menuIconText, { color: '#d32f2f' }]}>💪</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.notifications.workoutReminders')}</Text>
        </View>
        <Switch
          value={workoutReminders}
          onValueChange={setWorkoutReminders}
          trackColor={{ false: '#e0e0e0', true: '#1976d2' }}
          thumbColor={workoutReminders ? '#ffffff' : '#f4f3f4'}
        />
      </View>

      <View style={[styles.menuItem, styles.menuItemBorder]}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#fff8e1' }]}>
            <Text style={[styles.menuIconText, { color: '#f57c00' }]}>💡</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.notifications.scienceTips')}</Text>
        </View>
        <Switch
          value={scienceTips}
          onValueChange={setScienceTips}
          trackColor={{ false: '#e0e0e0', true: '#1976d2' }}
          thumbColor={scienceTips ? '#ffffff' : '#f4f3f4'}
        />
      </View>
    </View>
  );

  const renderAppInfo = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('settings.appInfo.title')}</Text>
      </View>
      
      <TouchableOpacity style={styles.menuItem}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#e3f2fd' }]}>
            <Text style={[styles.menuIconText, { color: '#1976d2' }]}>🔬</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.appInfo.scientificSources')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#f5f5f5' }]}>
            <Text style={[styles.menuIconText, { color: '#616161' }]}>🛡️</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.appInfo.privacyPolicy')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#f5f5f5' }]}>
            <Text style={[styles.menuIconText, { color: '#616161' }]}>❓</Text>
          </View>
          <Text style={styles.menuItemText}>{t('settings.appInfo.helpSupport')}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <View style={[styles.menuItem, styles.menuItemBorder]}>
        <View style={styles.menuItemContent}>
          <View style={[styles.menuIcon, { backgroundColor: '#f5f5f5' }]}>
            <Text style={[styles.menuIconText, { color: '#616161' }]}>ℹ️</Text>
          </View>
          <View>
            <Text style={styles.menuItemText}>{t('settings.appInfo.version')}</Text>
            <Text style={styles.versionText}>{t('settings.appInfo.versionNumber')}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const styles = createStyles(theme);
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderProfileSection()}
        {renderLanguageSection()}
        {renderThemeSection()}
        {renderHealthGoals()}
        {renderNotifications()}
        {renderAppInfo()}
        
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>{t('settings.signOut')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: theme.colors.profileBackground,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.avatarBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.avatarText,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  activePlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 8,
  },
  activePlanText: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  editIcon: {
    fontSize: 18,
    color: theme.colors.primary,
  },
  section: {
    backgroundColor: theme.colors.sectionBackground,
    marginTop: 24,
    marginHorizontal: 24,
    borderRadius: 16,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconText: {
    fontSize: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  chevron: {
    fontSize: 18,
    color: theme.colors.textTertiary,
    fontWeight: '300',
  },
  checkmark: {
    fontSize: 18,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    backgroundColor: theme.colors.buttonBackground,
    marginTop: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.buttonText,
  },
});