import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header区域 */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🧠</Text>
            </View>
            <Text style={styles.appName}>BodyMind AI</Text>
            <Text style={styles.tagline}>Science-based fat loss, personalized for you</Text>
          </View>
        </View>

        {/* 主要卡片区域 */}
        <View style={styles.mainCard}>
          <Text style={styles.heroTitle}>
            Say goodbye to{'\n'}
            <Text style={styles.heroHighlight}>fad diets</Text>
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Get personalized nutrition and fitness plans backed by real scientific research
          </Text>

          {/* 特性展示 */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🔬</Text>
                </View>
                <Text style={styles.featureLabel}>Evidence-based</Text>
                <Text style={styles.featureDesc}>PubMed research</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🎯</Text>
                </View>
                <Text style={styles.featureLabel}>Personalized</Text>
                <Text style={styles.featureDesc}>AI-powered plans</Text>
              </View>
            </View>
            
            <View style={styles.featureRow}>
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>📊</Text>
                </View>
                <Text style={styles.featureLabel}>Data-driven</Text>
                <Text style={styles.featureDesc}>Track progress</Text>
              </View>
              
              <View style={styles.featureItem}>
                <View style={styles.featureIconContainer}>
                  <Text style={styles.featureIcon}>🛡️</Text>
                </View>
                <Text style={styles.featureLabel}>Safe & Sustainable</Text>
                <Text style={styles.featureDesc}>No quick fixes</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 行动按钮区域 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ProfileSetup')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Chat')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Try AI Chat</Text>
          </TouchableOpacity>
        </View>

        {/* 底部区域 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Trusted by thousands of users worldwide
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Header区域
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 72,
    height: 72,
    backgroundColor: '#4285f4',
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4285f4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoIcon: {
    fontSize: 36,
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#202124',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: '#5f6368',
    textAlign: 'center',
    fontWeight: '400',
  },
  
  // 主要卡片
  mainCard: {
    marginHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f3f4',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroHighlight: {
    color: '#4285f4',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#5f6368',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontWeight: '400',
  },
  
  // 特性展示
  featuresContainer: {
    gap: 24,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#202124',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#5f6368',
    textAlign: 'center',
    fontWeight: '400',
  },
  
  // 按钮区域
  actionsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4285f4',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
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
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4285f4',
    letterSpacing: 0.3,
  },
  
  // 底部
  footer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9aa0a6',
    textAlign: 'center',
    fontWeight: '400',
  },
}); 