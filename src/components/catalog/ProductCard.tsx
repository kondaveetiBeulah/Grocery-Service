import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Card } from '../common/Card';
import { StatusChip } from '../common/StatusChip';

interface ProductCardProps {
  product: ProductItem;
  onToggleAvailability: (productId: string) => void;
  onEdit: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onToggleAvailability,
  onEdit,
}) => {
  const discountPercent = product.mrp > product.sellingPrice
    ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
    : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.mainRow}>
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          {product.isVeg ? (
            <View style={[styles.vegBadge, styles.vegGreen]}>
              <View style={[styles.vegDot, styles.vegDotGreen]} />
            </View>
          ) : (
            <View style={[styles.vegBadge, styles.vegRed]}>
              <View style={[styles.vegDot, styles.vegDotRed]} />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoCol}>
          <View style={styles.topBadges}>
            {product.isMasterCatalog ? (
              <View style={styles.masterBadge}>
                <Ionicons name="shield-checkmark" size={10} color={colors.primaryDark} />
                <Text style={styles.masterBadgeText}>Master Catalog</Text>
              </View>
            ) : (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>Store Added</Text>
              </View>
            )}

            {product.reviewStatus !== 'Approved' && (
              <StatusChip status={product.reviewStatus} size="small" />
            )}
          </View>

          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.metaText}>
            {product.brand} • {product.packSize} {product.soldByWeight ? '• By Weight' : ''}
          </Text>

          {/* Pricing Row */}
          <View style={styles.pricingRow}>
            <Text style={styles.sellingPrice}>₹{product.sellingPrice}</Text>
            {product.mrp > product.sellingPrice && (
              <>
                <Text style={styles.mrp}>₹{product.mrp}</Text>
                <Text style={styles.discount}>{discountPercent}% off</Text>
              </>
            )}
          </View>
        </View>

        {/* Edit Button */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => onEdit(product)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pencil" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Footer Switch: Binary Availability */}
      <View style={styles.footerRow}>
        <View style={styles.availStatusWrap}>
          <View style={[styles.statusDot, { backgroundColor: product.isAvailable ? colors.success : colors.error }]} />
          <Text style={[styles.availStatusText, { color: product.isAvailable ? colors.success : colors.error }]}>
            {product.isAvailable ? 'Available for Orders' : 'Marked Out of Stock'}
          </Text>
        </View>

        <View style={styles.switchWrapper}>
          <Text style={styles.switchLabel}>In Stock</Text>
          <Switch
            value={product.isAvailable}
            onValueChange={() => onToggleAvailability(product.id)}
            trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
            thumbColor={colors.surface}
            ios_backgroundColor={colors.surfaceTertiary}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: spacing.md,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
  },
  vegBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 2,
  },
  vegGreen: {
    borderColor: '#15803D',
  },
  vegRed: {
    borderColor: '#B91C1C',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vegDotGreen: {
    backgroundColor: '#15803D',
  },
  vegDotRed: {
    backgroundColor: '#B91C1C',
  },
  infoCol: {
    flex: 1,
    paddingRight: spacing.xs,
  },
  topBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  masterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    gap: 3,
  },
  masterBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  customBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  customBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  name: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginTop: 4,
  },
  sellingPrice: {
    ...typography.h4,
    color: colors.primaryDark,
  },
  mrp: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discount: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  editBtn: {
    padding: spacing.xs,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  availStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  availStatusText: {
    ...typography.caption,
    fontWeight: '700',
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  switchLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
