import React, { useRef, useEffect, useCallback } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated,
    StyleSheet,
    Linking,
    Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme';
import { BRAND_GRADIENT } from '../../theme/colors';
import AppText from '../common/AppText';

const QUICK_ACTIONS = [
    { id: 'invoice', label: 'RAISE INVOICE', icon: 'file-text', iconLib: 'feather' },
    { id: 'customers', label: 'CUSTOMERS', icon: 'account-group', iconLib: 'mci' },
    { id: 'checklist', label: 'CHECK LIST', icon: 'clipboard-list', iconLib: 'mci' },
    { id: 'concerns', label: 'CONCERNS', icon: 'alert-circle', iconLib: 'feather' },
    { id: 'drafts', label: 'DRAFTS', icon: 'file-document-edit', iconLib: 'mci' },
];

const RM_DATA = {
    name: 'Rahul Krishnan',
    phone: '+91 98400 12345',
    email: 'rahul.k@crmconnect.in',
    assignedLabel: 'Assigned',
};
const ActionIcon = ({ name, lib }) => {
    const { colors } = useTheme();
    const size = 20;
    if (lib === 'mci') {
        return <MaterialCommunityIcons name={name} size={size} color={colors.textBrand} />;
    }
    return <Feather name={name} size={size} color={colors.textBrand} />;
};

const ActionRow = React.memo(({ item, onPress }) => {
    const { colors, spacing, radius } = useTheme();
    const hoverAnim = useRef(new Animated.Value(0)).current;

    const handlePressIn = () =>
        Animated.timing(hoverAnim, { toValue: 1, duration: 120, useNativeDriver: false }).start();
    const handlePressOut = () =>
        Animated.timing(hoverAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();

    const bgColor = hoverAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', colors.hoverBg ?? colors.surfaceElevated],
    });

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => onPress?.(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
        >
            <Animated.View style={[
                styles.actionRow,
                {
                    backgroundColor: bgColor,
                    paddingHorizontal: spacing.base,
                    paddingVertical: spacing.sm + 2,
                    borderRadius: radius.md,
                },
            ]}>
                {/* Gradient left accent bar on hover */}
                <View style={[styles.iconBox, { backgroundColor: `${colors.primary}15`, borderRadius: radius.sm }]}>
                    <ActionIcon name={item.icon} lib={item.iconLib} />
                </View>
                <AppText
                    variant="label"
                    style={[styles.actionLabel, { color: colors.textPrimary, letterSpacing: 0.8 }]}
                >
                    {item.label}
                </AppText>
                <Feather name="chevron-right" size={14} color={colors.textSecondary} />
            </Animated.View>
        </Pressable>
    );
});

const RmCard = React.memo(({ rm }) => {
    const { colors, spacing, radius } = useTheme();

    const handleCall = useCallback(() => {
        const num = rm.phone.replace(/\s+/g, '');
        Linking.openURL(`tel:${num}`);
    }, [rm.phone]);

    return (
        <View style={[
            styles.rmCard,
            {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.base,
                marginHorizontal: spacing.sm,
                marginBottom: spacing.base,
            },
        ]}>
            {/* RM header row */}
            <View style={styles.rmHeader}>
                <AppText variant="bodySm" style={{ color: colors.textSecondary, fontWeight: '600' }}>
                    Your RM
                </AppText>
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.assignedBadge, { borderRadius: radius.full }]}
                >
                    <AppText variant="caption" style={{ color: '#fff', fontWeight: '700' }}>
                        {rm.assignedLabel}
                    </AppText>
                </LinearGradient>
            </View>

            {/* RM info row */}
            <View style={[styles.rmInfo, { marginTop: spacing.sm }]}>
                {/* Avatar */}
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.rmAvatar, { borderRadius: radius.full }]}
                >
                    <Feather name="user" size={22} color="#fff" />
                </LinearGradient>

                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                    <AppText variant="h3" style={{ color: colors.textPrimary, fontWeight: '700' }}>
                        {rm.name}
                    </AppText>
                    <View style={styles.rmContact}>
                        <Feather name="phone" size={11} color={colors.textSecondary} />
                        <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>{rm.phone}</AppText>
                    </View>
                    <View style={styles.rmContact}>
                        <Feather name="mail" size={11} color={colors.textSecondary} />
                        <AppText variant="caption" color="secondary" style={{ marginLeft: 4 }}>{rm.email}</AppText>
                    </View>
                </View>
            </View>

            {/* Call button */}
            <TouchableOpacity onPress={handleCall} activeOpacity={0.8} style={{ marginTop: spacing.sm }}>
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.callBtn, { borderRadius: radius.full }]}
                >
                    <Feather name="phone" size={14} color="#fff" />
                    <AppText variant="bodySm" style={{ color: '#fff', fontWeight: '700', marginLeft: 6 }}>
                        Call {rm.name.split(' ')[0]} {rm.name.split(' ')[1]}
                    </AppText>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
});

const QuickActionsMenu = ({ visible, onClose, onAction, topOffset = 70 }) => {
    const { colors, spacing, radius } = useTheme();

    // Slide-in from top animation
    const slideAnim = useRef(new Animated.Value(-300)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 80,
                    friction: 10,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -300,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, fadeAnim, slideAnim]);

    const handleAction = useCallback((id) => {
        onAction?.(id);
        onClose?.();
    }, [onAction, onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Transparent top area — allows tapping the header/menu bar again to close */}
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ height: topOffset, width: '100%', backgroundColor: 'transparent' }} />
            </TouchableWithoutFeedback>

            {/* Dim backdrop — shifted down so header remains visible */}
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View style={[
                    styles.backdrop,
                    {
                        opacity: fadeAnim,
                        top: topOffset, // Keep header visible
                    }
                ]} />
            </TouchableWithoutFeedback>

            {/* Menu panel */}
            <Animated.View
                style={[
                    styles.panel,
                    {
                        top: topOffset,
                        right: spacing.base,
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderRadius: radius.xl,
                        transform: [{ translateY: slideAnim }],
                        shadowColor: colors.shadow,
                    },
                ]}
                pointerEvents="box-none"
            >
                {/* Header row: QUICK ACTIONS ▼ */}
                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[styles.menuHeader, { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl }]}
                >
                    <AppText variant="label" style={[styles.menuHeaderText]}>
                        QUICK ACTIONS
                    </AppText>
                    <Feather name="chevron-down" size={14} color="#fff" style={{ marginLeft: 6 }} />
                </LinearGradient>

                {/* Action list */}
                <View style={{ paddingHorizontal: spacing.xs, paddingTop: spacing.xs }}>
                    {QUICK_ACTIONS.map(item => (
                        <ActionRow key={item.id} item={item} onPress={handleAction} />
                    ))}
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: colors.divider, marginVertical: spacing.xs }]} />

                {/* RM Card */}
                <RmCard rm={RM_DATA} />
            </Animated.View>
        </Modal>
    );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    panel: {
        position: 'absolute',
        width: 260,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
        overflow: 'hidden',
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    menuHeaderText: {
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 1.2,
        fontSize: 12,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    actionLabel: {
        flex: 1,
        fontWeight: '700',
    },
    divider: { height: 1, marginHorizontal: 12 },
    rmCard: { borderWidth: 1 },
    rmHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    assignedBadge: { paddingHorizontal: 10, paddingVertical: 3 },
    rmInfo: { flexDirection: 'row', alignItems: 'flex-start' },
    rmAvatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    rmContact: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    callBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 9,
    },
});

export default QuickActionsMenu;
