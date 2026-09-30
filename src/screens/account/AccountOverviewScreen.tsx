import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList, StoreDetails } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { StatusChip } from '../../components/common/StatusChip';
import { storeService } from '../../services/storeService';

type AccountNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'AccountTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface AccountOverviewScreenProps {
  navigation: AccountNavProp;
}

export const AccountOverviewScreen: React.FC<AccountOverviewScreenProps> = ({ navigation }) => {
  const [store, setStore] = useState<StoreDetails>(storeService.getStoreDetails());

  useEffect(() => {
    const unsub = storeService.subscribe(() => {
      setStore(storeService.getStoreDetails());
    });
    return unsub;
  }, []);

  const menuSections = [
    {
      title: 'Business Analytics & Customer Feedback',
      items: [
        {
          title: 'Store Performance Insights',
          subtitle: 'Fill rate, acceptance %, top sellers & peak hours',
          icon: 'analytics-outline' as const,
          action: () => navigation.navigate('StoreInsights'),
        },
        {
          title: 'Customer Ratings & Reviews',
          subtitle: '4.9 rating (842 verified customer reviews)',
          icon: 'star-outline' as const,
          action: () => navigation.navigate('CustomerReviews'),
        },
      ],
    },
    {
      title: 'Store Settings & Operations',
      items: [
        {
          title: 'Store Settings & Shifts',
          subtitle: 'Hours, holiday mode, thermal printer & dispatch',
          icon: 'settings-outline' as const,
          action: () => navigation.navigate('StoreSettings'),
        },
        {
          title: 'Bank Account & Daily Settlements',
          subtitle: `${store.bankDetails.bankName} (•••• 2903)`,
          icon: 'card-outline' as const,
          action: () => navigation.navigate('PayoutHistory'),
        },
        {
          title: 'Verification & Document Status',
          subtitle: `Status: ${store.verificationStatus} • Compliance check`,
          icon: 'shield-checkmark-outline' as const,
          action: () => navigation.navigate('VerificationStatusModal'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Store Profile & Account"
        subtitle="Manage Operations & Compliance"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* STORE PROFILE HERO CARD */}
        <Card style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatarCircle}>
              <Ionicons name="storefront" size={28} color={colors.primaryDark} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.storeName}>{store.storeName}</Text>
              <Text style={styles.ownerText}>Proprietor: {store.ownerName}</Text>
              <Text style={styles.storeIdText}>ID: {store.storeId}</Text>
            </View>
            <StatusChip status={store.verificationStatus} size="small" />
          </View>

          <View style={styles.divider} />

          <View style={styles.profileFooter}>
            <View style={styles.onlineToggleRow}>
              <View style={[styles.statusDot, { backgroundColor: store.isOpen ? colors.success : colors.error }]} />
              <Text style={styles.statusText}>
                {store.isOpen ? 'Store is OPEN for orders' : 'Store is PAUSED'}
              </Text>
            </View>

            <Switch
              value={store.isOpen}
              onValueChange={(val) => storeService.toggleStoreStatus(val)}
              trackColor={{ false: colors.surfaceTertiary, true: colors.primary }}
              thumbColor={colors.surface}
            />
          </View>
        </Card>

        {/* MENU SECTIONS */}
        {menuSections.map((section, idx) => (
          <View key={idx} style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>{section.title}</Text>
            <Card style={styles.menuCard}>
              {section.items.map((item, itemIdx) => (
                <TouchableOpacity
                  key={itemIdx}
                  style={[styles.menuItem, itemIdx < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={item.action}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons name={item.icon} size={22} color={colors.primary} />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSub}>{item.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: spacing.tabBarClearance + 24,
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  storeName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  ownerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  storeIdText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  profileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  onlineToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionWrap: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    marginLeft: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
  },
  menuSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
