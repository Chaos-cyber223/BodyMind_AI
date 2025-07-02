import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../localization/i18n';

const RESEARCH_LIST = [
  {
    icon: '🔬',
    color: '#6366f1',
    title: 'Combined Training Benefits',
    summary: 'Strength + cardio increases fat loss by 28% compared to cardio alone.',
    source: 'Journal of Sports Science, 2023',
    link: 'https://www.example.com/research1',
  },
  {
    icon: '🥚',
    color: '#10b981',
    title: 'Protein Intake & Fat Loss',
    summary: 'Higher protein diets help preserve muscle mass during weight loss.',
    source: 'Nutrition Reviews, 2022',
    link: 'https://www.example.com/research2',
  },
  {
    icon: '💧',
    color: '#0ea5e9',
    title: 'Hydration & Metabolism',
    summary: 'Proper hydration can boost metabolism and support fat loss.',
    source: 'Metabolism Journal, 2021',
    link: 'https://www.example.com/research3',
  },
];

export default function ResearchScreen() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('mealPlan.latestResearch')}</Text>
          <Text style={styles.subtitle}>Science-backed insights for smarter fat loss</Text>
        </View>
        {RESEARCH_LIST.map((item, idx) => (
          <View key={idx} style={[styles.card, { shadowColor: item.color }]}> 
            <View style={styles.cardRow}>
              <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}> 
                <Text style={[styles.icon, { color: item.color }]}>{item.icon}</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSummary}>{item.summary}</Text>
                <View style={styles.sourceRow}>
                  <Text style={styles.sourceLabel}>Source:</Text>
                  <Text style={styles.sourceText} onPress={() => Linking.openURL(item.link)}>{item.source}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#22223b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
  },
  icon: {
    fontSize: 28,
    fontWeight: '700',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#22223b',
    marginBottom: 4,
  },
  cardSummary: {
    fontSize: 14,
    color: '#4a4e69',
    marginBottom: 10,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 4,
  },
  sourceText: {
    fontSize: 12,
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
}); 