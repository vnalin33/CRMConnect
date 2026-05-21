import React from 'react';
import { View, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import AppText from '../common/AppText';

const SnapshotCard = ({ icon, iconBgColor, count, label, style }) => {
    const { colors, spacing, radius } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.snapshotCardBg,
                    borderColor: colors.snapshotCardBorder,
                    borderRadius: radius.lg,
                    paddingVertical: spacing.md,
                    paddingHorizontal: spacing.sm,
                },
                style,
            ]}
        >
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor + '18', borderRadius: radius.full }]}>
                <Feather name={icon} size={18} color={iconBgColor} />
            </View>
            <AppText variant="h2" style={[styles.count, { color: colors.snapshotCountColor, marginTop: spacing.xs }]}>
                {count}
            </AppText>
            <AppText variant="caption" numberOfLines={2} style={[styles.label, { color: colors.snapshotLabelColor }]}>
                {label}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    iconCircle: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    count: {
        fontWeight: '800',
        fontSize: 24,
    },
    label: {
        marginTop: 2,
        textAlign: 'center',
        fontSize: 11,
    },
});

export default SnapshotCard;
