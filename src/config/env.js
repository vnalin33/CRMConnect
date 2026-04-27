import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (__DEV__) {
    // USB: `adb reverse tcp:5005 tcp:5005` maps device localhost → PC port
    return 'http://localhost:5005/api';
  }
  return 'https://api.crmconnect.app/api';
};

const API_BASE_URL = getApiBaseUrl();
 
export const ENV = {
  API_URL: API_BASE_URL,
  USE_MOCK: false,
};
