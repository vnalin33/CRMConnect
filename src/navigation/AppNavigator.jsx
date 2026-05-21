import React, { useEffect, useRef, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking, AppState, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setOnAuthFailure } from '../api/apiClient';
import { useToast } from '../context/ToastContext';

import LoginScreen from '../auth/LoginScreen';
import SignupScreen from '../auth/SignupScreen';
import ForgotPasswordScreen from '../auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../auth/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import StatusScreen from '../screens/StatusScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewLeadScreen from '../screens/NewLeadScreen';
import PayoutScreen from '../screens/PayoutScreen';
import CheckListScreen from '../screens/CheckListScreen';
import CustomersScreen from '../screens/CustomersScreen';
import DraftsScreen from '../screens/DraftsScreen';
import RaiseInvoiceScreen from '../screens/RaiseInvoiceScreen';
import ConcernsScreen from '../screens/ConcernsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import LeadListScreen from '../screens/LeadListScreen';
import LeadDetailScreen from '../screens/LeadDetailScreen';
import ConcernDetailsScreen from '../screens/ConcernDetailsScreen';
import SupportScreen from '../screens/SupportScreen';
import WalletScreen from '../screens/WalletScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

import CustomTabBar from './CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarWrapper = (props) => <CustomTabBar {...props} />;

const extractTokenFromUrl = (url) => {
    if (!url) return null;
    try {
        // Handle crmconnect://reset-password?token=XXXX
        const match = url.match(/[?&]token=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : null;
    } catch {
        return null;
    }
};

function MainTabs() {
    return (
        <Tab.Navigator
            tabBar={CustomTabBarWrapper}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Status" component={StatusScreen} />
            <Tab.Screen name="NewLead" component={NewLeadScreen} />
            <Tab.Screen name="Payout" component={PayoutScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
            <Tab.Screen name="CheckList" component={CheckListScreen} />
            <Tab.Screen name="Customers" component={CustomersScreen} />
            <Tab.Screen name="Drafts" component={DraftsScreen} />
            <Tab.Screen name="RaiseInvoice" component={RaiseInvoiceScreen} />
            <Tab.Screen name="Concerns" component={ConcernsScreen} />
            <Tab.Screen name="Wallet" component={WalletScreen} />
            <Tab.Screen name="Support" component={SupportScreen} />
        </Tab.Navigator>
    );
}

export const AppNavigator = () => {
    const navigationRef = useRef(null);
    const { showToast } = useToast();

    // ── Global 401 handler — auto-logout on expired JWT ──────────────
    const forceLogout = useCallback(async () => {
        try {
            await AsyncStorage.multiRemove(['auth_token', 'user_data', 'auth_login_time']);
        } catch {}
        if (navigationRef.current?.isReady()) {
            navigationRef.current.resetRoot({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        }
    }, []);

    useEffect(() => {
        setOnAuthFailure(forceLogout);
    }, [forceLogout]);

    // ── JWT 30-min Session Expiry — works even when app is in background ──
    const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes

    const checkSessionExpiry = useCallback(async () => {
        try {
            const loginTime = await AsyncStorage.getItem('auth_login_time');
            if (!loginTime) return; // Not logged in

            const elapsed = Date.now() - parseInt(loginTime, 10);
            if (elapsed >= SESSION_DURATION_MS) {
                showToast('warning', 'Session Expired', 'Your session has expired after 30 minutes. Please sign in again.');
                await forceLogout();
            }
        } catch {}
    }, [forceLogout]);

    // Foreground interval — checks every 60s while app is active
    useEffect(() => {
        const intervalId = setInterval(checkSessionExpiry, 60_000);
        return () => clearInterval(intervalId);
    }, [checkSessionExpiry]);

    // Background-to-foreground — instantly checks when app wakes up
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                checkSessionExpiry();
            }
        });
        return () => subscription.remove();
    }, [checkSessionExpiry]);

    // Handle deep link that opens the app from COLD START
    useEffect(() => {
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink(url);
            }
        });

        // Handle deep link when app is already OPEN (background)
        const subscription = Linking.addEventListener('url', ({ url }) => {
            handleDeepLink(url);
        });

        return () => subscription.remove();
    }, []);

    const handleDeepLink = (url) => {
        if (!url) return;

        const token = extractTokenFromUrl(url);

        // Navigate to ResetPassword screen if the URL contains a token
        if (url.includes('reset-password') && token) {
            // Wait for navigation to be ready
            const navigate = () => {
                if (navigationRef.current?.isReady()) {
                    navigationRef.current.navigate('ResetPassword', { token });
                } else {
                    // Retry after a short delay if nav is not ready yet (cold start)
                    setTimeout(navigate, 100);
                }
            };
            navigate();
        }
    };

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="LeadList" component={LeadListScreen} />
                <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="ConcernDetails" component={ConcernDetailsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};