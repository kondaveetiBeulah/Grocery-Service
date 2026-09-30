import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModalWrapper } from '../common/ModalWrapper';
import { AppButton } from '../common/AppButton';
import { AppInput } from '../common/AppInput';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface PriceAdjustmentModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyAdjustment: (percentage: number) => void;
}

export const PriceAdjustmentModal: React.FC<PriceAdjustmentModalProps> = ({
  visible,
  onClose,
  onApplyAdjustment,
}) => {
  const [percentStr, setPercentStr] = useState('5');
  const [isIncrease, setIsIncrease] = useState(false); // default -5% discount

  const handleApply = () => {
    const p = parseFloat(percentStr);
    if (!isNaN(p) && p > 0) {
      const finalPercent = isIncrease ? p : -p;
      onApplyAdjustment(finalPercent);
    }
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Bulk Price Adjustment"
      subtitle="Adjust store selling prices across all catalog items"
    >
      <View style={styles.container}>
        {/* Toggle Increase / Decrease */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isIncrease && styles.toggleBtnActiveDiscount]}
            onPress={() => setIsIncrease(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, !isIncrease && styles.toggleTextActive]}>
              Discount / Decrease (-)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, isIncrease && styles.toggleBtnActiveIncrease]}
            onPress={() => setIsIncrease(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, isIncrease && styles.toggleTextActive]}>
              Price Increase (+)
            </Text>
          </TouchableOpacity>
        </View>

        <AppInput
          label="Percentage (%)"
          value={percentStr}
          onChangeText={setPercentStr}
          keyboardType="numeric"
          placeholder="e.g. 5"
          helperText="Selling prices will automatically be capped so they NEVER exceed MRP (sellingPrice <= MRP)."
        />

        <View style={styles.presetsRow}>
          {['3', '5', '8', '10', '15'].map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.presetPill, percentStr === v && styles.presetPillActive]}
              onPress={() => setPercentStr(v)}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetText, percentStr === v && styles.presetTextActive]}>
                {isIncrease ? `+${v}%` : `-${v}%`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.btnRow}>
          <AppButton
            title="Cancel"
            onPress={onClose}
            variant="outline"
            style={styles.btnFlex}
          />
          <AppButton
            title="Apply to Catalog"
            onPress={handleApply}
            variant="primary"
            style={styles.btnFlex}
          />
        </View>
      </View>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  toggleBtnActiveDiscount: {
    backgroundColor: colors.primary,
  },
  toggleBtnActiveIncrease: {
    backgroundColor: colors.secondaryDark,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  toggleTextActive: {
    color: colors.textInverse,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  presetPill: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetPillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  presetText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  presetTextActive: {
    color: colors.primaryDark,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnFlex: {
    flex: 1,
  },
});
