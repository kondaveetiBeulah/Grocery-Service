import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OnboardingStepHeader } from '../../components/common/OnboardingStepHeader';
import { AppButton } from '../../components/common/AppButton';
import { Card } from '../../components/common/Card';

interface G4DocumentReviewScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G4DocumentReview'>;
}

export const G4DocumentReviewScreen: React.FC<G4DocumentReviewScreenProps> = ({ navigation }) => {
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const documentSummaries = [
    {
      type: 'FSSAI License',
      maskedNumber: '•••• •••• 6677',
      expiry: 'Valid until 31 Dec 2028',
      status: 'Valid',
      isWarning: false,
    },
    {
      type: 'GSTIN (Form REG-06)',
      maskedNumber: '29•••••••••1Z5',
      expiry: 'Active Regular Taxpayer',
      status: 'Valid',
      isWarning: false,
    },
    {
      type: 'Trade / Shop License',
      maskedNumber: 'BBMP/TR/••••/9981',
      expiry: 'Expires in 6 months (31 Mar 2027)',
      status: 'Renewal Upcoming',
      isWarning: true,
    },
    {
      type: 'Proprietor PAN Card',
      maskedNumber: '••••••1234F',
      expiry: 'Verified with ITD Database',
      status: 'Valid',
      isWarning: false,
    },
    {
      type: 'Storefront & Shelf Photos',
      maskedNumber: '3 Photos Attached',
      expiry: 'High Quality Verified',
      status: 'Valid',
      isWarning: false,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingStepHeader
        currentStep={2}
        title="Document Review"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verification Protection Notice */}
        <View style={styles.banner}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <View style={styles.bannerTextWrap}>
            <Text style={styles.bannerTitle}>All Document Proofs Received</Text>
            <Text style={styles.bannerSubtitle}>
              Please review masked registration details and expiry dates below before submission.
            </Text>
          </View>
        </View>

        {/* Warning Banner for Upcoming Expiry */}
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={20} color="#B45309" />
          <View style={styles.warningTextWrap}>
            <Text style={styles.warningTitle}>Trade License Renewal Notice</Text>
            <Text style={styles.warningSubtitle}>
              Your BBMP Trade License expires in 2027. You can proceed now and update the renewed certificate later in Document Center.
            </Text>
          </View>
        </View>

        {/* Document Cards List */}
        <View style={styles.docsList}>
          {documentSummaries.map((doc, idx) => (
            <Card key={idx} style={styles.docCard}>
              <View style={styles.cardHeader}>
                <View style={styles.docTitleGroup}>
                  <Text style={styles.docType}>{doc.type}</Text>
                  <Text style={styles.maskedNumber}>{doc.maskedNumber}</Text>
                </View>

                <TouchableOpacity
                  style={styles.editShortcut}
                  onPress={() => navigation.navigate('G3DocumentsUpload')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editText}>Edit</Text>
                  <Ionicons name="pencil" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.expiryRow}>
                  <Ionicons
                    name={doc.isWarning ? 'time-outline' : 'checkmark-circle-outline'}
                    size={14}
                    color={doc.isWarning ? '#B45309' : colors.success}
                  />
                  <Text style={[styles.expiryText, doc.isWarning && styles.warningExpiryText]}>
                    {doc.expiry}
                  </Text>
                </View>

                <View style={[styles.statusBadge, doc.isWarning ? styles.statusWarning : styles.statusSuccess]}>
                  <Text style={[styles.statusText, doc.isWarning ? styles.statusWarningText : styles.statusSuccessText]}>
                    {doc.status}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Declarations Checkbox */}
        <TouchableOpacity
          style={styles.declarationRow}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
          </View>
          <Text style={styles.declarationText}>
            I confirm that all uploaded licenses, GSTIN, and business information are genuine, valid, and belong to the registered retail establishment.
          </Text>
        </TouchableOpacity>

        {/* CTA */}
        <View style={styles.footer}>
          <AppButton
            title="Confirm & Proceed to Location"
            onPress={() => navigation.navigate('G5LocationDelivery')}
            disabled={!agreedToTerms}
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
    padding: spacing.lg,
  },
  banner: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  bannerTextWrap: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.bodyMediumBold,
    color: colors.primaryDark,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: colors.warningLight + '40',
    borderWidth: 1,
    borderColor: colors.warning + '50',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningTextWrap: {
    flex: 1,
  },
  warningTitle: {
    ...typography.bodySmallBold,
    color: '#92400E',
  },
  warningSubtitle: {
    ...typography.caption,
    color: '#92400E',
    marginTop: 2,
    lineHeight: 16,
  },
  docsList: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  docCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  docTitleGroup: {
    flex: 1,
  },
  docType: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  maskedNumber: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
  },
  editShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.primaryLight,
  },
  editText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expiryText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  warningExpiryText: {
    color: '#B45309',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  statusSuccess: {
    backgroundColor: colors.successLight,
  },
  statusWarning: {
    backgroundColor: colors.warningLight,
  },
  statusText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  statusSuccessText: {
    color: '#047857',
  },
  statusWarningText: {
    color: '#B45309',
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  declarationText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    marginBottom: spacing.xxl,
  },
});
