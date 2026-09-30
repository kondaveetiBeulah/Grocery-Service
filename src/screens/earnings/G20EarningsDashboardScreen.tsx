import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList, EarningsPeriod } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { AppButton } from '../../components/common/AppButton';
import { earningsService } from '../../services/earningsService';
import { orderService } from '../../services/orderService';

type EarningsNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'EarningsTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface G20EarningsDashboardScreenProps {
  navigation: EarningsNavProp;
}

const PERIODS: EarningsPeriod[] = ['Today', 'This Week', 'This Month', 'Custom Date'];

export const G20EarningsDashboardScreen: React.FC<G20EarningsDashboardScreenProps> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<EarningsPeriod>('Today');
  const summary = earningsService.getEarningsSummary(selectedPeriod);
  const completedOrders = orderService.getOrders('COMPLETED');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Earnings & Settlements"
        subtitle="Daily Payouts & Commission Breakdown"
        rightAction={
          <TouchableOpacity
            style={styles.historyHeaderBtn}
            onPress={() => navigation.navigate('PayoutHistory')}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={styles.historyBtnText}>History</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TIME PERIOD FILTER PILLS */}
        <View style={styles.periodPillsWrap}>
          {PERIODS.map((period) => {
            const isSelected = selectedPeriod === period;
            return (
              <TouchableOpacity
                key={period}
                style={[styles.periodPill, isSelected && styles.periodPillActive]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.7}
              >
                <Text style={[styles.periodText, isSelected && styles.periodTextActive]}>
                  {period}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* NET PAYOUT HERO CARD */}
        <Card style={styles.netEarningsCard}>
          <View style={styles.netHeader}>
            <Text style={styles.netLabel}>NET STORE SETTLEMENT ({selectedPeriod.toUpperCase()})</Text>
            <View style={styles.payoutBadge}>
              <Ionicons name="flash" size={12} color={colors.textInverse} />
              <Text style={styles.payoutBadgeText}>T+1 DAILY SETTLED</Text>
            </View>
          </View>

          <Text style={styles.netAmount}>₹{summary.netEarnings.toLocaleString('en-IN')}</Text>
          <Text style={styles.netOrdersCount}>
            Calculated across <Text style={styles.bold}>{summary.orderCount} customer orders</Text>
          </Text>

          <View style={styles.dividerLight} />

          <View style={styles.nextPayoutRow}>
            <View style={styles.nextPayoutLeft}>
              <Ionicons name="wallet-outline" size={18} color={colors.primaryMuted} />
              <View>
                <Text style={styles.nextPayoutDateLabel}>Next Bank Transfer</Text>
                <Text style={styles.nextPayoutDateVal}>{summary.nextPayoutDate}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.historyShortcut}
              onPress={() => navigation.navigate('PayoutHistory')}
              activeOpacity={0.7}
            >
              <Text style={styles.historyShortcutText}>View Statements →</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* METRICS ROW */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Gross Sales"
            value={`₹${summary.grossSales.toLocaleString('en-IN')}`}
            subtitle="Customer Cart Value"
            icon={<Ionicons name="cart-outline" size={18} color={colors.primary} />}
            style={styles.statCardFlex}
          />
          <StatCard
            title="Total Refunds"
            value={`₹${summary.totalRefunds.toLocaleString('en-IN')}`}
            subtitle="Out of Stock Deductions"
            icon={<Ionicons name="arrow-undo-outline" size={18} color={colors.error} />}
            style={styles.statCardFlex}
          />
        </View>

        {/* FINANCIAL RECONCILIATION BREAKDOWN CARD */}
        <Card style={styles.reconCard}>
          <Text style={styles.sectionTitle}>Earnings Reconciliation</Text>
          <Text style={styles.sectionSub}>Transparent audit of platform fees & taxes:</Text>

          <View style={styles.reconRow}>
            <View style={styles.reconLabelRow}>
              <Ionicons name="add-circle" size={16} color={colors.success} />
              <Text style={styles.reconLabel}>Gross Order Item Sales</Text>
            </View>
            <Text style={styles.reconVal}>+₹{summary.grossSales.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.reconRow}>
            <View style={styles.reconLabelRow}>
              <Ionicons name="remove-circle" size={16} color={colors.error} />
              <Text style={styles.reconLabel}>Customer Refunds & Returns</Text>
            </View>
            <Text style={[styles.reconVal, { color: colors.error }]}>
              -₹{summary.totalRefunds.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.reconRow}>
            <View style={styles.reconLabelRow}>
              <Ionicons name="remove-circle" size={16} color={colors.secondaryDark} />
              <Text style={styles.reconLabel}>
                OneBuddy Platform Fee ({summary.commissionPercentage}%)
              </Text>
            </View>
            <Text style={[styles.reconVal, { color: colors.secondaryDark }]}>
              -₹{summary.platformCommission.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.reconRow}>
            <View style={styles.reconLabelRow}>
              <Ionicons name="add-circle" size={16} color={colors.primary} />
              <Text style={styles.reconLabel}>Bagging & Handling Subsidy</Text>
            </View>
            <Text style={styles.reconVal}>+₹{(summary.orderCount * 10).toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.reconTotalRow}>
            <Text style={styles.reconTotalLabel}>Final Net Payout</Text>
            <Text style={styles.reconTotalVal}>₹{summary.netEarnings.toLocaleString('en-IN')}</Text>
          </View>
        </Card>

        {/* ORDER-WISE SETTLEMENT LIST */}
        <View style={styles.orderBreakdownSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Settled Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
              <Text style={styles.viewOrdersLink}>All Orders →</Text>
            </TouchableOpacity>
          </View>

          {completedOrders.map((order) => (
            <Card key={order.id} style={styles.settledOrderCard}>
              <View style={styles.settledTop}>
                <View>
                  <Text style={styles.settledShortId}>{order.shortId}</Text>
                  <Text style={styles.settledFullId}>{order.id}</Text>
                </View>
                <View style={styles.settledAmountWrap}>
                  <Text style={styles.settledEarned}>+₹{Math.round(order.totalAmount * 0.91)}</Text>
                  <Text style={styles.settledGross}>Gross: ₹{order.totalAmount}</Text>
                </View>
              </View>

              <View style={styles.settledFooter}>
                <Text style={styles.settledMeta}>
                  {order.createdAt} • {order.items.length} items • Paid Online (UPI)
                </Text>
                <View style={styles.paidChip}>
                  <Text style={styles.paidChipText}>SETTLED</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* STATEMENT DOWNLOAD CTA */}
        <AppButton
          title="View Bank Payout History & Statements"
          onPress={() => navigation.navigate('PayoutHistory')}
          variant="outline"
          size="large"
          fullWidth
          leftIcon={<Ionicons name="document-text-outline" size={20} color={colors.primary} />}
          style={styles.historyFullBtn}
        />
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
    paddingBottom: spacing.tabBarClearance + 24,
  },
  historyHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
  },
  historyBtnText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  periodPillsWrap: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    padding: 4,
    marginBottom: spacing.md,
  },
  periodPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  periodPillActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  netEarningsCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  netHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  netLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.primaryMuted,
    letterSpacing: 1,
  },
  payoutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  payoutBadgeText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: colors.textInverse,
  },
  netAmount: {
    ...typography.h1,
    fontSize: 36,
    color: colors.textInverse,
    fontWeight: '900',
    marginVertical: 4,
  },
  netOrdersCount: {
    ...typography.caption,
    color: '#D1FAE5',
  },
  bold: {
    fontWeight: '700',
    color: colors.textInverse,
  },
  dividerLight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: spacing.md,
  },
  nextPayoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextPayoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nextPayoutDateLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.primaryMuted,
  },
  nextPayoutDateVal: {
    ...typography.bodySmallBold,
    color: colors.textInverse,
  },
  historyShortcut: {
    paddingVertical: 2,
  },
  historyShortcutText: {
    ...typography.caption,
    color: colors.primaryMuted,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCardFlex: {
    flex: 1,
    marginBottom: 0,
  },
  reconCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  reconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  reconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    flex: 1,
  },
  reconLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  reconVal: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  reconTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reconTotalLabel: {
    ...typography.bodyLargeBold,
    color: colors.textPrimary,
  },
  reconTotalVal: {
    ...typography.h2,
    color: colors.primaryDark,
  },
  orderBreakdownSection: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewOrdersLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  settledOrderCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  settledTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  settledShortId: {
    ...typography.bodyLargeBold,
    color: colors.textPrimary,
  },
  settledFullId: {
    ...typography.caption,
    color: colors.textMuted,
  },
  settledAmountWrap: {
    alignItems: 'flex-end',
  },
  settledEarned: {
    ...typography.bodyLargeBold,
    color: colors.success,
  },
  settledGross: {
    ...typography.caption,
    color: colors.textMuted,
  },
  settledFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settledMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  paidChip: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
  },
  paidChipText: {
    ...typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
  },
  historyFullBtn: {
    marginBottom: spacing.xxl,
  },
});
