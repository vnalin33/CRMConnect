import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Svg, {
  Polyline,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
  Text as SvgText,
  Line,
} from 'react-native-svg';

// Update this path if your logo is elsewhere
import logo from '../assets/images/logo.png';

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
  payout: {
    amount: '₹24,500',
    date: 'Feb 28, 2026',
    status: 'Scheduled',
  },
  performance: {
    monthLabel: 'Jan 2025',
    tabs: ['Earnings', 'Files', 'Conversions'],
    chartData: [28, 32, 38, 58, 70, 65, 72, 78, 75],
    chartMax: 80,
    weekLabels: ['W1', '', 'W3', '', 'W3', '', 'W4', '', 'W5'],
    stats: {
      filesInProgress: '34',
      disbursedFiles: '128',
      conversion: '79%',
    },
  },
};

import DashboardHeader from '../components/dashboard/DashboardHeader';
import WalletCard from '../components/dashboard/WalletCard';
import SearchBar from '../components/dashboard/SearchBar';
import SnapshotRow from '../components/dashboard/SnapshotRow';
// ─────────────────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={screenSt.root}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <LinearGradient
          colors={['#8B7FF5', '#63C2F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={screenSt.headerGradient}
        >
          <DashboardHeader />
        </LinearGradient>

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
  root: { flex: 1, backgroundColor: 'EBF2F8' },
  headerGradient: { paddingTop: 44, paddingBottom: 90, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  walletWrapper: { marginTop: -70, paddingHorizontal: 16 },
  section: { marginTop: 16, paddingHorizontal: 16 },
});

export default HomeScreen;