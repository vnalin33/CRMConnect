import React, { useState } from 'react';
import {
  View,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import WalletCard from '../components/dashboard/WalletCard';
import SearchBar from '../components/dashboard/SearchBar';
import SnapshotRow from '../components/dashboard/SnapshotRow';
import QuickActionsMenu from '../components/dashboard/QuickActionsMenu';
import PayoutCard from '../components/dashboard/PayoutCard';

// ─── Mock Data ────────────────────────────────────────────────────────────────
// Replace with API data in the future.
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
  payouts: {
    instant: {
      amount: '₹24,500',
      date: 'Feb 28, 2026',
      status: 'Scheduled',
    },
    cycle: {
      amount: '₹32,800',
      date: 'Mar 15, 2026',
      status: 'Pending',
    },
  },
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [payoutTab, setPayoutTab] = useState('instant');

  // Total header height = status bar inset + DashHeader vertical padding + Logo height
  // DashboardHeader uses spacing.md (12) vertical padding and size 36 logo.
  const headerHeight = insets.top + (spacing.md * 2) + 36;

  const handleMenuAction = (actionId) => {
    if (actionId === 'checklist') {
      navigation.navigate('CheckList');
      return;
    }
    if (actionId === 'customers') {
      navigation.navigate('Customers');
      return;
    }
    if (actionId === 'drafts') {
      navigation.navigate('Drafts');
      return;
    }
    if (actionId === 'invoice') {
      navigation.navigate('RaiseInvoice');
      return;
    }
    if (actionId === 'concerns') {
      navigation.navigate('Concerns');
      return;
    }
    // TODO: Navigate to other screens when they're built
  };

  return (
    <View style={[screenSt.root, { backgroundColor: colors.background }]}>

      {/* ── Quick Actions Modal — floats above everything, layout-independent ── */}
      <QuickActionsMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onAction={handleMenuAction}
        topOffset={headerHeight}
      />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Gradient header with dashboard top bar inside ── */}
        <GradientScreenHeader gradientStyle={screenSt.headerGradient}>
          <DashboardHeader
            onMenu={() => setMenuVisible(true)}
            onNotification={() => {/* TODO */ }}
          />
        </GradientScreenHeader>

        {/* ── Wallet card overlapping the gradient bottom ── */}
        <View style={[screenSt.walletWrapper, { paddingHorizontal: spacing.base }]}>
          <WalletCard
            balance={DASHBOARD_DATA.wallet.balance}
            accountNumber={DASHBOARD_DATA.wallet.accountNumber}
            onWithdraw={() => navigation.navigate('Wallet')}
            onViewWallet={() => navigation.navigate('Wallet')}
          />
        </View>

        <View style={{ marginTop: spacing.base, paddingHorizontal: spacing.base }}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View style={{ marginTop: spacing.base, paddingHorizontal: spacing.base }}>
          <SnapshotRow data={DASHBOARD_DATA.snapshots} />
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <PayoutCard
            activeTab={payoutTab}
            onTabChange={setPayoutTab}
            payableAmount={DASHBOARD_DATA.payouts[payoutTab].amount}
            expectedDate={DASHBOARD_DATA.payouts[payoutTab].date}
            status={DASHBOARD_DATA.payouts[payoutTab].status}
            onViewHistory={() => navigation.navigate('Payout')}
          />
        </View>

      </ScrollView>
    </View>
  );
};

const screenSt = {
  root: { flex: 1 },
  headerGradient: {
    paddingBottom: 90,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  walletWrapper: { marginTop: -70 },
};

export default HomeScreen;