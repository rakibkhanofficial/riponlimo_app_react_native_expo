import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminApi } from '../services/api';
import { Car, CarStatus } from '../types';
import { EditVehicleModal } from '../components/admin/EditVehicleModal';

// Local vehicle asset mapping
const LOCAL_CAR_IMAGES: Record<string, any> = {
  'cadillac-escalade.png': require('../../assets/cars/cadillac-escalade.png'),
  'gmc-yukon.png': require('../../assets/cars/gmc-yukon.png'),
  'chevy-suburban.png': require('../../assets/cars/chevy-suburban.png'),
  'mercedes-s-class.png': require('../../assets/cars/mercedes-s-class.png'),
  'lincoln-mkt.png': require('../../assets/cars/lincoln-mkt.png'),
  'cadillac-ct5.png': require('../../assets/cars/cadillac-ct5.png'),
};

const resolveCarImage = (imagePath?: string) => {
  if (!imagePath) return LOCAL_CAR_IMAGES['cadillac-escalade.png'];
  const filename = imagePath.split('/').pop()?.replace('.jpg', '.png') || '';
  if (LOCAL_CAR_IMAGES[filename]) return LOCAL_CAR_IMAGES[filename];
  if (imagePath.startsWith('http')) return { uri: imagePath };
  return LOCAL_CAR_IMAGES['cadillac-escalade.png'];
};

export const FleetScreen: React.FC = () => {
  const { colors } = useTheme();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      const data = await AdminApi.getCars();
      setCars(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCars();
  };

  const handleOpenAdd = () => {
    setEditingCar(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setModalVisible(true);
  };

  const handleSaveCar = async (carData: Partial<Car>) => {
    setModalVisible(false);
    if (carData.id) {
      await AdminApi.updateCar(carData.id, carData);
    } else {
      await AdminApi.createCar(carData);
    }
    fetchCars();
  };

  const handleDeleteCar = async (carId: string) => {
    setModalVisible(false);
    await AdminApi.deleteCar(carId);
    fetchCars();
  };

  const handleQuickStatusToggle = async (car: Car) => {
    let nextStatus: CarStatus = 'AVAILABLE';
    if (car.status === 'AVAILABLE') nextStatus = 'MAINTENANCE';
    else if (car.status === 'MAINTENANCE') nextStatus = 'OUT_OF_SERVICE';
    else nextStatus = 'AVAILABLE';

    await AdminApi.updateCar(car.id, { status: nextStatus });
    fetchCars();
  };

  const filteredCars = cars.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.brand.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      c.plateNumber.toLowerCase().includes(q)
    );
  });

  const availableCount = cars.filter(c => c.status === 'AVAILABLE').length;
  const maintenanceCount = cars.filter(c => c.status === 'MAINTENANCE').length;
  const offlineCount = cars.filter(c => c.status === 'OUT_OF_SERVICE').length;

  const renderCarCard = ({ item }: { item: Car }) => {
    const isAvail = item.status === 'AVAILABLE';
    const isMaint = item.status === 'MAINTENANCE';

    let statusColor = colors.success;
    let statusBg = colors.successBg;
    let statusLabel = 'AVAILABLE';
    if (isMaint) {
      statusColor = colors.warning;
      statusBg = colors.warningBg;
      statusLabel = 'MAINTENANCE';
    } else if (item.status === 'OUT_OF_SERVICE') {
      statusColor = colors.danger;
      statusBg = colors.dangerBg;
      statusLabel = 'OFFLINE';
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Car Image Banner */}
        <View style={styles.imageContainer}>
          <Image
            source={resolveCarImage(item.images?.[0])}
            style={styles.carImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlayTop}>
            <View style={[styles.plateBadge, { backgroundColor: 'rgba(11,14,20,0.85)', borderColor: colors.gold }]}>
              <Text style={[styles.plateText, { color: colors.gold }]}>{item.plateNumber}</Text>
            </View>

            <TouchableOpacity
              style={[styles.statusBadge, { backgroundColor: statusBg, borderColor: statusColor }]}
              onPress={() => handleQuickStatusToggle(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
              <Ionicons name="sync-outline" size={10} color={statusColor} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.carName, { color: colors.text }]}>
                {item.brand} {item.model}
              </Text>
              <Text style={[styles.carCategory, { color: colors.textSecondary }]}>
                {item.category?.name || 'Executive Luxury'} • {item.year}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.editIconBtn, { borderColor: colors.border }]}
              onPress={() => handleOpenEdit(item)}
            >
              <Ionicons name="create-outline" size={16} color={colors.gold} />
            </TouchableOpacity>
          </View>

          {/* Specs & Rates */}
          <View style={[styles.specsRow, { borderTopColor: colors.border }]}>
            <View style={styles.specItem}>
              <Ionicons name="people-outline" size={14} color={colors.gold} />
              <Text style={[styles.specText, { color: colors.textSecondary }]}>
                {item.capacity} Passengers
              </Text>
            </View>

            <View style={styles.specItem}>
              <Ionicons name="pricetag-outline" size={14} color={colors.gold} />
              <Text style={[styles.specText, { color: colors.textSecondary }]}>
                ${item.rentPrice}/base
              </Text>
            </View>

            <View style={styles.specItem}>
              <Ionicons name="speedometer-outline" size={14} color={colors.gold} />
              <Text style={[styles.specText, { color: colors.textSecondary }]}>
                ${item.pricePerMile || 4.5}/mi
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fleet Stats Overview Bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.text }]}>{cars.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>TOTAL</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.success }]}>{availableCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>READY</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.warning }]}>{maintenanceCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>SERVICE</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.danger }]}>{offlineCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>OFFLINE</Text>
        </View>
      </View>

      {/* Search & Add Action Header */}
      <View style={styles.actionHeader}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search make, model, plate..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.gold }]}
          onPress={handleOpenAdd}
        >
          <Ionicons name="add" size={18} color="#0B0E14" />
          <Text style={styles.addBtnText}>Add Car</Text>
        </TouchableOpacity>
      </View>

      {/* Fleet List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>LOADING LUXURY FLEET...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item.id}
          renderItem={renderCarCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Vehicles Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {searchQuery ? 'No cars match search query.' : 'Add your first vehicle asset to the fleet.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Edit / Add Modal */}
      <EditVehicleModal
        visible={modalVisible}
        vehicle={editingCar}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCar}
        onDelete={handleDeleteCar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  statPill: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(150,150,150,0.2)',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#0B0E14',
    fontSize: 13,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  plateText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: '700',
  },
  carCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  editIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
  },
});
