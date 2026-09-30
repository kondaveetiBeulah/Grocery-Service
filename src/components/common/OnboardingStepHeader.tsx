import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

interface OnboardingStepHeaderProps {
  currentStep: number; // 1 to 6
  totalSteps?: number; // default 6
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

const STEP_NAMES = [
  'Store Details',
  'Documents',
  'Location',
  'Catalog Setup',
  'Catalog Review',
  'Pricing & Bank',
];

export const OnboardingStepHeader: React.FC<OnboardingStepHeaderProps> = ({
  currentStep,
  totalSteps = 6,
  title,
  subtitle,
  onBack,
  rightAction,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {/* Top Navigation Row */}
      <View style={styles.topRow}>
        <View style={styles.leftCol}>
          {onBack && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={onBack}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View style={styles.titleCol}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              <Text style={styles.subtitle} numberOfLines={1}>
                Step {currentStep} of {totalSteps} • {STEP_NAMES[currentStep - 1] || ''}
              </Text>
            )}
          </View>
        </View>

        {rightAction && <View style={styles.rightCol}>{rightAction}</View>}
      </View>

      {/* 6-Step Visual Tick Mark Pipeline */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperTrack}>
          {steps.map((stepNum, index) => {
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            const isUpcoming = stepNum > currentStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={stepNum}>
                {/* Step Circle Node */}
                <View style={styles.nodeWrapper}>
                  <View
                    style={[
                      styles.circle,
                      isCompleted && styles.circleCompleted,
                      isCurrent && styles.circleCurrent,
                      isUpcoming && styles.circleUpcoming,
                    ]}
                  >
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={14} color={colors.textInverse} />
                    ) : (
                      <Text
                        style={[
                          styles.circleText,
                          isCurrent && styles.circleTextCurrent,
                          isUpcoming && styles.circleTextUpcoming,
                        ]}
                      >
                        {stepNum}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Connecting Line between steps */}
                {!isLast && (
                  <View
                    style={[
                      styles.connectingLine,
                      stepNum < currentStep ? styles.lineCompleted : styles.lineUpcoming,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    minHeight: 48,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginLeft: -2,
  },
  titleCol: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  subtitle: {
    ...typography.caption,
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  rightCol: {
    marginLeft: spacing.sm,
  },
  // Stepper Bar
  stepperContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  stepperTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  nodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Completed step: solid green with white checkmark
  circleCompleted: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  // Current step: highlighted with green border & background
  circleCurrent: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  // Upcoming step: subtle neutral grey
  circleUpcoming: {
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  circleTextCurrent: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  circleTextUpcoming: {
    color: colors.textMuted,
  },
  // Connecting Lines
  connectingLine: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 3,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
  lineUpcoming: {
    backgroundColor: colors.border,
  },
});
