import { Platform } from 'react-native';


const getApiBaseUrl = () => {
  if (__DEV__) {
    // localhost works for both emulator (with adb reverse) and USB devices
    // For USB devices: run `adb reverse tcp:5005 tcp:5005`
    return 'http://localhost:5005/api';
  }
  return 'https://api.onebind.app/api';
};


const getCrmApiBaseUrl = () => {
  if (__DEV__) {
    // For USB devices: run `adb reverse tcp:8086 tcp:8086`
    return 'http://localhost:8086';
  }
  // Production URL — update when deployed
  return 'https://crm-api.onebind.app';
};

const API_BASE_URL = getApiBaseUrl();
const CRM_API_BASE_URL = getCrmApiBaseUrl();

export const ENV = {
  API_URL: API_BASE_URL,
  CRM_API_URL: CRM_API_BASE_URL,
  USE_MOCK: false,
};
