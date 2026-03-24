import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, WALLET_GRADIENT_LIGHT, WALLET_GRADIENT_DARK, BRAND_GRADIENT } from '../../theme';
import AppText from '../common/AppText';

const WalletCard = ({
    balance = '0.00',
    accountNumber = 'XXXX XXXX XXXX 1234',
    onWithdraw,
    onViewWallet,
    secondaryLabel = 'View Wallet',
}) => {
    const { colors, spacing, radius, isDark } = useTheme();
    const gradientColors = isDark ? BRAND_GRADIENT.colors : WALLET_GRADIENT_LIGHT;
    const gradientCoords = isDark ? {
        start: BRAND_GRADIENT.start,
        end: BRAND_GRADIENT.end,
        locations: BRAND_GRADIENT.locations
    } : {
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 }
    };

    return (
        <View style={[{ backgroundColor: isDark ? colors.surfaceElevated : colors.cardBg, borderRadius: radius.xl, marginHorizontal: spacing.base }, styles.card]}>
            <LinearGradient
                colors={gradientColors}
                start={gradientCoords.start}
                end={gradientCoords.end}
                locations={gradientCoords.locations}
                style={{ padding: spacing.lg }}
            >
                {/* Top row */}
                <View style={styles.topRow}>
                    <AppText variant="label" style={styles.label}>AVAILABLE BALANCE</AppText>
                    <TouchableOpacity
                        onPress={onViewWallet}
                        style={[styles.walletBadge, { borderRadius: radius.sm }]}
                        accessibilityRole="button"
                        accessibilityLabel="Wallet Account"
                    >
                        <Feather name="credit-card" size={12} color="#FFFFFF" />
                        <AppText variant="caption" style={styles.walletBadgeText}>Wallet A/C</AppText>
                    </TouchableOpacity>
                </View>
                <AppText variant="amount" style={styles.amount}>
                    ₹{balance}
                </AppText>

                {/* Account number */}
                <AppText variant="caption" style={styles.accountNum}>
                    A/C NO : {accountNumber}
                </AppText>

                {/* Action buttons */}
                <View style={[styles.btnRow, { marginTop: spacing.lg }]}>
                    <TouchableOpacity
                        onPress={onWithdraw}
                        accessibilityRole="button"
                        accessibilityLabel="Withdraw"
                        style={styles.withdrawBtnWrapper}
                    >
                        <LinearGradient
                            colors={gradientColors}
                            start={gradientCoords.start}
                            end={gradientCoords.end}
                            locations={gradientCoords.locations}
                            style={[styles.actionBtn, { borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }]}
                        >
                            <Feather name="arrow-down" size={14} color="#FFFFFF" />
                            <AppText variant="bodySm" style={styles.withdrawText}>Withdraw</AppText>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onViewWallet}
                        accessibilityRole="button"
                        accessibilityLabel={secondaryLabel}
                    >
                        <LinearGradient
                            colors={gradientColors}
                            start={gradientCoords.start}
                            end={gradientCoords.end}
                            locations={gradientCoords.locations}
                            style={[styles.actionBtn, { borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }]}
                        >
                            <AppText variant="bodySm" style={styles.viewText}>{secondaryLabel}</AppText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { overflow: 'hidden' },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    label: { color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 1.2 },
    walletBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
        paddingHorizontal: 10, paddingVertical: 4,
    },
    walletBadgeText: { color: '#FFFFFF', marginLeft: 4, fontSize: 11 },
    amount: { color: '#FFFFFF', fontSize: 32, fontWeight: '700', marginTop: 8 },
    accountNum: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
    btnRow: { flexDirection: 'row', alignItems: 'center' },
    actionBtn: { paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
    withdrawBtnWrapper: { marginRight: 12 },
    withdrawText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 4 },
    viewText: { color: '#FFFFFF', fontWeight: '600' },
});

export default WalletCard;
