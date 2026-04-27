import React from 'react';
import {
    View,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../../theme';
import { scale, radius } from '../../theme/metrics';
import AppText from './AppText';
import AppButton from './AppButton';
import { BRAND_GRADIENT } from '../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_W } = Dimensions.get('window');

const AppStatusModal = ({
    visible,
    type = 'success',
    title,
    message,
    onClose,
    onConfirm,
    buttonText = 'Continue',
    cancelText = 'Cancel',
    showConfirm = false,
}) => {
    const { colors, spacing } = useTheme();

    const getIcon = () => {
        switch (type) {
            case 'success':
                return { name: 'check-circle', color: colors.success };
            case 'error':
                return { name: 'x-circle', color: colors.error };
            case 'warning':
                return { name: 'alert-triangle', color: colors.warning };
            default:
                return { name: 'info', color: colors.primary };
        }
    };

    const icon = getIcon();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
                <View style={[styles.container, { backgroundColor: colors.surface, padding: spacing.xl }]}>
                    
                    {/* Icon Background Circle */}
                    <View style={[styles.iconWrapper, { backgroundColor: icon.color + '15' }]}>
                        <Feather name={icon.name} size={scale(48)} color={icon.color} />
                    </View>

                    <AppText variant="h2" style={styles.title}>
                        {title || (type === 'success' ? 'Success' : 'Attention')}
                    </AppText>

                    <AppText variant="body1" color="secondary" style={styles.message}>
                        {message}
                    </AppText>

                    {showConfirm ? (
                        <View style={styles.buttonRow}>
                            <AppButton
                                title={cancelText}
                                variant="outline"
                                style={styles.halfButton}
                                onPress={onClose}
                            />
                            <AppButton
                                title={buttonText}
                                variant="primary"
                                style={styles.halfButton}
                                onPress={() => {
                                    if (onConfirm) onConfirm();
                                    onClose();
                                }}
                            />
                        </View>
                    ) : (
                        <AppButton
                            title={buttonText}
                            variant={type === 'success' ? 'gradient' : 'primary'}
                            size="full"
                            onPress={onClose}
                            style={styles.button}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    container: {
        width: '100%',
        maxWidth: scale(340),
        borderRadius: radius.xl,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    iconWrapper: {
        width: scale(90),
        height: scale(90),
        borderRadius: scale(45),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: scale(20),
    },
    title: {
        textAlign: 'center',
        marginBottom: scale(12),
        fontWeight: '900',
    },
    message: {
        textAlign: 'center',
        marginBottom: scale(28),
        lineHeight: scale(22),
    },
    button: {
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    halfButton: {
        width: '48%',
    },
});

export default AppStatusModal;
