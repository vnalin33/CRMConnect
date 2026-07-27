/**
 * NotificationService.js
 * Push notification service using Firebase Cloud Messaging (modular API) + @notifee/react-native.
 * Handles FCM token registration, foreground display, background messages, and polling fallback.
 */
import {
  getMessaging,
  getToken,
  onTokenRefresh,
  onMessage,
  requestPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidColor, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import api from '../api/apiClient';

const POLL_INTERVAL = 30000; // 30 seconds
const LAST_SEEN_KEY = '@notification_last_seen_id';
const FCM_TOKEN_KEY = '@fcm_device_token';
const CHANNEL_ID = 'crm_default';
const CHANNEL_HIGH_ID = 'crm_high_priority';

class NotificationService {
  constructor() {
    this._pollTimer = null;
    this._appStateSubscription = null;
    this._initialized = false;
    this._fcmToken = null;
    this._unsubscribeMessage = null;
    this._unsubscribeTokenRefresh = null;
    this.processedIds = new Set();
  }

  /**
   * Initialize notification channels, FCM, and start polling.
   * Call this once from App.jsx on mount.
   */
  async initialize() {
    if (this._initialized) return;
    this._initialized = true;

    // Create Android notification channels
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'General Notifications',
        description: 'General ONEBind notifications',
        importance: AndroidImportance.DEFAULT,
        sound: 'default',
      });

      await notifee.createChannel({
        id: CHANNEL_HIGH_ID,
        name: 'Important Updates',
        description: 'Invoice, withdrawal, and payment notifications',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: AndroidColor.BLUE,
      });
    }

    // ── Firebase Cloud Messaging Setup ──
    await this._setupFCM();

    // Listen to foreground notification events (tap handling)
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('[Notification] User tapped:', detail.notification?.data);
      }
    });

    // Start polling when app is in foreground (fallback for missed pushes)
    this._startPolling();

    // Handle app state changes
    this._appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        this._startPolling();
      } else {
        this._stopPolling();
      }
    });

    console.log('[NotificationService] Initialized with FCM (modular API)');
  }

  /**
   * Setup Firebase Cloud Messaging using modular API.
   */
  async _setupFCM() {
    try {
      const messaging = getMessaging();

      // Request notification permission
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('[FCM] Notification permission denied');
        return;
      }

      // Get FCM token
      const fcmToken = await getToken(messaging);
      if (fcmToken) {
        this._fcmToken = fcmToken;
        await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);
        console.log('[FCM] Token obtained:', fcmToken.substring(0, 30) + '...');

        // Register token with backend (will be called again after login)
        await this._registerTokenWithBackend(fcmToken);
      }

      // Listen for token refresh
      this._unsubscribeTokenRefresh = onTokenRefresh(messaging, async (newToken) => {
        console.log('[FCM] Token refreshed');
        this._fcmToken = newToken;
        await AsyncStorage.setItem(FCM_TOKEN_KEY, newToken);
        await this._registerTokenWithBackend(newToken);
      });

      // Handle foreground messages — display via Notifee
      this._unsubscribeMessage = onMessage(messaging, async (remoteMessage) => {
        console.log('[FCM] Foreground message:', remoteMessage.data);
        const data = remoteMessage.data || {};
        const title = data.title;
        const body = data.body;
        const notificationId = data.notificationId;
        const isHighPriority = ['INVOICE', 'PAYOUT'].includes(data.type);

        if (title) {
          if (notificationId) {
            if (this.processedIds.has(notificationId)) {
              console.log('[FCM] Skipping duplicate foreground notification:', notificationId);
              return;
            }
            this.processedIds.add(notificationId);
            if (this.processedIds.size > 100) {
              const firstVal = this.processedIds.values().next().value;
              this.processedIds.delete(firstVal);
            }
            // Update last seen key to avoid polling the same notification
            try {
              const currentLastSeen = parseInt(await AsyncStorage.getItem(LAST_SEEN_KEY)) || 0;
              const notifIdNum = parseInt(notificationId);
              if (!isNaN(notifIdNum) && notifIdNum > currentLastSeen) {
                await AsyncStorage.setItem(LAST_SEEN_KEY, String(notifIdNum));
              }
            } catch (err) {
              console.warn('[FCM] Error updating last seen:', err.message);
            }
          }
          await this.displayNotification(title, body || '', data, isHighPriority);
        }
      });

      console.log('[FCM] Setup complete (modular API)');
    } catch (err) {
      console.warn('[FCM] Setup error (non-fatal):', err.message);
    }
  }

  /**
   * Register the FCM token with the backend server.
   */
  async _registerTokenWithBackend(token) {
    try {
      const authToken = await AsyncStorage.getItem('auth_token');
      if (!authToken) return;

      await api.post('/fcm/register', {
        token,
        deviceInfo: `${Platform.OS} ${Platform.Version}`,
      });
      console.log('[FCM] Token registered with backend');
    } catch (err) {
      console.debug('[FCM] Backend registration failed (will retry):', err.message);
    }
  }

  /**
   * Call this after successful login to register the FCM token.
   */
  async registerAfterLogin() {
    try {
      const token = this._fcmToken || await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (token) {
        await this._registerTokenWithBackend(token);
      }
    } catch (err) {
      console.debug('[FCM] Post-login registration error:', err.message);
    }
  }

  /**
   * Call this on logout to unregister the FCM token.
   */
  async unregisterOnLogout() {
    try {
      const token = this._fcmToken || await AsyncStorage.getItem(FCM_TOKEN_KEY);
      if (token) {
        await api.delete('/fcm/unregister', { body: { token } });
        console.log('[FCM] Token unregistered on logout');
      }
    } catch (err) {
      console.debug('[FCM] Logout unregister error:', err.message);
    }
  }

  /**
   * Display a local push notification via Notifee.
   */
  async displayNotification(title, body, data = {}, highPriority = false) {
    try {
      await notifee.displayNotification({
        title,
        body,
        data,
        android: {
          channelId: highPriority ? CHANNEL_HIGH_ID : CHANNEL_ID,
          importance: highPriority ? AndroidImportance.HIGH : AndroidImportance.DEFAULT,
          smallIcon: 'logo',
          color: '#6C5CE7',
          pressAction: { id: 'default' },
          showTimestamp: true,
          timestamp: Date.now(),
        },
      });
    } catch (err) {
      console.warn('[NotificationService] Display error:', err.message);
    }
  }

  /**
   * Poll the backend for new notifications (fallback for missed FCM pushes).
   */
  async _pollForNew() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return;

      const lastSeenId = parseInt(await AsyncStorage.getItem(LAST_SEEN_KEY)) || 0;
      const response = await api.get(`/notifications/poll?since_id=${lastSeenId}`);

      if (response?.success && response.data?.length > 0) {
        const newNotifications = response.data;

        for (const notif of newNotifications) {
          const notifIdStr = String(notif.id);
          if (this.processedIds.has(notifIdStr)) {
            console.log('[NotificationService] Skipping already displayed poll notification:', notifIdStr);
            continue;
          }
          this.processedIds.add(notifIdStr);
          if (this.processedIds.size > 100) {
            const firstVal = this.processedIds.values().next().value;
            this.processedIds.delete(firstVal);
          }

          const isHighPriority = ['INVOICE', 'PAYOUT'].includes(notif.type);
          await this.displayNotification(
            notif.title,
            notif.body,
            { id: notifIdStr, type: notif.type },
            isHighPriority
          );
        }

        const maxId = Math.max(...newNotifications.map(n => n.id));
        await AsyncStorage.setItem(LAST_SEEN_KEY, String(maxId));
        console.log(`[NotificationService] Displayed ${newNotifications.length} new notification(s)`);
      }
    } catch (err) {
      if (__DEV__) {
        console.debug('[NotificationService] Poll error:', err.message);
      }
    }
  }

  _startPolling() {
    this._stopPolling();
    this._pollForNew();
    this._pollTimer = setInterval(() => this._pollForNew(), POLL_INTERVAL);
  }

  _stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  /**
   * Reset last seen ID (call on logout).
   */
  async reset() {
    this._stopPolling();
    await AsyncStorage.removeItem(LAST_SEEN_KEY);
    this._initialized = false;
  }

  /**
   * Cleanup on unmount.
   */
  destroy() {
    this._stopPolling();
    if (this._appStateSubscription) {
      this._appStateSubscription.remove();
    }
    if (this._unsubscribeMessage) {
      this._unsubscribeMessage();
    }
    if (this._unsubscribeTokenRefresh) {
      this._unsubscribeTokenRefresh();
    }
  }
}

// Singleton
const notificationService = new NotificationService();
export default notificationService;
