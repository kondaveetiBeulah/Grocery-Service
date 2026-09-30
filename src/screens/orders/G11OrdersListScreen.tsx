import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList, Order, OrderStatus } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { AppInput } from '../../components/common/AppInput';
import { OrderCard } from '../../components/orders/OrderCard';
import { EmptyState } from '../../components/common/EmptyState';
import { orderService } from '../../services/orderService';

type OrdersScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'OrdersTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface G11OrdersListScreenProps {
  navigation: OrdersScreenNavigationProp;
}

const ORDER_TABS: { key: OrderStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'NEW', label: 'New' },
  { key: 'PICKING', label: 'Picking' },
  { key: 'READY_FOR_PICKUP', label: 'Ready' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export const G11OrdersListScreen: React.FC<G11OrdersListScreenProps> = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>(orderService.getOrders());

  useEffect(() => {
    const unsub = orderService.subscribe(() => {
      setOrders(orderService.getOrders());
    });
    return unsub;
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesTab = selectedTab === 'ALL' || o.status === selectedTab;
    const matchesSearch = !searchQuery.trim() ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shortId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTabCount = (tabKey: OrderStatus | 'ALL') => {
    if (tabKey === 'ALL') return orders.length;
    return orders.filter(o => o.status === tabKey).length;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Orders Manager"
        subtitle="Live Queue & Pick-Pack Pipeline"
      />

      <View style={styles.container}>
        {/* Search Bar supporting Full ID & Last 4 digits */}
        <View style={styles.searchSection}>
          <AppInput
            placeholder="Search Order ID (e.g. 0087) or Customer"
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftAffix={<Ionicons name="search" size={16} color={colors.textMuted} />}
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Status Filter Horizontal Tabs — strictly content-fitted & height-constrained */}
        <View style={styles.tabsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
            style={styles.tabsScrollView}
          >
            {ORDER_TABS.map((tab) => {
              const isSelected = selectedTab === tab.key;
              const count = getTabCount(tab.key);
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabBtn, isSelected && styles.tabBtnActive]}
                  onPress={() => setSelectedTab(tab.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabBtnText, isSelected && styles.tabBtnTextActive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.tabBadge, isSelected ? styles.tabBadgeActive : styles.tabBadgeInactive]}>
                    <Text style={[styles.tabBadgeText, isSelected && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Orders Cards List */}
        <ScrollView contentContainerStyle={styles.ordersList} showsVerticalScrollIndicator={false}>
          {filteredOrders.length === 0 ? (
            <EmptyState
              iconName="receipt-outline"
              title="No Orders Found"
              message={
                searchQuery
                  ? `No orders matching query "${searchQuery}".`
                  : `There are currently no orders in the ${selectedTab} state.`
              }
              actionTitle={searchQuery ? 'Clear Search' : undefined}
              onActionPress={searchQuery ? () => setSearchQuery('') : undefined}
            />
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                onQuickAction={() => {
                  if (order.status === 'NEW') {
                    orderService.acceptOrder(order.id);
                    navigation.navigate('PickPackExecution', { orderId: order.id });
                  } else if (order.status === 'PICKING') {
                    navigation.navigate('PickPackExecution', { orderId: order.id });
                  } else if (order.status === 'READY_FOR_PICKUP') {
                    navigation.navigate('ReadyHandover', { orderId: order.id });
                  } else {
                    navigation.navigate('OrderDetail', { orderId: order.id });
                  }
                }}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs + 2,
    paddingBottom: 2,
    backgroundColor: colors.surface,
  },
  searchInput: {
    marginBottom: 0,
  },
  tabsSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  tabsScrollView: {
    flexGrow: 0,
  },
  tabsRow: {
    paddingHorizontal: spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
    alignSelf: 'flex-start',
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  tabBtnText: {
    ...typography.caption,
    fontWeight: '700',
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: colors.textInverse,
    fontWeight: '800',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeInactive: {
    backgroundColor: colors.border,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.textInverse,
  },
  ordersList: {
    padding: spacing.md,
    paddingBottom: spacing.tabBarClearance + 24,
  },
});
