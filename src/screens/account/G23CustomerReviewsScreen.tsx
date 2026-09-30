import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CustomerReview } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { earningsService } from '../../services/earningsService';

interface G23CustomerReviewsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerReviews'>;
}

export const G23CustomerReviewsScreen: React.FC<G23CustomerReviewsScreenProps> = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState<number | undefined>(undefined);
  const [reviews, setReviews] = useState<CustomerReview[]>(earningsService.getReviews());

  useEffect(() => {
    const unsub = earningsService.subscribe(() => {
      setReviews(earningsService.getReviews(selectedFilter));
    });
    return unsub;
  }, [selectedFilter]);

  const handleFilterChange = (stars?: number) => {
    setSelectedFilter(stars);
    setReviews(earningsService.getReviews(stars));
  };

  const handleReportReview = (reviewId: string) => {
    Alert.alert(
      'Report Review for Moderation',
      'Are you sure you want to flag this customer review for OneBuddy merchant support review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report Review',
          style: 'destructive',
          onPress: () => {
            earningsService.reportReview(reviewId);
            Alert.alert('Report Submitted', 'Our merchant quality team will evaluate the dispute.');
          },
        },
      ]
    );
  };

  const starBreakdowns = [
    { stars: 5, count: 742, percent: 88 },
    { stars: 4, count: 78, percent: 9 },
    { stars: 3, count: 14, percent: 2 },
    { stars: 2, count: 5, percent: 0.6 },
    { stars: 1, count: 3, percent: 0.4 },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Ratings & Reviews"
        subtitle="Customer Quality Feedback"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* RATING HERO SCORECARD */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreRow}>
            <View style={styles.scoreMain}>
              <Text style={styles.scoreNumber}>4.9</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Ionicons key={s} name="star" size={18} color="#F59E0B" />
                ))}
              </View>
              <Text style={styles.totalReviewsText}>842 verified ratings</Text>
            </View>

            <View style={styles.breakdownCol}>
              {starBreakdowns.map((b) => (
                <View key={b.stars} style={styles.starLine}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Text style={styles.starLineNum}>{b.stars}</Text>
                    <Ionicons name="star" size={11} color="#F59E0B" />
                  </View>
                  <ProgressBar
                    current={b.percent}
                    total={100}
                    color="#F59E0B"
                    height={6}
                    style={styles.starProgressBar}
                  />
                  <Text style={styles.starLineCount}>{b.percent}%</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* STAR FILTER PILLS */}
        <View style={styles.filterPillsRow}>
          <TouchableOpacity
            style={[styles.filterPill, selectedFilter === undefined && styles.filterPillActive]}
            onPress={() => handleFilterChange(undefined)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterPillText, selectedFilter === undefined && styles.filterPillTextActive]}>
              All (842)
            </Text>
          </TouchableOpacity>

          {[5, 4, 3, 2, 1].map((s) => {
            const isSelected = selectedFilter === s;
            return (
              <TouchableOpacity
                key={s}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => handleFilterChange(s)}
                activeOpacity={0.7}
              >
                <Ionicons name="star" size={12} color={isSelected ? colors.textInverse : '#F59E0B'} />
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                  {s} Star
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* REVIEWS LIST */}
        <View style={styles.reviewsList}>
          {reviews.map((rev) => (
            <Card key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.avatarInitial}>{rev.customerName[0]}</Text>
                </View>
                <View style={styles.customerInfo}>
                  <Text style={styles.customerName}>{rev.customerName}</Text>
                  <Text style={styles.orderRef}>
                    Order {rev.shortId} ({rev.orderId}) • {rev.date}
                  </Text>
                </View>

                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={12} color={colors.textInverse} />
                  <Text style={styles.ratingScore}>{rev.rating}</Text>
                </View>
              </View>

              {/* Tags */}
              <View style={styles.tagsRow}>
                {rev.tags.map((tag, i) => (
                  <View key={i} style={styles.tagPill}>
                    <Ionicons name="checkmark-circle" size={12} color={colors.primary} />
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Comment text */}
              <Text style={styles.commentText}>"{rev.comment}"</Text>

              {/* Report button */}
              <View style={styles.reviewFooter}>
                <TouchableOpacity
                  style={styles.reportBtn}
                  onPress={() => handleReportReview(rev.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={rev.isReported ? 'flag' : 'flag-outline'}
                    size={14}
                    color={rev.isReported ? colors.error : colors.textMuted}
                  />
                  <Text style={[styles.reportText, rev.isReported && styles.reportedActiveText]}>
                    {rev.isReported ? 'Reported for Review' : 'Report Review'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
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
    paddingBottom: spacing.xxxl,
  },
  scoreCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreMain: {
    alignItems: 'center',
    paddingRight: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minWidth: 120,
  },
  scoreNumber: {
    ...typography.h1,
    fontSize: 44,
    color: colors.textPrimary,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  totalReviewsText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  breakdownCol: {
    flex: 1,
    paddingLeft: spacing.lg,
    gap: 4,
  },
  starLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  starLineNum: {
    ...typography.caption,
    width: 22,
    fontWeight: '700',
    color: colors.textSecondary,
    fontSize: 10,
  },
  starProgressBar: {
    flex: 1,
    marginVertical: 0,
  },
  starLineCount: {
    ...typography.caption,
    width: 28,
    textAlign: 'right',
    fontSize: 10,
    color: colors.textMuted,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterPillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.textInverse,
  },
  reviewsList: {
    gap: spacing.xs,
  },
  reviewCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarInitial: {
    ...typography.bodyMediumBold,
    color: colors.primaryDark,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  orderRef: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  ratingScore: {
    ...typography.caption,
    color: '#B45309',
    fontWeight: '800',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight + '50',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '700',
  },
  commentText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 18,
    fontStyle: 'italic',
    marginVertical: spacing.xs,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  reportedActiveText: {
    color: colors.error,
    fontWeight: '700',
  },
});
