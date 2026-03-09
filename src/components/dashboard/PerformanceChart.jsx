import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';

const PerformanceChart = ({
    filesInProgress = '-',
    disbursedFiles = '-',
    conversion = '-',
    monthLabel = '-',
    tabs = [],
    chartData = [],
    chartMax = 100,
    weekLabels = [],
}) => {
    const { colors, spacing, radius } = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    const chartHeight = 140;
    const chartWidth = '100%';

    // Simple View-based line chart
    const renderChart = () => {
        const points = chartData;
        const maxVal = chartMax || 100;

        return (
            <View style={[styles.chartArea, { height: chartHeight, marginTop: spacing.md }]}>
                {/* Y-axis labels */}
                <View style={styles.yAxis}>
                    {['80k', '60k', '40k', '20k'].map(label => (
                        <AppText key={label} variant="caption" color="disabled" style={styles.yLabel}>
                            {label}
                        </AppText>
                    ))}
                </View>

                {/* Chart body */}
                <View style={styles.chartBody}>
                    {/* Grid lines */}
                    {[0, 1, 2, 3].map(i => (
                        <View
                            key={i}
                            style={[
                                styles.gridLine,
                                {
                                    top: (i / 3) * chartHeight,
                                    borderColor: colors.divider,
                                },
                            ]}
                        />
                    ))}

                    {/* Data points + connecting lines */}
                    <View style={styles.pointsRow}>
                        {points.map((val, idx) => {
                            const pct = val / maxVal;
                            const bottomPos = pct * (chartHeight - 16);
                            return (
                                <View key={idx} style={[styles.pointCol, { height: chartHeight }]}>
                                    <View
                                        style={[
                                            styles.dot,
                                            {
                                                bottom: bottomPos,
                                                backgroundColor: colors.primary,
                                                borderColor: colors.perfCardBg,
                                            },
                                        ]}
                                    />
                                </View>
                            );
                        })}
                    </View>

                    {/* X-axis labels */}
                    <View style={styles.xAxis}>
                        {weekLabels && weekLabels.map((label, idx) => (
                            <AppText key={idx} variant="caption" color="disabled" style={styles.xLabel}>
                                {label}
                            </AppText>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const StatItem = ({ value, label }) => (
        <View style={styles.statItem}>
            <AppText variant="h2" style={{ color: colors.textPrimary, fontWeight: '700' }}>{value}</AppText>
            <AppText variant="caption" color="secondary" style={{ marginTop: 2 }}>{label}</AppText>
        </View>
    );

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.perfCardBg,
                    borderColor: colors.perfBorder,
                    borderRadius: radius.lg,
                    padding: spacing.lg,
                    marginHorizontal: spacing.base,
                    marginTop: spacing.lg,
                },
            ]}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                    Performance Overview
                </AppText>
                <View style={[styles.monthBadge, { backgroundColor: colors.pillBg, borderRadius: radius.full }]}>
                    <AppText variant="caption" style={{ color: colors.pillText }}>{monthLabel}</AppText>
                </View>
            </View>

            {/* Tabs */}
            <View style={[styles.tabRow, { marginTop: spacing.md }]}>
                {tabs && tabs.map((tab, idx) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(idx)}
                        style={[
                            styles.tab,
                            {
                                backgroundColor: activeTab === idx ? colors.pillActiveBg : colors.pillBg,
                                borderRadius: radius.full,
                                paddingHorizontal: spacing.md,
                                paddingVertical: spacing.xs,
                                marginRight: spacing.xs,
                            },
                        ]}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: activeTab === idx }}
                    >
                        <AppText
                            variant="caption"
                            style={{
                                color: activeTab === idx ? colors.pillActiveText : colors.pillText,
                                fontWeight: '600',
                            }}
                        >
                            {tab}
                        </AppText>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chart */}
            {renderChart()}

            {/* Bottom stats */}
            <View style={[styles.statsRow, { marginTop: spacing.lg, borderTopColor: colors.divider }]}>
                <StatItem value={filesInProgress} label="Files in Progress" />
                <StatItem value={disbursedFiles} label="Disbursed Files" />
                <StatItem value={conversion} label="Conversion" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { borderWidth: 1 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    monthBadge: { paddingHorizontal: 12, paddingVertical: 4 },
    tabRow: { flexDirection: 'row', alignItems: 'center' },
    tab: {},
    chartArea: { flexDirection: 'row' },
    yAxis: { width: 36, justifyContent: 'space-between', paddingBottom: 20 },
    yLabel: { fontSize: 10 },
    chartBody: { flex: 1, position: 'relative' },
    gridLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderStyle: 'dashed' },
    pointsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20 },
    pointCol: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
    dot: { width: 8, height: 8, borderRadius: 4, position: 'absolute', borderWidth: 2 },
    xAxis: { flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 0, left: 0, right: 0 },
    xLabel: { fontSize: 10, textAlign: 'center', flex: 1 },
    statsRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingTop: 12, borderTopWidth: 1,
    },
    statItem: { alignItems: 'center', flex: 1 },
});

export default PerformanceChart;
