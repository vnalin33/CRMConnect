/**
 * withdrawalApi.js
 * Sends withdrawal requests to Oneassist-CRMConnect backend (port 8086)
 * for admin approval/processing workflow.
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
  return 'http://localhost:8086';
};

const CRM_BACKEND_URL = getCRMBackendUrl();

/**
 * Submit a withdrawal request to CRM backend for admin processing.
 */
export const submitWithdrawalRequest = async (amount, bankDetails) => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    const user = userData ? JSON.parse(userData) : {};

    // Clean 'Not Provided' placeholder values
    const clean = (val) => (val && val !== 'Not Provided') ? val : '';

    const formattedBank = {
      ifsc: clean(bankDetails.ifsc),
      account: clean(bankDetails.account),
      branch: clean(bankDetails.branch),
      bank_name: clean(bankDetails.bankName) || clean(bankDetails.bank_name),
      account_holder: clean(bankDetails.accountHolderName) || clean(bankDetails.account_holder),
    };

    const body = {
      connector_id: user.connectorId || user.id || null,
      connector_name: user.name || user.identifier || '',
      amount,
      bank_details: formattedBank,
    };

    const response = await fetch(`${CRM_BACKEND_URL}/submitWithdrawalRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    return result;
  } catch (err) {
    console.error('Failed to submit withdrawal request:', err.message);
    throw new Error(err.message || 'Failed to submit withdrawal request');
  }
};

/**
 * Get withdrawal request history for the current connector.
 */
export const getWithdrawalHistory = async () => {
  try {
    const userData = await AsyncStorage.getItem('user_data');
    const user = userData ? JSON.parse(userData) : {};
    const connectorId = user.connectorId || user.id;

    if (!connectorId) return { success: true, data: [] };

    const response = await fetch(
      `${CRM_BACKEND_URL}/getWithdrawalsByConnector?connector_id=${connectorId}`
    );
    return await response.json();
  } catch (err) {
    console.warn('Failed to get withdrawal history:', err.message);
    return { success: false, data: [] };
  }
};
