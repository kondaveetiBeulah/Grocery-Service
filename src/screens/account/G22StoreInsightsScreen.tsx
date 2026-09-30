import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { earningsService } from '../../services/earningsService';

interface G22StoreInsightsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoreInsights'>;
}

export const G22StoreInsightsScreen: React.FC<G22StoreInsightsScreenProps> = ({ navigation }) => {
  const insights = earningsService.getInsights();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Store Insights & Analytics"
        subtitle="Performance & Demand Metrics"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TOP KPIs GRID */}
        <View style={styles.grid}>
          <StatCard
            title="Order Acceptance Rate"
            value={`${insights.acceptanceRate}%`}
            trend={{ value: '+1.4% vs last week', isPositive: true }}
            icon={<Ionicons name="checkmark-done" size={18} color={colors.success} />}
            style={styles.gridFlex}
          />
          <StatCard
            title="Catalog Fill Rate"
            value={`${insights.fillRatePercentage}%`}
            subtitle="0.9% substitution rate"
            icon={<Ionicons name="cube-outline" size={18} color={colors.primary} />}
            style={styles.gridFlex}
          />
        </View>

        <View style={styles.grid}>
          <StatCard
            title="Avg Store Packing Time"
            value={`${insights.avgPackingTimeMinutes}m`}
            trend={{ value: 'Target: < 7.0m', isPositive: true }}
            icon={<Ionicons name="timer-outline" size={18} color="#B45309" />}
            style={styles.gridFlex}
          />
          <StatCard
            title="Total Fulfilled Orders"
            value={insights.totalOrdersCompleted}
            subtitle="Zero non-delivery rate"
            icon={<Ionicons name="ribbon-outline" size={18} color={colors.info} />}
            style={styles.gridFlex}
          />
        </View>

        {/* TOP-SELLING PRODUCTS */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy" size={20} color={colors.secondary} />
            <Text style={styles.cardTitle}>Top Selling Products (Last 30 Days)</Text>
          </View>

          <View style={styles.tableList}>
            {insights.topSellingProducts.map((prod, idx) => (
              <View key={idx} style={styles.rankRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNum}>#{idx + 1}</Text>
                </View>
                <View style={styles.rankInfo}>
                  <Text style={styles.rankProdName}>{prod.productName}</Text>
                  <Text style={styles.rankCategory}>{prod.category}</Text>
                </View>
                <View style={styles.rankStats}>
                  <Text style={styles.rankUnits}>{prod.unitsSold} units</Text>
                  <Text style={styles.rankRevenue}>₹{prod.revenue.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* CATEGORY SALES DISTRIBUTION */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="pie-chart" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Category Sales Breakdown</Text>
          </View>

          <View style={styles.categoryDistList}>
            {insights.categoryDistribution.map((cat, idx) => (
              <View key={idx} style={styles.catDistItem}>
                <View style={styles.catDistTop}>
                  <Text style={styles.catDistName}>{cat.category}</Text>
                  <Text style={styles.catDistRevenue}>₹{cat.revenue.toLocaleString('en-IN')} ({cat.percentage}%)</Text>
                </View>
                <ProgressBar
                  current={cat.percentage}
                  total={100}
                  color={idx === 0 ? colors.primary : idx === 1 ? colors.secondary : idx === 2 ? colors.info : '#8B5CF6'}
                  height={6}
                />
              </View>
            ))}
          </View>
        </Card>

        {/* PEAK ORDER HOURS HEATMAP / BAR LIST */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flame" size={20} color={colors.error} />
            <Text style={styles.cardTitle}>Peak Order Rush Hours</Text>
          </View>
          <Text style={styles.cardSubtitle}>Ensure maximum packing staff during high volume windows:</Text>

          <View style={styles.hoursList}>
            {insights.peakHours.map((h, i) => (
              <View key={i} style={styles.hourItem}>
                <Text style={styles.hourLabel}>{h.hour}</Text>
                <View style={styles.hourBarTrack}>
                  <View
                    style={[
                      styles.hourBarFill,
                      { width: `${(h.orderCount / 70) * 100}%` },
                      h.orderCount > 50 && styles.hourBarRush,
                    ]}
                  />
                </View>
                <Text style={styles.hourCount}>{h.orderCount} orders</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* TOP OUT-OF-STOCK LOST DEMAND ITEMS */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle" size={20} color={colors.error} />
            <Text style={styles.cardTitle}>High Demand Unavailable Items</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            Customers searched for these items when they were marked Out of Stock:
          </Text>

          <View style={styles.unavailList}>
            {insights.topUnavailableItems.map((item, idx) => (
              <View key={idx} style={styles.unavailRow}>
                <Ionicons name="close-circle-outline" size={18} color={colors.error} />
                <Text style={styles.unavailName}>{item.productName}</Text>
                <View style={styles.unavailCountPill}>
                  <Text style={styles.unavailCountText}>{item.requestedCount} missed requests</Text>
                </View>
              </View>
            ))}
          </View>
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
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  gridFlex: {
    flex: 1,
    marginBottom: spacing.xs,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  tableList: {
    marginTop: spacing.xs,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankNum: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  rankInfo: {
    flex: 1,
  },
  rankProdName: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  rankCategory: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  rankStats: {
    alignItems: 'flex-end',
  },
  rankUnits: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  rankRevenue: {
    ...typography.bodySmallBold,
    color: colors.primaryDark,
  },
  categoryDistList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  catDistItem: {
    gap: 4,
  },
  catDistTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  catDistName: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  catDistRevenue: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  hoursList: {
    gap: spacing.sm,
  },
  hourItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hourLabel: {
    ...typography.caption,
    width: 105,
    color: colors.textSecondary,
    fontSize: 11,
  },
  hourBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 5,
    overflow: 'hidden',
  },
  hourBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  hourBarRush: {
    backgroundColor: colors.secondary,
  },
  hourCount: {
    ...typography.caption,
    width: 60,
    textAlign: 'right',
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 10,
  },
  unavailList: {
    gap: spacing.sm,
  },
  unavailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  unavailName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  unavailCountPill: {
    backgroundColor: colors.errorLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  unavailCountText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    fontSize: 10,
  },
});
