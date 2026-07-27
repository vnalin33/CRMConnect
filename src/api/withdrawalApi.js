/**
 * withdrawalApi.js
 * Sends withdrawal requests to Oneassist-CRMConnect backend (port 8086)
 * for admin approval/processing workflow.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import safeFetch from './safeFetch';

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

    return await safeFetch(`${ENV.CRM_API_URL}/submitWithdrawalRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
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

    return await safeFetch(
      `${ENV.CRM_API_URL}/getWithdrawalsByConnector?connector_id=${connectorId}`
    );
  } catch (err) {
    console.warn('Failed to get withdrawal history:', err.message);
    return { success: false, data: [] };
  }
};
