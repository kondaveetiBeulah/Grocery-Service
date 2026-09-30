import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { StatusChip } from '../../components/common/StatusChip';
import { AppButton } from '../../components/common/AppButton';
import { earningsService } from '../../services/earningsService';

interface G21PayoutHistoryScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PayoutHistory'>;
}

export const G21PayoutHistoryScreen: React.FC<G21PayoutHistoryScreenProps> = ({ navigation }) => {
  const payouts = earningsService.getPayouts();

  const handleDownloadStatement = (payoutId: string) => {
    Alert.alert(
      'Statement Downloaded',
      `Tax invoice and settlement voucher for ${payoutId} saved as PDF in Downloads.`
    );
  };

  const handleDownloadAll = () => {
    Alert.alert(
      'Consolidated Monthly Statement',
      'OneBuddy_Monthly_Tax_Settlement_Sep2026.pdf has been generated.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Payout Settlements"
        subtitle="Bank Transfers & UTR References"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handleDownloadAll} style={styles.downloadAllBtn} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={18} color={colors.primary} />
            <Text style={styles.downloadAllText}>Export All</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Settlement Guarantee Card */}
        <View style={styles.infoBanner}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primaryDark} />
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>Automated T+1 Daily NEFT/IMPS</Text>
            <Text style={styles.infoBannerSub}>
              Payouts are transferred directly to your verified HDFC bank account by 08:00 AM every business day.
            </Text>
          </View>
        </View>

        {/* Payouts List */}
        <View style={styles.payoutsList}>
          {payouts.map((item) => (
            <Card key={item.id} style={styles.payoutCard}>
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.payoutAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.payoutPeriod}>{item.periodDescription}</Text>
                </View>
                <StatusChip status={item.status} size="small" />
              </View>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>UTR Reference Number</Text>
                  <Text style={styles.metaValueMono}>{item.utrNumber}</Text>
                </View>

                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Credit Destination</Text>
                  <Text style={styles.metaValue}>{item.bankAccountMasked}</Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <Text style={styles.dateText}>Transferred on {item.date}</Text>
                <TouchableOpacity
                  style={styles.invoiceBtn}
                  onPress={() => handleDownloadStatement(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                  <Text style={styles.invoiceBtnText}>Voucher PDF</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Support Footer */}
        <Card style={styles.supportCard}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
          <View style={styles.supportTextWrap}>
            <Text style={styles.supportTitle}>Discrepancy in Payout?</Text>
            <Text style={styles.supportSub}>
              If a settlement transaction does not reflect in your passbook within 2 hours of UTR generation, raise a priority dispute ticket.
            </Text>
          </View>
          <AppButton
            title="Raise Payout Query"
            onPress={() => Alert.alert('Support Ticket', 'Ticket created. Priority finance desk will contact you.')}
            variant="outline"
            size="small"
          />
        </Card>
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
    paddingBottom: spacing.xxxl,
  },
  downloadAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  downloadAllText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  infoBannerText: {
    flex: 1,
  },
  infoBannerTitle: {
    ...typography.bodySmallBold,
    color: colors.primaryDark,
  },
  infoBannerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  payoutsList: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  payoutCard: {
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  payoutAmount: {
    ...typography.h2,
    color: colors.primaryDark,
  },
  payoutPeriod: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: 2,
  },
  metaValue: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  metaValueMono: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight + '50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  invoiceBtnText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  supportCard: {
    padding: spacing.lg,
    alignItems: 'center',
    textAlign: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xxl,
  },
  supportTextWrap: {
    alignItems: 'center',
  },
  supportTitle: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  supportSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 2,
  },
});
