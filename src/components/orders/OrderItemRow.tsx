import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface OrderItemRowProps {
  item: OrderItem;
  onTogglePick: () => void;
  onAdjustWeight?: () => void;
  onScanBarcode?: () => void;
  onMarkUnavailable?: () => void;
  showPickControls?: boolean;
}

export const OrderItemRow: React.FC<OrderItemRowProps> = ({
  item,
  onTogglePick,
  onAdjustWeight,
  onScanBarcode,
  onMarkUnavailable,
  showPickControls = true,
}) => {
  const isPicked = item.isPicked;
  const isUnavailable = item.isUnavailable;

  return (
    <View style={[styles.container, isPicked && styles.pickedContainer, isUnavailable && styles.unavailableContainer]}>
      <View style={styles.mainRow}>
        {/* Checkbox (if pick controls enabled) */}
        {showPickControls && !isUnavailable && (
          <TouchableOpacity
            style={[styles.checkbox, isPicked && styles.checkboxChecked]}
            onPress={onTogglePick}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isPicked }}
          >
            {isPicked && <Ionicons name="checkmark" size={16} color={colors.textInverse} />}
          </TouchableOpacity>
        )}

        {/* Product Image */}
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />

        {/* Details Column */}
        <View style={styles.detailsCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.productName, isPicked && styles.pickedText, isUnavailable && styles.unavailableText]} numberOfLines={2}>
              {item.productName}
            </Text>
          </View>

          <Text style={styles.packSizeText}>
            {item.brand} • {item.packSize}
          </Text>

          {item.aisle && (
            <View style={styles.aisleBadge}>
              <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.aisleText}>{item.aisle}</Text>
            </View>
          )}

          {/* Sold by weight details */}
          {item.isSoldByWeight && (
            <View style={styles.weightBadge}>
              <Text style={styles.weightBadgeText}>
                Target: {item.targetWeight || `${item.quantity} kg`}
                {item.actualWeight ? ` • Weighed: ${item.actualWeight} kg` : ''}
              </Text>
            </View>
          )}

          {/* Substitution Status */}
          {item.substitution && (
            <View style={[
              styles.subBadge,
              item.substitution.action === 'refund' ? styles.refundBadge : styles.replaceBadge
            ]}>
              <Ionicons
                name={item.substitution.action === 'refund' ? 'cash-outline' : 'swap-horizontal'}
                size={12}
                color={item.substitution.action === 'refund' ? colors.error : colors.info}
              />
              <Text style={[
                styles.subText,
                { color: item.substitution.action === 'refund' ? colors.error : colors.info }
              ]}>
                {item.substitution.action === 'refund' 
                  ? 'Refunded (-₹' + item.substitution.originalPrice + ')' 
                  : `Replaced with: ${item.substitution.replacementProduct?.name || 'Similar Item'}`}
              </Text>
            </View>
          )}
        </View>

        {/* Quantity and Price */}
        <View style={styles.priceCol}>
          <View style={styles.qtyBadge}>
            <Text style={styles.qtyText}>x{item.quantity}</Text>
          </View>
          <Text style={styles.itemPrice}>₹{item.unitPrice * item.quantity}</Text>
          <Text style={styles.unitPriceText}>₹{item.unitPrice}/unit</Text>
        </View>
      </View>

      {/* Picking Action Buttons (Barcode Scan, Weigh, Unavailable) */}
      {showPickControls && !isPicked && !isUnavailable && (
        <View style={styles.actionButtonsRow}>
          {item.isSoldByWeight && onAdjustWeight && (
            <TouchableOpacity
              style={[styles.smallBtn, styles.weighBtn]}
              onPress={onAdjustWeight}
              activeOpacity={0.7}
            >
              <Ionicons name="scale-outline" size={14} color="#B45309" />
              <Text style={styles.weighBtnText}>Weigh Item</Text>
            </TouchableOpacity>
          )}

          {onScanBarcode && (
            <TouchableOpacity
              style={[styles.smallBtn, styles.scanBtn]}
              onPress={onScanBarcode}
              activeOpacity={0.7}
            >
              <Ionicons name="barcode-outline" size={14} color={colors.primary} />
              <Text style={styles.scanBtnText}>Scan Barcode</Text>
            </TouchableOpacity>
          )}

          {onMarkUnavailable && (
            <TouchableOpacity
              style={[styles.smallBtn, styles.unavailableBtn]}
              onPress={onMarkUnavailable}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle-outline" size={14} color={colors.error} />
              <Text style={styles.unavailableBtnText}>Unavailable</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickedContainer: {
    backgroundColor: '#F0FDF4',
    borderColor: colors.success + '40',
  },
  unavailableContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: colors.error + '40',
    opacity: 0.9,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    marginRight: spacing.md,
  },
  detailsCol: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productName: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  pickedText: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  unavailableText: {
    color: colors.error,
  },
  packSizeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aisleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  aisleText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  weightBadge: {
    backgroundColor: colors.warningLight + '60',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  weightBadgeText: {
    ...typography.caption,
    color: '#B45309',
    fontWeight: '700',
    fontSize: 11,
  },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: 4,
    gap: 4,
  },
  replaceBadge: {
    backgroundColor: colors.infoLight,
  },
  refundBadge: {
    backgroundColor: colors.errorLight,
  },
  subText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  qtyBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginBottom: 4,
  },
  qtyText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  itemPrice: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  unitPriceText: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  weighBtn: {
    backgroundColor: colors.warningLight,
  },
  weighBtnText: {
    ...typography.caption,
    color: '#B45309',
    fontWeight: '700',
  },
  scanBtn: {
    backgroundColor: colors.primaryLight,
  },
  scanBtnText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  unavailableBtn: {
    backgroundColor: colors.errorLight,
    marginLeft: 'auto',
  },
  unavailableBtnText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
  },
});
