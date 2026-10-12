import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminApi } from '../services/api';
import { Coupon } from '../types';

export const CouponsScreen: React.FC = () => {
  const { colors } = useTheme();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountVal, setDiscountVal] = useState('');
  const [minOrderVal, setMinOrderVal] = useState('');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCoupons = useCallback(async () => {
    try {
      const data = await AdminApi.getCoupons();
      setCoupons(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCoupons();
  };

  const openAddModal = () => {
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountVal('');
    setMinOrderVal('');
    setValidUntil('2026-12-31');
    setUsageLimit('');
    setModalVisible(true);
  };

  const handleCreateCoupon = async () => {
    if (!code.trim() || !discountVal.trim()) {
      Alert.alert('Required Fields', 'Promo code and discount value are required.');
      return;
    }

    setSaving(true);
    try {
      await AdminApi.createCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountVal: parseFloat(discountVal) || 0,
        minOrderVal: minOrderVal.trim() ? parseFloat(minOrderVal) : undefined,
        validUntil: new Date(validUntil).toISOString(),
        usageLimit: usageLimit.trim() ? parseInt(usageLimit) : undefined,
      });
      Alert.alert('Coupon Created', `Promo Code ${code.trim().toUpperCase()} is now live.`);
      setModalVisible(false);
      fetchCoupons();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (coupon: Coupon) => {
    Alert.alert(
      'Revoke Coupon',
      `Delete promotional discount code "${coupon.code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            await AdminApi.deleteCoupon(coupon.id);
            fetchCoupons();
          },
        },
      ]
    );
  };

  const filteredCoupons = coupons.filter(c => {
    const q = searchQuery.toLowerCase();
    return c.code.toLowerCase().includes(q);
  });

  const renderCouponCard = ({ item }: { item: Coupon }) => {
    const isExpired = new Date(item.validUntil).getTime() < Date.now();
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.codeRow}>
            <View style={[styles.tagIcon, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Ionicons name="pricetag-outline" size={16} color={colors.text} />
            </View>
            <View>
              <Text style={[styles.codeText, { color: colors.text }]}>{item.code}</Text>
              <Text style={[styles.discountText, { color: colors.accent }]}>
                {item.discountType === 'PERCENTAGE' ? `${item.discountVal}% OFF` : `$${item.discountVal} OFF FLAT`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MIN SPEND</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {item.minOrderVal ? `$${item.minOrderVal}` : 'None'}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>EXPIRATION</Text>
            <Text style={[styles.metricValue, { color: isExpired ? colors.danger : colors.text }]}>
              {new Date(item.validUntil).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>REDEMPTIONS</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {item.usedCount || 0} / {item.usageLimit || '∞'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search coupon code..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
          />
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.buttonText} />
          <Text style={[styles.addBtnText, { color: colors.buttonText }]}>NEW CODE</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>LOADING PROMOTIONS...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCoupons}
          keyExtractor={item => item.id}
          renderItem={renderCouponCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="ticket-outline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Promo Coupons</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Create VIP client discount vouchers and campaign codes above.
              </Text>
            </View>
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>CREATE PROMO COUPON</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  EXCLUSIVE CLIENT PRIVILEGE CODE
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>COUPON CODE *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. VIPSUMMER, ELITE25"
                  placeholderTextColor={colors.textMuted}
                  value={code}
                  onChangeText={setCode}
                  autoCapitalize="characters"
                />
              </View>

              {/* Discount Type Selector */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DISCOUNT MECHANISM</Text>
                <View style={styles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      { borderColor: discountType === 'PERCENTAGE' ? colors.primary : colors.border },
                      discountType === 'PERCENTAGE' && { backgroundColor: colors.surfaceElevated },
                    ]}
                    onPress={() => setDiscountType('PERCENTAGE')}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        { color: discountType === 'PERCENTAGE' ? colors.text : colors.textMuted },
                      ]}
                    >
                      % PERCENTAGE
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeBtn,
                      { borderColor: discountType === 'FIXED' ? colors.primary : colors.border },
                      discountType === 'FIXED' && { backgroundColor: colors.surfaceElevated },
                    ]}
                    onPress={() => setDiscountType('FIXED')}
                  >
                    <Text
                      style={[
                        styles.typeBtnText,
                        { color: discountType === 'FIXED' ? colors.text : colors.textMuted },
                      ]}
                    >
                      $ FLAT DOLLAR
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
                    {discountType === 'PERCENTAGE' ? 'DISCOUNT (%) *' : 'DISCOUNT ($) *'}
                  </Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder={discountType === 'PERCENTAGE' ? '15' : '50'}
                    placeholderTextColor={colors.textMuted}
                    value={discountVal}
                    onChangeText={setDiscountVal}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>MIN ORDER ($)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="100"
                    placeholderTextColor={colors.textMuted}
                    value={minOrderVal}
                    onChangeText={setMinOrderVal}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>VALID UNTIL</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textMuted}
                    value={validUntil}
                    onChangeText={setValidUntil}
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>USAGE LIMIT</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g. 100"
                    placeholderTextColor={colors.textMuted}
                    value={usageLimit}
                    onChangeText={setUsageLimit}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateCoupon}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.buttonText} />
                ) : (
                  <Text style={[styles.saveBtnText, { color: colors.buttonText }]}>PUBLISH COUPON</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 2,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 2,
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tagIcon: {
    width: 36,
    height: 36,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 4,
    borderWidth: 1,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    height: 40,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  saveBtn: {
    height: 46,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
