import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../theme';

const HomeScreen = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.primary }]}>Home Dashboard</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Welcome to CRM Connect</Text>
        </View>
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
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
    },
});

export default HomeScreen;
