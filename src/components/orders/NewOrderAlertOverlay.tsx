import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { StatusChip } from '../common/StatusChip';
import { CountdownTimer } from '../common/CountdownTimer';
import { AppButton } from '../common/AppButton';
import { RejectOrderModal } from './RejectOrderModal';

interface NewOrderAlertOverlayProps {
  visible: boolean;
  orders: Order[];
  onAccept: (orderId: string) => void;
  onReject: (orderId: string, reason: string) => void;
  onDismiss: () => void;
}

export const NewOrderAlertOverlay: React.FC<NewOrderAlertOverlayProps> = ({
  visible,
  orders,
  onAccept,
  onReject,
  onDismiss,
}) => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visible || orders.length === 0) return null;

  const currentOrder = orders[currentIndex] || orders[0];

  const handleAcceptCurrent = () => {
    onAccept(currentOrder.id);
    if (currentIndex < orders.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onDismiss();
    }
  };

  const handleConfirmReject = (reason: string) => {
    setRejectModalVisible(false);
    onReject(currentOrder.id, reason);
    if (currentIndex < orders.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header Bar */}
          <View style={styles.header}>
            <View style={styles.alertPulse}>
              <Ionicons name="notifications" size={20} color={colors.textInverse} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>
                NEW ORDER ARRIVED {orders.length > 1 ? `(${currentIndex + 1}/${orders.length})` : ''}
              </Text>
              <Text style={styles.headerSubtitle}>Please accept before countdown ends</Text>
            </View>
            <CountdownTimer
              initialSeconds={60}
              size="medium"
              prefix=""
              style={styles.timer}
              onExpire={onDismiss}
            />
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Key Order Info Card */}
            <View style={styles.infoCard}>
              <View style={styles.idRow}>
                <View>
                  <Text style={styles.shortId}>{currentOrder.shortId}</Text>
                  <Text style={styles.fullId}>{currentOrder.id}</Text>
                </View>
                <StatusChip status={currentOrder.deliveryMode} size="medium" />
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Total Items</Text>
                  <Text style={styles.metricValue}>
                    {currentOrder.items.reduce((s, i) => s + i.quantity, 0)} Units
                  </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Bill Amount</Text>
                  <Text style={[styles.metricValue, { color: colors.primaryDark }]}>
                    ₹{currentOrder.totalAmount}
                  </Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Payment Mode</Text>
                  <Text style={styles.metricValue}>
                    {currentOrder.paymentMode.includes('Online') ? 'UPI / Online' : 'Cash'}
                  </Text>
                </View>
              </View>

              {currentOrder.customerSpecialNotes && (
                <View style={styles.noteBox}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color="#B45309" />
                  <Text style={styles.noteText}>
                    Note: "{currentOrder.customerSpecialNotes}"
                  </Text>
                </View>
              )}
            </View>

            {/* Items to Pack List */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionHeading}>
                Items to Pack ({currentOrder.items.length} distinct products):
              </Text>
              {currentOrder.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                    <Text style={styles.itemMeta}>
                      {item.brand} • {item.packSize}
                    </Text>
                    {item.aisle && (
                      <Text style={styles.aisleText}>{item.aisle}</Text>
                    )}
                  </View>
                  <View style={styles.itemRight}>
                    <View style={styles.qtyPill}>
                      <Text style={styles.qtyText}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.priceText}>₹{item.unitPrice * item.quantity}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Action Buttons Fixed Footer */}
          <View style={styles.footer}>
            <AppButton
              title="Reject"
              onPress={() => setRejectModalVisible(true)}
              variant="outline"
              size="large"
              style={styles.rejectBtn}
              textStyle={styles.rejectBtnText}
            />
            <AppButton
              title="ACCEPT ORDER"
              onPress={handleAcceptCurrent}
              variant="primary"
              size="large"
              style={styles.acceptBtn}
              leftIcon={<Ionicons name="checkmark-circle" size={22} color={colors.textInverse} />}
            />
          </View>
        </View>

        {/* Rejection Modal */}
        <RejectOrderModal
          visible={rejectModalVisible}
          orderShortId={currentOrder.shortId}
          onClose={() => setRejectModalVisible(false)}
          onConfirmReject={handleConfirmReject}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  alertPulse: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    ...typography.bodyMediumBold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timer: {
    backgroundColor: colors.errorLight,
  },
  scrollContent: {
    flex: 1,
    padding: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 3,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  shortId: {
    ...typography.h1,
    color: colors.primaryDark,
  },
  fullId: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningLight + '50',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  noteText: {
    ...typography.caption,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  itemsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  itemName: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aisleText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  qtyPill: {
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
  priceText: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  rejectBtn: {
    flex: 1,
    borderColor: colors.error,
  },
  rejectBtnText: {
    color: colors.error,
  },
  acceptBtn: {
    flex: 2,
  },
});
