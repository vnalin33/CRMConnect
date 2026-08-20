import { Platform } from 'react-native';


const getApiBaseUrl = () => {
  if (__DEV__) {
    // localhost works for both emulator (with adb reverse) and USB devices
    // For USB devices: run `adb reverse tcp:5005 tcp:5005`
    return 'http://localhost:5005/api';
  }
  return 'https://oneassist.net.in/onebindapi/api';
};


const getCrmApiBaseUrl = () => {
  if (__DEV__) {
    // Unified backend — admin routes are now at /api/admin on the same server
    return 'http://localhost:5005';
  }
  // Production — unified backend behind Nginx reverse proxy
  return 'https://oneassist.net.in/onebindapi';
};

const API_BASE_URL = getApiBaseUrl();
const CRM_API_BASE_URL = getCrmApiBaseUrl();

export const ENV = {
  API_URL: API_BASE_URL,
  CRM_API_URL: CRM_API_BASE_URL,
  USE_MOCK: false,
};
