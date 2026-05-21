import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme';
import AppText from '../components/common/AppText';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsScreen = ({ navigation }) => {
    const { colors, spacing, radius } = useTheme();
    const { notifications, loading, markAsRead, markAllAsRead, clearAll, refresh } = useNotifications();

    const getIconForType = (type) => {
        switch(type) {
            case 'PAYOUT': return { name: 'dollar-sign', color: '#00C896', bg: '#E6F9F4' };
            case 'LEAD': return { name: 'user', color: '#6855F0', bg: '#F0EEFD' };
            case 'INVOICE': return { name: 'file-text', color: '#F59E0B', bg: '#FEF3C7' };
            default: return { name: 'bell', color: '#3B82F6', bg: '#EFF6FF' };
        }
    };

    const renderItem = ({ item }) => {
        const iconConfig = getIconForType(item.type);
        const isUnread = !item.read_status;

        return (
            <TouchableOpacity 
                style={[
                    styles.notificationCard, 
                    { backgroundColor: isUnread ? colors.surface : colors.background, borderColor: colors.border, borderRadius: radius.lg }
                ]}
                onPress={() => {
                    if (isUnread) markAsRead(item.id);
                }}
            >
                <View style={[styles.iconWrapper, { backgroundColor: iconConfig.bg, borderRadius: radius.full }]}>
                    <Feather name={iconConfig.name} size={20} color={iconConfig.color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <AppText variant="subtitle2" style={{ fontWeight: isUnread ? '700' : '500', flex: 1, color: colors.textPrimary }}>
                            {item.title}
                        </AppText>
                        <AppText variant="caption" style={{ color: colors.textSecondary }}>
                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </AppText>
                    </View>
                    <AppText variant="bodySm" style={{ color: colors.textSecondary, marginTop: 4 }}>
                        {item.body}
                    </AppText>
                </View>
                {isUnread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    return (
        <ScreenWrapper withPadding={false} edges={['left', 'right']}>
            <GradientScreenHeader 
                title="Notifications" 
                subtitle="Stay up to date"
                showBack 
                navigation={navigation}
                rightElement={
                    notifications.length > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            {notifications.some(n => !n.read_status) && (
                                <TouchableOpacity onPress={markAllAsRead}>
                                    <Feather name="check-circle" size={22} color={colors.textPrimary} />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={clearAll}>
                                <Feather name="trash-2" size={22} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    ) : undefined
                }
            />
            
            {loading && notifications.length === 0 ? (
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: spacing.base, paddingBottom: 16 }}
                    refreshing={loading}
                    onRefresh={refresh}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Feather name="bell-off" size={64} color={colors.border} style={{ marginBottom: spacing.md, marginTop: 60 }} />
                            <AppText variant="body" color="secondary">You're all caught up!</AppText>
                        </View>
                    }
                />
            )}
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    notificationCard: {
        flexDirection: 'row',
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'flex-start'
    },
    iconWrapper: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    content: {
        flex: 1
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
        marginLeft: 8,
        marginTop: 6
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default NotificationsScreen;


