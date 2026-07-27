/**
 * @format
 */

// Silence React Native Firebase v22 modular API deprecation warnings
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import { AppRegistry } from 'react-native';
import { getMessaging, onMessage, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType, AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// ── Firebase Cloud Messaging: Background message handler ──
// This runs when the app is in background or killed state.
const messaging = getMessaging();
setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  console.log('[FCM BG] Message received:', remoteMessage.data);
  const data = remoteMessage.data || {};
  const title = data.title;
  const body = data.body;
  const isHighPriority = ['INVOICE', 'PAYOUT'].includes(data.type);

  if (title) {
    if (data.notificationId) {
      try {
        const LAST_SEEN_KEY = '@notification_last_seen_id';
        const currentLastSeen = parseInt(await AsyncStorage.getItem(LAST_SEEN_KEY)) || 0;
        const notifIdNum = parseInt(data.notificationId);
        if (!isNaN(notifIdNum) && notifIdNum > currentLastSeen) {
          await AsyncStorage.setItem(LAST_SEEN_KEY, String(notifIdNum));
        }
      } catch (err) {
        console.warn('[FCM BG] Error updating last seen:', err.message);
      }
    }

    try {
      await notifee.displayNotification({
        title,
        body: body || '',
        data,
        android: {
          channelId: isHighPriority ? 'crm_high_priority' : 'crm_default',
          importance: isHighPriority ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
          smallIcon: 'logo',
          color: '#6C5CE7',
          pressAction: { id: 'default' },
          showTimestamp: true,
          timestamp: Date.now(),
        },
      });
    } catch (err) {
      console.warn('[FCM BG] Display notification error:', err.message);
    }
  }
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
