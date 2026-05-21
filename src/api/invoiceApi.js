import api from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_CACHE_KEY = '@crm_profile_cache';

/**
 * Read GST registration status from cached profile data.
 */
const getGstStatus = async () => {
  try {
    const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      const profile = JSON.parse(cached);
      return profile?.taxDetails?.isGstRegistered === true &&
             profile?.taxDetails?.gst &&
             profile?.taxDetails?.gst !== 'Not Provided';
    }
  } catch (e) {
    console.warn('Failed to read GST status from cache:', e);
  }
  return false;
};


export const generateInvoice = async (payoutItem) => {
  const isGstRegistered = await getGstStatus();

  const body = {
    trackId: parseInt(payoutItem.id, 10),
    customerName: payoutItem.name,
    loanType: payoutItem.loanType,
    serviceType: payoutItem.serviceType,
    processingType: payoutItem.processingType,
    loanAmount: payoutItem.loanAmount,
    disbursedAmount: payoutItem.disbursedAmount,
    payoutAmount: payoutItem.payoutAmount,
    bankName: payoutItem.bankName || '',
    trackNumber: payoutItem.trackNumber || '',
    isGstRegistered,
  };

  const result = await api.post('/invoices/generate', body);

  if (!result.success) {
    throw new Error(result.message || 'Failed to generate invoice');
  }
  return result.data;
};


export const generateCycleInvoice = async (payoutItem) => {
  const isGstRegistered = await getGstStatus();

  const body = {
    trackId: parseInt(payoutItem.id, 10),
    customerName: payoutItem.name,
    loanType: payoutItem.loanType,
    serviceType: payoutItem.serviceType,
    processingType: payoutItem.processingType,
    loanAmount: payoutItem.loanAmount,
    disbursedAmount: payoutItem.disbursedAmount,
    payoutAmount: payoutItem.payoutAmount,
    bankName: payoutItem.bankName || '',
    trackNumber: payoutItem.trackNumber || '',
    isGstRegistered,
  };

  const result = await api.post('/invoices/generate-cycle', body);

  if (!result.success) {
    throw new Error(result.message || 'Failed to generate cycle invoice');
  }
  return result.data;
};


export const getInvoicesByTrackIds = async (trackIds) => {
  const result = await api.post('/invoices/by-tracks', {
    trackIds: trackIds.map((id) => parseInt(id, 10)),
  });

  if (!result.success) {
    throw new Error(result.message || 'Failed to fetch invoice status');
  }
  return result.data;
};
