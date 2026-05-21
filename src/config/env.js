import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (__DEV__) {

    if (Platform.OS === 'android') {

      return 'http://127.0.0.1:5005/api';
    }
    // iOS simulator or other fallbacks
    return 'http://127.0.0.1:5005/api';
  }
  return 'https://api.crmconnect.app/api';
};

const API_BASE_URL = getApiBaseUrl();

export const ENV = {
  API_URL: API_BASE_URL,
  USE_MOCK: false,
};
