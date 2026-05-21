/**
 * ToastContext.js
 * Global toast notification system for CRM Connect.
 * Provides success, error, warning, and info toasts with animated transitions.
 * 
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('success', 'Profile updated successfully');
 *   showToast('error', 'Failed to save', 'Please try again');
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

const { width: SCREEN_W } = Dimensions.get('window');

const ToastContext = createContext(null);

const TOAST_CONFIG = {
    success: { icon: 'check-circle', bg: '#059669', accent: '#34D399', label: 'Success' },
    error:   { icon: 'x-circle',     bg: '#DC2626', accent: '#F87171', label: 'Error' },
    warning: { icon: 'alert-triangle', bg: '#D97706', accent: '#FBBF24', label: 'Warning' },
    info:    { icon: 'info',         bg: '#2563EB', accent: '#60A5FA', label: 'Info' },
};

const TOAST_DURATION = 3500;

const ToastItem = ({ toast, onDismiss }) => {
    const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
            Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(slideAnim, { toValue: -100, duration: 250, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            ]).start(() => onDismiss(toast.id));
        }, toast.duration || TOAST_DURATION);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: config.bg,
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <View style={[styles.accentBar, { backgroundColor: config.accent }]} />
            <View style={styles.iconWrap}>
                <Feather name={config.icon} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.textWrap}>
                {toast.title ? (
                    <>
                        <Animated.Text style={styles.toastTitle}>{toast.title}</Animated.Text>
                        {toast.message ? <Animated.Text style={styles.toastMessage}>{toast.message}</Animated.Text> : null}
                    </>
                ) : (
                    <Animated.Text style={styles.toastTitle}>{toast.message}</Animated.Text>
                )}
            </View>
            <TouchableOpacity onPress={() => onDismiss(toast.id)} style={styles.dismissBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
        </Animated.View>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const insets = useSafeAreaInsets();
    const idCounter = useRef(0);

    const showToast = useCallback((type, titleOrMessage, message, duration) => {
        const id = ++idCounter.current;
        const toast = {
            id,
            type,
            title: message ? titleOrMessage : null,
            message: message || titleOrMessage,
            duration,
        };
        setToasts(prev => [...prev, toast]);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
                ))}
            </View>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback for components rendered outside the provider
        return {
            showToast: (type, title, message) => {
                console.warn('[Toast] Provider not found, falling back to console:', type, title, message);
            },
        };
    }
    return ctx;
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 9999,
        alignItems: 'center',
        pointerEvents: 'box-none',
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'center',
        width: SCREEN_W - 32,
        marginBottom: 8,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: 14,
        borderBottomLeftRadius: 14,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    textWrap: {
        flex: 1,
    },
    toastTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.1,
    },
    toastMessage: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12.5,
        marginTop: 2,
        lineHeight: 17,
    },
    dismissBtn: {
        padding: 4,
        marginLeft: 8,
    },
});
