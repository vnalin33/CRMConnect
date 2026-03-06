import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '../theme';

const ContactsScreen = () => {
    const { colors } = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Contacts</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
});

export default ContactsScreen;
