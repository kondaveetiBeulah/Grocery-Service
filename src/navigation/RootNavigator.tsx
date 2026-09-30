import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import { AuthStackNavigator } from './AuthStackNavigator';
import { MainTabNavigator } from './MainTabNavigator';

import { G13OrderDetailScreen } from '../screens/orders/G13OrderDetailScreen';
import { G14PickPackExecutionScreen } from '../screens/orders/G14PickPackExecutionScreen';
import { G16ReadyHandoverScreen } from '../screens/orders/G16ReadyHandoverScreen';
import { G18AddEditProductScreen } from '../screens/catalog/G18AddEditProductScreen';
import { G19BulkUpdateScreen } from '../screens/catalog/G19BulkUpdateScreen';
import { G20EarningsDashboardScreen } from '../screens/earnings/G20EarningsDashboardScreen';
import { G21PayoutHistoryScreen } from '../screens/earnings/G21PayoutHistoryScreen';
import { G22StoreInsightsScreen } from '../screens/account/G22StoreInsightsScreen';
import { G23CustomerReviewsScreen } from '../screens/account/G23CustomerReviewsScreen';
import { G24StoreSettingsScreen } from '../screens/account/G24StoreSettingsScreen';
import { G9VerificationStatusScreen } from '../screens/onboarding/G9VerificationStatusScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AuthStack"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Auth & Onboarding Flow */}
      <Stack.Screen name="AuthStack" component={AuthStackNavigator} />

      {/* Main Tab App Shell */}
      <Stack.Screen name="MainApp" component={MainTabNavigator} />

      {/* Order Workflow Screens */}
      <Stack.Screen name="OrderDetail" component={G13OrderDetailScreen} />
      <Stack.Screen name="PickPackExecution" component={G14PickPackExecutionScreen} />
      <Stack.Screen name="ReadyHandover" component={G16ReadyHandoverScreen} />

      {/* Catalog Screens */}
      <Stack.Screen name="AddEditProduct" component={G18AddEditProductScreen} />
      <Stack.Screen name="BulkUpdate" component={G19BulkUpdateScreen} />

      {/* Earnings Screens */}
      <Stack.Screen name="PayoutHistory" component={G21PayoutHistoryScreen} />

      {/* Account & Analytics Screens */}
      <Stack.Screen name="StoreInsights" component={G22StoreInsightsScreen} />
      <Stack.Screen name="CustomerReviews" component={G23CustomerReviewsScreen} />
      <Stack.Screen name="StoreSettings" component={G24StoreSettingsScreen} />
      <Stack.Screen name="VerificationStatusModal" component={G9VerificationStatusScreen as any} />
    </Stack.Navigator>
  );
};
