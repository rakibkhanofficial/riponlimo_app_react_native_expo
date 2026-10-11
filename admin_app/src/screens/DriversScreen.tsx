import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminApi } from '../services/api';
import { Driver } from '../types';
import { AddDriverModal } from '../components/admin/AddDriverModal';

export const DriversScreen: React.FC = () => {
  const { colors } = useTheme();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Modal
  const [addModalVisible, setAddModalVisible] = useState(false);

  const fetchDrivers = useCallback(async () => {
    try {
      const data = await AdminApi.getDrivers();
      setDrivers(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDrivers();
  };

  const handleAddDriver = async (driverData: { name: string; email: string; phone: string; password?: string }) => {
    setAddModalVisible(false);
    await AdminApi.createDriver(driverData);
    Alert.alert('Chauffeur Added', `${driverData.name} has been enrolled in the dispatch roster.`);
    fetchDrivers();
  };

  const makeCall = (phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const makeSms = (phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`sms:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const filteredDrivers = drivers.filter(d => {
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      (d.phone && d.phone.toLowerCase().includes(q))
    );
  });

  const availableCount = drivers.filter(d => (d.activeTrips || 0) === 0).length;
  const onTripCount = drivers.filter(d => (d.activeTrips || 0) > 0).length;

  const renderDriverCard = ({ item }: { item: Driver }) => {
    const isOnTrip = (item.activeTrips || 0) > 0;
    const statusColor = isOnTrip ? colors.warning : colors.success;
    const statusBg = isOnTrip ? colors.warningBg : colors.successBg;

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <View style={[styles.avatar, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
              <Ionicons name="person" size={20} color={colors.gold} />
            </View>
            <View>
              <Text style={[styles.driverName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.driverEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isOnTrip ? `${item.activeTrips} ON TRIP` : 'AVAILABLE'}
            </Text>
          </View>
        </View>

        {/* Chauffeur details & actions */}
        <View style={[styles.cardBottom, { borderTopColor: colors.border }]}>
          <View style={styles.phoneCol}>
            <Ionicons name="call-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.phoneText, { color: colors.text }]}>{item.phone || 'No phone recorded'}</Text>
          </View>

          {item.phone && (
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}
                onPress={() => makeCall(item.phone)}
              >
                <Ionicons name="call" size={12} color={colors.gold} />
                <Text style={[styles.contactBtnText, { color: colors.gold }]}>Direct Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
                onPress={() => makeSms(item.phone)}
              >
                <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
                <Text style={[styles.contactBtnText, { color: colors.textSecondary }]}>SMS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Overview Stat Bar */}
      <View style={[styles.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.text }]}>{drivers.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>ROSTER</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.success }]}>{availableCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>AVAILABLE</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statPill}>
          <Text style={[styles.statNum, { color: colors.warning }]}>{onTripCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>ON TRIP</Text>
        </View>
      </View>

      {/* Action Header */}
      <View style={styles.actionHeader}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search chauffeur name or email..."
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.gold }]}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="person-add" size={16} color="#0B0E14" />
          <Text style={styles.addBtnText}>Enroll</Text>
        </TouchableOpacity>
      </View>

      {/* Roster List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>LOADING CHAUFFEUR ROSTER...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDrivers}
          keyExtractor={(item) => item.id}
          renderItem={renderDriverCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Chauffeurs Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {searchQuery ? 'No drivers match query.' : 'Enroll your first professional chauffeur.'}
              </Text>
            </View>
          }
        />
      )}

      {/* Add Chauffeur Modal */}
      <AddDriverModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={handleAddDriver}
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
    gap: 5,
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
    gap: 12,
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 14,
    fontWeight: '700',
  },
  driverEmail: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  phoneCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  contactBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
