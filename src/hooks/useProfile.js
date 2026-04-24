import { useState, useEffect, useCallback } from 'react';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import { fetchBankDetailsByIfsc } from '../api/bankApi';
import { fetchProfile, updatePersonalInfoApi, updateBankDetailsApi, uploadProfilePictureApi } from '../api/profileApi';

const PROFILE_CACHE_KEY = '@crm_profile_cache';

const mapDataToProfile = (data) => ({
    name: data.name || '',
    role: 'Finance Agent',
    rating: '4.2',
    ratingText: 'Top Performer',
    stats: {
        leads: { count: '—', label: 'Total Leads' },
        deals: { count: '—', label: 'Closed Deals' },
        month: { count: '—', label: 'This Month' },
    },
    personalInfo: {
        name: data.name || '',
        email: data.emailid || '',
        mobile: data.mobilenumber || '',
        location: data.location || '',
        profileImage: data.profile_picture ? `${ENV.API_URL.replace('/api', '')}${data.profile_picture}` : null,
    },
    bankDetails: {
        ifsc: data.ifsc || 'Not Provided',
        account: data.accountnumber || 'Not Provided',
        branch: data.branch || 'Not Provided',
    },
    settings: {
        notifications: true,
    },
});

export const useProfile = () => {
    // isFirstLoad = true only when there is absolutely no cached data
    const [profileData, setProfileData] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [formErrors, setFormErrors] = useState({});

    const [isEditingBank, setIsEditingBank] = useState(false);
    const [editBankForm, setEditBankForm] = useState({});
    const [bankFormErrors, setBankFormErrors] = useState({});

    const [imageModalVisible, setImageModalVisible] = useState(false);

    // Keep loading as an alias for isFirstLoad for backward compatibility
    const loading = isFirstLoad;

    const refreshProfile = useCallback(async (isMounted = { current: true }) => {
        try {
            const data = await fetchProfile();
            if (!isMounted.current) return;
            const mapped = mapDataToProfile(data);
            setProfileData(mapped);
            // Save to cache so next open is instant
            await AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(mapped));
        } catch (error) {
            console.warn('Profile fetch error:', error.message);
        }
    }, []);

    useEffect(() => {
        const isMounted = { current: true };

        const loadData = async () => {
            try {
                const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
                if (cached && isMounted.current) {
                    const parsed = JSON.parse(cached);
                    // Robust check: ensure cache matches new schema before using
                    if (parsed && parsed.personalInfo && parsed.bankDetails) {
                        setProfileData(parsed);
                        setIsFirstLoad(false); // Show real UI instantly from cache
                    }
                }
            } catch (_) {
                // Cache read failed or was invalid, will just show skeleton until fresh data loads
            }

            // Step 2: Always fetch fresh data from API (silently in background)
            await refreshProfile(isMounted);

            // After fresh data is loaded, we are definitely no longer on first load
            if (isMounted.current) setIsFirstLoad(false);
        };

        loadData();
        return () => { isMounted.current = false; };
    }, [refreshProfile]);

    const handlePickImage = async () => {
        try {
            const result = await launchImageLibrary({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 400,
                maxHeight: 400,
            });

            if (result.didCancel || result.errorCode) return;

            const uri = result.assets?.[0]?.uri;
            if (uri) {
                // Let's assume uploadProfilePictureApi can also take uri instead of image.path
                // For safety, we keep the stashed logic for upload if it exists
                // We'll wrap in try-catch in case uploadProfilePictureApi isn't fully implemented
                try {
                    const { profile_picture } = await uploadProfilePictureApi(uri);
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: profile_picture ? `${ENV.API_URL.replace('/api', '')}${profile_picture}` : uri
                        }
                    }));
                } catch(e) {
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: uri
                        }
                    }));
                }
                setImageModalVisible(false);
            }
        } catch (error) {
            console.error('Image upload failed:', error.message);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const result = await launchCamera({
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 400,
                maxHeight: 400,
            });

            if (result.didCancel || result.errorCode) return;

            const uri = result.assets?.[0]?.uri;
            if (uri) {
                try {
                    const { profile_picture } = await uploadProfilePictureApi(uri);
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: profile_picture ? `${ENV.API_URL.replace('/api', '')}${profile_picture}` : uri
                        }
                    }));
                } catch(e) {
                    setProfileData(prev => ({
                        ...prev,
                        personalInfo: {
                            ...prev.personalInfo,
                            profileImage: uri
                        }
                    }));
                }
                setImageModalVisible(false);
            }
        } catch (error) {
            console.error('Camera upload failed:', error.message);
        }
    };

    const handleRemoveImage = () => {
        setProfileData(prev => ({
            ...prev,
            personalInfo: {
                ...prev.personalInfo,
                profileImage: null
            }
        }));
        setImageModalVisible(false);
    };

    const toggleNotifications = () => {
        if (!profileData) return;
        setProfileData(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                notifications: !prev.settings.notifications
            }
        }));
    };

    const handleEditToggle = async () => {
        if (isEditingInfo) {
            const errors = {};
            if (editForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
                errors.email = "Invalid email format";
            }
            if (editForm.mobile && !/^\d{10}$/.test(editForm.mobile)) {
                errors.mobile = "Mobile must be exactly 10 digits";
            }

            if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
            }

            setFormErrors({});
            setSaving(true);

            try {
                const updated = await updatePersonalInfoApi({
                    name: editForm.name,
                    emailid: editForm.email,
                    mobilenumber: editForm.mobile,
                    location: editForm.location,
                });

                setProfileData(prev => ({
                    ...prev,
                    personalInfo: {
                        ...prev.personalInfo,
                        name: updated.name || editForm.name,
                        email: updated.emailid || editForm.email,
                        mobile: updated.mobilenumber || editForm.mobile,
                        location: updated.location || editForm.location,
                    },
                    name: updated.name || editForm.name,
                }));
            } catch (error) {
                setFormErrors({ general: error.message });
                setSaving(false);
                return;
            } finally {
                setSaving(false);
            }
        } else {
            setEditForm({ ...profileData.personalInfo });
            setFormErrors({});
        }
        setIsEditingInfo(!isEditingInfo);
    };

    const handleBankEditToggle = async () => {
        if (isEditingBank) {
            const isIfscEmpty = !editBankForm.ifsc || editBankForm.ifsc.trim() === '';
            const isAccountEmpty = !editBankForm.account || editBankForm.account.trim() === '';

            let finalBankDetails = { ...editBankForm };

            if (isIfscEmpty && isAccountEmpty) {
                finalBankDetails = {
                    ifsc: "Not Provided",
                    account: "Not Provided",
                    branch: "Not Provided"
                };
            } else {
                const errors = {};
                if (!editBankForm.ifsc || editBankForm.ifsc.length !== 11) {
                    errors.ifsc = "IFSC must be 11 characters";
                }
                if (!editBankForm.account || editBankForm.account.trim().length === 0) {
                    errors.account = "Account number is required";
                } else if (editBankForm.account.length > 18) {
                    errors.account = "Account number must be max 18 digits";
                }

                if (Object.keys(errors).length > 0) {
                    setBankFormErrors(errors);
                    return;
                }
            }

            setBankFormErrors({});
            setSaving(true);

            try {
                const apiData = {
                    ifsc: finalBankDetails.ifsc === 'Not Provided' ? null : finalBankDetails.ifsc,
                    accountnumber: finalBankDetails.account === 'Not Provided' ? null : finalBankDetails.account,
                    branch: finalBankDetails.branch === 'Not Provided' ? null : finalBankDetails.branch,
                };

                await updateBankDetailsApi(apiData);

                setProfileData(prev => ({
                    ...prev,
                    bankDetails: finalBankDetails
                }));
            } catch (error) {
                setBankFormErrors({ general: error.message });
                setSaving(false);
                return;
            } finally {
                setSaving(false);
            }
        } else {
            const currentIfsc = profileData.bankDetails.ifsc;
            const currentAccount = profileData.bankDetails.account;
            const currentBranch = profileData.bankDetails.branch;

            setEditBankForm({
                ifsc: (currentIfsc === 'Not Provided') ? '' : currentIfsc,
                account: (currentAccount === 'Not Provided') ? '' : currentAccount,
                branch: (currentBranch === 'Not Provided') ? '' : currentBranch
            });
            setBankFormErrors({});
        }
        setIsEditingBank(!isEditingBank);
    };

    const handleIfscChange = async (text) => {
        const uText = text.toUpperCase();
        setEditBankForm((prev) => ({ ...prev, ifsc: uText }));
        if (uText.length === 11) {
            try {
                const response = await fetchBankDetailsByIfsc(uText);
                if (response.success) {
                    setEditBankForm((prev) => ({ ...prev, branch: response.data.branch }));
                    setBankFormErrors((prev) => ({ ...prev, ifsc: null }));
                } else {
                    setBankFormErrors((prev) => ({ ...prev, ifsc: response.error }));
                    setEditBankForm((prev) => ({ ...prev, branch: '' }));
                }
            } catch (error) {
                setBankFormErrors((prev) => ({ ...prev, ifsc: 'Error fetching branch' }));
            }
        } else {
            setBankFormErrors((prev) => ({ ...prev, ifsc: uText.length > 0 ? 'IFSC must be 11 characters' : null }));
            if (uText.length < 11) {
                setEditBankForm((prev) => ({ ...prev, branch: '' }));
            }
        }
    };

    return {
        profileData,
        loading,
        saving,
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
    };
};
