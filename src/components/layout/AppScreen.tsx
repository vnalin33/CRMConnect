import React from 'react';
import { SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/theme';

interface AppScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    safeAreaColor?: string;
}

export const AppScreen: React.FC<AppScreenProps> = ({
    children,
    style,
    safeAreaColor = COLORS.background,
}) => {
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: safeAreaColor }]}>
            <KeyboardAvoidingView
                style={[styles.keyboardView, style]}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {children}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});
