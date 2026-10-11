import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeContext';

interface RevenueChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(data.length - 1);

  if (!data || data.length === 0) {
    return null;
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 100);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = Math.round(totalRevenue / data.length);
  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.textSecondary }]}>REVENUE OVERVIEW (7 DAYS)</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>
            ${totalRevenue.toLocaleString()}
          </Text>
        </View>

        {selectedItem && (
          <View style={[styles.selectedBadge, { backgroundColor: colors.goldBg, borderColor: colors.goldBorder }]}>
            <Text style={[styles.selectedDay, { color: colors.gold }]}>{selectedItem.name}</Text>
            <Text style={[styles.selectedValue, { color: colors.text }]}>${selectedItem.revenue.toLocaleString()}</Text>
          </View>
        )}
      </View>

      {/* Chart Bars */}
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const heightPercent = Math.max(12, Math.round((item.revenue / maxRevenue) * 100));
          const isSelected = selectedIndex === index;

          return (
            <TouchableOpacity
              key={item.name}
              style={styles.barColumn}
              activeOpacity={0.8}
              onPress={() => setSelectedIndex(index)}
            >
              {/* Bar Container */}
              <View style={styles.barTrack}>
                <View style={[styles.barFillContainer, { height: `${heightPercent}%` }]}>
                  <LinearGradient
                    colors={isSelected ? [colors.goldLight, colors.gold] : ['#3A4556', '#1E2633']}
                    style={[
                      styles.barFill,
                      isSelected && { shadowColor: colors.gold, shadowOpacity: 0.5, shadowRadius: 6, elevation: 4 }
                    ]}
                  />
                </View>
              </View>

              {/* Day Label */}
              <Text
                style={[
                  styles.dayLabel,
                  { color: isSelected ? colors.gold : colors.textMuted },
                  isSelected && styles.dayLabelActive
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer Info */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Daily Average</Text>
          <Text style={[styles.footerValue, { color: colors.text }]}>${avgRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Peak Volume</Text>
          <Text style={[styles.footerValue, { color: colors.success }]}>${maxRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerItem}>
          <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Week Trend</Text>
          <Text style={[styles.footerValue, { color: colors.gold }]}>+18.4%</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  selectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'flex-end',
  },
  selectedDay: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  chartArea: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
  },
  barTrack: {
    width: '100%',
    maxWidth: 24,
    height: 110,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFillContainer: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    height: '100%',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  dayLabelActive: {
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  footerItem: {
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(150,150,150,0.2)',
  },
});
