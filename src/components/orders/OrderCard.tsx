import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { Card } from '../common/Card';
import { StatusChip } from '../common/StatusChip';
import { CountdownTimer } from '../common/CountdownTimer';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onQuickAction?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onQuickAction,
}) => {
  const isPicking = order.status === 'PICKING';
  const isNew = order.status === 'NEW';
  const isReady = order.status === 'READY_FOR_PICKUP';

  const pickedCount = order.items.filter(i => i.isPicked).length;
  const totalItems = order.items.length;

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Header Row: Short ID & Status & Mode */}
      <View style={styles.headerRow}>
        <View style={styles.idGroup}>
          <Text style={styles.shortId}>{order.shortId}</Text>
          <Text style={styles.fullId}>{order.id}</Text>
        </View>
        <View style={styles.badgeGroup}>
          <StatusChip status={order.deliveryMode} size="small" style={styles.modeChip} />
          <StatusChip status={order.status} size="small" />
        </View>
      </View>

      {/* Customer & Time Info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{order.customerName}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>{order.createdAt}</Text>
        </View>
      </View>

      {/* Items preview snippet */}
      <View style={styles.itemsPreview}>
        <Text style={styles.itemsText} numberOfLines={2}>
          {order.items.map(i => `${i.quantity}x ${i.productName}`).join(' • ')}
        </Text>
      </View>

      {/* Picking / Packing Status Bar */}
      {isPicking && (
        <View style={styles.progressRow}>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressLabel}>
              Picked <Text style={styles.bold}>{pickedCount}/{totalItems}</Text> items
            </Text>
          </View>
          <CountdownTimer
            initialSeconds={order.packingTimeRemainingSeconds}
            size="small"
            prefix="Pack in:"
          />
        </View>
      )}

      {/* Ready for Pickup Rider Bar */}
      {isReady && order.rider && (
        <View style={styles.riderRow}>
          <View style={styles.riderLeft}>
            <Ionicons name="bicycle" size={18} color={colors.primary} />
            <Text style={styles.riderText}>
              Rider: <Text style={styles.bold}>{order.rider.name}</Text> ({order.rider.vehicleNumber})
            </Text>
          </View>
          {order.rider.isArrived ? (
            <View style={styles.arrivedBadge}>
              <Text style={styles.arrivedText}>ARRIVED</Text>
            </View>
          ) : (
            <Text style={styles.etaText}>ETA: {order.rider.etaMinutes}m</Text>
          )}
        </View>
      )}

      {/* Footer Row: Total Amount & Action CTA */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.totalLabel}>
            {order.items.reduce((sum, i) => sum + i.quantity, 0)} items • {order.paymentMode.includes('Online') ? 'Paid Online' : 'Pay on Delivery'}
          </Text>
          <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            isNew && styles.actionButtonNew,
            isPicking && styles.actionButtonPicking,
            isReady && styles.actionButtonReady,
          ]}
          onPress={onQuickAction || onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            {isNew ? 'Accept Order' : isPicking ? 'Pick & Pack' : isReady ? 'Handover' : 'View Details'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  idGroup: {
    flex: 1,
  },
  shortId: {
    ...typography.h3,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  fullId: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  modeChip: {
    marginRight: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemsPreview: {
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginVertical: spacing.sm,
  },
  itemsText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warningLight + '40',
    padding: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  bold: {
    fontWeight: '700',
  },
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight + '50',
    padding: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  riderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  riderText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  arrivedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  arrivedText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '800',
    fontSize: 10,
  },
  etaText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  totalLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  totalAmount: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  actionButtonNew: {
    backgroundColor: colors.info,
  },
  actionButtonPicking: {
    backgroundColor: colors.warning,
  },
  actionButtonReady: {
    backgroundColor: '#7C3AED',
  },
  actionButtonText: {
    ...typography.bodySmallBold,
    color: colors.textInverse,
  },
});
