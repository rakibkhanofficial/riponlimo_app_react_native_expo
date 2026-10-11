import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminApi } from '../services/api';
import { AnalyticsData } from '../types';
import { RevenueChart } from '../components/common/RevenueChart';

interface DashboardScreenProps {
  onNavigateToBookings: (filter?: string) => void;
  onNavigateToFleet: () => void;
  onNavigateToDrivers: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToBookings,
  onNavigateToFleet,
  onNavigateToDrivers,
}) => {
  const { colors } = useTheme();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await AdminApi.getAnalytics();
      setAnalytics(data);
    } catch {
      // handled in service
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading && !analytics) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.gold} size="large" />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>LOADING EXECUTIVE ANALYTICS...</Text>
      </View>
    );
  }

  const statCards = [
    {
      title: 'TOTAL REVENUE',
      value: `$${(analytics?.revenue.total || 0).toLocaleString()}`,
      sub: 'All time completed bookings',
      icon: 'cash-outline',
      color: colors.gold,
      onPress: () => onNavigateToBookings('COMPLETED'),
    },
    {
      title: 'TOTAL BOOKINGS',
      value: String(analytics?.bookings.total || 0),
      sub: `${analytics?.bookings.pending || 0} awaiting dispatch`,
      icon: 'calendar-outline',
      color: colors.info,
      onPress: () => onNavigateToBookings('ALL'),
    },
    {
      title: 'ACTIVE FLEET',
      value: `${analytics?.cars.available || 0} / ${analytics?.cars.total || 0}`,
      sub: 'Vehicles ready for service',
      icon: 'car-sport-outline',
      color: colors.success,
      onPress: onNavigateToFleet,
    },
    {
      title: 'CHAUFFEURS',
      value: String(analytics?.users.drivers || 0),
      sub: `${analytics?.users.total || 0} registered users`,
      icon: 'people-outline',
      color: colors.purple,
      onPress: onNavigateToDrivers,
    },
  ];

  const totalBookings = analytics?.bookings.total || 1;
  const statuses = [
    { label: 'Pending', count: analytics?.bookings.pending || 0, color: colors.warning, filter: 'PENDING' },
    { label: 'Confirmed', count: analytics?.bookings.confirmed || 0, color: colors.info, filter: 'CONFIRMED' },
    { label: 'Completed', count: analytics?.bookings.completed || 0, color: colors.success, filter: 'COMPLETED' },
    { label: 'Cancelled', count: analytics?.bookings.cancelled || 0, color: colors.danger, filter: 'CANCELLED' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Pending Dispatch Action Banner */}
      {(analytics?.bookings.pending || 0) > 0 && (
        <TouchableOpacity
          style={[styles.alertBanner, { backgroundColor: colors.warningBg, borderColor: colors.warning }]}
          onPress={() => onNavigateToBookings('PENDING')}
          activeOpacity={0.8}
        >
          <View style={styles.alertLeft}>
            <Ionicons name="alert-circle" size={20} color={colors.warning} />
            <View>
              <Text style={[styles.alertTitle, { color: colors.warning }]}>
                {analytics?.bookings.pending} PENDING RESERVATION{(analytics?.bookings.pending || 0) > 1 ? 'S' : ''}
              </Text>
              <Text style={[styles.alertSub, { color: colors.textSecondary }]}>
                Requires immediate chauffeur assignment or confirmation
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={16} color={colors.warning} />
        </TouchableOpacity>
      )}

      {/* 4 Stat Cards */}
      <View style={styles.statsGrid}>
        {statCards.map((c) => (
          <TouchableOpacity
            key={c.title}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={c.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.statHeader}>
              <Text style={[styles.statTitle, { color: colors.textMuted }]}>{c.title}</Text>
              <Ionicons name={c.icon as any} size={18} color={c.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{c.value}</Text>
            <Text style={[styles.statSub, { color: colors.textSecondary }]} numberOfLines={1}>
              {c.sub}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 7-Day Revenue Bar Chart */}
      {analytics && <RevenueChart data={analytics.revenueChart} />}

      {/* Booking Status Distribution */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BOOKING STATUS PIPELINE</Text>
          <TouchableOpacity onPress={() => onNavigateToBookings('ALL')}>
            <Text style={[styles.sectionLink, { color: colors.gold }]}>View All ({totalBookings})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusList}>
          {statuses.map((st) => {
            const pct = Math.round((st.count / totalBookings) * 100);
            return (
              <TouchableOpacity
                key={st.label}
                style={styles.statusRow}
                onPress={() => onNavigateToBookings(st.filter)}
              >
                <View style={styles.statusLabelCol}>
                  <View style={[styles.statusDot, { backgroundColor: st.color }]} />
                  <Text style={[styles.statusName, { color: colors.text }]}>{st.label}</Text>
                </View>

                <View style={styles.progressBarWrapper}>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceElevated }]}>
                    <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: st.color }]} />
                  </View>
                </View>

                <View style={styles.statusCountCol}>
                  <Text style={[styles.statusCount, { color: colors.text }]}>{st.count}</Text>
                  <Text style={[styles.statusPct, { color: colors.textMuted }]}>({pct}%)</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Business Insights & Growth */}
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>BUSINESS INSIGHTS & FORECAST</Text>
        <View style={styles.insightsGrid}>
          <View style={[styles.insightItem, { borderColor: colors.border }]}>
            <Text style={[styles.insightLabel, { color: colors.textMuted }]}>MOM GROWTH</Text>
            <Text style={[styles.insightValue, { color: colors.success }]}>
              {analytics?.insights.growth || '+14.5%'}
            </Text>
          </View>
          <View style={[styles.insightItem, { borderColor: colors.border }]}>
            <Text style={[styles.insightLabel, { color: colors.textMuted }]}>DEMAND PROBABILITY</Text>
            <Text style={[styles.insightValue, { color: colors.gold }]}>
              {analytics?.insights.upcomingProbability || 'High (85%)'}
            </Text>
          </View>
          <View style={[styles.insightItem, { borderColor: colors.border }]}>
            <Text style={[styles.insightLabel, { color: colors.textMuted }]}>TOP SERVICE</Text>
            <Text style={[styles.insightValue, { color: colors.text }]} numberOfLines={1}>
              {analytics?.insights.topService || 'Airport Transfer'}
            </Text>
          </View>
          <View style={[styles.insightItem, { borderColor: colors.border }]}>
            <Text style={[styles.insightLabel, { color: colors.textMuted }]}>RETENTION RATE</Text>
            <Text style={[styles.insightValue, { color: colors.info }]}>
              {analytics?.insights.retentionRate || '68%'}
            </Text>
          </View>
        </View>

        {/* AI Forecast Banner */}
        <View style={[styles.forecastBox, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
          <Ionicons name="trending-up-outline" size={18} color={colors.gold} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.forecastLabel, { color: colors.gold }]}>EXECUTIVE FORECAST</Text>
            <Text style={[styles.forecastText, { color: colors.textSecondary }]}>
              {analytics?.insights.forecast || 'Expected surge in reservations during next week.'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
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
    letterSpacing: 1.5,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  alertSub: {
    fontSize: 11,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  statSub: {
    fontSize: 10,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionLink: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusList: {
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 90,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusName: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusCountCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 60,
    justifyContent: 'flex-end',
  },
  statusCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPct: {
    fontSize: 10,
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  insightItem: {
    width: '48%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  insightLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  forecastBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  forecastLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  forecastText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
