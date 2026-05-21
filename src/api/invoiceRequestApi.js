/**
 * invoiceRequestApi.js
 * Sends invoice requests to Oneassist-CRMConnect backend (port 8086)
 * for admin approval/rejection workflow.
 * Both mobile and admin portal share the same backend + database.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Oneassist-CRMConnect backend runs on port 8086
const getCRMBackendUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://127.0.0.1:8086';
    }
    return 'http://localhost:8086';
  }
  // Production URL — update when deployed
  return 'http://localhost:8086';
};

const CRM_BACKEND_URL = getCRMBackendUrl();

/**
 * Submit an invoice request to CRM backend for admin approval.
 * @param {Object} item - The payout item data from the mobile app
 * @param {string} type - 'instant' or 'cycle'
 * @returns {Object} - The API response
 */
export const submitInvoiceRequest = async (item, type = 'instant') => {
  try {
    // Get logged-in user data
    const userData = await AsyncStorage.getItem('user_data');
    const user = userData ? JSON.parse(userData) : {};

    // Get GST status from profile cache
    const profileCache = await AsyncStorage.getItem('@crm_profile_cache');
    const profile = profileCache ? JSON.parse(profileCache) : {};
    const isGstRegistered = profile?.taxDetails?.isGstRegistered === true &&
      profile?.taxDetails?.gst &&
      profile?.taxDetails?.gst !== 'Not Provided';

    const payoutAmount = parseFloat(item.payoutAmount) || 0;
    const tdsRate = 0.02;
    const gstRate = 0.09;

    const tds = Math.round(payoutAmount * tdsRate * 100) / 100;
    let sgst = 0;
    let cgst = 0;
    let totalAmount;

    if (isGstRegistered) {
      // GST registered: only TDS deducted
      totalAmount = Math.round((payoutAmount - tds) * 100) / 100;
    } else {
      // Not GST registered: SGST + CGST + TDS deducted
      sgst = Math.round(payoutAmount * gstRate * 100) / 100;
      cgst = sgst;
      totalAmount = Math.round((payoutAmount - sgst - cgst - tds) * 100) / 100;
    }

    const body = {
      connectorid: user.connectorId || user.id || null,
      connector_name: user.name || user.identifier || '',
      contact_name: item.name || '',
      loan_type: item.loanType || '',
      loan_amount: item.loanAmount || 0,
      disbursed_amount: item.disbursedAmount || 0,
      payout_amount: payoutAmount,
      sgst,
      cgst,
      tds,
      total_amount: totalAmount,
      invoice_type: type,
      bank_name: item.bankName || '',
      track_number: item.trackNumber || '',
      track_id: item.id ? parseInt(item.id, 10) : null,
      service_type: item.serviceType || '',
      processing_type: item.processingType || '',
      is_gst_registered: isGstRegistered,
    };

    const response = await fetch(`${CRM_BACKEND_URL}/submitInvoiceRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return result;

  } catch (err) {
    console.error('Failed to submit invoice request:', err.message);
    throw new Error(err.message || 'Failed to submit invoice request');
  }
};


/**
 * Get all invoice request statuses for the current connector.
 * Used to display status on payout cards and invoice list.
 */
export const getInvoiceRequestStatuses = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    const user = userData ? JSON.parse(userData) : {};
    const connectorid = user.connectorId || user.id;

    if (!connectorid) return { success: true, data: [] };

    const response = await fetch(
      `${CRM_BACKEND_URL}/getInvoiceRequestsByConnector?connectorid=${connectorid}`
    );
    return await response.json();
  } catch (err) {
    console.warn('Failed to get invoice request statuses:', err.message);
    return { success: false, data: [] };
  }
};


export const getWalletBalance = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    const user = userData ? JSON.parse(userData) : {};
    const connectorid = user.connectorId || user.id;

    if (!connectorid) return { success: true, data: { walletBalance: '0.00' } };

    const response = await fetch(
      `${CRM_BACKEND_URL}/getWalletBalance?connectorid=${connectorid}`
    );
    return await response.json();
  } catch (err) {
    console.warn('Failed to get wallet balance:', err.message);
    return { success: true, data: { walletBalance: '0.00' } };
  }
};

/**
 * Fetch the final tax invoice HTML from the admin backend by track_id.
 * Returns the HTML string that can be converted to PDF.
 * @param {number} trackId - the payout/lead track ID
 * @returns {string} HTML content of the final invoice
 */
export const getInvoiceHtmlByTrackId = async (trackId) => {
  const response = await fetch(
    `${CRM_BACKEND_URL}/api/invoice-requests/by-track/${trackId}/invoice-pdf`
  );
  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || 'Failed to fetch invoice');
  }
  return await response.text();
};

