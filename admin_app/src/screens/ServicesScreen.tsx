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
import { ServiceType } from '../types';

export const ServicesScreen: React.FC = () => {
  const { colors } = useTheme();

  const [services, setServices] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const data = await AdminApi.getServices();
      setServices(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const openAddModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setBasePrice('');
    setPricePerUnit('');
    setModalVisible(true);
  };

  const openEditModal = (service: ServiceType) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setBasePrice(String(service.basePrice));
    setPricePerUnit(service.pricePerUnit ? String(service.pricePerUnit) : '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !basePrice.trim()) {
      Alert.alert('Required Fields', 'Please enter a service name and base rate.');
      return;
    }

    setSaving(true);
    try {
      if (editingService) {
        await AdminApi.updateService(editingService.id, {
          name: name.trim(),
          description: description.trim(),
          basePrice: parseFloat(basePrice) || 0,
          pricePerUnit: pricePerUnit.trim() ? parseFloat(pricePerUnit) : null,
        });
        Alert.alert('Service Updated', `"${name.trim()}" has been updated.`);
      } else {
        await AdminApi.createService({
          name: name.trim(),
          description: description.trim(),
          basePrice: parseFloat(basePrice) || 0,
          pricePerUnit: pricePerUnit.trim() ? parseFloat(pricePerUnit) : undefined,
        });
        Alert.alert('Service Created', `"${name.trim()}" has been added to services catalog.`);
      }
      setModalVisible(false);
      fetchServices();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (service: ServiceType) => {
    Alert.alert(
      'Delete Service Type',
      `Are you sure you want to remove "${service.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await AdminApi.deleteService(service.id);
            fetchServices();
          },
        },
      ]
    );
  };

  const filteredServices = services.filter(s => {
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  const renderServiceCard = ({ item }: { item: ServiceType }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons name="briefcase-outline" size={18} color={colors.text} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.serviceName, { color: colors.text }]}>{item.name}</Text>
            {item.description ? (
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => openEditModal(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={14} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.dangerBg, borderColor: colors.danger }]}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.rateBox}>
          <Text style={[styles.rateLabel, { color: colors.textMuted }]}>BASE RATE</Text>
          <Text style={[styles.rateValue, { color: colors.text }]}>${item.basePrice.toFixed(2)}</Text>
        </View>
        <View style={styles.rateBox}>
          <Text style={[styles.rateLabel, { color: colors.textMuted }]}>PER MILE / HR</Text>
          <Text style={[styles.rateValue, { color: colors.text }]}>
            {item.pricePerUnit ? `$${item.pricePerUnit.toFixed(2)}` : 'Standard'}
          </Text>
        </View>
        <View style={styles.rateBox}>
          <Text style={[styles.rateLabel, { color: colors.textMuted }]}>TOTAL BOOKINGS</Text>
          <Text style={[styles.rateValue, { color: colors.text }]}>{item._count?.bookings || 0}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Controls */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search service types..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAddModal}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={colors.buttonText} />
          <Text style={[styles.addBtnText, { color: colors.buttonText }]}>NEW SERVICE</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>LOADING SERVICES...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={item => item.id}
          renderItem={renderServiceCard}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="briefcase-outline" size={44} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Services Found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                {searchQuery ? 'Try altering your search keywords.' : 'Add your first service tier using the button above.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {editingService ? 'EDIT SERVICE' : 'ADD NEW SERVICE'}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  CONFIG TARIFF & TRIP TYPE
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>SERVICE NAME *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. Airport Transfer, Hourly Chauffeur"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>DESCRIPTION</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Brief overview of features, inclusions and guidelines..."
                  placeholderTextColor={colors.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.rowFields}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>BASE FARE ($) *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="150"
                    placeholderTextColor={colors.textMuted}
                    value={basePrice}
                    onChangeText={setBasePrice}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>PER UNIT / MILE ($)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="5.50"
                    placeholderTextColor={colors.textMuted}
                    value={pricePerUnit}
                    onChangeText={setPricePerUnit}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.8}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.buttonText} />
                ) : (
                  <Text style={[styles.saveBtnText, { color: colors.buttonText }]}>
                    {editingService ? 'SAVE CHANGES' : 'CREATE SERVICE'}
                  </Text>
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
    alignItems: 'flex-start',
    gap: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  serviceDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 30,
    height: 30,
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
  rateBox: {
    flex: 1,
  },
  rateLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  rateValue: {
    fontSize: 14,
    fontWeight: '800',
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
  textArea: {
    height: 72,
    paddingTop: 10,
    textAlignVertical: 'top',
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
