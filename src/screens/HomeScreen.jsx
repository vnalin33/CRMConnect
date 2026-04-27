import React, { useState } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
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
import { useLeadList } from '../hooks/useLeadList';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useProfile } from '../hooks/useProfile';

// Replace with API data in the future for wallet and payouts.
const DASHBOARD_DATA = {
  wallet: {
    balance: '0.00',
    accountNumber: 'XXXX XXXX XXXX 1234',
  },
  payouts: {
    instant: {
      amount: '₹0',
      date: 'N/A',
      status: 'Scheduled',
    },
    cycle: {
      amount: '₹0',
      date: 'N/A',
      status: 'Pending',
    },
  },
};

// Mask account number: show only last 4 digits
const maskAccount = (acc) => {
  if (!acc || acc.length < 4) return acc || '';
  const last4 = acc.slice(-4);
  return `XXXX XXXX ${last4}`;
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { tabCounts, refresh, loading } = useLeadList();
  const { profileData } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [payoutTab, setPayoutTab] = useState('instant');

  // Auto-refresh when screen gains focus
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading}
            onRefresh={refresh} 
            colors={[colors.primary]} 
          />
        }
      >

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
            accountNumber={profileData?.bankDetails?.account && profileData.bankDetails.account !== 'Not Provided' ? maskAccount(profileData.bankDetails.account) : 'XXXX XXXX XXXX 1234'}
            onWithdraw={() => navigation.navigate('Wallet')}
            onViewWallet={() => navigation.navigate('Wallet')}
          />
        </View>

        <View style={{ marginTop: spacing.base, paddingHorizontal: spacing.base }}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View style={{ marginTop: spacing.base, paddingHorizontal: spacing.base }}>
          <SnapshotRow data={[
            { id: '1', icon: 'file-text', iconBgColor: '#6855F0', count: String(tabCounts.progress || 0), label: 'Files in Progress' },
            { id: '2', icon: 'check-circle', iconBgColor: '#00C896', count: String(tabCounts.completed || 0), label: 'Disbursed Files' },
            { id: '3', icon: 'clock', iconBgColor: '#F59E0B', count: String(tabCounts.new || 0), label: 'New Leads' },
            { id: '4', icon: 'users', iconBgColor: '#2DBFE6', count: String(tabCounts.all || 0), label: 'Total Clients' },
          ]} />
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