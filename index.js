/**
 * @format
 */

// Silence React Native Firebase v22 modular API deprecation warnings
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { AppRegistry } from 'react-native';
import { getMessaging, onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// ── Firebase Cloud Messaging: Background message handler ──
// This runs when the app is in background or killed state.
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('[FCM BG] Message received:', remoteMessage.notification?.title);
  // FCM automatically displays the notification when app is in background
  // No need to call notifee.displayNotification here — Android handles it natively
});

// Register background notification event handler for Notifee.
// This runs even when the app is killed/backgrounded.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;

  if (type === EventType.PRESS) {
    // User tapped the notification — app will open automatically
    console.log('[BG] Notification pressed:', notification?.data);
  }

  if (type === EventType.DISMISSED) {
    console.log('[BG] Notification dismissed');
  }
});

AppRegistry.registerComponent(appName, () => App);
