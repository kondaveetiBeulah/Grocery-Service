import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { AppButton } from '../../components/common/AppButton';

interface G1RegistrationIntroScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G1RegistrationIntro'>;
}

export const G1RegistrationIntroScreen: React.FC<G1RegistrationIntroScreenProps> = ({ navigation }) => {
  const steps = [
    {
      step: 1,
      title: 'Store Details & Operating Hours',
      desc: 'Store name, grocery categories, daily open/close slots & packing staff.',
      icon: 'storefront-outline' as const,
    },
    {
      step: 2,
      title: 'Business Licenses & Document Upload',
      desc: 'FSSAI License, GSTIN, Trade License, PAN card & storefront photos.',
      icon: 'document-text-outline' as const,
    },
    {
      step: 3,
      title: 'Location & Delivery Configuration',
      desc: 'Pin your physical store location, set delivery radius & order limits.',
      icon: 'location-outline' as const,
    },
    {
      step: 4,
      title: 'Catalog Setup',
      desc: 'Import from 20k+ Master Catalog items or upload custom CSV.',
      icon: 'basket-outline' as const,
    },
    {
      step: 5,
      title: 'Catalog Review & Price Check',
      desc: 'Review selling prices, set availability & bulk percentage adjustments.',
      icon: 'pricetag-outline' as const,
    },
    {
      step: 6,
      title: 'Pricing Plan & Bank Payout Details',
      desc: 'Select commission tier and enter bank details for daily settlements.',
      icon: 'wallet-outline' as const,
    },
  ];

  const requiredDocuments = [
    { name: 'FSSAI Food License (14-Digit Number)', required: true },
    { name: 'GST Registration Certificate (GSTIN)', required: true },
    { name: 'Trade / Shop & Establishment License', required: true },
    { name: 'Business / Proprietor PAN Card', required: true },
    { name: 'Storefront & Interior Photos', required: true },
    { name: 'Bank Account & IFSC Code for Settlements', required: true },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Partner Registration"
        subtitle="Grocery Store Partner Onboarding"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Welcome Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrapper}>
            <Ionicons name="sparkles" size={26} color={colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>Welcome to OneBuddy!</Text>
          <Text style={styles.welcomeSubtitle}>
            Grow your grocery business with fast 15-minute neighborhood deliveries and daily direct bank payouts.
          </Text>

          <View style={styles.highlightsRow}>
            <View style={styles.highlightItem}>
              <Ionicons name="flash-outline" size={16} color={colors.primaryDark} />
              <Text style={styles.highlightText}>Instant Orders</Text>
            </View>
            <View style={styles.highlightDivider} />
            <View style={styles.highlightItem}>
              <Ionicons name="cash-outline" size={16} color={colors.primaryDark} />
              <Text style={styles.highlightText}>Daily Payouts</Text>
            </View>
            <View style={styles.highlightDivider} />
            <View style={styles.highlightItem}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.primaryDark} />
              <Text style={styles.highlightText}>Verified Partner</Text>
            </View>
          </View>
        </View>

        {/* 6 Steps Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>6-Step Registration Process</Text>
            <Text style={styles.sectionSubtitle}>Follow each step to set up your store</Text>
          </View>

          <View style={styles.roadmapList}>
            {steps.map((item) => (
              <View key={item.step} style={styles.stepCard}>
                <View style={styles.stepIconBadge}>
                  <Ionicons name={item.icon} size={20} color={colors.primaryDark} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{item.title}</Text>
                  <Text style={styles.stepDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            ))}
          </View>
        </View>

        {/* Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents to Keep Ready</Text>
          <View style={styles.checklistCard}>
            {requiredDocuments.map((doc, idx) => (
              <View key={idx} style={styles.checklistItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
                <Text style={styles.checklistText}>{doc.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Primary CTA Button */}
        <View style={styles.footer}>
          <AppButton
            title="Proceed to Partner Registration"
            onPress={() => navigation.navigate('G2StoreDetails')}
            variant="primary"
            size="large"
            fullWidth
            rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl + 20,
  },
  heroCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  welcomeTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '800',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  highlightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  highlightDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border,
  },
  highlightText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roadmapList: {
    gap: spacing.xs + 2,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  stepIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
  },
  checklistCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checklistText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontSize: 12,
    flex: 1,
  },
  footer: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
