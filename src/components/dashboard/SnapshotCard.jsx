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
                    padding: spacing.md,
                },
                style,
            ]}
        >
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor, borderRadius: radius.full }]}>
                <Feather name={icon} size={16} color="#FFFFFF" />
            </View>
            <AppText variant="h2" style={[styles.count, { color: colors.snapshotCountColor, marginTop: spacing.sm }]}>
                {count}
            </AppText>
            <AppText variant="caption" numberOfLines={2} style={{ color: colors.snapshotLabelColor, marginTop: 2 }}>
                {label}
            </AppText>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { borderWidth: 1, width: 110, minHeight: 100 },
    iconCircle: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
    count: { fontWeight: '700', fontSize: 22 },
});

export default SnapshotCard;
