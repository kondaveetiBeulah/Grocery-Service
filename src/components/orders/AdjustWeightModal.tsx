import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModalWrapper } from '../common/ModalWrapper';
import { AppButton } from '../common/AppButton';
import { AppInput } from '../common/AppInput';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OrderItem } from '../../types';

interface AdjustWeightModalProps {
  visible: boolean;
  item: OrderItem | null;
  onClose: () => void;
  onSaveWeight: (actualWeight: number) => void;
}

export const AdjustWeightModal: React.FC<AdjustWeightModalProps> = ({
  visible,
  item,
  onClose,
  onSaveWeight,
}) => {
  const [weightInput, setWeightInput] = useState('1.05');

  if (!item) return null;

  const handleSave = () => {
    const num = parseFloat(weightInput);
    if (!isNaN(num) && num > 0) {
      onSaveWeight(num);
    }
  };

  const quickWeights = ['0.50', '1.00', '1.05', '1.50', '2.00'];

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Weigh Item on Scale"
      subtitle={`Enter the physical weight for ${item.productName}`}
    >
      <View style={styles.container}>
        <View style={styles.targetInfo}>
          <Text style={styles.targetLabel}>Target Ordered Weight:</Text>
          <Text style={styles.targetValue}>{item.targetWeight || `${item.quantity} kg`}</Text>
        </View>

        <AppInput
          label="Actual Weighed Quantity (kg)"
          value={weightInput}
          onChangeText={setWeightInput}
          keyboardType="decimal-pad"
          placeholder="e.g. 1.05"
          helperText="Bill automatically adjusts if actual weight varies within ±15%"
        />

        <Text style={styles.quickLabel}>Quick Pick Weight:</Text>
        <View style={styles.quickPillsRow}>
          {quickWeights.map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.pill, weightInput === w && styles.pillSelected]}
              onPress={() => setWeightInput(w)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, weightInput === w && styles.pillTextSelected]}>
                {w} kg
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
            title="Confirm Weight & Mark Picked"
            onPress={handleSave}
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
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  targetLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  targetValue: {
    ...typography.bodyLargeBold,
    color: colors.primaryDark,
  },
  quickLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  pill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  pillText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  pillTextSelected: {
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
