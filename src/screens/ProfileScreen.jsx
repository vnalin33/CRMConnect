import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Image,
    ActivityIndicator,
    Modal
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

import { useTheme } from '../theme';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import AppText from '../components/common/AppText';
import AppCard from '../components/common/AppCard';
import GradientText from '../components/common/GradientText';
import AppInput from '../components/common/AppInput';

// Custom Hooks and Components
import { useProfile } from '../hooks/useProfile';
import { HeaderRow, InfoRow, ActionRow } from '../components/profile/ProfileComponents';

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
            <ScreenWrapper style={{ backgroundColor: isDark ? '#0C0E1A' : '#EBF2F8', justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </ScreenWrapper>
        );
    }

    if (!profileData) {
        return (
            <ScreenWrapper style={{ backgroundColor: isDark ? '#0C0E1A' : '#EBF2F8', justifyContent: 'center', alignItems: 'center' }}>
                <AppText>Error loading profile data</AppText>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper scrollable withPadding={false} style={{ backgroundColor: isDark ? '#0C0E1A' : '#EBF2F8' }}>

            {/* Screen Header */}
            <View style={[styles.topHeader, { paddingHorizontal: spacing.base }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Feather name="arrow-left" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="h2" style={{ fontWeight: '700', color: colors.textPrimary }}>My Profile</AppText>
                <View style={{ width: 20 }} /> {/* Placeholder for balance */}
            </View>

            {/* Profile Header Block */}
            <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.md }}>

                {/* Avatar & Name */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity 
                        activeOpacity={0.8} 
                        onPress={() => setImageModalVisible(true)}
                        style={[styles.avatarContainer, { backgroundColor: colors.primary, borderRadius: radius.lg }]}>
                        {profileData.personalInfo.profileImage ? (
                            <Image 
                                source={{ uri: profileData.personalInfo.profileImage }} 
                                style={{ width: '100%', height: '100%', borderRadius: radius.lg }} 
                            />
                        ) : (
                            <Feather name="user" size={32} color="#FFF" />
                        )}
                        <View style={[styles.cameraBadge, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
                            <Feather name="camera" size={10} color={colors.textPrimary} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.profileNameContainer}>
                        <GradientText variant="h2" style={{ fontWeight: '700' }}>{profileData.name}</GradientText>

                        <View style={[styles.badge, { backgroundColor: colors.successBg, borderRadius: radius.full }]}>
                            <AppText variant="caption" style={{ color: colors.successText, fontWeight: '600', fontSize: 10 }}>
                                {profileData.role}
                            </AppText>
                        </View>

                        <View style={styles.ratingRow}>
                            <View style={styles.stars}>
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Feather key={s} name="star" size={12} color={colors.warning} style={{ marginRight: 2 }} />
                                ))}
                            </View>
                            <AppText variant="caption" color="secondary" style={{ fontSize: 10, fontWeight: '500' }}>
                                {profileData.rating} {profileData.ratingText}
                            </AppText>
                        </View>

                    </View>
                </View>

                {/* Stats Row */}
                <LinearGradient
                    colors={isDark ? ['#1A213D', '#11152B'] : ['#E8F0FE', '#DDE8FA']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.statsCard, { borderRadius: radius.lg, borderColor: isDark ? '#2D375E' : '#C7D8F2', borderWidth: 1 }]}
                >
                    {/* Leads */}
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={{ color: colors.textBrand, fontWeight: '700' }}>{profileData.stats.leads.count}</AppText>
                        <AppText variant="caption" color="secondary" style={{ fontSize: 10, marginTop: 4 }}>{profileData.stats.leads.label}</AppText>
                    </View>

                    <View style={[styles.statDivider, { backgroundColor: isDark ? '#2D375E' : '#C7D8F2' }]} />

                    {/* Deals */}
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={{ color: colors.success, fontWeight: '700' }}>{profileData.stats.deals.count}</AppText>
                        <AppText variant="caption" color="secondary" style={{ fontSize: 10, marginTop: 4 }}>{profileData.stats.deals.label}</AppText>
                    </View>

                    <View style={[styles.statDivider, { backgroundColor: isDark ? '#2D375E' : '#C7D8F2' }]} />

                    {/* Month */}
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={{ color: colors.warning, fontWeight: '700' }}>{profileData.stats.month.count}</AppText>
                        <AppText variant="caption" color="secondary" style={{ fontSize: 10, marginTop: 4 }}>{profileData.stats.month.label}</AppText>
                    </View>
                </LinearGradient>
            </View>

            {/* Lists Container */}
            <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}>

                {/* PERSONAL INFO */}
                <AppCard style={[styles.cardWrapper, { borderColor: isDark ? colors.border : '#DAE5F0', borderWidth: 1 }]} variant="elevated">
                    <HeaderRow
                        title="PERSONAL INFO"
                        showEdit
                        isEditing={isEditingInfo}
                        onPressEdit={handleEditToggle}
                    />

                    {isEditingInfo ? (
                        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base }}>
                            <AppInput
                                label="Name"
                                value={editForm.name}
                                onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                            />
                            <AppInput
                                label="Email"
                                value={editForm.email}
                                keyboardType="email-address"
                                onChangeText={(text) => {
                                    setEditForm(prev => ({ ...prev, email: text }));
                                    setFormErrors(prev => ({ ...prev, email: null }));
                                }}
                                error={formErrors.email}
                            />
                            <AppInput
                                label="Mobile"
                                value={editForm.mobile}
                                keyboardType="numeric"
                                maxLength={10}
                                onChangeText={(text) => {
                                    setEditForm(prev => ({ ...prev, mobile: text.replace(/[^0-9]/g, '') }));
                                    setFormErrors(prev => ({ ...prev, mobile: null }));
                                }}
                                error={formErrors.mobile}
                            />
                            <AppInput
                                label="Location"
                                value={editForm.location}
                                onChangeText={(text) => {
                                    setEditForm(prev => ({ ...prev, location: text.replace(/[0-9]/g, '') }));
                                }}
                            />
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

                {/* BANK DETAILS */}
                <AppCard style={[styles.cardWrapper, { borderColor: isDark ? colors.border : '#DAE5F0', borderWidth: 1 }]} variant="elevated">
                    <HeaderRow
                        title="BANK DETAILS"
                        showEdit
                        isEditing={isEditingBank}
                        onPressEdit={handleBankEditToggle}
                    />
                    {isEditingBank ? (
                        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base }}>
                            <AppInput
                                label="IFSC Code"
                                value={editBankForm.ifsc}
                                maxLength={11}
                                autoCapitalize="characters"
                                onChangeText={handleIfscChange}
                                error={bankFormErrors.ifsc}
                            />
                            <AppInput
                                label="Account Number"
                                value={editBankForm.account}
                                keyboardType="numeric"
                                maxLength={18}
                                onChangeText={(text) => {
                                    setEditBankForm(prev => ({ ...prev, account: text.replace(/[^0-9]/g, '') }));
                                    setBankFormErrors(prev => ({ ...prev, account: null }));
                                }}
                                error={bankFormErrors.account}
                            />
                            <AppInput
                                label="Branch"
                                value={editBankForm.branch}
                                editable={false}
                                onChangeText={(text) => setEditBankForm(prev => ({ ...prev, branch: text }))}
                            />
                        </View>
                    ) : (
                        <>
                            <InfoRow icon="briefcase" label="IFSC" value={profileData.bankDetails.ifsc} />
                            <InfoRow icon="credit-card" label="Account Number" value={profileData.bankDetails.account} />
                            <InfoRow icon="git-branch" label="Branch" value={profileData.bankDetails.branch} isLast />
                        </>
                    )}
                </AppCard>

                {/* USER ACCOUNT */}
                <AppCard style={[styles.cardWrapper, { borderColor: isDark ? colors.border : '#DAE5F0', borderWidth: 1 }]} variant="elevated">
                    <HeaderRow title="USER ACCOUNT" />
                    <ActionRow icon="lock" title="Change Password" subtitle="Security & access" onPress={() => { }} />

                    {/* Notifications Toggle */}
                    <ActionRow
                        icon="bell"
                        title="Notifications"
                        subtitle="Push, email, SMS alerts"
                        rightElement={
                            <Switch
                                trackColor={{ false: colors.textDisabled, true: colors.textBrand }}
                                thumbColor={"#fff"}
                                ios_backgroundColor={colors.textDisabled}
                                onValueChange={toggleNotifications}
                                value={profileData.settings?.notifications ?? true}
                                style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
                            />
                        }
                    />

                    {/* Theme Segmented Control */}
                    <ActionRow
                        icon="monitor"
                        title="Appearance"
                        subtitle="Change Themes"
                        rightElement={
                            <View style={[styles.themeSwitcher, { backgroundColor: isDark ? '#192036' : '#EFF3F9' }]}>
                                <TouchableOpacity
                                    onPress={() => { if (isDark) toggleTheme() }}
                                    style={[styles.themeBtn, !isDark && [styles.themeBtnActive, { backgroundColor: colors.textBrand }]]}
                                >
                                    <AppText variant="caption" style={{ color: !isDark ? '#FFF' : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>Light</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { if (!isDark) toggleTheme() }}
                                    style={[styles.themeBtn, isDark && [styles.themeBtnActive, { backgroundColor: colors.textBrand }]]}
                                >
                                    <AppText variant="caption" style={{ color: isDark ? '#FFF' : colors.textSecondary, fontWeight: '600', fontSize: 13 }}>Dark</AppText>
                                </TouchableOpacity>
                            </View>
                        }
                        isLast
                    />
                </AppCard>

                {/* SUPPORT */}
                <AppCard style={[styles.cardWrapper, { borderColor: isDark ? colors.border : '#DAE5F0', borderWidth: 1 }]} variant="elevated">
                    <HeaderRow title="SUPPORT" />
                    <ActionRow icon="help-circle" title="Help & Support" subtitle="FAQs and Contact us" onPress={() => { }} />
                    <ActionRow icon="shield" title="Privacy Policy" subtitle="Data handling & Privacy" onPress={() => { }} />
                    <ActionRow icon="alert-circle" title="Report an Issue" subtitle="Bug reports & feedback" onPress={() => { }} isLast />
                </AppCard>

                {/* SIGN OUT */}
                <TouchableOpacity
                    onPress={() => navigation.replace('Login')}
                    style={[
                        styles.signOutBtn,
                        { backgroundColor: isDark ? 'rgba(244, 67, 54, 0.1)' : '#FCE8E8', borderColor: isDark ? 'transparent' : '#FAD4D4', borderWidth: 1, borderRadius: radius.md }
                    ]}>
                    <Feather name="log-out" size={16} color={colors.error} style={{ marginRight: 8 }} />
                    <AppText variant="body" style={{ color: colors.error, fontWeight: '700' }}>Sign Out</AppText>
                </TouchableOpacity>

            </View>

            {/* Profile Picture Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={imageModalVisible}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
                        <View style={styles.modalHeader}>
                            <AppText variant="h3" style={{ fontWeight: '700', color: colors.textPrimary }}>Profile Picture</AppText>
                            <TouchableOpacity onPress={() => setImageModalVisible(false)} hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
                                <Feather name="x" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Image Preview */}
                        <View style={[styles.previewContainer, { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg }]}>
                            {profileData.personalInfo.profileImage ? (
                                <Image 
                                    source={{ uri: profileData.personalInfo.profileImage }} 
                                    style={{ width: 160, height: 160, borderRadius: 80 }} 
                                    resizeMode="cover"
                                />
                            ) : (
                                <View style={[styles.placeholderPreview, { backgroundColor: colors.primary }]}>
                                    <Feather name="user" size={64} color="#FFF" />
                                </View>
                            )}
                        </View>

                        {/* Modal Actions */}
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
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginTop: 10,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    cameraBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    profileNameContainer: {
        marginLeft: 16,
        justifyContent: 'center'
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginTop: 4,
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    stars: {
        flexDirection: 'row',
        marginRight: 6
    },
    statsCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginBottom: 20,
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
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 0,
        shadowOpacity: 0
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
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    themeBtnActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        elevation: 2,
    },
    signOutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
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
