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
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList, ProductItem, CatalogFilterTab, ProductCategory } from '../../types';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { AppInput } from '../../components/common/AppInput';
import { ProductCard } from '../../components/catalog/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { BarcodeScannerModal } from '../../components/catalog/BarcodeScannerModal';
import { PriceAdjustmentModal } from '../../components/catalog/PriceAdjustmentModal';
import { BulkCsvModal } from '../../components/catalog/BulkCsvModal';
import { catalogService } from '../../services/catalogService';

type CatalogNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CatalogTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface G17CatalogScreenProps {
  navigation: CatalogNavProp;
}

const CATEGORY_LIST: (ProductCategory | 'ALL')[] = [
  'ALL',
  'Dairy & Bread',
  'Fresh Fruits & Vegetables',
  'Snacks & Beverages',
  'Staples, Rice & Dals',
  'Household Essentials',
  'Packaged Foods',
];

const FILTER_TABS: { key: CatalogFilterTab; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Available', label: 'Available' },
  { key: 'Unavailable', label: 'Unavailable' },
  { key: 'Needs Attention', label: 'Needs Attention' },
  { key: 'Pending Review', label: 'Pending Review' },
];

export const G17CatalogScreen: React.FC<G17CatalogScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<CatalogFilterTab>('All');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<ProductItem[]>(catalogService.getProducts('All'));

  // Modals
  const [scannerVisible, setScannerVisible] = useState(false);
  const [priceAdjVisible, setPriceAdjVisible] = useState(false);
  const [csvModalVisible, setCsvModalVisible] = useState(false);

  useEffect(() => {
    const unsub = catalogService.subscribe(() => {
      const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
      setProducts(catalogService.getProducts(activeTab, cat));
    });
    return unsub;
  }, [activeTab, selectedCategory]);

  const handleTabChange = (tab: CatalogFilterTab) => {
    setActiveTab(tab);
    const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
    setProducts(catalogService.getProducts(tab, cat));
  };

  const handleCategoryChange = (cat: ProductCategory | 'ALL') => {
    setSelectedCategory(cat);
    const catFilter = cat === 'ALL' ? undefined : cat;
    setProducts(catalogService.getProducts(activeTab, catFilter));
  };

  const handleResetFilters = () => {
    setActiveTab('All');
    setSelectedCategory('ALL');
    setSearchQuery('');
    setProducts(catalogService.getProducts('All'));
  };

  const handleToggleAvailability = (productId: string) => {
    catalogService.toggleAvailability(productId);
  };

  const handleEditProduct = (product: ProductItem) => {
    navigation.navigate('AddEditProduct', { productId: product.id, isMaster: product.isMasterCatalog });
  };

  const handleScanBarcodeResult = (barcode: string) => {
    const found = catalogService.searchProducts(barcode);
    if (found.length > 0) {
      setSearchQuery(found[0].name);
    } else {
      Alert.alert(
        'New Barcode Scanned',
        `No product found with barcode ${barcode}. Would you like to create a new product?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Product', onPress: () => navigation.navigate('AddEditProduct', {}) }
        ]
      );
    }
  };

  const getTabCount = (tabKey: CatalogFilterTab) => {
    const cat = selectedCategory === 'ALL' ? undefined : selectedCategory;
    return catalogService.getProducts(tabKey, cat).length;
  };

  const displayProducts = searchQuery.trim()
    ? catalogService.searchProducts(searchQuery, activeTab, selectedCategory === 'ALL' ? undefined : selectedCategory)
    : products;

  const isFilterActive = activeTab !== 'All' || selectedCategory !== 'ALL' || searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Header
        title="Store Catalog"
        subtitle="Manage Pricing & Stock Availability"
        rightAction={
          <TouchableOpacity
            style={styles.addHeaderBtn}
            onPress={() => navigation.navigate('AddEditProduct', {})}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={18} color={colors.textInverse} />
            <Text style={styles.addHeaderText}>Add Item</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.container}>
        {/* Search & Tool Pills */}
        <View style={styles.searchSection}>
          <AppInput
            placeholder="Search products by title, brand, or SKU..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftAffix={<Ionicons name="search" size={18} color={colors.textMuted} />}
            rightAffix={
              <TouchableOpacity onPress={() => setScannerVisible(true)} style={styles.scanIconBtn}>
                <Ionicons name="barcode-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            }
            containerStyle={styles.searchInput}
          />

          <View style={styles.quickBulkRow}>
            <TouchableOpacity
              style={styles.bulkPill}
              onPress={() => setPriceAdjVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="trending-down-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.bulkPillText}>Price Adjustment (±%)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bulkPill}
              onPress={() => setCsvModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={14} color={colors.primaryDark} />
              <Text style={styles.bulkPillText}>Bulk CSV Tool</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Section: High-Visibility Status Tabs & Category Pills */}
        <View style={styles.filterSection}>
          {/* Top Row: Status Filter Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tabsRow}
            style={styles.horizontalScrollWrap}
          >
            {FILTER_TABS.map(({ key, label }) => {
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

          {/* Bottom Row: Category Pills */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.catPillsRow}
            style={styles.horizontalScrollWrap}
          >
            {CATEGORY_LIST.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, isSelected && styles.catPillActive]}
                  onPress={() => handleCategoryChange(cat)}
                  activeOpacity={0.7}
                >
                  {isSelected && <Ionicons name="checkmark-circle" size={13} color={colors.textInverse} />}
                  <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Filter Status Indicator Bar */}
        <View style={styles.activeFilterStatusBar}>
          <View style={styles.statusLeft}>
            <Ionicons name="funnel-outline" size={14} color={colors.primaryDark} />
            <Text style={styles.statusText}>
              Showing <Text style={styles.statusBold}>{displayProducts.length}</Text> {activeTab === 'All' ? 'items' : activeTab} {selectedCategory !== 'ALL' ? `in ${selectedCategory}` : ''}
            </Text>
          </View>
          {isFilterActive && (
            <TouchableOpacity onPress={handleResetFilters} style={styles.clearFilterBtn} activeOpacity={0.7}>
              <Ionicons name="close-circle-outline" size={14} color={colors.error} />
              <Text style={styles.clearFilterText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Products List or Dedicated No Data Found State */}
        <ScrollView contentContainerStyle={styles.productsScroll} showsVerticalScrollIndicator={false}>
          {displayProducts.length === 0 ? (
            <View style={styles.noDataCard}>
              <View style={styles.noDataIconWrap}>
                <Ionicons name="file-tray-outline" size={48} color={colors.textMuted} />
              </View>
              <Text style={styles.noDataTitle}>No Products Found</Text>
              <Text style={styles.noDataSubtitle}>
                {searchQuery
                  ? `No products matching "${searchQuery}".`
                  : `No products currently in "${activeTab}" filter${selectedCategory !== 'ALL' ? ` for "${selectedCategory}"` : ''}.`}
              </Text>
              
              <View style={styles.noDataActionsRow}>
                <TouchableOpacity style={styles.noDataResetBtn} onPress={handleResetFilters} activeOpacity={0.7}>
                  <Ionicons name="refresh" size={16} color={colors.primaryDark} />
                  <Text style={styles.noDataResetText}>Show All Products</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.noDataAddBtn} 
                  onPress={() => navigation.navigate('AddEditProduct', {})}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={colors.textInverse} />
                  <Text style={styles.noDataAddText}>Add New Product</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleAvailability={handleToggleAvailability}
                onEdit={handleEditProduct}
              />
            ))
          )}
        </ScrollView>
      </View>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanResult={handleScanBarcodeResult}
      />

      {/* Bulk Price Adjustment Modal */}
      <PriceAdjustmentModal
        visible={priceAdjVisible}
        onClose={() => setPriceAdjVisible(false)}
        onApplyAdjustment={(p) => {
          const res = catalogService.bulkAdjustPrices(p);
          setPriceAdjVisible(false);
          Alert.alert('Prices Adjusted', `Updated ${res.updatedCount} items within MRP limits.`);
        }}
      />

      {/* Bulk CSV Modal */}
      <BulkCsvModal
        visible={csvModalVisible}
        onClose={() => setCsvModalVisible(false)}
        onApplyValidRows={(c) => Alert.alert('CSV Imported', `Added ${c} items successfully.`)}
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
  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  addHeaderText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 12,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs + 2,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  scanIconBtn: {
    padding: spacing.xs,
  },
  quickBulkRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  bulkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight + '50',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  bulkPillText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 11,
  },
  filterSection: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 6,
  },
  horizontalScrollWrap: {
    flexGrow: 0,
  },
  // Row 1: Filter Status Tabs — high visibility and solid contrast
  tabsRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
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
    fontWeight: '700',
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
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: colors.textInverse,
  },
  // Row 2: Category Pills
  catPillsRow: {
    paddingHorizontal: spacing.md,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 6,
    alignItems: 'center',
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catPillActive: {
    backgroundColor: '#1E293B', // Sleek dark slate
    borderColor: '#0F172A',
  },
  catPillText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: colors.textInverse,
    fontWeight: '700',
  },
  // Active Filter Summary Bar
  activeFilterStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    backgroundColor: colors.primaryLight + '35',
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '20',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  statusBold: {
    color: colors.primaryDark,
    fontWeight: '800',
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.error + '30',
  },
  clearFilterText: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '700',
    fontSize: 10,
  },
  // Products Scroll
  productsScroll: {
    padding: spacing.md,
    paddingBottom: spacing.tabBarClearance + 24,
  },
  // No Data Found State
  noDataCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noDataIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  noDataTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  noDataSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  noDataActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  noDataResetBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  noDataResetText: {
    ...typography.buttonSmall,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 12,
  },
  noDataAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  noDataAddText: {
    ...typography.buttonSmall,
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 12,
  },
});
