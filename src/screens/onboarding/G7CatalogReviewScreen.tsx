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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList, ProductItem, CatalogFilterTab } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OnboardingStepHeader } from '../../components/common/OnboardingStepHeader';
import { AppButton } from '../../components/common/AppButton';
import { AppInput } from '../../components/common/AppInput';
import { ProductCard } from '../../components/catalog/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { PriceAdjustmentModal } from '../../components/catalog/PriceAdjustmentModal';
import { BulkCsvModal } from '../../components/catalog/BulkCsvModal';
import { catalogService } from '../../services/catalogService';

interface G7CatalogReviewScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'G7CatalogReview'>;
}

const TABS: { key: CatalogFilterTab; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Needs Attention', label: 'Needs Attention' },
  { key: 'Unavailable', label: 'Unavailable' },
  { key: 'Pending Review', label: 'Pending Review' },
];

export const G7CatalogReviewScreen: React.FC<G7CatalogReviewScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<CatalogFilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductItem[]>(catalogService.getProducts('All'));
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [csvModalVisible, setCsvModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = catalogService.subscribe(() => {
      setProducts(catalogService.getProducts(activeTab));
    });
    return unsubscribe;
  }, [activeTab]);

  const handleTabChange = (tab: CatalogFilterTab) => {
    setActiveTab(tab);
    setProducts(catalogService.getProducts(tab));
  };

  const handleToggleAvailability = (productId: string) => {
    catalogService.toggleAvailability(productId);
  };

  const handleApplyPriceAdj = (percentage: number) => {
    const result = catalogService.bulkAdjustPrices(percentage);
    setPriceModalVisible(false);
    Alert.alert(
      'Bulk Prices Updated',
      `Adjusted selling prices across ${result.updatedCount} products while adhering strictly to the MRP ceiling (sellingPrice <= MRP).`
    );
  };

  const displayProducts = searchQuery.trim()
    ? catalogService.searchProducts(searchQuery, activeTab)
    : products;

  const getTabCount = (tabKey: CatalogFilterTab) => {
    return catalogService.getProducts(tabKey).length;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingStepHeader
        currentStep={5}
        title="Catalog Review & Pricing"
        onBack={() => navigation.goBack()}
        rightAction={
          <TouchableOpacity
            style={styles.bulkEditBtn}
            onPress={() => setPriceModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={16} color={colors.primary} />
            <Text style={styles.bulkEditText}>Bulk %</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Search & Action Pills */}
        <View style={styles.searchBarWrap}>
          <AppInput
            placeholder="Search brand, name, or SKU..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftAffix={<Ionicons name="search" size={18} color={colors.textMuted} />}
            containerStyle={styles.searchInput}
          />

          <View style={styles.actionPillsRow}>
            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => setPriceModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="trending-down-outline" size={13} color={colors.primaryDark} />
              <Text style={styles.actionPillText}>Price Adjustment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionPill}
              onPress={() => setCsvModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={13} color={colors.primaryDark} />
              <Text style={styles.actionPillText}>Upload CSV</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Tabs — strictly constrained in height to prevent vertical stretching */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterTabsWrap}
            style={styles.filterScrollView}
          >
            {TABS.map(({ key, label }) => {
              const isSelected = activeTab === key;
              const count = getTabCount(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterTab, isSelected && styles.filterTabActive]}
                  onPress={() => handleTabChange(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                    {label}
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

        {/* Product Cards List or Empty State */}
        <ScrollView contentContainerStyle={styles.productList} showsVerticalScrollIndicator={false}>
          {displayProducts.length === 0 ? (
            <EmptyState
              iconName="basket-outline"
              title="No Products Found"
              message={
                searchQuery
                  ? `No products match "${searchQuery}" in ${activeTab}.`
                  : `No products found under "${activeTab}" status.`
              }
              actionTitle={searchQuery ? 'Clear Search' : 'Show All Products'}
              onActionPress={() => {
                if (searchQuery) setSearchQuery('');
                else handleTabChange('All');
              }}
            />
          ) : (
            displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleAvailability={handleToggleAvailability}
                onEdit={(prod) => {
                  Alert.alert(
                    'Edit Product',
                    `Edit ${prod.name}\n(MRP: ₹${prod.mrp}, Selling Price: ₹${prod.sellingPrice})`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Close' }
                    ]
                  );
                }}
              />
            ))
          )}

          {/* Footer CTA */}
          <View style={styles.footer}>
            <AppButton
              title="Confirm Catalog & Pricing Plan"
              onPress={() => navigation.navigate('G8PricingPlanBank')}
              variant="primary"
              size="large"
              fullWidth
              rightIcon={<Ionicons name="arrow-forward" size={18} color={colors.textInverse} />}
            />
          </View>
        </ScrollView>
      </View>

      {/* Price Adjustment Modal */}
      <PriceAdjustmentModal
        visible={priceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        onApplyAdjustment={handleApplyPriceAdj}
      />

      {/* Bulk CSV Modal */}
      <BulkCsvModal
        visible={csvModalVisible}
        onClose={() => setCsvModalVisible(false)}
        onApplyValidRows={() => setProducts(catalogService.getProducts(activeTab))}
      />
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
  bulkEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  bulkEditText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  searchBarWrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs + 2,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  actionPillsRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight + '60',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  actionPillText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  filterSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterTabsWrap: {
    paddingHorizontal: spacing.md,
    gap: 8,
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  filterTabText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  filterTabTextActive: {
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
  productList: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  footer: {
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
});
