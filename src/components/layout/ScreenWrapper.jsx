import React from 'react';
import {
    View, ScrollView, KeyboardAvoidingView,
    Platform, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

export const ScreenWrapper = ({
    children,
    scrollable = false,
    style,
    contentStyle,
    withPadding = true,
    edges = ['top', 'bottom', 'left', 'right'],
}) => {
    const { colors, spacing, isDark } = useTheme();

    const content = scrollable ? (
        <ScrollView
            contentContainerStyle={[
                withPadding && { paddingHorizontal: spacing.base },
                contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {children}
        </ScrollView>
    ) : (
        <View
            style={[
                styles.flex,
                withPadding && { paddingHorizontal: spacing.base },
                contentStyle,
            ]}
        >
            {children}
        </View>
    );

    return (
        <SafeAreaView
            edges={edges}
            style={[styles.flex, { backgroundColor: colors.background }, style]}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
                translucent={false}
            />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                {content}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1 },
});
