import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { AdminUser } from '../../types';

export type AdminRoute =
  | 'dashboard'
  | 'bookings'
  | 'fleet'
  | 'services'
  | 'coupons'
  | 'drivers'
  | 'clients'
  | 'driver_portal'
  | 'settings';

interface AdminSidebarProps {
  visible: boolean;
  onClose: () => void;
  activeRoute: AdminRoute;
  onRouteChange: (route: AdminRoute) => void;
  admin: AdminUser | null;
  onLogout: () => void;
  pendingBadges?: {
    bookings?: number;
  };
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, width * 0.82);

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  visible,
  onClose,
  activeRoute,
  onRouteChange,
  admin,
  onLogout,
  pendingBadges,
}) => {
  const { colors, mode, toggleTheme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayAnim]);

  if (!visible && slideAnim === undefined) return null;

  const handleSelect = (route: AdminRoute) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    onRouteChange(route);
    onClose();
  };

  const navItems: {
    key: AdminRoute;
    label: string;
    icon: any;
    roles?: string[];
    badge?: number;
  }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
    { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', badge: pendingBadges?.bookings },
    { key: 'fleet', label: 'Fleet & Cars', icon: 'car-sport-outline' },
    { key: 'services', label: 'Services', icon: 'briefcase-outline' },
    { key: 'coupons', label: 'Coupons', icon: 'ticket-outline' },
    { key: 'drivers', label: 'Chauffeurs', icon: 'people-outline' },
    { key: 'clients', label: 'Users & Clients', icon: 'person-outline' },
    { key: 'driver_portal', label: 'Driver Portal', icon: 'navigate-outline' },
    { key: 'settings', label: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Dimmed backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: overlayAnim,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Container */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: SIDEBAR_WIDTH,
            backgroundColor: colors.card,
            borderRightColor: colors.border,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Brand Header */}
        <View style={[styles.header, { borderBottomColor: colors.borderSubtle }]}>
          <View style={styles.brand}>
            <View style={[styles.brandBadge, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.text} />
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.text }]}>
                RIPON <Text style={{ color: colors.textMuted }}>ADMIN</Text>
              </Text>
              <Text style={[styles.brandSubtitle, { color: colors.textMuted }]}>
                EXECUTIVE DISPATCH
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Navigation List */}
        <ScrollView style={styles.navScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.navGroup}>
            <Text style={[styles.groupTitle, { color: colors.textMuted }]}>MANAGEMENT CONSOLE</Text>
            {navItems.map(item => {
              const isActive = activeRoute === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.navItem,
                    isActive && [
                      styles.activeNavItem,
                      { backgroundColor: colors.primary, borderColor: colors.primary },
                    ],
                  ]}
                  onPress={() => handleSelect(item.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={isActive ? colors.buttonText : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.navText,
                      { color: isActive ? colors.buttonText : colors.text },
                      isActive && styles.activeNavText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.badge && item.badge > 0 ? (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isActive ? colors.buttonText : colors.warning,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isActive ? colors.primary : '#000000' },
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer Admin Bar */}
        <View style={[styles.footer, { borderTopColor: colors.borderSubtle, backgroundColor: colors.surface }]}>
          <View style={styles.adminProfile}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Text style={[styles.avatarText, { color: colors.text }]}>
                {admin?.name?.charAt(0).toUpperCase() || 'A'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.adminName, { color: colors.text }]} numberOfLines={1}>
                {admin?.name || 'Administrator'}
              </Text>
              <Text style={[styles.adminRole, { color: colors.textMuted }]} numberOfLines={1}>
                {admin?.role || 'ADMIN'}
              </Text>
            </View>

            {/* Quick Theme Toggle */}
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              onPress={toggleTheme}
            >
              <Ionicons
                name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={16}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: colors.border }]}
            onPress={() => {
              onClose();
              onLogout();
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={16} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>SIGN OUT</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRightWidth: 1,
    paddingTop: Platform.OS === 'android' ? 24 : 44,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  navScroll: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  navGroup: {
    gap: 4,
    paddingBottom: 24,
  },
  groupTitle: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 6,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 2,
  },
  activeNavItem: {
    borderRadius: 2,
  },
  navText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeNavText: {
    fontWeight: '900',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  adminProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
  },
  adminName: {
    fontSize: 13,
    fontWeight: '800',
  },
  adminRole: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 1,
  },
  themeBtn: {
    width: 32,
    height: 32,
    borderRadius: 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 38,
    borderRadius: 2,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
});
