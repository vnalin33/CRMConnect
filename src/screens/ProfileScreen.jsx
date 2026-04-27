import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
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
import { useFocusEffect } from '@react-navigation/native';
import { HeaderRow, InfoRow, ActionRow, GradientToggle, GradientThemeSwitcher, ProfileSkeleton } from '../components/profile/ProfileComponents';

const ProfileScreen = ({ navigation }) => {
    const { colors, spacing, radius, isDark, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');

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
        refreshProfile,
        setEditForm,
        setEditBankForm,
        setFormErrors,
        setBankFormErrors
    } = useProfile();

    // Auto-refresh stats when focused
    useFocusEffect(
        useCallback(() => {
            refreshProfile();
        }, [refreshProfile])
    );

    // First-ever visit with no cache: show shimmer skeleton inside the screen chrome
    if (loading) {
        return (
            <ScreenWrapper withPadding={false} edges={['bottom', 'left', 'right']} style={styles.root}>
                <GradientScreenHeader
                    title="My Profile"
                    showBack
                    navigation={navigation}
                />
                <ProfileSkeleton />
            </ScreenWrapper>
        );
    }

    if (!profileData) {
        return (
            <ScreenWrapper style={styles.centered} edges={['top']}>
                <AppText>Error loading profile data</AppText>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper
            scrollable
            withPadding={false}
            edges={['bottom', 'left', 'right']}
            style={styles.root}
        >
            <GradientScreenHeader
                title="My Profile"
                showBack
                navigation={navigation}
                searchable
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search profile sections..."
            />

            <View style={[styles.headerSection, { paddingHorizontal: spacing.base, marginTop: spacing.md }]}>
                {!searchQuery && (
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
                            <GradientText variant="h2" style={styles.profileNameText}>{profileData.name}</GradientText>
                            <View style={[styles.badge, { backgroundColor: colors.successBg, borderRadius: radius.full }]}>
                                <AppText variant="caption" style={[styles.badgeText, { color: colors.successText }]}>
                                    {profileData.role}
                                </AppText>
                            </View>
                        </View>
                    </View>
                )}

                <LinearGradient
                    colors={BRAND_GRADIENT.colors}
                    start={BRAND_GRADIENT.start}
                    end={BRAND_GRADIENT.end}
                    locations={BRAND_GRADIENT.locations}
                    style={[
                        styles.statsCard,
                        {
                            borderRadius: radius.xl,
                            shadowColor: colors.primary,
                            shadowOpacity: isDark ? 0.3 : 0.1,
                            shadowRadius: 10,
                            elevation: 5
                        }
                    ]}
                >
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={styles.statValue}>{profileData.stats.leads.count}</AppText>
                        <AppText variant="caption" style={styles.statLabel}>{profileData.stats.leads.label}</AppText>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={styles.statValue}>{profileData.stats.deals.count}</AppText>
                        <AppText variant="caption" style={styles.statLabel}>{profileData.stats.deals.label}</AppText>
                    </View>
                    <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
                    <View style={styles.statCol}>
                        <AppText variant="h2" style={styles.statValue}>{profileData.stats.month.count}</AppText>
                        <AppText variant="caption" style={styles.statLabel}>{profileData.stats.month.label}</AppText>
                    </View>
                </LinearGradient>
            </View>


            <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}>
                {(() => {
                    const q = (searchQuery || '').toLowerCase().trim();
                    const matches = (val) => !q || (val != null && String(val).toLowerCase().includes(q));

                    const personalMatches = [
                        profileData.personalInfo.name,
                        profileData.personalInfo.email,
                        profileData.personalInfo.mobile,
                        profileData.personalInfo.location,
                        'Personal Info'
                    ].some(matches);

                    const bankMatches = [
                        profileData.bankDetails.ifsc,
                        profileData.bankDetails.account,
                        profileData.bankDetails.branch,
                        'Bank Details'
                    ].some(matches);

                    const accountItems = [
                        { icon: 'lock', title: 'Change Password', sub: 'Security & access' },
                        { icon: 'bell', title: 'Notifications', sub: 'Push, email, SMS alerts' },
                        { icon: 'monitor', title: 'Appearance', sub: 'Change Themes' },
                        { icon: 'globe', title: 'Language Settings', sub: 'Change Language' }
                    ].filter(i => matches(i.title) || matches(i.sub) || matches('User Account'));

                    const supportItems = [
                        { icon: 'help-circle', title: 'Help & Support', sub: 'FAQs and Contact us' },
                        { icon: 'shield', title: 'Privacy Policy', sub: 'Data Handling & Privacy' },
                        { icon: 'alert-circle', title: 'Report an Issue', sub: 'Bug reports & feedback' }
                    ].filter(i => matches(i.title) || matches(i.sub) || matches('Support'));

                    const hasResults = personalMatches || bankMatches || accountItems.length > 0 || supportItems.length > 0;

                    if (!hasResults && q) {
                        return (
                            <View style={styles.noResultsContainer}>
                                <Feather name="search" size={48} color={colors.textDisabled} />
                                <AppText variant="body" style={{ color: colors.textSecondary, marginTop: 16 }}>
                                    No matches found for "{searchQuery}"
                                </AppText>
                            </View>
                        );
                    }

                    return (
                        <>
                            {personalMatches && (
                                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder }]} variant="elevated">
                                    <HeaderRow title="PERSONAL INFO" showEdit isEditing={isEditingInfo} onPressEdit={handleEditToggle} />
                                    {isEditingInfo ? (
                                        <View style={[styles.formPadding, { paddingHorizontal: spacing.base, paddingBottom: spacing.base }]}>
                                            {formErrors.general && (
                                                <View style={{ backgroundColor: colors.errorBg || 'rgba(239, 68, 68, 0.1)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.base, borderLeftWidth: 3, borderLeftColor: colors.error }}>
                                                    <AppText variant="bodySm" style={{ color: colors.error }}>⚠ {formErrors.general}</AppText>
                                                </View>
                                            )}
                                            <AppInput label="Name" value={editForm.name} onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))} />
                                            <AppInput label="Email" value={editForm.email} keyboardType="email-address" onChangeText={(text) => { setEditForm(prev => ({ ...prev, email: text })); setFormErrors(prev => ({ ...prev, email: null, general: null })); }} error={formErrors.email} />
                                            <AppInput label="Mobile" value={editForm.mobile} keyboardType="numeric" maxLength={10} onChangeText={(text) => { setEditForm(prev => ({ ...prev, mobile: text.replace(/[^0-9]/g, '') })); setFormErrors(prev => ({ ...prev, mobile: null })); }} error={formErrors.mobile} />
                                            <AppInput label="Location" value={editForm.location} onChangeText={(text) => { setEditForm(prev => ({ ...prev, location: text.replace(/[0-9]/g, '') })); }} />
                                        </View>
                                    ) : (
                                        <>
                                            {matches(profileData.personalInfo.name) && <InfoRow icon="user" label="Name" value={profileData.personalInfo.name} />}
                                            {matches(profileData.personalInfo.email) && <InfoRow icon="mail" label="Email" value={profileData.personalInfo.email} />}
                                            {matches(profileData.personalInfo.mobile) && <InfoRow icon="phone" label="Mobile" value={profileData.personalInfo.mobile} />}
                                            {matches(profileData.personalInfo.location) && <InfoRow icon="map-pin" label="Location" value={profileData.personalInfo.location} isLast />}
                                        </>
                                    )}
                                </AppCard>
                            )}

                            {bankMatches && (
                                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder }]} variant="elevated">
                                    <HeaderRow title="BANK DETAILS" showEdit isEditing={isEditingBank} onPressEdit={handleBankEditToggle} />
                                    {isEditingBank ? (
                                        <View style={[styles.formPadding, { paddingHorizontal: spacing.base, paddingBottom: spacing.base }]}>
                                            {bankFormErrors.general && (
                                                <View style={{ backgroundColor: colors.errorBg || 'rgba(239, 68, 68, 0.1)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.base, borderLeftWidth: 3, borderLeftColor: colors.error }}>
                                                    <AppText variant="bodySm" style={{ color: colors.error }}>⚠ {bankFormErrors.general}</AppText>
                                                </View>
                                            )}
                                            <AppInput label="IFSC Code" value={editBankForm.ifsc} maxLength={11} autoCapitalize="characters" onChangeText={handleIfscChange} error={bankFormErrors.ifsc} />
                                            <AppInput label="Account Number" value={editBankForm.account} keyboardType="numeric" maxLength={18} onChangeText={(text) => { setEditBankForm(prev => ({ ...prev, account: text.replace(/[^0-9]/g, '') })); setBankFormErrors(prev => ({ ...prev, account: null })); }} error={bankFormErrors.account} />
                                            <AppInput label="Branch" value={editBankForm.branch} editable={false} />
                                        </View>
                                    ) : (
                                        <>
                                            {matches(profileData.bankDetails.ifsc) && <InfoRow icon="briefcase" label="IFSC" value={profileData.bankDetails.ifsc} />}
                                            {matches(profileData.bankDetails.account) && <InfoRow icon="credit-card" label="Account Number" value={profileData.bankDetails.account} />}
                                            {matches(profileData.bankDetails.branch) && <InfoRow icon="git-branch" label="Branch" value={profileData.bankDetails.branch} isLast />}
                                        </>
                                    )}
                                </AppCard>
                            )}

                            {accountItems.length > 0 && (
                                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder }]} variant="elevated">
                                    <HeaderRow title="USER ACCOUNT" />
                                    {accountItems.map((item, idx) => {
                                        const isLast = idx === accountItems.length - 1;
                                        if (item.title === 'Notifications') {
                                            return <ActionRow key={item.title} icon={item.icon} title={item.title} subtitle={item.sub} isLast={isLast} rightElement={<GradientToggle value={profileData.settings?.notifications ?? true} onValueChange={toggleNotifications} />} />;
                                        }
                                        if (item.title === 'Appearance') {
                                            return <ActionRow key={item.title} icon={item.icon} title={item.title} subtitle={item.sub} isLast={isLast} rightElement={<GradientThemeSwitcher isDark={isDark} toggleTheme={toggleTheme} colors={colors} spacing={spacing} radius={radius} />} />;
                                        }
                                        if (item.title === 'Change Password') {
                                            return <ActionRow key={item.title} icon={item.icon} title={item.title} subtitle={item.sub} isLast={isLast} onPress={() => navigation.navigate('ChangePassword')} />;
                                        }
                                        return <ActionRow key={item.title} icon={item.icon} title={item.title} subtitle={item.sub} isLast={isLast} onPress={() => { }} />;
                                    })}
                                </AppCard>
                            )}

                            {supportItems.length > 0 && (
                                <AppCard style={[styles.cardWrapper, { borderColor: colors.profileCardBorder }]} variant="elevated">
                                    <HeaderRow title="SUPPORT" />
                                    {supportItems.map((item, idx) => (
                                        <ActionRow
                                            key={item.title}
                                            icon={item.icon}
                                            title={item.title}
                                            subtitle={item.sub}
                                            isLast={idx === supportItems.length - 1}
                                            iconColor={item.title === 'Report an Issue' ? colors.error : undefined}
                                            onPress={() => { }}
                                        />
                                    ))}
                                </AppCard>
                            )}
                        </>
                    );
                })()}

                {!searchQuery && (
                    <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.replace('Login')}>
                        <View style={[styles.signOutBtn, { backgroundColor: colors.signOutBg, borderRadius: radius.lg }]}>
                            <Feather name="log-out" size={18} color={colors.signOutText} style={styles.logoutIcon} />
                            <AppText variant="body" style={[styles.logoutText, { color: colors.signOutText }]}>Sign Out</AppText>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            <Modal animationType="fade" transparent={true} visible={imageModalVisible} onRequestClose={() => setImageModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderRadius: radius.xl }]}>
                        <View style={styles.modalHeader}>
                            <AppText variant="h3" style={[styles.modalTitle, { color: colors.textPrimary }]}>Profile Picture</AppText>
                            <TouchableOpacity onPress={() => setImageModalVisible(false)} hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
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
                            <Feather name="camera" size={20} color={colors.textBrand} style={styles.actionIcon} />
                            <AppText variant="body" style={[styles.actionText, { color: colors.textPrimary }]}>Take Photo</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalActionBtn, { borderBottomWidth: 1, borderBottomColor: colors.divider }]} onPress={handlePickImage}>
                            <Feather name="image" size={20} color={colors.textBrand} style={styles.actionIcon} />
                            <AppText variant="body" style={[styles.actionText, { color: colors.textPrimary }]}>Choose from Gallery</AppText>
                        </TouchableOpacity>
                        {profileData.personalInfo.profileImage && (
                            <TouchableOpacity style={styles.modalActionBtn} onPress={handleRemoveImage}>
                                <Feather name="trash-2" size={20} color={colors.error} style={styles.actionIcon} />
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
    root: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
        justifyContent: 'center',
    },
    profileNameText: {
        fontWeight: '700',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginTop: 4,
        marginBottom: 4,
    },
    badgeText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 10,
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
        justifyContent: 'center',
    },
    statValue: {
        color: '#FFF',
        fontWeight: '800',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        marginTop: 4,
        fontWeight: '600',
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
        shadowOpacity: 0,
        borderWidth: 1,
    },
    formPadding: {
        paddingTop: 8,
    },
    noResultsContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    signOutBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 8,
        marginBottom: 24,
    },
    logoutIcon: {
        marginRight: 10,
    },
    logoutText: {
        fontWeight: '700',
        fontSize: 15,
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
    modalTitle: {
        fontWeight: '700',
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
    },
    actionIcon: {
        marginRight: 12,
    },
    actionText: {
        fontWeight: '500',
    },
});

export default ProfileScreen;
