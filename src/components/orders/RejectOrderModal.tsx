import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModalWrapper } from '../common/ModalWrapper';
import { AppButton } from '../common/AppButton';
import { AppInput } from '../common/AppInput';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

const REJECTION_REASONS = [
  'Store is closing / Power outage',
  'Multiple items out of stock',
  'High store rush / Unable to pack within ETA',
  'Delivery radius / Address issue',
  'Other operational issue',
];

interface RejectOrderModalProps {
  visible: boolean;
  orderShortId: string;
  onClose: () => void;
  onConfirmReject: (reason: string) => void;
}

export const RejectOrderModal: React.FC<RejectOrderModalProps> = ({
  visible,
  orderShortId,
  onClose,
  onConfirmReject,
}) => {
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Other operational issue' && customReason.trim()
      ? customReason.trim()
      : selectedReason;
    onConfirmReject(finalReason);
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title={`Reject Order ${orderShortId}?`}
      subtitle="Please select a reason. High rejections may affect store rating."
    >
      <View style={styles.container}>
        {REJECTION_REASONS.map((reason) => {
          const isSelected = selectedReason === reason;
          return (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonOption, isSelected && styles.reasonOptionSelected]}
              onPress={() => setSelectedReason(reason)}
              activeOpacity={0.7}
            >
              <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                {reason}
              </Text>
            </TouchableOpacity>
          );
        })}

        {selectedReason === 'Other operational issue' && (
          <AppInput
            placeholder="Type specific reason..."
            value={customReason}
            onChangeText={setCustomReason}
            containerStyle={styles.customInput}
          />
        )}

        <View style={styles.btnRow}>
          <AppButton
            title="Keep Order"
            onPress={onClose}
            variant="outline"
            style={styles.btnFlex}
          />
          <AppButton
            title="Confirm Reject"
            onPress={handleConfirm}
            variant="danger"
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
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  reasonOptionSelected: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight + '25',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioCircleSelected: {
    borderColor: colors.error,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  reasonText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  reasonTextSelected: {
    ...typography.bodyMediumBold,
    color: colors.error,
  },
  customInput: {
    marginTop: spacing.xs,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btnFlex: {
    flex: 1,
  },
});
