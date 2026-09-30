import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';
import { OrderStatus, VerificationState } from '../../types';

interface StatusChipProps {
  status?: OrderStatus | VerificationState | 'Available' | 'Unavailable' | 'Express' | 'Scheduled' | 'Paid' | 'Processing' | 'Failed' | string;
  label?: string;
  size?: 'small' | 'medium';
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status = 'NEW',
  label,
  size = 'medium',
  style,
}) => {
  const displayLabel = label || status;

  const getChipColors = (): { bg: string; text: string; border: string } => {
    switch (status) {
      // Order Statuses
      case 'NEW':
        return { bg: colors.infoLight, text: colors.info, border: colors.info + '40' };
      case 'PICKING':
        return { bg: colors.warningLight, text: '#B45309', border: colors.warning + '50' };
      case 'READY_FOR_PICKUP':
        return { bg: '#EDE9FE', text: '#6D28D9', border: '#C4B5FD' };
      case 'COMPLETED':
      case 'Paid':
      case 'Approved':
      case 'Available':
        return { bg: colors.successLight, text: '#047857', border: colors.success + '40' };
      case 'CANCELLED':
      case 'Rejected':
      case 'Failed':
      case 'Unavailable':
        return { bg: colors.errorLight, text: colors.error, border: colors.error + '40' };
      case 'Under Review':
      case 'Processing':
        return { bg: colors.warningLight, text: '#D97706', border: colors.warning + '40' };
      case 'Needs Changes':
        return { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' };
      case 'Express':
        return { bg: colors.secondaryLight, text: colors.secondaryDark, border: colors.secondary + '40' };
      case 'Scheduled':
        return { bg: colors.surfaceSecondary, text: colors.textSecondary, border: colors.border };
      default:
        return { bg: colors.surfaceSecondary, text: colors.textSecondary, border: colors.border };
    }
  };

  const { bg, text, border } = getChipColors();

  return (
    <View
      style={[
        styles.chip,
        size === 'small' ? styles.chipSmall : styles.chipMedium,
        { backgroundColor: bg, borderColor: border },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text
        style={[
          size === 'small' ? styles.textSmall : styles.textMedium,
          { color: text },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipSmall: {
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
  chipMedium: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs + 2,
  },
  textSmall: {
    ...typography.caption,
    fontWeight: '700',
  },
  textMedium: {
    ...typography.bodySmallBold,
  },
});
