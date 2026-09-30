import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalWrapper } from '../common/ModalWrapper';
import { AppButton } from '../common/AppButton';
import { AppInput } from '../common/AppInput';
import { StatusChip } from '../common/StatusChip';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { OrderItem, ProductItem } from '../../types';
import { catalogService } from '../../services/catalogService';

interface SubstitutionModalProps {
  visible: boolean;
  item: OrderItem | null;
  customerPhone: string;
  customerPreference: string;
  onClose: () => void;
  onConfirmSubstitution: (action: 'replace' | 'refund', replacement?: ProductItem) => void;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  visible,
  item,
  customerPhone,
  customerPreference,
  onClose,
  onConfirmSubstitution,
}) => {
  const [activeTab, setActiveTab] = useState<'replace' | 'refund' | 'call'>('replace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReplacement, setSelectedReplacement] = useState<ProductItem | null>(null);

  if (!item) return null;

  const catalogProducts = catalogService.getProducts('Available');
  const filteredProducts = catalogProducts.filter(p => 
    p.id !== item.productId &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.category === item.category)
  ).slice(0, 4);

  const handleCallCustomer = () => {
    Alert.alert(
      'Calling Customer',
      `Connecting to ${customerPhone} regarding substitution for ${item.productName}...`,
      [{ text: 'End Call', style: 'cancel' }]
    );
  };

  const handleApplyRefund = () => {
    onConfirmSubstitution('refund');
  };

  const handleApplyReplace = () => {
    if (!selectedReplacement) {
      Alert.alert('Select Replacement', 'Please tap one of the suggested products to replace.');
      return;
    }
    onConfirmSubstitution('replace', selectedReplacement);
  };

  return (
    <ModalWrapper
      visible={visible}
      onClose={onClose}
      title="Item Unavailable & Substitution"
      subtitle={`Handling out-of-stock for ${item.productName}`}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Customer Preference Card */}
        <View style={styles.prefCard}>
          <View style={styles.prefHeader}>
            <Ionicons name="information-circle" size={18} color={colors.info} />
            <Text style={styles.prefTitle}>Customer Substitution Preference:</Text>
          </View>
          <Text style={styles.prefValue}>"{customerPreference}"</Text>
          <View style={styles.approvalRow}>
            <Text style={styles.approvalLabel}>Status:</Text>
            <StatusChip status="Pending Review" label="Customer Auto-Approval" size="small" />
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'replace' && styles.tabItemActive]}
            onPress={() => setActiveTab('replace')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="swap-horizontal"
              size={18}
              color={activeTab === 'replace' ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'replace' && styles.tabTextActive]}>
              Replace Item
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'refund' && styles.tabItemActive]}
            onPress={() => setActiveTab('refund')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="cash-outline"
              size={18}
              color={activeTab === 'refund' ? colors.error : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'refund' && styles.tabTextActive]}>
              Remove & Refund
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'call' && styles.tabItemActive]}
            onPress={() => setActiveTab('call')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="call-outline"
              size={18}
              color={activeTab === 'call' ? colors.secondaryDark : colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'call' && styles.tabTextActive]}>
              Call
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: REPLACE ITEM */}
        {activeTab === 'replace' && (
          <View style={styles.tabContent}>
            <AppInput
              placeholder="Search replacement catalog..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              leftAffix={<Ionicons name="search" size={18} color={colors.textMuted} />}
              containerStyle={styles.searchInput}
            />

            <Text style={styles.sectionTitle}>Suggested Matches in {item.category}:</Text>
            {filteredProducts.map((prod) => {
              const isSelected = selectedReplacement?.id === prod.id;
              const priceDiff = prod.sellingPrice - item.unitPrice;
              return (
                <TouchableOpacity
                  key={prod.id}
                  style={[styles.productOption, isSelected && styles.productOptionSelected]}
                  onPress={() => setSelectedReplacement(prod)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: prod.imageUrl }} style={styles.prodImg} />
                  <View style={styles.prodDetails}>
                    <Text style={styles.prodName} numberOfLines={1}>{prod.name}</Text>
                    <Text style={styles.prodPack}>{prod.brand} • {prod.packSize}</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.prodPrice}>₹{prod.sellingPrice}</Text>
                      <Text style={[
                        styles.diffText,
                        { color: priceDiff > 0 ? '#B45309' : priceDiff < 0 ? colors.success : colors.textSecondary }
                      ]}>
                        {priceDiff === 0 ? 'Same price' : priceDiff > 0 ? `+₹${priceDiff} diff` : `-₹${Math.abs(priceDiff)} diff`}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.radioCheck, isSelected && styles.radioCheckSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color={colors.textInverse} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            <AppButton
              title={selectedReplacement ? `Replace with ${selectedReplacement.name}` : 'Select an Item Above'}
              onPress={handleApplyReplace}
              variant="primary"
              disabled={!selectedReplacement}
              style={styles.mainActionBtn}
            />
          </View>
        )}

        {/* TAB 2: REMOVE & REFUND */}
        {activeTab === 'refund' && (
          <View style={styles.tabContent}>
            <View style={styles.refundBox}>
              <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
              <Text style={styles.refundTitle}>Remove & Refund Item</Text>
              <Text style={styles.refundText}>
                Removing <Text style={styles.bold}>{item.quantity}x {item.productName}</Text> will deduct{' '}
                <Text style={styles.bold}>₹{item.unitPrice * item.quantity}</Text> from the customer's total bill and immediately initiate an automated refund.
              </Text>
            </View>

            <AppButton
              title={`Confirm Refund of ₹${item.unitPrice * item.quantity}`}
              onPress={handleApplyRefund}
              variant="danger"
              style={styles.mainActionBtn}
            />
          </View>
        )}

        {/* TAB 3: CALL CUSTOMER */}
        {activeTab === 'call' && (
          <View style={styles.tabContent}>
            <View style={styles.callBox}>
              <View style={styles.callAvatar}>
                <Ionicons name="person" size={28} color={colors.primary} />
              </View>
              <Text style={styles.callPhone}>{customerPhone}</Text>
              <Text style={styles.callSubtext}>
                Ask customer if they prefer a different brand or wish to skip this item before finalizing.
              </Text>
              <AppButton
                title="Dial Customer Now"
                onPress={handleCallCustomer}
                variant="secondary"
                leftIcon={<Ionicons name="call" size={18} color={colors.textInverse} />}
                style={styles.callBtn}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ModalWrapper>
  );
};

const styles = StyleSheet.create({
  prefCard: {
    backgroundColor: colors.infoLight + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  prefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  prefTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.info,
  },
  prefValue: {
    ...typography.bodyMediumBold,
    color: colors.textPrimary,
    fontStyle: 'italic',
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.info + '20',
  },
  approvalLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.md,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tabText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  tabContent: {
    paddingTop: spacing.xs,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  productOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  productOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '30',
  },
  prodImg: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceSecondary,
    marginRight: spacing.md,
  },
  prodDetails: {
    flex: 1,
  },
  prodName: {
    ...typography.bodySmallBold,
    color: colors.textPrimary,
  },
  prodPack: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  prodPrice: {
    ...typography.bodySmallBold,
    color: colors.primaryDark,
  },
  diffText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  radioCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioCheckSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  refundBox: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.errorLight + '20',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error + '30',
    marginBottom: spacing.lg,
  },
  refundTitle: {
    ...typography.h3,
    color: colors.error,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  refundText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  callBox: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  callAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  callPhone: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  callSubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  callBtn: {
    width: '100%',
  },
  mainActionBtn: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
});
