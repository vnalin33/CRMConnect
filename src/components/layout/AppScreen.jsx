import React from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

const AppScreen = ({ children, style }) => {
    const { colors } = useTheme();
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={[styles.keyboardView, { backgroundColor: colors.background }, style]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {children}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    keyboardView: { flex: 1 },
});

export default AppScreen;
