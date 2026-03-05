import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { TYPOGRAPHY, COLORS } from '../constants/theme';

export const HomeScreen = () => {
    return (
        <AppScreen style={styles.container}>
            <Text style={styles.title}>Home Dashboard</Text>
            <Text style={styles.subtitle}>Welcome to CRM Connect</Text>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        ...TYPOGRAPHY.h1,
        color: COLORS.primary,
        marginBottom: 10,
    },
    subtitle: {
        ...TYPOGRAPHY.body1,
        color: COLORS.textSecondary,
    },
});
