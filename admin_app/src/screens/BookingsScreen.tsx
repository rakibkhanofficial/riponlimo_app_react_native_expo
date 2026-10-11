import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminApi } from '../services/api';
import { Booking, BookingStatus, Driver } from '../types';
import { AssignDriverModal } from '../components/admin/AssignDriverModal';

interface BookingsScreenProps {
  initialFilter?: string;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ initialFilter = 'ALL' }) => {
  const { colors } = useTheme();

  const [filter, setFilter] = useState<string>(initialFilter);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Assignment Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const [bkList, drvList] = await Promise.all([
        AdminApi.getBookings(filter),
        AdminApi.getDrivers(),
      ]);
      setBookings(bkList);
      setDrivers(drvList);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    Alert.alert(
      'Update Reservation Status',
      `Change order status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await AdminApi.updateBooking(bookingId, { status: newStatus });
            fetchBookings();
          },
        },
      ]
    );
  };

  const openAssignModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setAssignModalVisible(true);
  };

  const handleAssignDriver = async (bookingId: string, driverId: string | null) => {
    setAssignLoading(true);
    await AdminApi.updateBooking(bookingId, {
      driverId,
      status: driverId ? 'CONFIRMED' : 'PENDING',
    });
    setAssignLoading(false);
    setAssignModalVisible(false);
    fetchBookings();
  };

  const makeCall = (phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const makeSms = (phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`sms:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const filterTabs = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return { text: colors.warning, bg: colors.warningBg };
      case 'CONFIRMED':
        return { text: colors.info, bg: colors.infoBg };
      case 'IN_PROGRESS':
        return { text: colors.purple, bg: colors.purpleBg };
      case 'COMPLETED':
        return { text: colors.success, bg: colors.successBg };
      case 'CANCELLED':
        return { text: colors.danger, bg: colors.dangerBg };
      default:
        return { text: colors.textSecondary, bg: colors.surfaceElevated };
    }
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusTheme = getStatusColor(item.status);
    const shortId = item.id.slice(-6).toUpperCase();
    const dateFormatted = new Date(item.pickupTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Top Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.orderId, { color: colors.gold }]}>RESERVATION #{shortId}</Text>
            <Text style={[styles.dateTime, { color: colors.text }]}>{dateFormatted}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusTheme.bg }]}>
            <Text style={[styles.statusText, { color: statusTheme.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Passenger & Vehicle */}
        <View style={[styles.metaSection, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>CLIENT PASSENGER</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>{item.user?.name || 'Private VIP'}</Text>
              {item.user?.phone && (
                <View style={styles.contactRow}>
                  <TouchableOpacity onPress={() => makeCall(item.user?.phone)} style={styles.contactChip}>
                    <Ionicons name="call-outline" size={12} color={colors.gold} />
                    <Text style={[styles.contactText, { color: colors.gold }]}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => makeSms(item.user?.phone)} style={styles.contactChip}>
                    <Ionicons name="chatbubble-outline" size={12} color={colors.textSecondary} />
                    <Text style={[styles.contactText, { color: colors.textSecondary }]}>SMS</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <View style={[styles.metaCol, { alignItems: 'flex-end' }]}>
              <Text style={[styles.metaLabel, { color: colors.textMuted }]}>ASSIGNED VEHICLE</Text>
              <Text style={[styles.metaValue, { color: colors.text }]}>
                {item.car?.brand} {item.car?.model}
              </Text>
              <Text style={[styles.plateNumber, { color: colors.gold }]}>
                {item.car?.plateNumber || 'FLEET'}
              </Text>
            </View>
          </View>
        </View>

        {/* Locations */}
        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <View style={[styles.routeIcon, { backgroundColor: 'rgba(212, 175, 55, 0.2)' }]}>
              <Ionicons name="location" size={12} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeLabel, { color: colors.textMuted }]}>PICKUP LOCATION</Text>
              <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={2}>
                {item.pickupLocation}
              </Text>
            </View>
          </View>

          {item.dropLocation && (
            <View style={styles.routeItem}>
              <View style={[styles.routeIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="flag" size={12} color={colors.info} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.routeLabel, { color: colors.textMuted }]}>DESTINATION</Text>
                <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={2}>
                  {item.dropLocation}
                </Text>
              </View>
            </View>
          )}

          {/* Airport Flight Info */}
          {item.flightNumber && (
            <View style={[styles.flightBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Ionicons name="airplane-outline" size={14} color={colors.gold} />
              <Text style={[styles.flightText, { color: colors.text }]}>
                {item.flightName || 'Flight'}: {item.flightNumber}
              </Text>
              {item.meetAndGreet && (
                <View style={[styles.greetBadge, { backgroundColor: colors.goldBg }]}>
                  <Text style={[styles.greetText, { color: colors.gold }]}>Meet & Greet</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Chauffeur Assignment Status */}
        <View style={[styles.chauffeurSection, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <View style={styles.chauffeurInfo}>
            <Ionicons
              name={item.driver ? 'person-circle' : 'alert-circle-outline'}
              size={22}
              color={item.driver ? colors.success : colors.warning}
            />
            <View>
              <Text style={[styles.chauffeurLabel, { color: colors.textMuted }]}>CHAUFFEUR</Text>
              <Text style={[styles.chauffeurName, { color: colors.text }]}>
                {item.driver ? item.driver.name : 'Unassigned (Open Dispatch)'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.assignActionBtn, { borderColor: colors.gold, backgroundColor: colors.goldBg }]}
            onPress={() => openAssignModal(item)}
          >
            <Ionicons name="swap-horizontal" size={14} color={colors.gold} />
            <Text style={[styles.assignActionText, { color: colors.gold }]}>
              {item.driver ? 'Reassign' : 'Assign'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fare & Quick Actions */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={[styles.fareLabel, { color: colors.textMuted }]}>TOTAL FARE</Text>
            <View style={styles.fareRow}>
              <Text style={[styles.fareAmount, { color: colors.text }]}>
                ${item.totalAmount?.toLocaleString() || '0.00'}
              </Text>
              <View
                style={[
                  styles.paymentPill,
                  {
                    backgroundColor: item.paymentStatus === 'PAID' ? colors.successBg : colors.warningBg,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.paymentText,
                    {
                      color: item.paymentStatus === 'PAID' ? colors.success : colors.warning,
                    },
                  ]}
                >
                  {item.paymentStatus}
                </Text>
              </View>
            </View>
          </View>

          {/* Status Progression Buttons */}
          <View style={styles.actionButtons}>
            {item.status === 'PENDING' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.info }]}
                onPress={() => handleStatusChange(item.id, 'CONFIRMED')}
              >
                <Text style={styles.actionBtnText}>Confirm</Text>
              </TouchableOpacity>
            )}
            {item.status === 'CONFIRMED' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.purple }]}
                onPress={() => handleStatusChange(item.id, 'IN_PROGRESS')}
              >
                <Text style={styles.actionBtnText}>Dispatch</Text>
              </TouchableOpacity>
            )}
            {item.status === 'IN_PROGRESS' && (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.success }]}
                onPress={() => handleStatusChange(item.id, 'COMPLETED')}
              >
                <Text style={styles.actionBtnText}>Complete</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && (
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => handleStatusChange(item.id, 'CANCELLED')}
              >
                <Text style={[styles.cancelText, { color: colors.danger }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.tabsWrapper, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {filterTabs.map((t) => {
            const isSelected = filter === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[
                  styles.tabBtn,
                  isSelected && [styles.tabBtnActive, { borderBottomColor: colors.gold }],
                ]}
                onPress={() => setFilter(t.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    { color: isSelected ? colors.gold : colors.textSecondary },
                    isSelected && styles.tabTextActive,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookings List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>LOADING RESERVATIONS...</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Reservations Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No bookings match filter "{filter}".
              </Text>
            </View>
          }
        />
      )}

      {/* Assign Driver Modal */}
      <AssignDriverModal
        visible={assignModalVisible}
        booking={selectedBooking}
        drivers={drivers}
        loading={assignLoading}
        onClose={() => setAssignModalVisible(false)}
        onAssign={handleAssignDriver}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsWrapper: {
    borderBottomWidth: 1,
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {},
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
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
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  dateTime: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 10,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  plateNumber: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(150,150,150,0.1)',
  },
  contactText: {
    fontSize: 10,
    fontWeight: '700',
  },
  routeSection: {
    gap: 8,
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  routeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  routeLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  routeText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  flightBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  flightText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  greetBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  greetText: {
    fontSize: 9,
    fontWeight: '800',
  },
  chauffeurSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  chauffeurInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  chauffeurLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chauffeurName: {
    fontSize: 12,
    fontWeight: '700',
  },
  assignActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  assignActionText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  fareLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  fareAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  paymentPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  paymentText: {
    fontSize: 9,
    fontWeight: '800',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  cancelText: {
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
