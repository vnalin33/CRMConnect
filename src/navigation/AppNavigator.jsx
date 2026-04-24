import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Linking } from 'react-native';

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

import CustomTabBar from './CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarWrapper = (props) => <CustomTabBar {...props} />;

/**
 * Parses a deep link URL and extracts the token parameter.
 * Supports: crmconnect://reset-password?token=XXXX
 */
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
                <Stack.Screen name="ConcernDetails" component={ConcernDetailsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};