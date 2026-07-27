/**
 * MonthYearPicker.jsx
 * Industry-standard month/year picker modal.
 *
 * Features:
 *   - Scrollable month grid for each year
 *   - Navigation arrows to move between years
 *   - Bounded by account creation date (earliest) and current month (latest)
 *   - Disabled state for months outside the valid range
 *   - Gradient highlight on the selected month
 *   - Smooth animations for open/close
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from './AppText';

const { width: SCREEN_W } = Dimensions.get('window');

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * @param {object} props
 * @param {boolean}  props.visible         – controls modal visibility
 * @param {function} props.onClose         – called when user dismisses
 * @param {function} props.onSelect        – (year, month) → void, month is 0-indexed
 * @param {number}   props.selectedYear
 * @param {number}   props.selectedMonth   – 0-indexed
 * @param {Date|null} props.minDate        – earliest selectable month (account creation)
 * @param {Date|null} props.maxDate        – latest selectable month (defaults to now)
 */
const MonthYearPicker = ({
  visible,
  onClose,
  onSelect,
  selectedYear,
  selectedMonth,
  minDate,
  maxDate,
}) => {
  const { colors, radius, spacing } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const now = useMemo(() => maxDate || new Date(), [maxDate]);
  const earliest = useMemo(() => {
    if (minDate) return new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    // Fallback: 12 months back
    const d = new Date();
    d.setMonth(d.getMonth() - 11);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }, [minDate]);

  const minYear = earliest.getFullYear();
  const maxYear = now.getFullYear();

  const [viewYear, setViewYear] = useState(selectedYear);

  // Reset viewYear when picker opens
  useEffect(() => {
    if (visible) setViewYear(selectedYear);
  }, [visible, selectedYear]);

  // Animate in/out
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 14, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  const canGoPrev = viewYear > minYear;
  const canGoNext = viewYear < maxYear;

  const isMonthDisabled = (monthIdx) => {
    const target = new Date(viewYear, monthIdx, 1);
    const min = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    const max = new Date(now.getFullYear(), now.getMonth(), 1);
    return target < min || target > max;
  };

  const isSelected = (monthIdx) =>
    viewYear === selectedYear && monthIdx === selectedMonth;

  const handleSelect = (monthIdx) => {
    if (isMonthDisabled(monthIdx)) return;
    onSelect(viewYear, monthIdx);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.border,
              borderRadius: radius.xl,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Pressable>
            {/* Year navigation */}
            <View style={styles.yearRow}>
              <TouchableOpacity
                onPress={() => canGoPrev && setViewYear(y => y - 1)}
                disabled={!canGoPrev}
                style={[styles.arrowBtn, !canGoPrev && { opacity: 0.3 }]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name="chevron-left" size={22} color={colors.textPrimary} />
              </TouchableOpacity>

              <AppText
                variant="h2"
                style={{ color: colors.textPrimary, fontWeight: '700', fontSize: 20 }}
              >
                {viewYear}
              </AppText>

              <TouchableOpacity
                onPress={() => canGoNext && setViewYear(y => y + 1)}
                disabled={!canGoNext}
                style={[styles.arrowBtn, !canGoNext && { opacity: 0.3 }]}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Feather name="chevron-right" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Month grid (4 cols × 3 rows) */}
            <View style={styles.grid}>
              {MONTHS.map((label, idx) => {
                const disabled = isMonthDisabled(idx);
                const selected = isSelected(idx);

                return (
                  <TouchableOpacity
                    key={label}
                    activeOpacity={disabled ? 1 : 0.6}
                    onPress={() => handleSelect(idx)}
                    style={styles.cellWrapper}
                  >
                    {selected ? (
                      <LinearGradient
                        colors={BRAND_GRADIENT.colors}
                        start={BRAND_GRADIENT.start}
                        end={BRAND_GRADIENT.end}
                        style={styles.cell}
                      >
                        <AppText variant="bodySm" style={styles.cellTextSelected}>
                          {label}
                        </AppText>
                      </LinearGradient>
                    ) : (
                      <View
                        style={[
                          styles.cell,
                          {
                            backgroundColor: disabled
                              ? 'transparent'
                              : colors.surfaceAlt || colors.background,
                            borderWidth: 1,
                            borderColor: disabled ? 'transparent' : colors.border,
                          },
                        ]}
                      >
                        <AppText
                          variant="bodySm"
                          style={{
                            color: disabled
                              ? (colors.textDisabled || '#CBD5E1')
                              : colors.textPrimary,
                            fontWeight: '500',
                          }}
                        >
                          {label}
                        </AppText>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick-jump footer */}
            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                onPress={() => {
                  onSelect(now.getFullYear(), now.getMonth());
                  onClose();
                }}
                style={[styles.todayBtn, { borderColor: colors.primary || '#6366F1' }]}
              >
                <AppText
                  variant="caption"
                  style={{ color: colors.primary || '#6366F1', fontWeight: '600' }}
                >
                  This Month
                </AppText>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export { MONTHS, MONTH_FULL };
export default MonthYearPicker;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: Math.min(SCREEN_W - 48, 360),
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  arrowBtn: {
    padding: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  cellWrapper: {
    width: '24%',
  },
  cell: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  todayBtn: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
