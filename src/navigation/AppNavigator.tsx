import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ContactsScreen } from '../screens/ContactsScreen';
import { COLORS } from '../constants/theme';

export type RootStackParamList = {
    Home: undefined;
    Contacts: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: COLORS.surface,
                    },
                    headerTintColor: COLORS.text,
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                    contentStyle: {
                        backgroundColor: COLORS.background,
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'CRM Connect Dashboard' }}
                />
                <Stack.Screen
                    name="Contacts"
                    component={ContactsScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
