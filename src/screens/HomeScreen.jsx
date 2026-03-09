import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import {
    DashboardHeader,
    WalletCard,
    SearchBar,
    SnapshotRow,
    PayoutCard,
    PerformanceChart,
    BottomTabBar,
} from '../components/dashboard';

// --- MOCK DATA (Move this to your API/Redux layer later) ---
const DASHBOARD_DATA = {
    wallet: {
        balance: '24,500.00',
        accountNumber: 'XXXX XXXX XXXX 1234',
    },
    snapshots: [
        { id: '1', icon: 'file-text', iconBgColor: '#6855F0', count: '34', label: 'Files in Progress' },
        { id: '2', icon: 'check-circle', iconBgColor: '#00C896', count: '128', label: 'Disbursed Files' },
        { id: '3', icon: 'clock', iconBgColor: '#F59E0B', count: '11', label: 'Pending Approval' },
        { id: '4', icon: 'users', iconBgColor: '#2DBFE6', count: '26', label: 'Active Clients' },
    ],
    payout: {
        amount: '₹24,500',
        date: 'Feb 28, 2026',
        status: 'Scheduled',
    },
    performance: {
        monthLabel: 'Jan 2026',
        tabs: ['Earnings', 'Files', 'Conversions'],
        chartData: [28, 32, 38, 58, 70, 65, 72, 78, 75],
        chartMax: 80,
        weekLabels: ['W1', '', 'W3', '', 'W3', '', 'W4', '', 'W5'],
        stats: {
            filesInProgress: '34',
            disbursedFiles: '128',
            conversion: '79%',
        }
    }
};

const HomeScreen = ({ navigation }) => {
    const { colors, spacing } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('Home');
    const [activePayoutTab, setActivePayoutTab] = useState('instant');

    const handleTabPress = key => {
        setActiveTab(key);
        // Navigate to other screens as they are built
        if (key === 'Profile') {
            // navigation?.navigate('Profile');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScreenWrapper scrollable withPadding={false} edges={['top']}>
                {/* Header */}
                <DashboardHeader
                    onNotification={() => { }}
                    onMenu={() => { }}
                />

                {/* Wallet Card */}
                <View style={{ marginTop: spacing.md }}>
                    <WalletCard
                        balance={DASHBOARD_DATA.wallet.balance}
                        accountNumber={DASHBOARD_DATA.wallet.accountNumber}
                        onWithdraw={() => { }}
                        onViewWallet={() => { }}
                    />
                </View>

                {/* Search Bar */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />

                {/* Operational Snapshot */}
                <SnapshotRow data={DASHBOARD_DATA.snapshots} />

                {/* Payout Card */}
                <PayoutCard
                    payableAmount={DASHBOARD_DATA.payout.amount}
                    expectedDate={DASHBOARD_DATA.payout.date}
                    status={DASHBOARD_DATA.payout.status}
                    activeTab={activePayoutTab}
                    onTabChange={setActivePayoutTab} // Not currently implemented inside component but passed for future 
                    onViewHistory={() => { }}
                />

                {/* Performance Chart */}
                <PerformanceChart
                    filesInProgress={DASHBOARD_DATA.performance.stats.filesInProgress}
                    disbursedFiles={DASHBOARD_DATA.performance.stats.disbursedFiles}
                    conversion={DASHBOARD_DATA.performance.stats.conversion}
                    monthLabel={DASHBOARD_DATA.performance.monthLabel}
                    tabs={DASHBOARD_DATA.performance.tabs}
                    chartData={DASHBOARD_DATA.performance.chartData}
                    chartMax={DASHBOARD_DATA.performance.chartMax}
                    weekLabels={DASHBOARD_DATA.performance.weekLabels}
                />

                {/* Bottom spacer for tab bar */}
                <View style={{ height: spacing.huge }} />
            </ScreenWrapper>

            {/* Bottom Tab Bar */}
            <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});

export default HomeScreen;
