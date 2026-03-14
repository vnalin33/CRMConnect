import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Linking from 'react-native';

import LoginScreen from '../auth/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import StatusScreen from '../screens/StatusScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NewLeadScreen from '../screens/NewLeadScreen';
import PayoutScreen from '../screens/PayoutScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

import CustomTabBar from './CustomTabBar';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarWrapper = (props) => <CustomTabBar {...props} />;

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
        </Tab.Navigator>
    );
}

const linking = {
    prefixes: ['crmconnect://', 'https://crmconnect.app'],
    config: {
        screens: {
            ResetPassword: {
                path: 'reset-password',
                parse: {
                    token: (token) => `${token}`,
                },
            },
        },
    },
};

export const AppNavigator = () => {
    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};