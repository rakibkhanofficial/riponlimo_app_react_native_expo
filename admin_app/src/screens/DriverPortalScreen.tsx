import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { AdminUser } from '../types';

interface DriverPortalScreenProps {
  admin: AdminUser | null;
}

export const DriverPortalScreen: React.FC<DriverPortalScreenProps> = ({ admin }) => {
  const { colors } = useTheme();

  const [isOnline, setIsOnline] = useState(true);
  const [activeJob, setActiveJob] = useState({
    id: 'TRIP-9021',
    passenger: 'Senator William Vance',
    phone: '+1 202 555 0199',
    pickup: 'The St. Regis Hotel, 5th Ave',
    drop: 'Teterboro Private Airport (TEB)',
    vehicle: 'Cadillac Escalade ESV (RIPON-01)',
    flight: 'NetJets NJ-481',
    status: 'EN ROUTE TO PICKUP',
    time: '14:30 EST',
  });

  const toggleOnline = () => {
    setIsOnline(!isOnline);
  };

  const handleUpdateTrip = (nextStatus: string) => {
    Alert.alert('Status Updated', `Chauffeur state transmitted: "${nextStatus}"`);
    setActiveJob({ ...activeJob, status: nextStatus });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header status bar */}
      <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.chauffeurInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons name="car-sport" size={20} color={colors.text} />
          </View>
          <View>
            <Text style={[styles.chauffeurName, { color: colors.text }]}>{admin?.name || 'Executive Chauffeur'}</Text>
            <Text style={[styles.chauffeurRole, { color: colors.textMuted }]}>VIP DISPATCH COCKPIT</Text>
          </View>
        </View>

        <View style={styles.dutyToggle}>
          <Text style={[styles.dutyText, { color: isOnline ? colors.accent : colors.textMuted }]}>
            {isOnline ? 'ON DUTY' : 'STANDBY'}
          </Text>
          <Switch
            value={isOnline}
            onValueChange={toggleOnline}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.buttonText}
          />
        </View>
      </View>

      {/* Active Mission Card */}
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>ACTIVE CHAUFFEUR DISPATCH MISSION</Text>

      <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.missionHeader}>
          <View>
            <Text style={[styles.missionId, { color: colors.textMuted }]}>{activeJob.id}</Text>
            <Text style={[styles.passengerName, { color: colors.text }]}>{activeJob.passenger}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{activeJob.status}</Text>
          </View>
        </View>

        <View style={styles.waypoints}>
          <View style={styles.waypointItem}>
            <Ionicons name="radio-button-on" size={16} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pointLabel, { color: colors.textMuted }]}>PICKUP LOCATION</Text>
              <Text style={[styles.pointVal, { color: colors.text }]}>{activeJob.pickup}</Text>
            </View>
          </View>

          <View style={[styles.connector, { backgroundColor: colors.border }]} />

          <View style={styles.waypointItem}>
            <Ionicons name="location" size={16} color={colors.text} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pointLabel, { color: colors.textMuted }]}>DESTINATION</Text>
              <Text style={[styles.pointVal, { color: colors.text }]}>{activeJob.drop}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.specsRow, { borderTopColor: colors.borderSubtle, borderBottomColor: colors.borderSubtle }]}>
          <View style={styles.specBox}>
            <Text style={[styles.specLabel, { color: colors.textMuted }]}>VEHICLE</Text>
            <Text style={[styles.specVal, { color: colors.text }]}>{activeJob.vehicle}</Text>
          </View>
          <View style={styles.specBox}>
            <Text style={[styles.specLabel, { color: colors.textMuted }]}>FLIGHT / TAIL</Text>
            <Text style={[styles.specVal, { color: colors.text }]}>{activeJob.flight}</Text>
          </View>
        </View>

        {/* Action progression buttons */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => handleUpdateTrip('ARRIVED AT PICKUP')}
          >
            <Ionicons name="checkbox-outline" size={16} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>ARRIVED</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            onPress={() => handleUpdateTrip('PASSENGER ON BOARD')}
          >
            <Ionicons name="people-outline" size={16} color={colors.text} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>ON BOARD</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            onPress={() => handleUpdateTrip('TRIP COMPLETED')}
          >
            <Ionicons name="checkmark-done" size={16} color={colors.buttonText} />
            <Text style={[styles.actionBtnText, { color: colors.buttonText }]}>COMPLETE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety & Protocol notes */}
      <View style={[styles.protocolBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
        <Text style={[styles.protocolText, { color: colors.textSecondary }]}>
          Ripon Limo Chauffeur Standard: Formal black suit attire, ambient temperature 70°F, bottled refreshments pre-stocked, silent acoustic cabin preferred unless client requests audio.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
  },
  chauffeurInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chauffeurName: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chauffeurRole: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  dutyToggle: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dutyText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  missionCard: {
    borderRadius: 4,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  missionId: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  waypoints: {
    gap: 10,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  connector: {
    width: 1,
    height: 14,
    marginLeft: 7,
  },
  pointLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pointVal: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  specBox: {
    flex: 1,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  specVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: 2,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  protocolBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 2,
    borderWidth: 1,
  },
  protocolText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});
