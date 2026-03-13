import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, WALLET_GRADIENT_LIGHT, WALLET_GRADIENT_DARK } from '../../theme';
import AppText from '../common/AppText';

const WalletCard = ({
    balance = '0.00',
    accountNumber = 'XXXX XXXX XXXX 1234',
    onWithdraw,
    onViewWallet,
}) => {
    const { colors, spacing, radius, isDark } = useTheme();
    const gradientColors = isDark ? WALLET_GRADIENT_DARK : WALLET_GRADIENT_LIGHT;

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, { borderRadius: radius.xl, padding: spacing.lg, marginHorizontal: spacing.base }]}
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
                    style={[styles.actionBtn, styles.withdrawBtn, { borderRadius: radius.full }]}
                    accessibilityRole="button"
                    accessibilityLabel="Withdraw"
                >
                    <Feather name="arrow-down" size={14} color="#FFFFFF" />
                    <AppText variant="bodySm" style={styles.withdrawText}>Withdraw</AppText>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onViewWallet}
                    style={[styles.actionBtn, styles.viewBtn, { borderRadius: radius.full }]}
                    accessibilityRole="button"
                    accessibilityLabel="View Wallet"
                >
                    <AppText variant="bodySm" style={styles.viewText}>View Wallet</AppText>
                </TouchableOpacity>
            </View>
        </LinearGradient>
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
    withdrawBtn: { backgroundColor: 'rgba(0,200,150,0.85)', marginRight: 12 },
    withdrawText: { color: '#FFFFFF', fontWeight: '600', marginLeft: 4 },
    viewBtn: { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)' },
    viewText: { color: '#FFFFFF', fontWeight: '600' },
});

export default WalletCard;
