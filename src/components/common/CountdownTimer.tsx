import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showIcon?: boolean;
  prefix?: string;
  size?: 'small' | 'medium' | 'large';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  onExpire,
  style,
  textStyle,
  showIcon = true,
  prefix = 'Pack in:',
  size = 'medium',
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpire && onExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire && onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onExpire]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (secondsLeft > 300) {
      return { bg: colors.successLight, text: '#065F46', icon: colors.success };
    }
    if (secondsLeft > 120) {
      return { bg: colors.warningLight, text: '#92400E', icon: colors.warning };
    }
    return { bg: colors.errorLight, text: colors.error, icon: colors.error };
  };

  const themeColors = getColor();

  return (
    <View
      style={[
        styles.container,
        size === 'small' && styles.smallContainer,
        size === 'large' && styles.largeContainer,
        { backgroundColor: themeColors.bg },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name="timer-outline"
          size={size === 'small' ? 14 : size === 'large' ? 20 : 16}
          color={themeColors.icon}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          size === 'small' && styles.smallText,
          size === 'large' && styles.largeText,
          { color: themeColors.text },
          textStyle,
        ]}
      >
        {prefix ? `${prefix} ` : ''}
        {formatTime(secondsLeft)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  smallContainer: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
  },
  largeContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    ...typography.bodySmallBold,
    fontVariant: ['tabular-nums'],
  },
  smallText: {
    ...typography.caption,
    fontWeight: '700',
  },
  largeText: {
    ...typography.bodyLargeBold,
    fontSize: 18,
  },
});
