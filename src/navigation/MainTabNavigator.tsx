import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

import { G10HomeScreen } from '../screens/home/G10HomeScreen';
import { G11OrdersListScreen } from '../screens/orders/G11OrdersListScreen';
import { G17CatalogScreen } from '../screens/catalog/G17CatalogScreen';
import { G20EarningsDashboardScreen } from '../screens/earnings/G20EarningsDashboardScreen';
import { AccountOverviewScreen } from '../screens/account/AccountOverviewScreen';
import { orderService } from '../services/orderService';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const [activeOrderCount, setActiveOrderCount] = useState(
    orderService.getOrders().filter(o => o.status === 'NEW' || o.status === 'PICKING').length
  );

  useEffect(() => {
    const unsub = orderService.subscribe(() => {
      setActiveOrderCount(
        orderService.getOrders().filter(o => o.status === 'NEW' || o.status === 'PICKING').length
      );
    });
    return unsub;
  }, []);

  // Elevated bottom padding to clear Android navigation buttons (||| [] <) and iOS home indicator
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 18 : 12);
  const tabHeight = Platform.OS === 'ios' ? 84 + insets.bottom : 72 + (insets.bottom > 0 ? insets.bottom : 16);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: tabHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={G10HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="OrdersTab"
        component={G11OrdersListScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarBadge: activeOrderCount > 0 ? activeOrderCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.secondary,
            fontSize: 10,
            fontWeight: '800',
          },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="CatalogTab"
        component={G17CatalogScreen}
        options={{
          tabBarLabel: 'Catalog',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'basket' : 'basket-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="EarningsTab"
        component={G20EarningsDashboardScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="AccountTab"
        component={AccountOverviewScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
