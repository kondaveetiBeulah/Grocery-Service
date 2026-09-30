import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, OrderItem, ProductItem } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { ProgressBar } from '../../components/common/ProgressBar';
import { CountdownTimer } from '../../components/common/CountdownTimer';
import { AppButton } from '../../components/common/AppButton';
import { Card } from '../../components/common/Card';
import { OrderItemRow } from '../../components/orders/OrderItemRow';
import { AdjustWeightModal } from '../../components/orders/AdjustWeightModal';
import { SubstitutionModal } from '../../components/orders/SubstitutionModal';
import { BarcodeScannerModal } from '../../components/catalog/BarcodeScannerModal';
import { orderService } from '../../services/orderService';

type PickPackRouteProp = RouteProp<RootStackParamList, 'PickPackExecution'>;
type PickPackNavProp = NativeStackNavigationProp<RootStackParamList, 'PickPackExecution'>;

interface G14PickPackExecutionScreenProps {
  route: PickPackRouteProp;
  navigation: PickPackNavProp;
}

export const G14PickPackExecutionScreen: React.FC<G14PickPackExecutionScreenProps> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState(orderService.getOrderById(orderId));

  // Modal states
  const [activeWeightItem, setActiveWeightItem] = useState<OrderItem | null>(null);
  const [activeUnavailableItem, setActiveUnavailableItem] = useState<OrderItem | null>(null);
  const [activeBarcodeItem, setActiveBarcodeItem] = useState<OrderItem | null>(null);

  // Quality check states
  const [coldSeparated, setColdSeparated] = useState(order?.bagQualityChecks.coldItemsSeparated ?? true);
  const [liquidsSealed, setLiquidsSealed] = useState(order?.bagQualityChecks.liquidsSealed ?? true);
  const [fragileOnTop, setFragileOnTop] = useState(order?.bagQualityChecks.fragileOnTop ?? true);
  const [bagCount, setBagCount] = useState(order?.bagCount ?? 1);

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

  const totalItems = order.items.length;
  const pickedCount = order.items.filter(i => i.isPicked || i.isUnavailable).length;
  const allPicked = pickedCount === totalItems;

  const handleTogglePick = (itemId: string) => {
    orderService.toggleItemPicked(order.id, itemId);
  };

  const handleSaveWeight = (weight: number) => {
    if (activeWeightItem) {
      orderService.updateItemWeight(order.id, activeWeightItem.id, weight);
      setActiveWeightItem(null);
    }
  };

  const handleConfirmSubstitution = (action: 'replace' | 'refund', replacement?: ProductItem) => {
    if (activeUnavailableItem) {
      orderService.setItemUnavailable(order.id, activeUnavailableItem.id, action, replacement);
      setActiveUnavailableItem(null);
    }
  };

  const handleBarcodeScanned = (barcode: string) => {
    if (activeBarcodeItem) {
      orderService.toggleItemPicked(order.id, activeBarcodeItem.id);
      setActiveBarcodeItem(null);
      Alert.alert('Barcode Matched', `Scanned ${barcode} matches ${activeBarcodeItem.productName}. Marked picked!`);
    }
  };

  const handleCompletePacking = () => {
    orderService.updateBagCount(order.id, bagCount);
    orderService.updateQualityChecks(order.id, {
      coldItemsSeparated: coldSeparated,
      liquidsSealed,
      fragileOnTop,
    });
    orderService.completePacking(order.id);
    navigation.navigate('ReadyHandover', { orderId: order.id });
  };

  // Group items by Aisle / Category
  const groupedItems = order.items.reduce<Record<string, OrderItem[]>>((acc, item) => {
    const aisleKey = item.aisle || item.category;
    if (!acc[aisleKey]) acc[aisleKey] = [];
    acc[aisleKey].push(item);
    return acc;
  }, {});

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title={`Pick & Pack: ${order.shortId}`}
        subtitle={`${order.id} • ${order.customerName}`}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TOP STATUS BAR: PROGRESS & PACKING TIMER */}
        <Card style={styles.statusBarCard}>
          <View style={styles.statusBarTop}>
            <View>
              <Text style={styles.progressCounter}>
                Picked <Text style={styles.bold}>{pickedCount}/{totalItems}</Text> Items
              </Text>
              <Text style={styles.progressSub}>
                {allPicked ? 'All items accounted for!' : 'Check each product before bagging'}
              </Text>
            </View>
            <CountdownTimer
              initialSeconds={order.packingTimeRemainingSeconds || 360}
              size="medium"
              prefix="Time left:"
            />
          </View>

          <ProgressBar
            current={pickedCount}
            total={totalItems}
            color={allPicked ? colors.success : colors.warning}
            style={styles.progressBar}
          />
        </Card>

        {/* AISLE / CATEGORY GROUPED ITEMS */}
        {Object.entries(groupedItems).map(([aisle, items]) => (
          <View key={aisle} style={styles.aisleSection}>
            <View style={styles.aisleHeader}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.aisleTitle}>{aisle.toUpperCase()}</Text>
              <View style={styles.aisleBadge}>
                <Text style={styles.aisleBadgeText}>{items.length} items</Text>
              </View>
            </View>

            {items.map((item) => (
              <OrderItemRow
                key={item.id}
                item={item}
                showPickControls
                onTogglePick={() => handleTogglePick(item.id)}
                onAdjustWeight={() => setActiveWeightItem(item)}
                onScanBarcode={() => setActiveBarcodeItem(item)}
                onMarkUnavailable={() => setActiveUnavailableItem(item)}
              />
            ))}
          </View>
        ))}

        {/* PACKING SUMMARY & BAG QUALITY CHECKLIST */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionHeading}>Bagging & Quality Assurance</Text>
          <Text style={styles.sectionSub}>Confirm package hygiene and bag count before seal:</Text>

          {/* Bag Count Incrementer */}
          <View style={styles.bagCounterRow}>
            <View>
              <Text style={styles.bagCounterLabel}>Total Bags Packed:</Text>
              <Text style={styles.bagCounterSub}>Include cold & dry bags</Text>
            </View>
            <View style={styles.counterWrap}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setBagCount(Math.max(1, bagCount - 1))}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.counterVal}>{bagCount} Bag{bagCount > 1 ? 's' : ''}</Text>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setBagCount(bagCount + 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Quality Checkboxes */}
          <View style={styles.qcList}>
            <TouchableOpacity
              style={styles.qcItem}
              onPress={() => setColdSeparated(!coldSeparated)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={coldSeparated ? 'checkbox' : 'square-outline'}
                size={22}
                color={coldSeparated ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.qcText, coldSeparated && styles.qcTextChecked]}>
                Cold / Chilled items packed in separate bag
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qcItem}
              onPress={() => setLiquidsSealed(!liquidsSealed)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={liquidsSealed ? 'checkbox' : 'square-outline'}
                size={22}
                color={liquidsSealed ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.qcText, liquidsSealed && styles.qcTextChecked]}>
                Oil & liquids standing upright with caps checked
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qcItem}
              onPress={() => setFragileOnTop(!fragileOnTop)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={fragileOnTop ? 'checkbox' : 'square-outline'}
                size={22}
                color={fragileOnTop ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.qcText, fragileOnTop && styles.qcTextChecked]}>
                Bread, eggs & tomatoes placed on top (not squished)
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.printManifestBtn}
            onPress={() => Alert.alert('Thermal Tag Printed', `Printed OneBuddy Bag Label #${order.shortId}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="print-outline" size={18} color={colors.primary} />
            <Text style={styles.printManifestText}>Print Bag Manifest Label</Text>
          </TouchableOpacity>
        </Card>

        {/* FINAL READY FOR PICKUP CTA */}
        <View style={styles.footer}>
          <AppButton
            title={allPicked ? 'PACKED — READY FOR PICKUP' : `Complete Remaining (${totalItems - pickedCount} items left)`}
            onPress={handleCompletePacking}
            disabled={!allPicked}
            variant="primary"
            size="large"
            fullWidth
            style={allPicked ? { backgroundColor: colors.success } : {}}
            rightIcon={<Ionicons name="checkmark-done" size={22} color={colors.textInverse} />}
          />
        </View>
      </ScrollView>

      {/* WEIGH ITEM MODAL */}
      <AdjustWeightModal
        visible={!!activeWeightItem}
        item={activeWeightItem}
        onClose={() => setActiveWeightItem(null)}
        onSaveWeight={handleSaveWeight}
      />

      {/* SUBSTITUTION MODAL (G15) */}
      <SubstitutionModal
        visible={!!activeUnavailableItem}
        item={activeUnavailableItem}
        customerPhone={order.customerPhone}
        customerPreference={order.substitutionPreference}
        onClose={() => setActiveUnavailableItem(null)}
        onConfirmSubstitution={handleConfirmSubstitution}
      />

      {/* BARCODE SCANNER MODAL */}
      <BarcodeScannerModal
        visible={!!activeBarcodeItem}
        onClose={() => setActiveBarcodeItem(null)}
        onScanResult={handleBarcodeScanned}
        title={`Scan for ${activeBarcodeItem?.productName || 'Product'}`}
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
  statusBarCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statusBarTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  progressCounter: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  bold: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  progressSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    marginTop: spacing.xs,
  },
  aisleSection: {
    marginBottom: spacing.md,
  },
  aisleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
    paddingHorizontal: 4,
  },
  aisleTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  aisleBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: borderRadius.xs,
    marginLeft: 'auto',
  },
  aisleBadgeText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  summaryCard: {
    padding: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  bagCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bagCounterLabel: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  bagCounterSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  counterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterVal: {
    ...typography.h4,
    color: colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  qcList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  qcItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qcText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  qcTextChecked: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  printManifestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight + '50',
    borderRadius: borderRadius.md,
  },
  printManifestText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
});
