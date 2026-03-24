import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../auth/LoginScreen';
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
import ConcernDetailsScreen from '../screens/ConcernDetailsScreen';
import WalletScreen from '../screens/WalletScreen';
import SupportScreen from '../screens/SupportScreen';

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
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen name="ConcernDetails" component={ConcernDetailsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};