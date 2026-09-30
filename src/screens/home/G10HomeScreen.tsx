import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList, Order, StoreDetails } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { StatCard } from '../../components/common/StatCard';
import { Card } from '../../components/common/Card';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { AppButton } from '../../components/common/AppButton';
import { OrderCard } from '../../components/orders/OrderCard';
import { NewOrderAlertOverlay } from '../../components/orders/NewOrderAlertOverlay';
import { BarcodeScannerModal } from '../../components/catalog/BarcodeScannerModal';
import { storeService } from '../../services/storeService';
import { orderService } from '../../services/orderService';
import { earningsService } from '../../services/earningsService';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface G10HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const G10HomeScreen: React.FC<G10HomeScreenProps> = ({ navigation }) => {
  const [store, setStore] = useState<StoreDetails>(storeService.getStoreDetails());
  const [orders, setOrders] = useState<Order[]>(orderService.getOrders());
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [selectedClosureDuration, setSelectedClosureDuration] = useState('30 mins');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [newOrderAlertVisible, setNewOrderAlertVisible] = useState(false);

  useEffect(() => {
    const unsubStore = storeService.subscribe(() => setStore(storeService.getStoreDetails()));
    const unsubOrders = orderService.subscribe(() => setOrders(orderService.getOrders()));
    return () => {
      unsubStore();
      unsubOrders();
    };
  }, []);

  const newOrders = orders.filter(o => o.status === 'NEW');
  const pickingOrders = orders.filter(o => o.status === 'PICKING');
  const readyOrders = orders.filter(o => o.status === 'READY_FOR_PICKUP');
  const earningsSummary = earningsService.getEarningsSummary('Today');

  const handleToggleStore = (val: boolean) => {
    if (!val) {
      setCloseModalVisible(true);
    } else {
      storeService.toggleStoreStatus(true);
    }
  };

  const handleConfirmStoreClosure = () => {
    setCloseModalVisible(false);
    storeService.toggleStoreStatus(false, 'Store temporarily paused', selectedClosureDuration);
    Alert.alert('Store Paused', `Store marked closed for ${selectedClosureDuration}. Incoming orders paused.`);
  };

  const handleAcceptOrder = (orderId: string) => {
    orderService.acceptOrder(orderId);
    navigation.navigate('PickPackExecution', { orderId });
  };

  const handleRejectOrder = (orderId: string, reason: string) => {
    orderService.rejectOrder(orderId, reason);
  };

  const closureDurations = ['30 mins', '1 hour', 'Rest of Today', 'Until I Reopen'];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.storeAvatar}>
            <Ionicons name="storefront" size={20} color={colors.primaryDark} />
          </View>
          <View style={styles.storeTitles}>
            <Text style={styles.storeName} numberOfLines={1}>{store.storeName}</Text>
            <View style={styles.storeStatusRow}>
              <View style={[styles.statusDot, { backgroundColor: store.isOpen ? colors.success : colors.error }]} />
              <Text style={[styles.statusLabel, { color: store.isOpen ? colors.success : colors.error }]}>
                {store.isOpen ? 'ONLINE & ACCEPTING ORDERS' : `PAUSED (${store.reopenTime || 'Closed'})`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Switch
            value={store.isOpen}
            onValueChange={handleToggleStore}
            trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
            thumbColor={colors.surface}
            ios_backgroundColor={colors.surfaceTertiary}
          />
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => setNewOrderAlertVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications" size={22} color={colors.textPrimary} />
            {newOrders.length > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{newOrders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* NEW ORDERS POPUP TRIGGER BANNER (IF ANY) */}
        {newOrders.length > 0 && (
          <TouchableOpacity
            style={styles.newOrderBanner}
            onPress={() => setNewOrderAlertVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.pulseIcon}>
              <Ionicons name="flash" size={20} color={colors.textInverse} />
            </View>
            <View style={styles.newOrderTextWrap}>
              <Text style={styles.newOrderBannerTitle}>
                {newOrders.length} NEW ORDER{newOrders.length > 1 ? 'S' : ''} AWAITING CONFIRMATION
              </Text>
              <Text style={styles.newOrderBannerSub}>Tap to review item list and accept within countdown</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textInverse} />
          </TouchableOpacity>
        )}

        {/* METRICS CARDS GRID (Today's performance) */}
        <View style={styles.metricsGrid}>
          <StatCard
            title="Sales Today"
            value={`₹${earningsSummary.netEarnings}`}
            subtitle="Gross: ₹14,820"
            icon={<Ionicons name="wallet-outline" size={18} color={colors.primary} />}
            style={styles.statCardFlex}
          />
          <StatCard
            title="Orders Today"
            value={earningsSummary.orderCount}
            subtitle={`${pickingOrders.length + readyOrders.length} in progress`}
            icon={<Ionicons name="receipt-outline" size={18} color={colors.info} />}
            style={styles.statCardFlex}
          />
        </View>

        <View style={styles.metricsGrid}>
          <StatCard
            title="Avg Packing Time"
            value="5.8 mins"
            trend={{ value: '1.2m faster', isPositive: true }}
            icon={<Ionicons name="timer-outline" size={18} color="#B45309" />}
            style={styles.statCardFlex}
          />
          <StatCard
            title="Acceptance Rate"
            value="98.4%"
            subtitle="Fill rate: 99.1%"
            icon={<Ionicons name="shield-checkmark-outline" size={18} color={colors.success} />}
            style={styles.statCardFlex}
          />
        </View>

        {/* "NEEDS YOUR ACTION" SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Needs Your Immediate Action</Text>
          <Text style={styles.sectionBadge}>
            {pickingOrders.length + readyOrders.length + (newOrders.length > 0 ? 1 : 0)} Tasks
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionCarousel}>
          {newOrders.length > 0 && (
            <Card style={[styles.actionCard, { borderColor: colors.info }]} onPress={() => setNewOrderAlertVisible(true)}>
              <View style={styles.actionCardTop}>
                <Ionicons name="alert-circle" size={22} color={colors.info} />
                <Text style={[styles.actionCount, { color: colors.info }]}>{newOrders.length} New</Text>
              </View>
              <Text style={styles.actionHeading}>Incoming Orders</Text>
              <Text style={styles.actionDesc}>Review and accept before auto-cancellation timer ends.</Text>
            </Card>
          )}

          {pickingOrders.length > 0 && (
            <Card
              style={[styles.actionCard, { borderColor: colors.warning }]}
              onPress={() => navigation.navigate('PickPackExecution', { orderId: pickingOrders[0].id })}
            >
              <View style={styles.actionCardTop}>
                <Ionicons name="basket" size={22} color="#B45309" />
                <Text style={[styles.actionCount, { color: '#B45309' }]}>{pickingOrders.length} Picking</Text>
              </View>
              <Text style={styles.actionHeading}>Pack in Progress</Text>
              <Text style={styles.actionDesc}>Order {pickingOrders[0].shortId} is being picked by staff.</Text>
            </Card>
          )}

          {readyOrders.length > 0 && (
            <Card
              style={[styles.actionCard, { borderColor: '#7C3AED' }]}
              onPress={() => navigation.navigate('ReadyHandover', { orderId: readyOrders[0].id })}
            >
              <View style={styles.actionCardTop}>
                <Ionicons name="bicycle" size={22} color="#7C3AED" />
                <Text style={[styles.actionCount, { color: '#7C3AED' }]}>{readyOrders.length} Ready</Text>
              </View>
              <Text style={styles.actionHeading}>Rider at Counter</Text>
              <Text style={styles.actionDesc}>Rider arrived for handover of {readyOrders[0].shortId}.</Text>
            </Card>
          )}
        </ScrollView>

        {/* QUICK ACTIONS BAR */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Store Quick Actions</Text>
        </View>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('AddEditProduct', {})}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="add-circle" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Add Product</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('BulkUpdate')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="document-text" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.quickActionText}>Bulk CSV Tool</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => setScannerVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="barcode" size={24} color={colors.info} />
            </View>
            <Text style={styles.quickActionText}>Scan Barcode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate('StoreSettings')}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="settings" size={24} color={colors.textSecondary} />
            </View>
            <Text style={styles.quickActionText}>Store Settings</Text>
          </TouchableOpacity>
        </View>

        {/* LIVE ORDERS WIDGET LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Live Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
            <Text style={styles.viewAllText}>View All ({orders.length})</Text>
          </TouchableOpacity>
        </View>

        {orders.slice(0, 3).map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
            onQuickAction={() => {
              if (order.status === 'NEW') {
                handleAcceptOrder(order.id);
              } else if (order.status === 'PICKING') {
                navigation.navigate('PickPackExecution', { orderId: order.id });
              } else if (order.status === 'READY_FOR_PICKUP') {
                navigation.navigate('ReadyHandover', { orderId: order.id });
              } else {
                navigation.navigate('OrderDetail', { orderId: order.id });
              }
            }}
          />
        ))}

        {/* WEEKLY PERFORMANCE SUMMARY */}
        <Card style={styles.weeklySummaryCard}>
          <View style={styles.weeklyHeader}>
            <View>
              <Text style={styles.weeklyTitle}>This Week's Partner Summary</Text>
              <Text style={styles.weeklySubtitle}>Mon, 24 Sep - Sun, 30 Sep</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('StoreInsights')}>
              <Text style={styles.insightsLink}>Full Insights →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weeklyMetricsRow}>
            <View style={styles.weeklyMetric}>
              <Text style={styles.weeklyVal}>194</Text>
              <Text style={styles.weeklyLabel}>Orders Fulfilled</Text>
            </View>
            <View style={styles.weeklyDivider} />
            <View style={styles.weeklyMetric}>
              <Text style={styles.weeklyVal}>₹96,480</Text>
              <Text style={styles.weeklyLabel}>Net Earnings</Text>
            </View>
            <View style={styles.weeklyDivider} />
            <View style={styles.weeklyMetric}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.weeklyVal}>4.9</Text>
                <Ionicons name="star" size={14} color="#F59E0B" />
              </View>
              <Text style={styles.weeklyLabel}>Customer Rating</Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* STORE CLOSURE DURATION MODAL */}
      <ModalWrapper
        visible={closeModalVisible}
        onClose={() => setCloseModalVisible(false)}
        title="Pause Store & Orders"
        subtitle="Select how long you want to pause incoming orders:"
      >
        <View style={styles.closeModalBody}>
          {closureDurations.map((dur) => (
            <TouchableOpacity
              key={dur}
              style={[styles.durOption, selectedClosureDuration === dur && styles.durOptionSelected]}
              onPress={() => setSelectedClosureDuration(dur)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, selectedClosureDuration === dur && styles.radioSelected]}>
                {selectedClosureDuration === dur && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.durText, selectedClosureDuration === dur && styles.durTextSelected]}>
                {dur}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.modalBtnRow}>
            <AppButton
              title="Cancel"
              onPress={() => setCloseModalVisible(false)}
              variant="outline"
              style={styles.modalBtnFlex}
            />
            <AppButton
              title="Confirm Pause"
              onPress={handleConfirmStoreClosure}
              variant="danger"
              style={styles.modalBtnFlex}
            />
          </View>
        </View>
      </ModalWrapper>

      {/* NEW ORDER FULL SCREEN ALERT MODAL (G12) */}
      <NewOrderAlertOverlay
        visible={newOrderAlertVisible}
        orders={newOrders.length > 0 ? newOrders : orders.slice(0, 1)}
        onAccept={handleAcceptOrder}
        onReject={handleRejectOrder}
        onDismiss={() => setNewOrderAlertVisible(false)}
      />

      {/* BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanResult={(barcode) => {
          Alert.alert('Barcode Scanned', `Product Barcode: ${barcode}\nSearching store inventory...`);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  storeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  storeTitles: {
    flex: 1,
  },
  storeName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  storeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  bellBtn: {
    position: 'relative',
    padding: spacing.xs,
  },
  bellBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.tabBarClearance + 24,
  },
  newOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    elevation: 4,
  },
  pulseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newOrderTextWrap: {
    flex: 1,
  },
  newOrderBannerTitle: {
    ...typography.bodySmallBold,
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  newOrderBannerSub: {
    ...typography.caption,
    color: '#FED7AA',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  statCardFlex: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  sectionBadge: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primaryDark,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  viewAllText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  actionCarousel: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  actionCard: {
    width: 220,
    padding: spacing.md,
    borderWidth: 1.5,
    marginBottom: 0,
  },
  actionCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  actionCount: {
    ...typography.caption,
    fontWeight: '800',
  },
  actionHeading: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  actionDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  weeklySummaryCard: {
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  weeklyTitle: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  weeklySubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  insightsLink: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  weeklyMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  weeklyMetric: {
    alignItems: 'center',
  },
  weeklyVal: {
    ...typography.h3,
    color: colors.primaryDark,
  },
  weeklyLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weeklyDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  closeModalBody: {
    paddingTop: spacing.xs,
  },
  durOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  durOptionSelected: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight + '20',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.error,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  durText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  durTextSelected: {
    ...typography.bodyMediumBold,
    color: colors.error,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalBtnFlex: {
    flex: 1,
  },
});
