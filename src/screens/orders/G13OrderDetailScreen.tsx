import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { StatusChip } from '../../components/common/StatusChip';
import { AppButton } from '../../components/common/AppButton';
import { Card } from '../../components/common/Card';
import { OrderItemRow } from '../../components/orders/OrderItemRow';
import { RejectOrderModal } from '../../components/orders/RejectOrderModal';
import { orderService } from '../../services/orderService';

type OrderDetailRouteProp = RouteProp<RootStackParamList, 'OrderDetail'>;
type OrderDetailNavProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetail'>;

interface G13OrderDetailScreenProps {
  route: OrderDetailRouteProp;
  navigation: OrderDetailNavProp;
}

export const G13OrderDetailScreen: React.FC<G13OrderDetailScreenProps> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(orderService.getOrderById(orderId));
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  useEffect(() => {
    const unsub = orderService.subscribe(() => {
      setOrder(orderService.getOrderById(orderId));
    });
    return unsub;
  }, [orderId]);

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <Header title="Order Not Found" onBack={() => navigation.goBack()} />
        <View style={styles.notFound}>
          <Text>Order {orderId} not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handlePrintBagTag = () => {
    Alert.alert(
      'Thermal Bag Tag Sent to Bluetooth Printer',
      `Printing manifest for ${order.shortId} (${order.bagCount} Bag${order.bagCount > 1 ? 's' : ''})...\nCustomer: ${order.customerName}\nRider Pickup Code: ${order.rider?.pickupCode || 'N/A'}`
    );
  };

  const handleAccept = () => {
    orderService.acceptOrder(order.id);
    navigation.navigate('PickPackExecution', { orderId: order.id });
  };

  const handleReject = (reason: string) => {
    setRejectModalVisible(false);
    orderService.rejectOrder(order.id, reason);
    Alert.alert('Order Rejected', `Order ${order.shortId} cancelled: ${reason}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title={`Order ${order.shortId}`}
        subtitle={order.id}
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity onPress={handlePrintBagTag} style={styles.printBtn} activeOpacity={0.7}>
            <Ionicons name="print-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TOP STATUS & MODE SUMMARY CARD */}
        <Card style={styles.summaryCard}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.shortId}>{order.shortId}</Text>
              <Text style={styles.fullId}>{order.id}</Text>
            </View>
            <View style={styles.badgesRow}>
              <StatusChip status={order.deliveryMode} size="small" />
              <StatusChip status={order.status} size="small" />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Customer & Preference Info */}
          <View style={styles.customerGrid}>
            <View style={styles.customerItem}>
              <Text style={styles.metaLabel}>Customer</Text>
              <Text style={styles.metaValue}>{order.customerName}</Text>
              <Text style={styles.phoneText}>{order.customerPhone}</Text>
            </View>

            <View style={styles.customerItem}>
              <Text style={styles.metaLabel}>Placed At</Text>
              <Text style={styles.metaValue}>{order.createdAt}</Text>
              {order.scheduledSlot && (
                <Text style={styles.slotText}>Slot: {order.scheduledSlot}</Text>
              )}
            </View>
          </View>

          {/* Substitution Preference Pill */}
          <View style={styles.subPrefBox}>
            <Ionicons name="swap-horizontal" size={16} color={colors.info} />
            <Text style={styles.subPrefText}>
              Substitution: <Text style={styles.bold}>{order.substitutionPreference}</Text>
            </Text>
          </View>

          {order.customerSpecialNotes && (
            <View style={styles.specialNoteBox}>
              <Ionicons name="chatbox-ellipses-outline" size={16} color="#B45309" />
              <Text style={styles.specialNoteText}>
                Customer Note: "{order.customerSpecialNotes}"
              </Text>
            </View>
          )}
        </Card>

        {/* ASSIGNED RIDER INFO (IF READY / IN DELIVERY) */}
        {order.rider && (
          <Card style={styles.riderCard}>
            <View style={styles.riderHeader}>
              <Text style={styles.cardHeading}>Assigned Delivery Partner</Text>
              <View style={[styles.arrivedBadge, order.rider.isArrived ? styles.badgeGreen : styles.badgeAmber]}>
                <Text style={styles.arrivedBadgeText}>
                  {order.rider.isArrived ? 'AT STORE COUNTER' : `ETA ${order.rider.etaMinutes} MINS`}
                </Text>
              </View>
            </View>

            <View style={styles.riderContent}>
              <Image source={{ uri: order.rider.photoUrl }} style={styles.riderImg} />
              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>{order.rider.name}</Text>
                <Text style={styles.riderVehicle}>Vehicle: {order.rider.vehicleNumber}</Text>
                <Text style={styles.riderPhone}>{order.rider.phone}</Text>
              </View>

              <View style={styles.pickupCodeBox}>
                <Text style={styles.pickupCodeLabel}>Pickup Code</Text>
                <Text style={styles.pickupCodeVal}>{order.rider.pickupCode}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* ITEM BREAKDOWN */}
        <View style={styles.itemsSection}>
          <Text style={styles.cardHeading}>
            Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)} units total)
          </Text>

          {order.items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              showPickControls={false}
              onTogglePick={() => {}}
            />
          ))}
        </View>

        {/* BILL & PAYMENT BREAKDOWN */}
        <Card style={styles.billCard}>
          <Text style={styles.cardHeading}>Bill Breakdown</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Subtotal</Text>
            <Text style={styles.billValue}>₹{order.subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & GST</Text>
            <Text style={styles.billValue}>₹{order.taxes}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Store Packing & Bagging Fee</Text>
            <Text style={styles.billValue}>+₹{order.packingFee}</Text>
          </View>

          {order.discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: colors.success }]}>Item Refund / Discount</Text>
              <Text style={[styles.billValue, { color: colors.success }]}>-₹{order.discount}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Order Amount</Text>
            <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
          </View>

          <View style={styles.paymentModePill}>
            <Ionicons name="card-outline" size={16} color={colors.primaryDark} />
            <Text style={styles.paymentModeText}>Payment: {order.paymentMode}</Text>
          </View>
        </Card>

        {/* ORDER STATUS TIMELINE */}
        <Card style={styles.timelineCard}>
          <Text style={styles.cardHeading}>Order Progress Timeline</Text>
          <View style={styles.timelineList}>
            {order.timeline.map((step, index) => (
              <View key={index} style={styles.timelineStep}>
                <View style={styles.timelineIndicator}>
                  <View style={[styles.timelineDot, step.completed && styles.timelineDotDone]} />
                  {index < order.timeline.length - 1 && (
                    <View style={[styles.timelineLine, step.completed && styles.timelineLineDone]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineTitle, step.completed && styles.timelineTitleDone]}>
                    {step.title}
                  </Text>
                  <Text style={styles.timelineTime}>{step.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* ACTION CTA FIXED BAR */}
        <View style={styles.footerActions}>
          {order.status === 'NEW' && (
            <View style={styles.btnRow}>
              <AppButton
                title="Reject"
                onPress={() => setRejectModalVisible(true)}
                variant="outline"
                style={styles.btnFlex}
                textStyle={{ color: colors.error }}
              />
              <AppButton
                title="Accept Order"
                onPress={handleAccept}
                variant="primary"
                style={styles.btnFlex2}
                rightIcon={<Ionicons name="checkmark" size={18} color={colors.textInverse} />}
              />
            </View>
          )}

          {order.status === 'PICKING' && (
            <AppButton
              title="Continue Pick & Pack Execution"
              onPress={() => navigation.navigate('PickPackExecution', { orderId: order.id })}
              variant="primary"
              size="large"
              fullWidth
              rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
            />
          )}

          {order.status === 'READY_FOR_PICKUP' && (
            <AppButton
              title="Handover to Delivery Rider"
              onPress={() => navigation.navigate('ReadyHandover', { orderId: order.id })}
              variant="primary"
              size="large"
              fullWidth
              style={{ backgroundColor: '#7C3AED' }}
              rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
            />
          )}
        </View>
      </ScrollView>

      {/* Rejection Reason Modal */}
      <RejectOrderModal
        visible={rejectModalVisible}
        orderShortId={order.shortId}
        onClose={() => setRejectModalVisible(false)}
        onConfirmReject={handleReject}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  printBtn: {
    padding: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
  },
  notFound: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  summaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shortId: {
    ...typography.h2,
    color: colors.primaryDark,
  },
  fullId: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  customerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  customerItem: {
    flex: 1,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  phoneText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  slotText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  subPrefBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.infoLight + '30',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  subPrefText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  bold: {
    fontWeight: '700',
  },
  specialNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.warningLight + '40',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  specialNoteText: {
    ...typography.caption,
    color: '#92400E',
    fontWeight: '600',
    flex: 1,
  },
  riderCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary + '30',
  },
  riderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardHeading: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  arrivedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  badgeGreen: {
    backgroundColor: colors.success,
  },
  badgeAmber: {
    backgroundColor: colors.secondary,
  },
  arrivedBadgeText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textInverse,
  },
  riderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  riderVehicle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  riderPhone: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pickupCodeBox: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickupCodeLabel: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textSecondary,
  },
  pickupCodeVal: {
    ...typography.h3,
    color: colors.primaryDark,
    letterSpacing: 2,
  },
  itemsSection: {
    marginBottom: spacing.md,
  },
  billCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  billValue: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.h2,
    color: colors.primaryDark,
  },
  paymentModePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
  paymentModeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  timelineCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  timelineList: {
    marginTop: spacing.xs,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 44,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 20,
    marginRight: spacing.md,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderDark,
    marginTop: 4,
  },
  timelineDotDone: {
    backgroundColor: colors.success,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  timelineLineDone: {
    backgroundColor: colors.success,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  timelineTitleDone: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  timelineTime: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  footerActions: {
    marginTop: spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btnFlex: {
    flex: 1,
  },
  btnFlex2: {
    flex: 2,
  },
});
