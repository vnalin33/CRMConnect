import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../theme';
import MaskedView from '@react-native-masked-view/masked-view';
import AppText from '../common/AppText';
import MonthYearPicker, { MONTH_FULL } from '../common/MonthYearPicker';
import { BRAND_GRADIENT } from '../../theme/colors';
import { useLeadList } from '../../hooks/useLeadList';
import { useProfile } from '../../hooks/useProfile';

const screenWidth = Dimensions.get('window').width;

const TABS = ['Earnings', 'Files', 'Conversions'];

const SHORT_MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const PerformanceOverview = () => {
    const { colors, radius, spacing } = useTheme();
    const { allLeads, tabCounts } = useLeadList();
    const { profileData } = useProfile();

    const [activeTab, setActiveTab] = useState('Earnings');
    const [pickerVisible, setPickerVisible] = useState(false);

    // ── Selected month state (defaults to current month) ────────────────────
    const now = useMemo(() => new Date(), []);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-indexed

    // ── Account creation date (lower bound for the picker) ──────────────────
    const accountCreatedDate = useMemo(() => {
        if (profileData?.accountCreatedDate) {
            const d = new Date(profileData.accountCreatedDate);
            if (!isNaN(d.getTime())) return d;
        }
        // Fallback: 12 months back
        const fallback = new Date();
        fallback.setMonth(fallback.getMonth() - 11);
        return fallback;
    }, [profileData?.accountCreatedDate]);

    // ── Derived: start & end of selected month ─────────────────────────────
    const { monthStart, monthEnd } = useMemo(() => {
        const start = new Date(selectedYear, selectedMonth, 1);
        const end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
        return { monthStart: start, monthEnd: end };
    }, [selectedYear, selectedMonth]);

    // ── Filter leads for the selected month ─────────────────────────────────
    const monthLeads = useMemo(() => {
        return allLeads.filter(lead => {
            const d = new Date(lead.createdon || 0);
            return d >= monthStart && d <= monthEnd;
        });
    }, [allLeads, monthStart, monthEnd]);

    // ── Bottom stats for selected month ─────────────────────────────────────
    const filesInProgress = useMemo(() => {
        return monthLeads.filter(lead => {
            const s = lead.track_status || lead.status || 1;
            return s >= 1 && s < 17;
        }).length;
    }, [monthLeads]);

    const disbursedFiles = useMemo(() => {
        return monthLeads.filter(lead => {
            const s = lead.track_status || lead.status || 1;
            return s >= 17;
        }).length;
    }, [monthLeads]);

    const totalFiles = monthLeads.length;
    const conversionRate = totalFiles > 0 ? Math.round((disbursedFiles / totalFiles) * 100) : 0;

    // ── Chart data grouped by week for the selected month ───────────────────
    const chartData = useMemo(() => {
        const weeklyData = [0, 0, 0, 0, 0];

        monthLeads.forEach(lead => {
            const leadDate = new Date(lead.createdon || Date.now());
            const dayOfMonth = leadDate.getDate();
            const weekIndex = Math.min(Math.floor((dayOfMonth - 1) / 7), 4);

            if (activeTab === 'Files') {
                weeklyData[weekIndex] += 1;
            } else if (activeTab === 'Earnings') {
                const status = lead.track_status || lead.status || 1;
                if (status >= 17) {
                    const amount = parseFloat(lead.disbursementamount) || 0;
                    weeklyData[weekIndex] += amount;
                }
            } else if (activeTab === 'Conversions') {
                const status = lead.track_status || lead.status || 1;
                if (status >= 17) {
                    weeklyData[weekIndex] += 1;
                }
            }
        });

        const isDataEmpty = weeklyData.every(val => val === 0);

        // For earnings, scale down to thousands (k)
        if (activeTab === 'Earnings' && !isDataEmpty) {
            return weeklyData.map(val => val / 1000);
        }

        return weeklyData;
    }, [monthLeads, activeTab]);

    // ── Month label for the picker button ───────────────────────────────────
    const monthLabel = useMemo(() => {
        return `${SHORT_MONTHS[selectedMonth]} ${selectedYear}`;
    }, [selectedMonth, selectedYear]);

    // ── Quick nav: check if can go prev/next month ──────────────────────────
    const canGoPrev = useMemo(() => {
        const prev = new Date(selectedYear, selectedMonth - 1, 1);
        const min = new Date(accountCreatedDate.getFullYear(), accountCreatedDate.getMonth(), 1);
        return prev >= min;
    }, [selectedYear, selectedMonth, accountCreatedDate]);

    const canGoNext = useMemo(() => {
        const next = new Date(selectedYear, selectedMonth + 1, 1);
        const max = new Date(now.getFullYear(), now.getMonth(), 1);
        return next <= max;
    }, [selectedYear, selectedMonth, now]);

    const goToPrevMonth = useCallback(() => {
        if (!canGoPrev) return;
        if (selectedMonth === 0) {
            setSelectedYear(y => y - 1);
            setSelectedMonth(11);
        } else {
            setSelectedMonth(m => m - 1);
        }
    }, [canGoPrev, selectedMonth]);

    const goToNextMonth = useCallback(() => {
        if (!canGoNext) return;
        if (selectedMonth === 11) {
            setSelectedYear(y => y + 1);
            setSelectedMonth(0);
        } else {
            setSelectedMonth(m => m + 1);
        }
    }, [canGoNext, selectedMonth]);

    const handleMonthSelect = useCallback((year, month) => {
        setSelectedYear(year);
        setSelectedMonth(month);
    }, []);

    // ── Chart config ────────────────────────────────────────────────────────
    const data = {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
        datasets: [
            {
                data: chartData,
                color: (opacity = 1) => `rgba(129, 111, 245, ${opacity})`,
                strokeWidth: 4,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: colors.cardBg,
        backgroundGradientFrom: colors.cardBg,
        backgroundGradientTo: colors.cardBg,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
        fillShadowGradientFrom: '#FFFFFF',
        fillShadowGradientFromOpacity: 0,
        fillShadowGradientTo: '#FFFFFF',
        fillShadowGradientToOpacity: 0,
        propsForDots: {
            r: '5',
            strokeWidth: '3',
            stroke: colors.primary,
            fill: '#FFFFFF',
        },
        propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: 'rgba(203, 213, 225, 0.5)',
        },
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: radius.xl }]}>
            {/* Header */}
            <View style={styles.header}>
                <GradientText style={styles.title}>Performance Overview</GradientText>

                <View style={styles.monthNavRow}>
                    {/* Left arrow for quick prev month */}
                    <TouchableOpacity
                        onPress={goToPrevMonth}
                        disabled={!canGoPrev}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={[styles.navArrow, !canGoPrev && { opacity: 0.3 }]}
                    >
                        <Feather name="chevron-left" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Month picker button */}
                    <TouchableOpacity
                        style={[styles.monthPicker, { borderColor: colors.border }]}
                        onPress={() => setPickerVisible(true)}
                        activeOpacity={0.7}
                    >
                        <AppText variant="caption" style={{ color: colors.textSecondary, marginRight: 4, fontWeight: '500' }}>
                            {monthLabel}
                        </AppText>
                        <Feather name="chevron-down" size={12} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Right arrow for quick next month */}
                    <TouchableOpacity
                        onPress={goToNextMonth}
                        disabled={!canGoNext}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={[styles.navArrow, !canGoNext && { opacity: 0.3 }]}
                    >
                        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {TABS.map(tab => {
                    const isActive = activeTab === tab;
                    if (isActive) {
                        return (
                            <LinearGradient
                                key={tab}
                                colors={BRAND_GRADIENT.colors}
                                start={BRAND_GRADIENT.start}
                                end={BRAND_GRADIENT.end}
                                style={styles.activeTab}
                            >
                                <AppText variant="caption" style={styles.activeTabText}>{tab}</AppText>
                            </LinearGradient>
                        );
                    }
                    return (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            style={[styles.inactiveTab, { borderColor: colors.border }]}
                        >
                            <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '500' }}>{tab}</AppText>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Chart */}
            <View style={styles.chartWrapper}>
                <LineChart
                    data={data}
                    width={screenWidth - 48}
                    height={180}
                    chartConfig={chartConfig}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                    withVerticalLines={false}
                    withOuterLines={false}
                    yAxisSuffix={activeTab === 'Earnings' ? 'k' : ''}
                />
            </View>

            {/* Bottom Stats */}
            <View style={[styles.bottomStats, { borderTopColor: colors.border }]}>
                <View style={styles.statBox}>
                    <AppText variant="h2" style={[styles.statValue, { color: colors.textPrimary }]}>{filesInProgress}</AppText>
                    <AppText variant="caption" style={styles.statLabel}>Files in Progress</AppText>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statBox}>
                    <AppText variant="h2" style={[styles.statValue, { color: colors.textPrimary }]}>{disbursedFiles}</AppText>
                    <AppText variant="caption" style={styles.statLabel}>Disbursed Files</AppText>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statBox}>
                    <AppText variant="h2" style={[styles.statValue, { color: colors.textPrimary }]}>{conversionRate}%</AppText>
                    <AppText variant="caption" style={styles.statLabel}>Conversion</AppText>
                </View>
            </View>

            {/* Month/Year Picker Modal */}
            <MonthYearPicker
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={handleMonthSelect}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                minDate={accountCreatedDate}
                maxDate={now}
            />
        </View>
    );
};

