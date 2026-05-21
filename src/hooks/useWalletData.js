import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getPayoutsApi } from '../api/payoutApi';
import { getWithdrawalHistory } from '../api/withdrawalApi';
import { useProfile } from './useProfile';



// ── Module-level cache shared across all hook consumers ──
let _cachedData = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 3000; // 3 seconds – avoids duplicate requests when switching tabs quickly

const useWalletData = () => {
  const [payouts, setPayouts] = useState(_cachedData?.payouts || []);
  const [summary, setSummary] = useState(_cachedData?.summary || null);
  const [withdrawals, setWithdrawals] = useState(_cachedData?.withdrawals || []);
  const [loading, setLoading] = useState(!_cachedData);
  const mountedRef = useRef(true);
  const { profileData } = useProfile();

  const isGstRegistered = profileData?.taxDetails?.isGstRegistered === true &&
    profileData?.taxDetails?.gst &&
    profileData?.taxDetails?.gst !== 'Not Provided';

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Use cache if fresh enough and not forced
    const now = Date.now();
    if (!forceRefresh && _cachedData && now - _cacheTimestamp < CACHE_TTL) {
      setPayouts(_cachedData.payouts);
      setSummary(_cachedData.summary);
      setWithdrawals(_cachedData.withdrawals);
      setLoading(false);
      return _cachedData;
    }

    try {
      // Only show loading state if we have absolutely no data
      if (!_cachedData) {
        setLoading(true);
      }

      const [result, withdrawalRes] = await Promise.all([
        getPayoutsApi(),
        getWithdrawalHistory().catch(() => ({ success: true, data: [] }))
      ]);

      if (!mountedRef.current) return null;

      const newPayouts = result?.data || [];
      const newSummary = result?.summary || null;
      const newWithdrawals = withdrawalRes?.data || [];

      // Update module-level cache
      _cachedData = { payouts: newPayouts, summary: newSummary, withdrawals: newWithdrawals };
      _cacheTimestamp = Date.now();

      setPayouts(newPayouts);
      setSummary(newSummary);
      setWithdrawals(newWithdrawals);

      return _cachedData;
    } catch (err) {
      console.warn('Wallet data fetch failed:', err.message);
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Auto-refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      fetchData(true); // force refresh on focus

      return () => {
        mountedRef.current = false;
      };
    }, [fetchData])
  );

  // Calculate total withdrawals (approved + paid ONLY)
  // Per user request: do NOT deduct pending withdrawals from the wallet balance.
  const totalWithdrawn = withdrawals.reduce((acc, curr) => {
    if (curr.status === 'approved' || curr.status === 'paid') {
      return acc + (Number(curr.amount) || 0);
    }
    return acc;
  }, 0);

  // Calculate total net paid amount from payouts
  const totalPaid = payouts.reduce((acc, curr) => {
    if (curr.status === 'paid') {
      const payoutAmt = parseFloat(curr.payoutAmount) || 0;
      const tds = Math.round(payoutAmt * 0.02 * 100) / 100;
      const sgst = isGstRegistered ? 0 : Math.round(payoutAmt * 0.09 * 100) / 100;
      const cgst = isGstRegistered ? 0 : Math.round(payoutAmt * 0.09 * 100) / 100;
      const netAmt = Math.round((payoutAmt - tds - sgst - cgst) * 100) / 100;
      return acc + netAmt;
    }
    return acc;
  }, 0);

  // Wallet balance = total net paid amount - total withdrawn
  const walletBalance = Math.max(0, totalPaid - totalWithdrawn);

  const formattedBalance = walletBalance.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    payouts,
    summary,
    withdrawals,
    loading,
    walletBalance,
    formattedBalance,
    totalWithdrawn,
    refresh: () => fetchData(true),
  };
};

export default useWalletData;
