import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../theme';
import MaskedView from '@react-native-masked-view/masked-view';
import AppText from '../common/AppText';
import { BRAND_GRADIENT } from '../../theme/colors';
import { useLeadList } from '../../hooks/useLeadList';

const screenWidth = Dimensions.get('window').width;

const TABS = ['Earnings', 'Files', 'Conversions'];

const PerformanceOverview = () => {
    const { colors, radius, spacing } = useTheme();
    const { allLeads, tabCounts } = useLeadList();
    
    const [activeTab, setActiveTab] = useState('Earnings');

    // Calculate bottom stats
    const filesInProgress = tabCounts?.progress || 0;
    
    // Calculate disbursed files based on status >= 17
    const disbursedFiles = useMemo(() => {
        return allLeads.filter(lead => {
            const status = lead.track_status || lead.status || 1;
            return status >= 17;
        }).length;
    }, [allLeads]);
    
    const totalFiles = tabCounts?.all || 0;
    const conversionRate = totalFiles > 0 ? Math.round((disbursedFiles / totalFiles) * 100) : 0;
    
    const currentMonthYear = useMemo(() => {
        return new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }, []);

    // Calculate chart data
    const chartData = useMemo(() => {
        // Group data by week (W1, W2, W3, W4, W5)
        const weeklyData = [0, 0, 0, 0, 0];
        
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        allLeads.forEach(lead => {
            const leadDate = new Date(lead.createdon || Date.now());
            // Only process leads for current month
            if (leadDate >= startOfMonth) {
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
            }
        });

        const isDataEmpty = weeklyData.every(val => val === 0);

        // For earnings, scale down to thousands (k)
        if (activeTab === 'Earnings' && !isDataEmpty) {
            return weeklyData.map(val => val / 1000);
        }

        return weeklyData;
    }, [allLeads, activeTab]);

    const data = {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
        datasets: [
            {
                data: chartData,
                color: (opacity = 1) => `rgba(129, 111, 245, ${opacity})`, // Solid blue/purple
                strokeWidth: 4,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: colors.cardBg,
        backgroundGradientFrom: colors.cardBg,
        backgroundGradientTo: colors.cardBg,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // grid line color
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
            strokeDasharray: '', // solid lines
            stroke: 'rgba(203, 213, 225, 0.5)', // light gray
        },
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBg, borderColor: colors.border, borderRadius: radius.xl }]}>
            {/* Header */}
            <View style={styles.header}>
                <GradientText style={styles.title}>Performance Overview</GradientText>
                <TouchableOpacity style={[styles.monthPicker, { borderColor: colors.border }]}>
                    <AppText variant="caption" style={{ color: colors.textSecondary, marginRight: 4 }}>{currentMonthYear}</AppText>
                    <Feather name="chevron-down" size={12} color={colors.textSecondary} />
                </TouchableOpacity>
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
                    width={screenWidth - 48} // Padding adjustments
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
