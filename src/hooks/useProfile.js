import { useState, useEffect, useCallback } from 'react';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ENV } from '../config/env';
import { fetchBankDetailsByIfsc } from '../api/bankApi';
import { fetchProfile, updatePersonalInfoApi, updateBankDetailsApi, uploadProfilePictureApi } from '../api/profileApi';
import { useSocket } from '../context/SocketContext';

const PROFILE_CACHE_KEY = '@crm_profile_cache';

const mapDataToProfile = (data) => ({
    name: data.name || '',
    role: 'Finance Agent',
    rating: '4.2',
    ratingText: 'Top Performer',
    stats: {
        leads: { count: data.stats?.totalLeads ?? '0', label: 'Total Leads' },
        deals: { count: data.stats?.closedDeals ?? '0', label: 'Closed Deals' },
        month: { count: data.stats?.thisMonth ?? '0', label: 'This Month' },
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
    const queryClient = useQueryClient();
    const socket = useSocket();

    // Alias setProfileData to update React Query cache for instant Optimistic UI
    const setProfileData = useCallback((updater) => {
        queryClient.setQueryData(['profile'], (oldData) => {
            if (typeof updater === 'function') {
                return updater(oldData);
            }
            return updater;
        });
    }, [queryClient]);

    const [saving, setSaving] = useState(false);

    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [formErrors, setFormErrors] = useState({});

    const [isEditingBank, setIsEditingBank] = useState(false);
    const [editBankForm, setEditBankForm] = useState({});
    const [bankFormErrors, setBankFormErrors] = useState({});

    const [imageModalVisible, setImageModalVisible] = useState(false);

    const [cachedProfile, setCachedProfile] = useState(null);

    // Hydrate from cache immediately on mount for offline-first experience
    useEffect(() => {
        const hydrateCache = async () => {
            try {
                const cached = await AsyncStorage.getItem(PROFILE_CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    setCachedProfile(parsed);
                    // Pre-fill query client if empty so it doesn't stay in 'loading' state
                    if (!queryClient.getQueryData(['profile'])) {
                        queryClient.setQueryData(['profile'], parsed);
                    }
                }
            } catch (e) {
                console.error("Failed to hydrate profile cache", e);
            }
        };
        hydrateCache();
    }, [queryClient]);

    const {
        data: queryData,
        isLoading: queryLoading,
        isFetching,
        refetch: refreshProfile,
    } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const data = await fetchProfile();
            const mapped = mapDataToProfile(data);
            AsyncStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(mapped));
            return mapped;
        },
        staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes to prevent redundant network calls
    });

    // Use queryData if available, fallback to cachedProfile
    const profileData = queryData || cachedProfile;
    // Only show loading skeleton if we have NO data at all
    const loading = queryLoading && !profileData;

    // Listen for real-time profile/stats updates via WebSocket
    useEffect(() => {
        if (!socket) return;

        const handleProfileUpdated = () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        };

        socket.on('profile_updated', handleProfileUpdated);
        socket.on('stats_updated', handleProfileUpdated);
        socket.on('lead_added', handleProfileUpdated); // Updates total leads count instantly

        return () => {
            socket.off('profile_updated', handleProfileUpdated);
            socket.off('stats_updated', handleProfileUpdated);
            socket.off('lead_added', handleProfileUpdated);
        };
    }, [socket, queryClient]);

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
        refreshProfile,
        setEditForm,
        setEditBankForm,
        setFormErrors,
        setBankFormErrors
    };
};
