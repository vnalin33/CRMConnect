import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ContactsScreen from '../screens/ContactsScreen';
import LoginScreen from '../auth/LoginScreen';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const { colors } = useTheme();

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.textPrimary,
                    headerTitleStyle: { fontWeight: '600' },
                    contentStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CRM Connect Dashboard' }} />
                <Stack.Screen name="Contacts" component={ContactsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
