import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Modal,
    StatusBar,
    Platform
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme';
import { BRAND_GRADIENT } from '../theme/colors';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import GradientScreenHeader from '../components/layout/GradientScreenHeader';
import AppText from '../components/common/AppText';
import AppCard from '../components/common/AppCard';
import GradientText from '../components/common/GradientText';
import AppInput from '../components/common/AppInput';
import { useProfile } from '../hooks/useProfile';
import { HeaderRow, InfoRow, ActionRow } from '../components/profile/ProfileComponents';



const GradientToggle = ({ value, onValueChange }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onValueChange(!value)}
            style={styles.gradientToggleTrack}
        >
            <LinearGradient
                colors={value ? BRAND_GRADIENT.colors : ['#CDD5DF', '#CDD5DF']}
                start={BRAND_GRADIENT.start}
                end={BRAND_GRADIENT.end}
                locations={BRAND_GRADIENT.locations}
                style={styles.gradientToggleTrackBg}
            >
                <View style={[styles.gradientToggleThumb, { left: value ? 22 : 2 }]} />
            </LinearGradient>
        </TouchableOpacity>
    );
};



const GradientThemeSwitcher = ({ isDark, toggleTheme, colors }) => {
    return (
        <View style={[styles.themeSwitcherOuter, { borderColor: colors.profileStatsBorder }]}>
            <View style={[styles.themeSwitcher, { backgroundColor: colors.profileIconBg }]}>
                <TouchableOpacity
                    onPress={() => { if (isDark) toggleTheme(); }}
                    activeOpacity={0.8}
                    style={styles.themeBtn}
                >
                    {!isDark ? (
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={styles.themeBtnGradient}
                        >
                            <AppText variant="caption" style={styles.themeBtnActiveText}>Light</AppText>
                        </LinearGradient>
                    ) : (
                        <View style={styles.themeBtnInactive}>
                            <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 13 }}>Light</AppText>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { if (!isDark) toggleTheme(); }}
                    activeOpacity={0.8}
                    style={styles.themeBtn}
                >
                    {isDark ? (
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={styles.themeBtnGradient}
                        >
                            <AppText variant="caption" style={styles.themeBtnActiveText}>Dark</AppText>
                        </LinearGradient>
                    ) : (
                        <View style={styles.themeBtnInactive}>
                            <AppText variant="caption" style={{ color: colors.textSecondary, fontWeight: '600', fontSize: 13 }}>Dark</AppText>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const ProfileScreen = ({ navigation }) => {
    const { colors, spacing, radius, isDark, toggleTheme } = useTheme();

    const {
        profileData,
        loading,
        isEditingInfo,
        editForm,
        formErrors,
        isEditingBank,
        editBankForm,
        bankFormErrors,
        imageModalVisible,
        setImageModalVisible,
        handlePickImage,
        handleTakePhoto,
        handleRemoveImage,
        toggleNotifications,
        handleEditToggle,
        handleBankEditToggle,
        handleIfscChange,
        setEditForm,
        setEditBankForm,
        setFormErrors,
        setBankFormErrors
    } = useProfile();

    if (loading) {
        return (
            <ScreenWrapper style={{ backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ScreenWrapper>
        );
    }

    if (!profileData) {
        return (
            <ScreenWrapper style={{ backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <AppText>Error loading profile data</AppText>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable withPadding={false} edges={['bottom', 'left', 'right']} style={{ backgroundColor: colors.background }}>

            <GradientScreenHeader
                title="My Profile"
                showBack
                navigation={navigation}
            />

            <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>
                <View style={styles.profileHeader}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setImageModalVisible(true)}
                        style={styles.avatarOuter}
                    >
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={styles.avatarSquare}
                        >
                            {profileData.personalInfo.profileImage ? (
                                <Image
                                    source={{ uri: profileData.personalInfo.profileImage }}
                                    style={styles.avatarImage}
                                />
                            ) : (
                                <Feather name="user" size={32} color={colors.textInverse} />
                            )}
                        </LinearGradient>
                        <LinearGradient
                            colors={BRAND_GRADIENT.colors}
                            start={BRAND_GRADIENT.start}
                            end={BRAND_GRADIENT.end}
                            locations={BRAND_GRADIENT.locations}
                            style={[styles.cameraBadge, { borderColor: colors.surface }]}
                        >
                            <Feather name="camera" size={10} color={colors.textInverse} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.profileNameContainer}>
                        <GradientText variant="h2" style={{ fontWeight: '700' }}>{profileData.name}</GradientText>
                        <View style={[styles.badge, { backgroundColor: colors.successBg, borderRadius: radius.full }]}>
                            <AppText variant="caption" style={{ color: colors.successText, fontWeight: '600', fontSize: 10 }}>
                                {profileData.role}
                            </AppText>
                        </View>

                    </View>
                </View>

                <LinearGradient
                    colors={colors.profileStatsBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.statsCard, { borderRadius: radius.lg, borderColor: colors.profileStatsBorder, borderWidth: 1 }]}
                >
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={{ color: colors.textBrand, fontWeight: '700' }}>{profileData.stats.leads.count}</AppText>
                        <AppText variant="caption" color="secondary" style={{ fontSize: 10, marginTop: 4 }}>{profileData.stats.leads.label}</AppText>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.profileStatsBorder }]} />
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={{ color: colors.success, fontWeight: '700' }}>{profileData.stats.deals.count}</AppText>
                        <AppText variant="caption" color="secondary" style={{ fontSize: 10, marginTop: 4 }}>{profileData.stats.deals.label}</AppText>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: colors.profileStatsBorder }]} />
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={{ color: colors.warning, fontWeight: '700' }}>{profileData.stats.month.count}</AppText>
                        <AppText variant="caption" color="secondary" style={{ fontSize: 10, marginTop: 4 }}>{profileData.stats.month.label}</AppText>
                    </View>
                </LinearGradient>
            </View>

            <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}>
                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder, borderWidth: 1 }]} variant="elevated">
                    <HeaderRow title="PERSONAL INFO" showEdit isEditing={isEditingInfo} onPressEdit={handleEditToggle} />
                    {isEditingInfo ? (
                        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base }}>
                            <AppInput label="Name" value={editForm.name} onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))} />
                            <AppInput label="Email" value={editForm.email} keyboardType="email-address" onChangeText={(text) => { setEditForm(prev => ({ ...prev, email: text })); setFormErrors(prev => ({ ...prev, email: null })); }} error={formErrors.email} />
                            <AppInput label="Mobile" value={editForm.mobile} keyboardType="numeric" maxLength={10} onChangeText={(text) => { setEditForm(prev => ({ ...prev, mobile: text.replace(/[^0-9]/g, '') })); setFormErrors(prev => ({ ...prev, mobile: null })); }} error={formErrors.mobile} />
                            <AppInput label="Location" value={editForm.location} onChangeText={(text) => { setEditForm(prev => ({ ...prev, location: text.replace(/[0-9]/g, '') })); }} />
                        </View>
                    ) : (
                        <>
                            <InfoRow icon="user" label="Name" value={profileData.personalInfo.name} />
                            <InfoRow icon="mail" label="Email" value={profileData.personalInfo.email} />
                            <InfoRow icon="phone" label="Mobile" value={profileData.personalInfo.mobile} />
                            <InfoRow icon="map-pin" label="Location" value={profileData.personalInfo.location} isLast />
                        </>
                    )}
                </AppCard>

                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder, borderWidth: 1 }]} variant="elevated">
                    <HeaderRow title="BANK DETAILS" showEdit isEditing={isEditingBank} onPressEdit={handleBankEditToggle} />
                    {isEditingBank ? (
                        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base }}>
                            <AppInput label="IFSC Code" value={editBankForm.ifsc} maxLength={11} autoCapitalize="characters" onChangeText={handleIfscChange} error={bankFormErrors.ifsc} />
                            <AppInput label="Account Number" value={editBankForm.account} keyboardType="numeric" maxLength={18} onChangeText={(text) => { setEditBankForm(prev => ({ ...prev, account: text.replace(/[^0-9]/g, '') })); setBankFormErrors(prev => ({ ...prev, account: null })); }} error={bankFormErrors.account} />
                            <AppInput label="Branch" value={editBankForm.branch} editable={false} onChangeText={(text) => setEditBankForm(prev => ({ ...prev, branch: text }))} />
                        </View>
                    ) : (
                        <>
                            <InfoRow icon="briefcase" label="IFSC" value={profileData.bankDetails.ifsc} />
                            <InfoRow icon="credit-card" label="Account Number" value={profileData.bankDetails.account} />
                            <InfoRow icon="git-branch" label="Branch" value={profileData.bankDetails.branch} isLast />
                        </>
                    )}
                </AppCard>

                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder, borderWidth: 1 }]} variant="elevated">
                    <HeaderRow title="USER ACCOUNT" />
                    <ActionRow icon="user" title="Personal Information" subtitle="Update your details" onPress={() => { }} />
                    <ActionRow icon="lock" title="Change Password" subtitle="Security & access" onPress={() => { }} />
                    <ActionRow
                        icon="bell"
                        title="Notifications"
                        subtitle="Push, email, SMS alerts"
                        rightElement={
                            <GradientToggle
                                value={profileData.settings?.notifications ?? true}
                                onValueChange={toggleNotifications}
                            />
                        }
                    />
                    <ActionRow
                        icon="monitor"
                        title="Appearance"
                        subtitle="Change Themes"
                        rightElement={
                            <GradientThemeSwitcher isDark={isDark} toggleTheme={toggleTheme} colors={colors} />
                        }
                    />
                    <ActionRow icon="globe" title="Language Settings" subtitle="Change Language" onPress={() => { }} isLast />
                </AppCard>

                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder, borderWidth: 1 }]} variant="elevated">
                    <HeaderRow title="SUPPORT" />
                    <ActionRow icon="help-circle" title="Help & Support" subtitle="FAQs and Contact us" onPress={() => { }} />
                    <ActionRow icon="shield" title="Privacy Policy" subtitle="Data Handling & Privacy" onPress={() => { }} />
                    <ActionRow icon="alert-circle" title="Report an Issue" subtitle="Bug reports & feedback" iconColor={colors.error} onPress={() => { }} isLast />
                </AppCard>

                <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.replace('Login')}>
                    <View
                        style={[styles.signOutBtn, { backgroundColor: colors.signOutBg, borderRadius: radius.lg }]}
                    >
                        <Feather name="log-out" size={18} color={colors.signOutText} style={{ marginRight: 10 }} />
                        <AppText variant="body" style={{ color: colors.signOutText, fontWeight: '700', fontSize: 15 }}>Sign Out</AppText>
                    </View>
                </TouchableOpacity>
            </View>

            <Modal animationType="fade" transparent={true} visible={imageModalVisible} onRequestClose={() => setImageModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
                        <View style={styles.modalHeader}>
                            <AppText variant="h3" style={{ fontWeight: '700', color: colors.textPrimary }}>Profile Picture</AppText>
                            <TouchableOpacity onPress={() => setImageModalVisible(false)} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
                                <Feather name="x" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.previewContainer, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg }]}>
                            {profileData.personalInfo.profileImage ? (
                                <Image source={{ uri: profileData.personalInfo.profileImage }} style={styles.previewImage} resizeMode="cover" />
                            ) : (
                                <View style={[styles.placeholderPreview, { backgroundColor: colors.primary }]}>
                                    <Feather name="user" size={64} color={colors.textInverse} />
                                </View>
                            )}
                        </View>
                        <TouchableOpacity style={[styles.modalActionBtn, { borderBottomWidth: 1, borderBottomColor: colors.divider }]} onPress={handleTakePhoto}>
                            <Feather name="camera" size={20} color={colors.textBrand} style={{ marginRight: 12 }} />
                            <AppText variant="body" style={{ color: colors.textPrimary, fontWeight: '500' }}>Take Photo</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalActionBtn, { borderBottomWidth: 1, borderBottomColor: colors.divider }]} onPress={handlePickImage}>
                            <Feather name="image" size={20} color={colors.textBrand} style={{ marginRight: 12 }} />
                            <AppText variant="body" style={{ color: colors.textPrimary, fontWeight: '500' }}>Choose from Gallery</AppText>
                        </TouchableOpacity>
                        {profileData.personalInfo.profileImage && (
                            <TouchableOpacity style={styles.modalActionBtn} onPress={handleRemoveImage}>
                                <Feather name="trash-2" size={20} color={colors.error} style={{ marginRight: 12 }} />
                                <AppText variant="body" style={{ color: colors.error, fontWeight: '500' }}>Remove Photo</AppText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>

        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarOuter: {
        position: 'relative',
    },
    avatarSquare: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: -4,
        left: -4,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    profileNameContainer: {
        marginLeft: 14,
        justifyContent: 'center'
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginTop: 4,
        marginBottom: 4,
    },
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginBottom: 16,
    },
    statCol: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    statDivider: {
        width: 1,
        height: '80%',
        alignSelf: 'center',
    },
    cardWrapper: {
        padding: 0,
        paddingTop: 12,
        marginBottom: 14,
        overflow: 'hidden',
        elevation: 0,
        shadowOpacity: 0
    },
    gradientToggleTrack: {
        width: 44,
        height: 24,
    },
    gradientToggleTrackBg: {
        width: 44,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
    },
    gradientToggleThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    themeSwitcherOuter: {
        borderWidth: 1.5,
        borderRadius: 26,
        padding: 2,
    },
    themeSwitcher: {
        flexDirection: 'row',
        borderRadius: 24,
        padding: 3,
        width: 130,
        height: 36,
    },
    themeBtn: {
        flex: 1,
    },
    themeBtnGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    themeBtnInactive: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    themeBtnActiveText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    signOutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 8,
        marginBottom: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    previewContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 32,
        marginBottom: 24,
    },
    previewImage: {
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    placeholderPreview: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
    }
});

export default ProfileScreen;