// GradientText helper to match the title style using MaskedView
const GradientText = (props) => {
    return (
        <MaskedView
            maskElement={
                <AppText variant="h3" style={[{ backgroundColor: 'transparent', fontWeight: 'bold' }, props.style]}>
                    {props.children}
                </AppText>
            }
        >
            <LinearGradient
                colors={BRAND_GRADIENT.colors}
                start={BRAND_GRADIENT.start}
                end={BRAND_GRADIENT.end}
            >
                <AppText variant="h3" style={[{ opacity: 0, fontWeight: 'bold' }, props.style]}>
                    {props.children}
                </AppText>
            </LinearGradient>
        </MaskedView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        paddingTop: 20,
        marginHorizontal: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
    },
    monthNavRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    navArrow: {
        padding: 4,
    },
    monthPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    activeTab: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    activeTabText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    inactiveTab: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    chartWrapper: {
        alignItems: 'center',
        paddingRight: 10,
    },
    bottomStats: {
        flexDirection: 'row',
        borderTopWidth: 1,
        paddingVertical: 16,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontWeight: 'bold',
        fontSize: 22,
    },
    statLabel: {
        color: '#94A3B8',
        marginTop: 4,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: '80%',
        alignSelf: 'center',
    },
});

export default PerformanceOverview;
