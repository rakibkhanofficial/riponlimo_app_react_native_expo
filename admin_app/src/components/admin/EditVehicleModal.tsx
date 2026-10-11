import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { Car, CarStatus } from '../../types';

interface EditVehicleModalProps {
  visible: boolean;
  vehicle: Car | null;
  onClose: () => void;
  onSave: (carData: Partial<Car>) => void;
  onDelete?: (carId: string) => void;
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({
  visible,
  vehicle,
  onClose,
  onSave,
  onDelete,
}) => {
  const { colors } = useTheme();

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [plateNumber, setPlateNumber] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [rentPrice, setRentPrice] = useState('99');
  const [pricePerMile, setPricePerMile] = useState('4.5');
  const [status, setStatus] = useState<CarStatus>('AVAILABLE');

  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(String(vehicle.year || 2024));
      setPlateNumber(vehicle.plateNumber);
      setCapacity(String(vehicle.capacity || 4));
      setRentPrice(String(vehicle.rentPrice || 99));
      setPricePerMile(String(vehicle.pricePerMile || 4.5));
      setStatus(vehicle.status);
    } else {
      setBrand('');
      setModel('');
      setYear('2024');
      setPlateNumber('');
      setCapacity('4');
      setRentPrice('99');
      setPricePerMile('4.5');
      setStatus('AVAILABLE');
    }
  }, [vehicle, visible]);

  const handleSave = () => {
    if (!brand.trim() || !model.trim() || !plateNumber.trim()) {
      Alert.alert('Required Fields', 'Please enter Brand, Model, and Plate Number.');
      return;
    }
    onSave({
      id: vehicle ? vehicle.id : undefined,
      brand: brand.trim(),
      model: model.trim(),
      name: `${brand.trim()} ${model.trim()}`,
      year: parseInt(year) || 2024,
      plateNumber: plateNumber.trim().toUpperCase(),
      capacity: parseInt(capacity) || 4,
      rentPrice: parseFloat(rentPrice) || 99,
      pricePerMile: parseFloat(pricePerMile) || 4.5,
      status,
    });
  };

  const handleDelete = () => {
    if (!vehicle || !onDelete) return;
    Alert.alert(
      'Remove Vehicle',
      `Are you sure you want to remove ${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber}) from active fleet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete(vehicle.id) },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                {vehicle ? 'Edit Vehicle Details' : 'Add Vehicle to Fleet'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.gold }]}>
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'New Fleet Asset'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Status Selector */}
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>FLEET OPERATIONAL STATUS</Text>
            <View style={styles.statusRow}>
              {(['AVAILABLE', 'MAINTENANCE', 'OUT_OF_SERVICE'] as CarStatus[]).map((st) => {
                const isSelected = status === st;
                let activeColor = colors.success;
                let activeBg = colors.successBg;
                let label = 'Available';
                if (st === 'MAINTENANCE') {
                  activeColor = colors.warning;
                  activeBg = colors.warningBg;
                  label = 'Service';
                } else if (st === 'OUT_OF_SERVICE') {
                  activeColor = colors.danger;
                  activeBg = colors.dangerBg;
                  label = 'Offline';
                }

                return (
                  <TouchableOpacity
                    key={st}
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isSelected ? activeBg : colors.card,
                        borderColor: isSelected ? activeColor : colors.border,
                      },
                    ]}
                    onPress={() => setStatus(st)}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: isSelected ? activeColor : colors.textMuted },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: isSelected ? activeColor : colors.textSecondary },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Brand & Model */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>BRAND / MAKE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="e.g. Cadillac"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>MODEL</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={model}
                  onChangeText={setModel}
                  placeholder="e.g. Escalade ESV"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* License Plate & Year */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1.2 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>LICENSE PLATE #</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholder="RIPON-01"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 0.8 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>YEAR</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Capacity & Pricing */}
            <View style={styles.formRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>PASSENGERS</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>BASE RENT ($)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={rentPrice}
                  onChangeText={setRentPrice}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.textMuted }]}>$/MILE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                  value={pricePerMile}
                  onChangeText={setPricePerMile}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.gold }]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>
                  {vehicle ? 'Save Vehicle Updates' : 'Add Vehicle to Fleet'}
                </Text>
              </TouchableOpacity>

              {vehicle && onDelete && (
                <TouchableOpacity
                  style={[styles.deleteBtn, { borderColor: colors.danger, backgroundColor: colors.dangerBg }]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete Vehicle</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    paddingBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  actionButtons: {
    marginTop: 16,
    gap: 10,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#0B0E14',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
