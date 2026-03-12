import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WalletCard from '../components/dashboard/WalletCard';
import SearchBar from '../components/dashboard/SearchBar';
import SnapshotRow from '../components/dashboard/SnapshotRow';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const DASHBOARD_DATA = {
  wallet: {
    balance: '0.00',
    accountNumber: 'XXXX XXXX XXXX 1234',
  },
  snapshots: [
    { id: '1', icon: 'file-text', iconBgColor: '#6855F0', count: '34', label: 'Files in Progress' },
    { id: '2', icon: 'check-circle', iconBgColor: '#00C896', count: '128', label: 'Disbursed Files' },
    { id: '3', icon: 'clock', iconBgColor: '#F59E0B', count: '11', label: 'Pending Approval' },
    { id: '4', icon: 'users', iconBgColor: '#2DBFE6', count: '26', label: 'Active Clients' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const HomeScreen = () => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={[screenSt.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Gradient header with dashboard top bar inside ── */}
        <GradientScreenHeader gradientStyle={screenSt.headerGradient}>
          <DashboardHeader />
        </GradientScreenHeader>

        {/* ── Wallet card overlapping the gradient bottom ── */}
        <View style={screenSt.walletWrapper}>
          <WalletCard
            balance={DASHBOARD_DATA.wallet.balance}
            accountNumber={DASHBOARD_DATA.wallet.accountNumber}
          />
        </View>

        <View style={screenSt.section}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View style={screenSt.section}>
          <SnapshotRow data={DASHBOARD_DATA.snapshots} />
        </View>

      </ScrollView>
    </View>
  );
};

const screenSt = StyleSheet.create({
  root: { flex: 1 },
  headerGradient: {
    paddingBottom: 90,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  walletWrapper: { marginTop: -70, paddingHorizontal: 16 },
  section: { marginTop: 16, paddingHorizontal: 16 },
});

export default HomeScreen;