import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
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
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { StatusChip } from '../../components/common/StatusChip';
import { HandoverModal } from '../../components/orders/HandoverModal';
import { orderService } from '../../services/orderService';

type ReadyHandoverRouteProp = RouteProp<RootStackParamList, 'ReadyHandover'>;
type ReadyHandoverNavProp = NativeStackNavigationProp<RootStackParamList, 'ReadyHandover'>;

interface G16ReadyHandoverScreenProps {
  route: ReadyHandoverRouteProp;
  navigation: ReadyHandoverNavProp;
}

export const G16ReadyHandoverScreen: React.FC<G16ReadyHandoverScreenProps> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(orderService.getOrderById(orderId));
  const [handoverModalVisible, setHandoverModalVisible] = useState(false);

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
      </SafeAreaView>
    );
  }

  const handleCallRider = () => {
    if (order.rider) {
      Alert.alert('Calling Rider', `Dialing ${order.rider.name} at ${order.rider.phone}...`);
    }
  };

  const handleHandoverSuccess = () => {
    setHandoverModalVisible(false);
    Alert.alert(
      'Handover Complete 🎉',
      `Order ${order.shortId} handed over to ${order.rider?.name}. Payout recorded!`,
      [{ text: 'Go to Home', onPress: () => navigation.navigate('MainApp') }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title={`Handover: ${order.shortId}`}
        subtitle="Ready for Delivery Rider"
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* PROMINENT ORDER ID & BAG COUNT HERO CARD */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>ORDER SHORT CODE</Text>
              <Text style={styles.heroShortId}>{order.shortId}</Text>
              <Text style={styles.heroFullId}>{order.id}</Text>
            </View>
            <View style={styles.bagCounterBadge}>
              <Ionicons name="cube" size={24} color={colors.textInverse} />
              <Text style={styles.bagCountNumber}>{order.bagCount}</Text>
              <Text style={styles.bagCountText}>BAG{order.bagCount > 1 ? 'S' : ''}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.heroMetaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Customer</Text>
              <Text style={styles.metaVal}>{order.customerName}</Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Total Units</Text>
              <Text style={styles.metaVal}>
                {order.items.reduce((s, i) => s + i.quantity, 0)} Items
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Payment</Text>
              <Text style={styles.metaVal}>
                {order.paymentMode.includes('Online') ? 'Paid Online' : 'Cash on Del.'}
              </Text>
            </View>
          </View>
        </Card>

        {/* RIDER STATUS & CARD */}
        {order.rider ? (
          <Card style={styles.riderCard}>
            <View style={styles.riderTop}>
              <Text style={styles.sectionTitle}>Assigned OneBuddy Rider</Text>
              <View style={[styles.statusPill, order.rider.isArrived ? styles.statusPillGreen : styles.statusPillAmber]}>
                <Ionicons
                  name={order.rider.isArrived ? 'checkmark-circle' : 'time'}
                  size={14}
                  color={colors.textInverse}
                />
                <Text style={styles.statusPillText}>
                  {order.rider.isArrived ? 'RIDER ARRIVED' : `ETA ${order.rider.etaMinutes} MINS`}
                </Text>
              </View>
            </View>

            <View style={styles.riderBody}>
              <Image source={{ uri: order.rider.photoUrl }} style={styles.riderAvatar} />
              <View style={styles.riderDetails}>
                <Text style={styles.riderName}>{order.rider.name}</Text>
                <Text style={styles.riderSub}>
                  Vehicle: <Text style={styles.bold}>{order.rider.vehicleNumber}</Text>
                </Text>
                <Text style={styles.riderSub}>
                  Phone: <Text style={styles.bold}>{order.rider.phone}</Text>
                </Text>
              </View>

              <TouchableOpacity style={styles.callRiderBtn} onPress={handleCallRider} activeOpacity={0.7}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickupCodeNotice}>
              <Ionicons name="keypad-outline" size={20} color={colors.primaryDark} />
              <View style={styles.pickupCodeTextWrap}>
                <Text style={styles.pickupNoticeTitle}>Rider Pickup Verification Code</Text>
                <Text style={styles.pickupNoticeSub}>
                  Ask rider for their 4-digit security code ({order.rider.pickupCode}) before handing over bags.
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.riderWaitingCard}>
            <Ionicons name="bicycle-outline" size={32} color={colors.primary} />
            <Text style={styles.waitingTitle}>Assigning Nearby Rider...</Text>
            <Text style={styles.waitingSub}>Automated fleet system is matching fastest rider.</Text>
          </Card>
        )}

        {/* ITEMS BAG SUMMARY PREVIEW */}
        <Card style={styles.itemsSummaryCard}>
          <Text style={styles.sectionTitle}>Packed Items in Bag ({order.items.length}):</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemSummaryRow}>
              <Text style={styles.itemSummaryName} numberOfLines={1}>
                {item.quantity}x {item.productName} ({item.packSize})
              </Text>
              <Text style={styles.itemSummaryPrice}>₹{item.unitPrice * item.quantity}</Text>
            </View>
          ))}
        </Card>

        {/* ACTION CTA */}
        <View style={styles.footer}>
          <AppButton
            title="VERIFY CODE & COMPLETE HANDOVER"
            onPress={() => setHandoverModalVisible(true)}
            variant="primary"
            size="large"
            fullWidth
            style={{ backgroundColor: colors.success }}
            leftIcon={<Ionicons name="shield-checkmark" size={22} color={colors.textInverse} />}
          />
        </View>
      </ScrollView>

      {/* HANDOVER 4-DIGIT VERIFICATION MODAL */}
      <HandoverModal
        visible={handoverModalVisible}
        order={order}
        onClose={() => setHandoverModalVisible(false)}
        onHandoverSuccess={handleHandoverSuccess}
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
  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    ...typography.caption,
    color: colors.primaryMuted,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroShortId: {
    ...typography.h1,
    fontSize: 36,
    color: colors.textInverse,
    fontWeight: '900',
  },
  heroFullId: {
    ...typography.caption,
    color: colors.primaryLight,
    marginTop: 2,
  },
  bagCounterBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bagCountNumber: {
    ...typography.h2,
    color: colors.textInverse,
    marginTop: 2,
  },
  bagCountText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textInverse,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: spacing.md,
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.primaryMuted,
    marginBottom: 2,
  },
  metaVal: {
    ...typography.bodySmallBold,
    color: colors.textInverse,
  },
  riderCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  riderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusPillGreen: {
    backgroundColor: colors.success,
  },
  statusPillAmber: {
    backgroundColor: colors.secondary,
  },
  statusPillText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textInverse,
  },
  riderBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  riderAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: spacing.md,
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    ...typography.bodyLargeBold,
    color: colors.textPrimary,
  },
  riderSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  callRiderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupCodeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primaryLight + '40',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  pickupCodeTextWrap: {
    flex: 1,
  },
  pickupNoticeTitle: {
    ...typography.bodySmallBold,
    color: colors.primaryDark,
  },
  pickupNoticeSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  riderWaitingCard: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  waitingTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  waitingSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemsSummaryCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  itemSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemSummaryName: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  itemSummaryPrice: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  footer: {
    marginBottom: spacing.xxl,
  },
});
