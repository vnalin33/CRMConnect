import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppScreen } from '../components/layout/AppScreen';
import { TYPOGRAPHY, COLORS } from '../constants/theme';

export const ContactsScreen = () => {
    return (
        <AppScreen style={styles.container}>
            <Text style={styles.title}>Contacts</Text>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...TYPOGRAPHY.h2,
        color: COLORS.text,
    },
});
