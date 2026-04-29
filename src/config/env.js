import { Platform } from 'react-native';

const getApiBaseUrl = () => {
  if (__DEV__) {
    // ── Development URLs ──────────────────────────────────────────
    // Android physical device (USB):
    //   Run: adb reverse tcp:5005 tcp:5005
    //   Then localhost on the phone maps to your PC's port 5005.
    //
    // Android emulator:
    //   10.0.2.2 is a special alias to the host machine's loopback.
    //
    // iOS simulator:
    //   localhost works out of the box.
    // ──────────────────────────────────────────────────────────────
    if (Platform.OS === 'android') {
      // USB debugging: run `adb reverse tcp:5005 tcp:5005` first.
      // This maps the phone's localhost:5005 → PC's localhost:5005.
      // Fallback LAN IP (same WiFi): http://192.168.1.21:5005/api
      return 'http://localhost:5005/api';
    }
    // iOS simulator
    return 'http://localhost:5005/api';
  }
  return 'https://api.crmconnect.app/api';
};

const API_BASE_URL = getApiBaseUrl();

export const ENV = {
  API_URL: API_BASE_URL,
  USE_MOCK: false,
};
