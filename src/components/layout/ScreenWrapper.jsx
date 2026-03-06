import React from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

const ScreenWrapper = ({
    children, scrollable = false, withPadding = true,
    edges = ['top', 'bottom', 'left', 'right'],
    style, contentStyle,
}) => {
    const { colors, spacing, isDark } = useTheme();
    const paddingH = withPadding ? spacing.base : 0;

    const innerContent = (
        <View style={[styles.flex, { paddingHorizontal: paddingH }, contentStyle]}>
            {children}
        </View>
    );

    return (
        <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: colors.background }, style]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
                translucent={false}
            />
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {scrollable ? (
                    <ScrollView
                        style={styles.flex}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {innerContent}
                    </ScrollView>
                ) : (
                    innerContent
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1 },
});

export default ScreenWrapper;