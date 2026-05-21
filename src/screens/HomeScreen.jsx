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
import PerformanceOverview from '../components/dashboard/PerformanceOverview';
import { useLeadList } from '../hooks/useLeadList';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useProfile } from '../hooks/useProfile';
import useWalletData from '../hooks/useWalletData';

// Replaced hardcoded DASHBOARD_DATA with dynamic data below

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
  const { allLeads, tabCounts, refresh, isRefreshing, loading } = useLeadList();
  const { profileData } = useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [payoutTab, setPayoutTab] = useState('instant');
  const { formattedBalance: walletBalance, payouts } = useWalletData();
  
  const disbursedFilesCount = allLeads.filter(lead => {
    const status = lead.track_status || lead.status || 1;
    return status >= 17;
  }).length;

  const dynamicPayoutsData = {
    instant: { amount: '₹0', date: 'N/A', status: 'Pending' },
    cycle: { amount: '₹0', date: 'N/A', status: 'Pending' },
  };

  if (payouts && payouts.length > 0) {
    const instantPayouts = payouts.filter(p => p.processingType?.toLowerCase() === 'instant');
    const cyclePayouts = payouts.filter(p => p.processingType?.toLowerCase() === 'cycle');

    if (instantPayouts.length > 0) {
      const latest = instantPayouts[0];
      dynamicPayoutsData.instant = {
        amount: latest.payoutAmountFormatted || '₹0',
        date: latest.date || 'N/A',
        status: latest.status === 'paid' ? 'Paid' : 'Pending',
      };
    }
    if (cyclePayouts.length > 0) {
      const latest = cyclePayouts[0];
      dynamicPayoutsData.cycle = {
        amount: latest.payoutAmountFormatted || '₹0',
        date: latest.date || 'N/A',
        status: latest.status === 'paid' ? 'Paid' : 'Pending',
      };
    }
  }

  // Auto-refresh leads when screen gains focus
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
            refreshing={isRefreshing}
            onRefresh={refresh} 
            colors={[colors.primary]} 
          />
        }
      >

        {/* ── Gradient header with dashboard top bar inside ── */}
        <GradientScreenHeader gradientStyle={screenSt.headerGradient}>
          <DashboardHeader
            onMenu={() => setMenuVisible(true)}
            onNotification={() => navigation.navigate('Notifications')}
          />
        </GradientScreenHeader>

        {/* ── Wallet card overlapping the gradient bottom ── */}
        <View style={[screenSt.walletWrapper, { paddingHorizontal: spacing.base }]}>
          <WalletCard
            balance={walletBalance}
            accountNumber={profileData?.bankDetails?.account && profileData.bankDetails.account !== 'Not Provided' ? maskAccount(profileData.bankDetails.account) : 'XXXX XXXX XXXX 1234'}
            onWithdraw={() => navigation.navigate('Wallet')}
            onViewWallet={() => navigation.navigate('Wallet')}
            secondaryLabel="View Wallet"
          />
        </View>

        <View style={{ marginTop: spacing.base, paddingHorizontal: spacing.base }}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        <View style={{ marginTop: spacing.base, paddingHorizontal: spacing.base }}>
          <SnapshotRow data={[
            { id: '1', icon: 'file-text', iconBgColor: '#6855F0', count: String(tabCounts.progress || 0), label: 'Files in Progress' },
            { id: '2', icon: 'check-circle', iconBgColor: '#00C896', count: String(disbursedFilesCount), label: 'Disbursed Files' },
            { id: '3', icon: 'users', iconBgColor: '#2DBFE6', count: String(tabCounts.all || 0), label: 'Active Customers' },
          ]} />
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <PayoutCard
            activeTab={payoutTab}
            onTabChange={setPayoutTab}
            payableAmount={dynamicPayoutsData[payoutTab].amount}
            expectedDate={dynamicPayoutsData[payoutTab].date}
            status={dynamicPayoutsData[payoutTab].status}
            onViewHistory={() => navigation.navigate('Payout')}
          />
        </View>

        <View style={{ marginBottom: spacing.xxxl }}>
            <PerformanceOverview />
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


