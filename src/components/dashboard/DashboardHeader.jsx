import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';
import AppLogo from '../common/AppLogo';
import { useNotifications } from '../../hooks/useNotifications';

const DashboardHeader = ({ onNotification, onMenu }) => {
    const { spacing } = useTheme();
    const { unreadCount } = useNotifications();

    return (
        <View style={[styles.container, { paddingHorizontal: spacing.base, paddingVertical: spacing.md }]}>
            <View style={styles.left}>
                <AppLogo size={48} isDashboard={true} />
                <AppText
                    variant="h2"
                    style={{ marginLeft: spacing.sm, color: '#FFFFFF', fontWeight: '700' }}
                >
                    ONE Bind
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
                    <Feather name="bell" size={22} color="#FFFFFF" />
                    {unreadCount > 0 && (
                        <View style={styles.badge}>
                            <AppText variant="caption" style={styles.badgeText}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </AppText>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onMenu}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Menu"
                    style={[styles.iconBtn, { marginLeft: spacing.base }]}
                >
                    <Feather name="menu" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    left: { flexDirection: 'row', alignItems: 'center' },
    right: { flexDirection: 'row', alignItems: 'center' },
    iconBtn: { padding: 4, position: 'relative' },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#EF4444', // Red for alerts
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1.5,
        borderColor: '#4F46E5', // To match gradient background seamlessly
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        lineHeight: 12,
    }
});

export default DashboardHeader;
