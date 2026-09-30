import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle, 
  View,
  StyleProp
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      ...styles.button,
      ...(fullWidth && { width: '100%' }),
    };

    switch (size) {
      case 'small':
        Object.assign(base, styles.sizeSmall);
        break;
      case 'large':
        Object.assign(base, styles.sizeLarge);
        break;
      case 'medium':
      default:
        Object.assign(base, styles.sizeMedium);
        break;
    }

    switch (variant) {
      case 'secondary':
        Object.assign(base, styles.variantSecondary);
        break;
      case 'outline':
        Object.assign(base, styles.variantOutline);
        break;
      case 'danger':
        Object.assign(base, styles.variantDanger);
        break;
      case 'ghost':
        Object.assign(base, styles.variantGhost);
        break;
      case 'success':
        Object.assign(base, styles.variantSuccess);
        break;
      case 'primary':
      default:
        Object.assign(base, styles.variantPrimary);
        break;
    }

    if (disabled || loading) {
      Object.assign(base, styles.disabled);
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
        return styles.textOutline;
      case 'secondary':
        return styles.textSecondary;
      case 'ghost':
        return styles.textGhost;
      case 'danger':
        return styles.textDanger;
      case 'primary':
      case 'success':
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textInverse} 
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={[styles.text, getTextStyle(), textStyle]}>
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full, // Pill rounded buttons matching OneBuddy theme
    minHeight: 46, // Touch target guideline
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSmall: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    minHeight: 38,
  },
  sizeMedium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  sizeLarge: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xxl,
    minHeight: 52,
  },
  variantPrimary: {
    backgroundColor: colors.primary,
  },
  variantSecondary: {
    backgroundColor: colors.secondary,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  variantDanger: {
    backgroundColor: colors.error,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  variantSuccess: {
    backgroundColor: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.button,
    fontWeight: '700',
    textAlign: 'center',
  },
  textPrimary: {
    color: colors.textInverse,
  },
  textSecondary: {
    color: colors.textInverse,
  },
  textOutline: {
    color: colors.primary,
    fontWeight: '700',
  },
  textGhost: {
    color: colors.primary,
  },
  textDanger: {
    color: colors.textInverse,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
