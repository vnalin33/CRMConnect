import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';
import AppLogo from '../common/AppLogo';

const DashboardHeader = ({ onNotification, onMenu }) => {
    const { colors, spacing } = useTheme();

    return (
        <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.md }]}>
            <View style={styles.left}>
                <AppLogo size={36} animated={false} />
                <AppText
                    variant="h2"
                    style={{ marginLeft: spacing.sm, color: colors.textPrimary, fontWeight: '700' }}
                >
                    CRM Connect
                </AppText>
            </View>

            <View style={styles.right}>
                <TouchableOpacity
                    onPress={onNotification}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Notifications"
                    style={styles.iconBtn}
                >
                    <Feather name="bell" size={22} color={colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onMenu}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Menu"
                    style={[styles.iconBtn, { marginLeft: spacing.base }]}
                >
                    <Feather name="menu" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    left: { flexDirection: 'row', alignItems: 'center' },
    right: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { padding: 4 },
});

export default DashboardHeader;
