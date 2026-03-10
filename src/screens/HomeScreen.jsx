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
import logo from '../assests/images/logo.png';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const DASHBOARD_DATA = {
  wallet: {
    balance: '0.00',
    accountNumber: 'XXXX XXXX XXXX 1234',
  },
  snapshots: [
    { id: '1', icon: 'file-text',    iconBgColor: '#6855F0', count: '34',  label: 'Files in Progress' },
    { id: '2', icon: 'check-circle', iconBgColor: '#00C896', count: '128', label: 'Disbursed Files'    },
    { id: '3', icon: 'clock',        iconBgColor: '#F59E0B', count: '11',  label: 'Pending Approval'  },
    { id: '4', icon: 'users',        iconBgColor: '#2DBFE6', count: '26',  label: 'Active Clients'    },
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

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────

const DashboardHeader = ({ onNotification, onMenu }) => (
  <View style={headerSt.row}>
    <View style={headerSt.brand}>
      <View style={headerSt.logoWrapper}>
        <Image source={logo} style={headerSt.logoImage} />
      </View>
      <Text style={headerSt.title}>CRM Connect</Text>
    </View>

    <View style={headerSt.actions}>
      <TouchableOpacity onPress={onNotification} style={headerSt.iconBtn}>
        <Feather name="bell" size={22} color="#FFFFFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onMenu} style={headerSt.iconBtn}>
        <Feather name="menu" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  </View>
);

const headerSt = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 20 },
  brand:      { flexDirection: 'row', alignItems: 'center' },
  logoWrapper:{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logoImage:  { width: 40, height: 40, resizeMode: 'contain' },
  title:      { fontSize: 25, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0, elevation: 8 },
  actions:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn:    { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
});

// ─────────────────────────────────────────────────────────────────────────────
// WALLET CARD
// ─────────────────────────────────────────────────────────────────────────────

const WalletCard = ({ balance, accountNumber }) => (
  <LinearGradient
    colors={['#C7CCFF', '#8AD4FF']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={walletSt.card}
  >
    <View style={walletSt.circleA} />
    <View style={walletSt.circleB} />

    <View style={walletSt.topRow}>
      <Text style={walletSt.balanceLabel}>AVAILABLE BALANCE</Text>
      <View style={walletSt.badge}>
        <Feather name="credit-card" size={11} color="#FFFFFF" />
        <Text style={walletSt.badgeText}>  Wallet A/C</Text>
      </View>
    </View>

    <Text style={walletSt.amount}>₹{balance}</Text>
    <Text style={walletSt.account}>A/C NO : {accountNumber}</Text>

    <View style={walletSt.btnRow}>
      <TouchableOpacity style={walletSt.withdrawWrap}>
        <LinearGradient
          colors={['#6B5AF5', '#3EC1E8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={walletSt.withdrawGrad}
        >
          <Feather name="arrow-down" size={15} color="#FFFFFF" />
          <Text style={walletSt.withdrawTxt}>  Withdraw</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={walletSt.viewBtn}>
        <Text style={walletSt.viewTxt}>View Wallet</Text>
      </TouchableOpacity>
    </View>
  </LinearGradient>
);

const walletSt = StyleSheet.create({
  card:         { borderRadius: 20, padding: 20, overflow: 'hidden', elevation: 8, shadowColor: '#6855F0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 10 },
  circleA:      { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.15)', top: -50, right: -30 },
  circleB:      { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.10)', top: 40, right: 70 },
  topRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceLabel: { fontSize: 11, fontWeight: '700', color: '#4059A9', letterSpacing: 0.8 },
  badge:        { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(125,110,255,0.7)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:    { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  amount:       { fontSize: 34, fontWeight: '800', color: '#1F2D5A', marginBottom: 4 },
  account:      { fontSize: 12, color: '#4F5F9A', marginBottom: 20 },
  btnRow:       { flexDirection: 'row', gap: 12 },
  withdrawWrap: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  withdrawGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15 },
  withdrawTxt:  { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  viewBtn:      { flex: 1, borderRadius: 12, borderWidth: 1, borderColor: '#6B5AF5', backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  viewTxt:      { color: '#6B5AF5', fontWeight: '700', fontSize: 14 },
});

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH BAR
// ─────────────────────────────────────────────────────────────────────────────

const SearchBar = ({ value, onChangeText }) => (
  <View style={searchSt.container}>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder="Search leads, clients..."
      placeholderTextColor="#9AA7BD"
      style={searchSt.input}
    />
    <Feather name="search" size={18} color="#9AA7BD" />
  </View>
);

const searchSt = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 30, paddingHorizontal: 18, height: 48, borderWidth: 1, borderColor: '#D8E2F2' },
  input:     { flex: 1, fontSize: 14, color: '#2D3748' },
});

// ─────────────────────────────────────────────────────────────────────────────
// SNAPSHOT
// ─────────────────────────────────────────────────────────────────────────────

const SnapshotCard = ({ icon, iconBgColor, count, label }) => (
  <View style={snapSt.card}>
    <View style={[snapSt.iconCircle, { backgroundColor: iconBgColor + '22' }]}>
      <Feather name={icon} size={17} color={iconBgColor} />
    </View>
    <Text style={snapSt.count}>{count}</Text>
    <Text style={snapSt.label}>{label}</Text>
  </View>
);

const SnapshotRow = ({ data }) => (
  <View>
    <Text style={snapSt.sectionTitle}>OPERATIONAL SNAPSHOT</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={snapSt.scroll}>
      {data.map(item => <SnapshotCard key={item.id} {...item} />)}
    </ScrollView>
  </View>
);

const snapSt = StyleSheet.create({
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6855F0', marginBottom: 12 },
  scroll:       { gap: 12 },
  card:         { width: 110, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E5ECF7' },
  iconCircle:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  count:        { fontSize: 20, fontWeight: '800', color: '#1A202C' },
  label:        { fontSize: 11, color: '#718096' },
});

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
  root:           { flex: 1, backgroundColor: 'EBF2F8' },
  headerGradient: { paddingTop: 44, paddingBottom: 90, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  walletWrapper:  { marginTop: -70, paddingHorizontal: 16 },
  section:        { marginTop: 16, paddingHorizontal: 16 },
});

export default HomeScreen;