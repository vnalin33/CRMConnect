/**
 * Re-export useNotifications from the global NotificationContext.
 * This file exists for backward compatibility — all notification state
 * is now managed by the NotificationProvider in context/NotificationContext.js
 */
export { useNotifications } from '../context/NotificationContext';
