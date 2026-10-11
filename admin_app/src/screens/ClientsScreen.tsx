import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminApi } from '../services/api';
import { ClientUser } from '../types';

export const ClientsScreen: React.FC = () => {
  const { colors } = useTheme();

  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = useCallback(async () => {
    try {
      const data = await AdminApi.getClients();
      setClients(data);
    } catch {
      // handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClients();
  };

  const makeCall = (phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const filtered = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q))
    );
  });

  const renderClientCard = ({ item }: { item: ClientUser }) => {
    const joinedFormatted = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.left}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated }]}>
              <Ionicons name="person-outline" size={18} color={colors.gold} />
            </View>
            <View>
              <Text style={[styles.clientName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            </View>
          </View>

          <View style={[styles.bookingBadge, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
            <Text style={[styles.bookingCount, { color: colors.gold }]}>
              {item._count?.bookings || 0}
            </Text>
            <Text style={[styles.bookingLabel, { color: colors.gold }]}>RIDES</Text>
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.infoCol}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>JOINED</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{joinedFormatted}</Text>
          </View>

          {item.referralCode && (
            <View style={styles.infoCol}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>REFERRAL CODE</Text>
              <Text style={[styles.infoValue, { color: colors.gold }]}>{item.referralCode}</Text>
            </View>
          )}

          {item.phone && (
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={() => makeCall(item.phone)}
            >
              <Ionicons name="call-outline" size={12} color={colors.gold} />
              <Text style={[styles.callBtnText, { color: colors.text }]}>{item.phone}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Header */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search VIP clients by name, email..."
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>LOADING REGISTERED CLIENTS...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderClientCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Clients Found</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                No users match your query.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '700',
  },
  clientEmail: {
    fontSize: 11,
    marginTop: 1,
  },
  bookingBadge: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  bookingCount: {
    fontSize: 14,
    fontWeight: '800',
  },
  bookingLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  infoCol: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  callBtnText: {
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
